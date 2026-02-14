import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, User } from 'lucide-react';
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
        setAudioVolume
    } = useAppStore();

    const [transcript, setTranscript] = useState<{ speaker: 'user' | 'ai', text: string, timestamp: number }[]>([]);
    const [isMuted, setIsMuted] = useState(false);
    const [status, setStatus] = useState('Connecting...');

    // Service Ref
    const serviceRef = useRef<GeminiLiveService | null>(null);

    // Audio Visualizer Canvas
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameRef = useRef<number>(0);

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

        // Initialize Service
        const service = new GeminiLiveService(
            (vol) => setAudioVolume(vol), // Update volume store for separate usage if needed
            (text, isUser) => {
                setTranscript(prev => [...prev, {
                    speaker: isUser ? 'user' : 'ai',
                    text,
                    timestamp: Date.now()
                }]);
            },
            (errorMessage) => {
                setStatus(errorMessage);
                // Optionally disconnect if critical error
                if (errorMessage.includes("Disconnected") || errorMessage.includes("Error")) {
                    setIsConnected(false);
                }
            }
        );

        serviceRef.current = service;

        service.connect(apiKey, selectedPersona)
            .then(() => {
                setIsConnected(true);
                setStatus('Connected - Start Speaking');
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

    // Visualizer Loop
    useEffect(() => {
        if (!isConnected) return;

        // Mock visualizer if no real audio data access in this component yet (store has volume)
        // Ideally we use the volume from store to drive this
        const draw = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const width = canvas.width;
            const height = canvas.height;
            const volume = useAppStore.getState().audioVolume; // Poll volume

            ctx.clearRect(0, 0, width, height);

            // Draw Wave
            ctx.beginPath();
            ctx.moveTo(0, height / 2);

            for (let i = 0; i < width; i++) {
                const amplitude = volume * 50;
                const waveLength = 20;
                const y = height / 2 + Math.sin(i / waveLength + Date.now() / 100) * amplitude * Math.sin(i / width * Math.PI); // envelope
                ctx.lineTo(i, y);
            }

            ctx.strokeStyle = '#C5A059'; // Gold
            ctx.lineWidth = 3;
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#C5A059';
            ctx.stroke();

            animationFrameRef.current = requestAnimationFrame(draw);
        };

        draw();
    }, [isConnected]);


    const handleEndCall = async () => {
        setStatus('Analyzing Call...');
        serviceRef.current?.disconnect();
        setIsConnected(false);

        // Generate Report
        const report = await generateAnalysisReport(transcript);
        setReport(report);
        setStep('report');
    };

    return (
        <div className="min-h-screen bg-luxury-charcoal text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-luxury-navy to-luxury-charcoal opacity-90" />

            {/* Status Overlay */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/10">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-sm font-medium tracking-wide">{status}</span>
            </div>

            <div className="z-10 w-full max-w-4xl flex flex-col items-center gap-12">

                {/* Persona Card */}
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-white/10 rounded-full mx-auto flex items-center justify-center border-2 border-luxury-gold shadow-[0_0_30px_rgba(197,160,89,0.3)]">
                        <User className="w-10 h-10 text-luxury-gold" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-serif">{selectedPersona?.name}</h2>
                        <p className="text-white/60 uppercase tracking-widest text-sm mt-1">{selectedPersona?.role} • {selectedPersona?.mood}</p>
                    </div>
                </div>

                {/* Audio Visualizer */}
                <div className="w-full h-48 bg-black/20 rounded-3xl border border-white/5 relative overflow-hidden flex items-center justify-center backdrop-blur-sm">
                    <canvas ref={canvasRef} width={800} height={192} className="w-full h-full" />
                </div>

                {/* Live Transcript (Rolling) */}
                <div className="w-full h-48 overflow-y-auto px-4 mask-fade-y space-y-3">
                    <AnimatePresence>
                        {transcript.slice(-4).map((t, i) => (
                            <motion.div
                                key={t.timestamp + i}
                                initial={{ opacity: 0, x: t.speaker === 'ai' ? -20 : 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex items-start gap-3 ${t.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`p-2 rounded-lg text-sm max-w-[80%] ${t.speaker === 'user' ? 'bg-luxury-gold/20 text-luxury-gold-light' : 'bg-white/10 text-white'}`}>
                                    {t.text}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    {transcript.length === 0 && <p className="text-center text-white/30 italic">Start speaking to begin...</p>}
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className={`p-6 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-white/10 hover:bg-white/20 text-white border-white/20'} border backdrop-blur-sm`}
                    >
                        {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                    </button>

                    <button
                        onClick={handleEndCall}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-full shadow-lg hover:shadow-red-900/50 transition-all flex items-center gap-3"
                    >
                        <PhoneOff className="w-6 h-6" /> End Session
                    </button>
                </div>
            </div>
        </div>
    );
};
