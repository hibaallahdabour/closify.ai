import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../store/useAppStore';
import { User, Mail, ChevronRight, Lock } from 'lucide-react';

export const AuthModal: React.FC = () => {
    const { setUserProfile, setStep } = useAppStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            setIsLoading(true);
            // Simulate a "login" delay for effect
            await new Promise(resolve => setTimeout(resolve, 800));
            setUserProfile({ name, email });
            setStep('persona-selection');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden selection:bg-luxury-gold selection:text-white">
            {/* Cinematic Background */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop"
                    alt="Luxury Building"
                    className="w-full h-full object-cover opacity-40 scale-105 animate-slow-pan"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-luxury-navy/80 to-luxury-charcoal/40" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 w-full max-w-md mx-4"
            >
                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">

                    {/* Subtle Gold Glow on Hover */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl" />

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="w-16 h-16 bg-gradient-to-br from-luxury-gold to-yellow-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-amber-500/20 mb-6 rotate-3 hover:rotate-6 transition-transform duration-500">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-3xl font-serif text-white mb-2 tracking-wide">Enter the Simulation</h2>
                            <p className="text-white/40 text-sm font-light uppercase tracking-widest">RealtyVoice AI • Professional Training</p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs text-luxury-gold font-bold uppercase tracking-wider ml-1">Agent Name</label>
                                <div className="relative group/input">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-slate group-focus-within/input:text-luxury-gold transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:bg-black/40 outline-none transition-all"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-luxury-gold font-bold uppercase tracking-wider ml-1">Agency Email</label>
                                <div className="relative group/input">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-luxury-slate group-focus-within/input:text-luxury-gold transition-colors" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:border-luxury-gold focus:ring-1 focus:ring-luxury-gold focus:bg-black/40 outline-none transition-all"
                                        placeholder="account@agency.com"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-8 bg-gradient-to-r from-luxury-gold to-yellow-600 hover:from-yellow-400 hover:to-yellow-700 text-luxury-charcoal font-bold py-4 rounded-xl shadow-lg shadow-amber-500/20 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 group/btn relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {isLoading ? 'Accessing Secure Server...' : 'Begin Session'}
                                    {!isLoading && <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
                                </span>
                                {/* Hover Sheen Effect */}
                                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
                            </button>
                        </form>
                    </div>
                </div>

                <p className="text-center text-white/20 text-xs mt-8 font-light">
                    Protected by Quantum-Level Encryption • v2.4.0
                </p>
            </motion.div>
        </div>
    );
};
