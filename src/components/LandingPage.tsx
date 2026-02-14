import React, { useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { DemoModal } from './DemoModal';
import { AboutSection } from './landing/AboutSection';
import { FeaturesGrid } from './landing/FeaturesGrid';
import { HowItWorks } from './landing/HowItWorks';
import { CurriculumSection } from './landing/CurriculumSection';
import { TestimonialsSection } from './landing/TestimonialsSection';

export const LandingPage: React.FC = () => {
    const setStep = useAppStore(state => state.setStep);
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const titleLetters = "CLOSIFY".split("");

    return (
        <div className="min-h-screen flex flex-col relative bg-luxury-charcoal text-white font-sans selection:bg-luxury-gold selection:text-luxury-charcoal overflow-x-hidden">

            {/* Ambient Background Animation */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[100px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-luxury-navy/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
            </div>

            {/* Hero Section */}
            <header className="relative h-screen flex flex-col overflow-hidden">
                {/* Parallax Background */}
                <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-luxury-charcoal z-10" />
                    {/* Extra gradient for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-transparent to-black/40 z-10" />
                    <img
                        src="/dubai_hero.png"
                        alt="Dubai Skyline Luxury View"
                        className="w-full h-full object-cover object-center scale-110"
                    />
                </motion.div>

                {/* Navbar */}
                <nav className="relative z-20 w-full px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-sm">
                    <div className="text-xl font-serif font-bold tracking-[0.2em] text-white">
                        CLOSIFY
                    </div>
                    <div className="hidden md:flex gap-8 text-xs font-bold tracking-widest text-white/60">
                        <a href="#" className="hover:text-luxury-gold transition-colors">SIMULATION</a>
                        <a href="#" className="hover:text-luxury-gold transition-colors">MASTERY</a>
                        <a href="#" className="hover:text-luxury-gold transition-colors">ANALYTICS</a>
                    </div>
                    <button
                        onClick={() => setStep('auth')}
                        className="px-6 py-2 border border-luxury-gold/50 text-luxury-gold hover:bg-luxury-gold hover:text-luxury-navy transition-all duration-300 rounded-sm text-xs font-bold tracking-widest uppercase"
                    >
                        Login
                    </button>
                </nav>

                {/* Hero Content */}
                <motion.main
                    style={{ opacity }}
                    className="relative z-20 flex-grow flex flex-col items-center justify-center px-6 text-center"
                >
                    <div className="space-y-8 max-w-5xl">
                        {/* Decorative Line */}
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 60 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="w-[1px] bg-gradient-to-b from-transparent via-luxury-gold to-transparent mx-auto"
                        />

                        <h1 className="text-7xl md:text-9xl font-serif font-medium tracking-tight text-white mb-2 relative flex justify-center overflow-hidden">
                            {titleLetters.map((letter, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ y: 100, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{
                                        delay: index * 0.1,
                                        duration: 0.8,
                                        ease: [0.215, 0.61, 0.355, 1.0]
                                    }}
                                    className="inline-block"
                                >
                                    {letter}
                                </motion.span>
                            ))}
                            <span className="absolute -top-4 -right-8 text-lg font-sans font-normal text-luxury-gold opacity-60 tracking-widest uppercase hidden md:block">Est. 2026</span>
                        </h1>

                        <div className="relative inline-block">
                            <span className="absolute -left-8 top-0 text-4xl text-luxury-gold/30 font-serif">"</span>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="text-2xl md:text-3xl font-light text-white/90 italic font-serif tracking-wide px-4 drop-shadow-lg"
                            >
                                Where preparation meets opportunity.
                            </motion.p>
                            <span className="absolute -right-8 bottom-0 text-4xl text-luxury-gold/30 font-serif">"</span>
                        </div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5, duration: 1 }}
                            className="text-sm md:text-base text-white/70 tracking-[0.2em] uppercase max-w-2xl mx-auto pt-8 drop-shadow-md"
                        >
                            The First AI-Powered Training Ground for Elite Dubai Real Estate Agents
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-6 justify-center pt-8"
                        >
                            <button
                                onClick={() => setStep('auth')}
                                className="group px-10 py-4 bg-luxury-gold text-luxury-navy text-sm font-bold tracking-widest uppercase rounded-sm hover:bg-white transition-all duration-500 shadow-[0_0_40px_rgba(197,160,89,0.2)]"
                            >
                                <span className="flex items-center gap-2">
                                    Start Simulation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>

                            <button
                                onClick={() => setIsDemoOpen(true)}
                                className="px-10 py-4 border border-white/20 text-white hover:border-white hover:bg-white/5 transition-all duration-300 rounded-sm text-sm font-bold tracking-widest uppercase backdrop-blur-sm"
                            >
                                <span className="flex items-center gap-2">
                                    <Play className="w-3 h-3 fill-current" /> Watch Demo
                                </span>
                            </button>
                        </motion.div>
                    </div>
                </motion.main>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.2, duration: 1 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
                >
                    <span className="text-[10px] tracking-[0.3em] text-white/30 uppercase">Scroll</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-white/50 to-transparent" />
                </motion.div>
            </header>

            {/* Scrollable Content Sections with Z-Index for stacking */}
            <div className="relative z-10 bg-luxury-charcoal shadow-2xl">
                <AboutSection />
                <FeaturesGrid />
                <CurriculumSection />
                <HowItWorks />
                <TestimonialsSection />

                {/* Final CTA Footer */}
                <footer className="py-32 bg-luxury-navy text-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/dubai_hero.png')] opacity-5 bg-cover bg-center fixed-attachment" />
                    <div className="relative z-10 container mx-auto px-6">
                        <div className="w-16 h-1 bg-luxury-gold mx-auto mb-8" />
                        <h2 className="text-4xl md:text-6xl font-serif text-white mb-8">Ready to join the 1%?</h2>
                        <button
                            onClick={() => setStep('auth')}
                            className="px-12 py-5 bg-white text-luxury-navy text-sm font-bold tracking-widest uppercase rounded-sm hover:bg-luxury-gold hover:text-white transition-all duration-300 shadow-2xl"
                        >
                            Begin Assessment
                        </button>
                        <div className="mt-16 flex justify-center gap-8 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Fake logos for social proof logic if needed, or just copyright */}
                        </div>
                        <p className="mt-8 text-white/20 text-xs tracking-widest">© 2026 CLOSIFY. DUBAI.</p>
                    </div>
                </footer>
            </div>

            <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        </div>
    );
};
