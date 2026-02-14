import type { PersonaConfig } from "../store/useAppStore";

export class GeminiLiveService {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private processor: ScriptProcessorNode | null = null;
    private audioQueue: string[] = []; // Base64 audio chunks
    private isPlaying = false;
    private onVolumeChange: (vol: number) => void;
    private onTranscript: (text: string, isUser: boolean) => void;
    private onError: (error: string) => void;

    constructor(
        onVolumeChange: (vol: number) => void,
        onTranscript: (text: string, isUser: boolean) => void,
        onError: (error: string) => void
    ) {
        this.onVolumeChange = onVolumeChange;
        this.onTranscript = onTranscript;
        this.onError = onError;
    }

    async connect(apiKey: string, persona: PersonaConfig): Promise<void> {
        return new Promise((resolve, reject) => {
            // Construct WebSocket URL
            // Switching to v1beta as v1alpha might have dropped support or model availability changed
            const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${apiKey}`;

            try {
                this.ws = new WebSocket(url);
            } catch (e) {
                const msg = `Failed to create WebSocket: ${e}`;
                this.onError(msg);
                return reject(msg);
            }

            this.ws.onopen = () => {
                console.log("Connected to Gemini Live");
                this.sendSetupMessage(persona);
                resolve();
            };

            this.ws.onmessage = async (event) => {
                try {
                    let data = event.data;
                    if (data instanceof Blob) {
                        data = await data.text();
                    }
                    const response = JSON.parse(data);

                    if (response.error) {
                        const errorMsg = `Gemini API Error: ${response.error.message || JSON.stringify(response.error)}`;
                        console.error(errorMsg);
                        this.onError(errorMsg);
                        return;
                    }

                    // Handle Audio
                    if (response.serverContent?.modelTurn?.parts) {
                        for (const part of response.serverContent.modelTurn.parts) {
                            if (part.inlineData && part.inlineData.mimeType.startsWith('audio')) {
                                this.queueAudio(part.inlineData.data);
                            }
                            if (part.text) {
                                this.onTranscript(part.text, false);
                            }
                        }
                    }

                    // Handle Turn Complete
                    if (response.serverContent?.turnComplete) {
                        console.log("Turn Complete");
                    }
                } catch (e) {
                    console.error("Error parsing WS message", e);
                }
            };

            this.ws.onerror = (err) => {
                console.error("Gemini WS Error", err);
                const msg = "WebSocket connection error. Check API Key and network.";
                this.onError(msg);
                // If we haven't resolved yet, reject
                if (this.ws?.readyState !== WebSocket.OPEN) {
                    reject(msg);
                }
            };

            this.ws.onclose = (event) => {
                console.log("Gemini Live Disconnected", event.code, event.reason);
                if (event.code !== 1000) {
                    const msg = `Disconnected: ${event.code} ${event.reason || 'Unknown reason'}`;
                    this.onError(msg);
                    if (this.ws?.readyState !== WebSocket.OPEN) {
                        reject(msg);
                    }
                }
            };

            // Start Microphone
            this.startMicrophone().catch(err => {
                const msg = `Mic Error: ${err}`;
                this.onError(msg);
            });
        });
    }

    private sendSetupMessage(persona: PersonaConfig) {
        if (!this.ws) return;

        const setupMsg = {
            setup: {
                model: "models/gemini-2.5-flash-native-audio-latest",
                generationConfig: {
                    responseModalities: ["AUDIO"],
                    speechConfig: {
                        voiceConfig: { prebuiltVoiceConfig: { voiceName: persona.voiceName || "Puck" } }
                    }
                },
                systemInstruction: {
                    parts: [{
                        text: `You are simulating a high-stakes real estate call in Dubai. 
            Role: ${persona.role} (${persona.name}).
            Context: ${persona.context}.
            Mood: ${persona.mood}.
            Objections to raise: ${persona.objections.join(", ")}.
            ${persona.systemInstruction}
            
            CRITICAL INSTRUCTIONS:
            - **SPEAK LIKE A HUMAN, NOT A BOT.** Use fillers (umm, well, honestly).
            - **DO NOT** mention laws (RERA, DLD) unless the user explicitly asks. Focus on money, quality, and feelings.
            - **Negotiate Logically:** If the user gives a good reason, concede the point ("Okay, I see that...") but then find a NEW problem ("...but what about the view?").
            - **React to Tone:** If the user is rude, get colder/shorter. If they are helpful, open up slightly.
            - Wait for the user to lead. Do not blurt out your bio.
            - Keep it short (1-2 sentences).`
                    }]
                }
            }
        };

        this.ws.send(JSON.stringify(setupMsg));
    }

    private async startMicrophone() {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

            // Resume context if suspended (browser requirement)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.mediaStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            const source = this.audioContext.createMediaStreamSource(this.mediaStream);
            this.processor = this.audioContext.createScriptProcessor(4096, 1, 1);

            source.connect(this.processor);
            this.processor.connect(this.audioContext.destination);

            this.processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);

                // Calculate volume for visualizer using original data
                let sum = 0;
                for (let i = 0; i < inputData.length; i++) {
                    sum += inputData[i] * inputData[i];
                }
                const volume = Math.sqrt(sum / inputData.length);
                this.onVolumeChange(volume * 5);

                // Downsample to 16kHz for Gemini
                const downsampledData = this.downsampleTo16k(inputData, this.audioContext!.sampleRate);

                // Convert to PCM 16-bit and send
                this.sendAudioChunk(downsampledData);
            };
        } catch (error) {
            console.error("Error starting microphone:", error);
        }
    }

    private downsampleTo16k(input: Float32Array, inputRate: number): Float32Array {
        if (inputRate === 16000) return input;

        const ratio = inputRate / 16000;
        const newLength = Math.ceil(input.length / ratio);
        const output = new Float32Array(newLength);

        for (let i = 0; i < newLength; i++) {
            const index = i * ratio;
            const leftIndex = Math.floor(index);
            const rightIndex = Math.ceil(index);
            const fraction = index - leftIndex;

            const leftVal = input[leftIndex] || 0;
            const rightVal = input[rightIndex] !== undefined ? input[rightIndex] : leftVal;

            output[i] = leftVal + (rightVal - leftVal) * fraction;
        }

        return output;
    }

    private sendAudioChunk(float32Data: Float32Array) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

        // Convert Float32 to Int16 PCM
        const int16Data = new Int16Array(float32Data.length);
        for (let i = 0; i < float32Data.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Data[i]));
            int16Data[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }

        const base64Audio = this.arrayBufferToBase64(int16Data.buffer);

        this.ws.send(JSON.stringify({
            realtimeInput: {
                mediaChunks: [{
                    mimeType: "audio/pcm;rate=16000",
                    data: base64Audio
                }]
            }
        }));
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }

    // Audio Playback Queue Implementation
    private queueAudio(base64Data: string) {
        this.audioQueue.push(base64Data);
        if (!this.isPlaying) {
            this.playNextChunk();
        }
    }

    private async playNextChunk() {
        if (this.audioQueue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const base64Data = this.audioQueue.shift();
        if (!base64Data || !this.audioContext) {
            this.playNextChunk();
            return;
        }

        try {
            const audioBuffer = await this.decodeBase64Audio(base64Data);
            const source = this.audioContext.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(this.audioContext.destination);

            source.onended = () => {
                this.playNextChunk();
            };

            source.start();
        } catch (e) {
            console.error("Error playing audio chunk", e);
            this.playNextChunk();
        }
    }

    private async decodeBase64Audio(base64Data: string): Promise<AudioBuffer> {
        const binaryString = window.atob(base64Data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        // Gemini sends PCM Int16 Little Endian, usually 24kHz
        const pcmData = new Int16Array(bytes.buffer);
        const floatData = new Float32Array(pcmData.length);
        for (let i = 0; i < pcmData.length; i++) {
            floatData[i] = pcmData[i] / 32768.0;
        }

        // Create buffer at 24kHz (standard for Gemini)
        const audioBuffer = this.audioContext!.createBuffer(1, floatData.length, 24000);
        audioBuffer.getChannelData(0).set(floatData);
        return audioBuffer;
    }

    disconnect() {
        this.ws?.close();
        this.mediaStream?.getTracks().forEach(track => track.stop());
        this.processor?.disconnect();
        // Do not close audioContext immediately if you want to keep playing? 
        // But for disconnect, we usually stop everything.
        this.audioContext?.close().catch(console.error); // Best effort
        this.audioQueue = [];
        this.isPlaying = false;
    }
}
