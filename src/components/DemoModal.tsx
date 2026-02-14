
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Mic, User } from 'lucide-react';

const DEMO_SCRIPT = [
    { speaker: 'ai', text: "Good morning! This is Sarah, your dedicated specialized agent for Downtown Dubai options. I see you're interested in high-yield investments?" },
    { speaker: 'user', text: "Yes, but I'm concerned about the current market saturation in that area." },
    { speaker: 'ai', text: "I understand completely. However, data shows Downtown luxury resale value has increased by 15% this quarter, driven by limited supply of premium units." },
    { speaker: 'user', text: "That's interesting. What about the service charges?" },
    { speaker: 'ai', text: "Valid point. While higher, the rental yields of 8-9% in this specific building comfortably offset those costs, ensuring a healthy net ROI." },
    { speaker: 'user', text: "Okay, you make a strong case. Let's discuss available units." }
];

interface DemoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [displayedLines, setDisplayedLines] = useState<typeof DEMO_SCRIPT>([]);

    useEffect(() => {
        if (!isOpen) {
            setDisplayedLines([]);
            setCurrentIndex(0);
            return;
        }

        const interval = setInterval(() => {
            if (currentIndex < DEMO_SCRIPT.length) {
                setDisplayedLines(prev => [...prev, DEMO_SCRIPT[currentIndex]]);
                setCurrentIndex(prev => prev + 1);
            } else {
                clearInterval(interval);
            }
        }, 2500); // New line every 2.5 seconds

        return () => clearInterval(interval);
    }, [isOpen, currentIndex]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative w-full max-w-2xl bg-luxury-charcoal border border-luxury-gold/30 rounded-2xl overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-2 text-luxury-gold">
                        <Play className="w-4 h-4 fill-current" />
                        <span className="font-bold tracking-wider text-sm">LIVE SIMULATION PREVIEW</span>
                    </div>
                    <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 flex flex-col gap-6 h-[500px]">

                    {/* Visualizer Placeholder */}
                    <div className="h-32 flex items-center justify-center gap-1">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <motion.div
                                key={i}
                                animate={{
                                    height: [10, Math.random() * 60 + 10, 10],
                                    opacity: [0.3, 1, 0.3]
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.05,
                                    ease: "easeInOut"
                                }}
                                className="w-1 bg-luxury-gold rounded-full"
                            />
                        ))}
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 mask-fade-y">
                        <AnimatePresence>
                            {displayedLines.map((line, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: line.speaker === 'ai' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex gap-3 ${line.speaker === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${line.speaker === 'ai' ? 'bg-luxury-gold text-luxury-charcoal' : 'bg-white/20 text-white'}`}>
                                        {line.speaker === 'ai' ? <Mic className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                    </div>
                                    <div className={`p-3 rounded-lg text-sm max-w-[80%] ${line.speaker === 'ai' ? 'bg-white/10 text-white' : 'bg-luxury-gold/20 text-luxury-gold-light'}`}>
                                        {line.text}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {currentIndex >= DEMO_SCRIPT.length && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center text-white/40 text-sm mt-4 italic"
                            >
                                Simulation Complete
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="p-6 border-t border-white/10 bg-white/5 text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-luxury-gold text-luxury-navy font-bold rounded-sm hover:bg-white transition-colors"
                    >
                        Try It Yourself
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
