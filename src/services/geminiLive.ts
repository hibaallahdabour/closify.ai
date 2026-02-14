import type { PersonaConfig } from "../store/useAppStore";

export class GeminiLiveService {
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private processor: ScriptProcessorNode | null = null;
    private audioQueue: string[] = []; // Base64 audio chunks
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

    private recognition: any = null; // Type as any to avoid window.SpeechRecognition TS issues

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
                this.nextStartTime = 0;
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
                                let text = part.text;

                                // AGGRESSIVE CLEANING: Remove "Inner Monologue" patterns
                                // Top-level bans for known reasoning headers
                                const BANNED_PATTERNS = [
                                    /Cutting Short Small Talk/gi,
                                    /Initiating The Dialogue/gi,
                                    /My objective is/gi,
                                    /I've registered/gi,
                                    /Prioritizing Key Metrics/gi,
                                    /I need to be blunt/gi,
                                    /The user's welcome has been noted/gi,
                                    /My focus must shift/gi,
                                    /I acknowledged/gi,
                                    /My focus shifted/gi,
                                    /Demanding Quick Answers/gi, // New from user report
                                    /I started this interaction/gi,
                                    /mirroring my .* persona/gi,
                                    /My speaking style dictates/gi,
                                    /I prioritized/gi,
                                    /Challenge the Initiator/gi, // New from user report
                                    /^([A-Z][a-z]+ ){2,5}\b/gm, // Catches "Title Case Headers" at start of line
                                    /^".*?"$/gm, // Catches lines that are just quotes (internal thought bubbles)
                                ];

                                BANNED_PATTERNS.forEach(pattern => {
                                    text = text.replace(pattern, '');
                                });

                                // Standard Cleaning
                                text = text
                                    .replace(/\*.*?\*/g, '')  // Remove *sigh*
                                    .replace(/\(.*?\)/g, '')  // Remove (pauses)
                                    .replace(/\[.*?\]/g, '')  // Remove [action]
                                    .trim();

                                // Smart Filter: If text is long (>40 words) and contains "Objective", "Strategy", likely internal monologue -> DROP IT
                                const wordCount = text.split(' ').length;
                                if (wordCount > 40 && (text.includes("Objective") || text.includes("Strategy") || text.includes("interaction"))) {
                                    console.warn("Dropping likely internal monologue:", text);
                                    text = "";
                                }

                                // Specific check for the user's reported pattern
                                if (text.includes("I started this interaction") || text.includes("mirroring my")) {
                                    console.warn("Dropping persona explanation:", text);
                                    text = "";
                                }

                                if (text.length > 1) { // Min 2 chars to be valid speech
                                    this.onTranscript(text, false);
                                }
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

            // Start Microphone & Speech Recognition
            this.startMicrophone().catch(err => {
                const msg = `Mic Error: ${err}`;
                this.onError(msg);
            });

            this.startSpeechRecognition();
        });
    }

    private startSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.warn("Speech Recognition not supported in this browser.");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';

        this.recognition.onresult = (event: any) => {
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    const transcript = event.results[i][0].transcript.trim();
                    if (transcript) {
                        this.onTranscript(transcript, true);
                    }
                }
            }
        };

        this.recognition.onerror = (event: any) => {
            console.error("Speech Recognition Error:", event.error);
        };

        this.recognition.onend = () => {
            // Auto-restart if we are still connected (unless explicitly stopped)
            if (this.ws?.readyState === WebSocket.OPEN) {
                try {
                    this.recognition.start();
                } catch (e) {
                    // Ignore start errors
                }
            }
        };

        try {
            this.recognition.start();
        } catch (e) {
            console.error("Failed to start Speech Recognition:", e);
        }
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
            
            **CRITICAL INSTRUCTION: VOICED AUDIO ONLY.**
            - You are ACTING. Do not describe your acting.
            - Do not output text like "I am being impatient now" or "My strategy is...".
            - Do not output headers like "Demanding Quick Answers".
            - IF YOU SAY IT, IT MUST BE SPOKEN TO THE USER.
            - If you are thinking it, KEEP IT SILENT.

            **Your Identity:**
            - Name: ${persona.name}
            - Role: ${persona.role}
            - Mood: ${persona.mood}
            - Context: ${persona.context}

            **Your Goal:**
            You are calling about a property (or receiving a call). You are the CUSTOMER. The user is the AGENT.

            **Detailed Interaction Protocol:**
            1.  **THE START:** 
                - Follow any specific "STARTING THE CALL" rule in your persona.
                - Fallback: "Hello? Is this the agent?"
            
            2.  **THE MIDDLE:** 
                - Be difficult. Raise objections: ${persona.objections.join(", ")}.
                - Interrupt if needed.
            
            3.  **Specific Persona Instructions:**
            ${persona.systemInstruction}
            
            **Global Behavior:**
            Be impatient, human, and direct. React to what they say instantly.
            `
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
    private nextStartTime = 0;

    private async queueAudio(base64Data: string) {
        this.audioQueue.push(base64Data);
        this.processAudioQueue();
    }

    private async processAudioQueue() {
        if (!this.audioContext || this.audioQueue.length === 0) return;

        // Process all available chunks
        while (this.audioQueue.length > 0) {
            const base64Data = this.audioQueue.shift();
            if (!base64Data) continue;

            try {
                const audioBuffer = await this.decodeBase64Audio(base64Data);

                // Ensure context is running
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }

                const source = this.audioContext.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(this.audioContext.destination);

                // Schedule playback
                // If nextStartTime is in the past (underrun), reset to now + small buffer
                const currentTime = this.audioContext.currentTime;
                if (this.nextStartTime < currentTime) {
                    this.nextStartTime = currentTime + 0.05; // 50ms buffer to prevent immediate cut-off
                }

                source.start(this.nextStartTime);
                this.nextStartTime += audioBuffer.duration;

            } catch (e) {
                console.error("Error scheduling audio chunk", e);
            }
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
        this.audioQueue = [];

        if (this.recognition) {
            this.recognition.onend = null; // Prevent restart
            try {
                this.recognition.stop();
            } catch (e) { }
            this.recognition = null;
        }
    }
}
