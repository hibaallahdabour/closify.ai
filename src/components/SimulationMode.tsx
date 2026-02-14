import React, { useEffect, useRef, useState } from 'react';

import { Mic, MicOff, PhoneOff, User, Radio } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { GeminiLiveService } from '../services/geminiLive';
import { generateAnalysisReport } from '../services/gemini';

export const SimulationMode: React.FC = () => {
    const {
        selectedPersona,
        setStep,
        setReport,
        isConnected,
        setIsConnected,
        setAudioVolume,
        transcript,
        addTranscriptLine,
        clearTranscript
    } = useAppStore();

    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState('Connecting...');

    // Service Ref
    const serviceRef = useRef<GeminiLiveService | null>(null);

    // Animation Refs for Siri-style Waveform
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);
    const phaseRef = useRef(0);

    // Smoothed volume for animation
    const smoothedVolumeRef = useRef(0);

    useEffect(() => {
        if (!selectedPersona) {
            setStep('persona-selection');
            return;
        }

        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        if (!apiKey) {
            setStatus('Error: No API Key');
            return;
        }

        clearTranscript();

        const service = new GeminiLiveService(
            (vol) => setAudioVolume(vol),
            (text, isUser) => {
                addTranscriptLine({
                    speaker: isUser ? 'user' : 'ai',
                    text,
                    timestamp: Date.now()
                });

                if (!isUser && text.toLowerCase().includes("hanging up now")) {
                    console.log("AI hung up.");
                    setTimeout(() => {
                        handleEndCall();
                    }, 1500);
                }
            },
            (errorMessage) => {
                setStatus(errorMessage);
                if (errorMessage.includes("Disconnected") || errorMessage.includes("Error")) {
                    setIsConnected(false);
                }
            }
        );

        serviceRef.current = service;

        service.connect(apiKey, selectedPersona)
            .then(() => {
                setIsConnected(true);
                setStatus('Connected');
            })
            .catch(err => {
                console.error("Connection failed:", err);
                setStatus(`Connection Failed: ${typeof err === 'string' ? err : 'Unknown error'}`);
                setIsConnected(false);
            });

        return () => {
            service.disconnect();
            setIsConnected(false);
            cancelAnimationFrame(animationFrameRef.current!);
        };
    }, []);

    // Canvas Waveform Animation Loop
    useEffect(() => {
        const animate = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Resize canvas to match display size for sharpness
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();

            // Should probably set this only on resize, but fine for now
            if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                ctx.scale(dpr, dpr);
            }

            const width = rect.width;
            const height = rect.height;
            const centerY = height / 2;

            const targetVolume = useAppStore.getState().audioVolume;

            // Smooth interpolation
            smoothedVolumeRef.current += (targetVolume - smoothedVolumeRef.current) * 0.1;
            const vol = Math.max(0.01, smoothedVolumeRef.current); // Keep a tiny bit of movement always

            ctx.clearRect(0, 0, width, height);

            // Configuration for multiple waves
            // Colors based on user image: Cyan, Purple, Blue, White
            const waves = [
                { color: 'rgba(56, 189, 248, 0.5)', speed: 0.02, amplitude: 0.5, frequency: 0.01 }, // Cyan
                { color: 'rgba(192, 132, 252, 0.5)', speed: 0.03, amplitude: 0.8, frequency: 0.008 }, // Purple
                { color: 'rgba(96, 165, 250, 0.5)', speed: 0.015, amplitude: 0.6, frequency: 0.012 }, // Blue
                { color: 'rgba(255, 255, 255, 0.8)', speed: 0.04, amplitude: 1.0, frequency: 0.005 }, // White Core 
            ];

            phaseRef.current += 1; // Global phase increment

            // Draw each wave
            waves.forEach((wave, index) => {
                ctx.beginPath();
                ctx.moveTo(0, centerY);

                const phaseOffset = index * 455; // Arbitrary offset so they don't overlap perfectly

                for (let x = 0; x <= width; x++) {
                    // Normalized position -1 to 1 (for envelope)
                    const normalizedX = (x / width) * 2 - 1;

                    // Gaussian Window / Envelope function to taper edges (Make it fade at ends)
                    // exp(-x^2) bell curve
                    const envelope = Math.pow(1 - Math.abs(normalizedX), 2);

                    // Wave calculation
                    // height/2 base
                    // + sin(x * freq + phase) 
                    // * amplitude (based on volume) 
                    // * envelope (to taper ends)
                    const baseAmp = height * 0.4 * (vol * wave.amplitude);

                    const sine = Math.sin(x * wave.frequency + (phaseRef.current * wave.speed) + phaseOffset);

                    // Add a second harmonic for more "organic" liquid feel
                    const sine2 = Math.sin(x * (wave.frequency * 2.5) + (phaseRef.current * wave.speed * 1.5)) * 0.3;

                    const y = centerY + (sine + sine2) * baseAmp * envelope;

                    ctx.lineTo(x, y);
                }

                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2 + (vol * 2); // Thicken lines when loud

                // Add Glow
                ctx.shadowBlur = 10 + (vol * 20);
                ctx.shadowColor = wave.color;

                ctx.stroke();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (isConnected) {
            animate();
        }

        return () => cancelAnimationFrame(animationFrameRef.current!);
    }, [isConnected]);

    const handleEndCall = async () => {
        const currentTranscript = useAppStore.getState().transcript;

        if (currentTranscript.length === 0) {
            setStatus("Error: No conversation detected. Speak first.");
            return;
        }

        setStatus('Analyzing Call...');
        serviceRef.current?.disconnect();
        setIsConnected(false);

        const report = await generateAnalysisReport(currentTranscript, useAppStore.getState().selectedPersona?.name);
        setReport(report);
        setStep('report');
    };

    return (
        <div className="min-h-screen bg-luxury-charcoal text-white flex flex-col relative overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-luxury-navy/80 to-luxury-charcoal pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

            {/* Top Bar */}
            <div className="relative z-10 w-full px-8 py-6 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-sm tracking-wider uppercase opacity-70 font-medium">{status}</span>
                </div>
                <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <Radio className="w-4 h-4 text-luxury-gold" />
                    <span className="text-xs font-mono opacity-60">LIVE FEED</span>
                </div>
            </div>

            {/* Main Content - Centered */}
            <div className="flex-1 flex flex-col items-center justify-center relative z-0 w-full">

                {/* Persona Overlap - Floating nicely */}
                <div className="absolute z-0 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none opacity-20">
                    <div className="w-64 h-64 rounded-full bg-gradient-to-br from-luxury-gold/10 to-transparent blur-3xl" />
                </div>

                {/* Persona Info */}
                <div className="text-center space-y-2 mb-8 relative z-10">
                    <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center border border-white/10 mb-4 shadow-xl">
                        <User className="w-8 h-8 text-luxury-gold/80" />
                    </div>
                    <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60">
                        {selectedPersona?.name}
                    </h2>
                    <p className="text-luxury-gold tracking-[0.2em] text-sm uppercase font-semibold">
                        {selectedPersona?.role} • {selectedPersona?.mood}
                    </p>
                </div>

                {/* Siri-style Canvas Visualizer */}
                <div className="w-full h-64 flex items-center justify-center relative">
                    <canvas ref={canvasRef} className="w-full h-full max-w-5xl" />
                </div>

                {/* Connection Status / Hint */}
                <div className="mt-12 h-8">
                    {transcript.length === 0 && isConnected && (
                        <p className="text-white/30 italic animate-pulse">Listening... speak naturally to begin</p>
                    )}
                    {transcript.length > 0 && (
                        <p className="text-white/20 text-xs">Session active</p>
                    )}
                </div>

            </div>

            {/* Bottom Controls */}
            <div className="relative z-10 pb-12 w-full flex justify-center items-center gap-8">
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`
                        w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300
                        ${isMuted
                            ? 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20'
                            : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:scale-105'
                        }
                    `}
                >
                    {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                </button>

                <button
                    onClick={handleEndCall}
                    className="group px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-full font-medium tracking-wide shadow-lg shadow-red-900/30 hover:shadow-red-900/50 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                >
                    <PhoneOff className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>End Session</span>
                </button>
            </div>
        </div>
    );
};
