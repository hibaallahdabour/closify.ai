import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowRight, Play, Star, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { DemoModal } from './DemoModal';
import { AboutSection } from './landing/AboutSection';
import { FeaturesGrid } from './landing/FeaturesGrid';
import { HowItWorks } from './landing/HowItWorks';
import { CurriculumSection } from './landing/CurriculumSection';
import { TestimonialsSection } from './landing/TestimonialsSection';
import { MouseTracker } from './ui/MouseTracker';

// --- Reusable Scroll Reveal Component ---
const RevealSection: React.FC<{ children: React.ReactNode; width?: "100%" | "fit-content" }> = ({ children, width = "fit-content" }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 75 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 75 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ width }}
        >
            {children}
        </motion.div>
    );
};

export const LandingPage: React.FC = () => {
    const setStep = useAppStore(state => state.setStep);
    const [isDemoOpen, setIsDemoOpen] = useState(false);
    const { scrollY } = useScroll();

    // Parallax Effects
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 400], [1, 0]);
    const scale = useTransform(scrollY, [0, 500], [1.1, 1]); // Subtle zoom out on scroll

    const titleLetters = "CLOSIFY".split("");

    return (
        <div className="min-h-screen flex flex-col relative bg-luxury-charcoal text-white font-sans selection:bg-luxury-gold selection:text-luxury-charcoal overflow-x-hidden cursor-none"> {/* cursor-none triggers MouseTracker use */}

            <MouseTracker />

            {/* Ambient Background Animation - Global */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-luxury-gold/5 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[900px] h-[900px] bg-luxury-navy/20 rounded-full blur-[150px] animate-pulse-slow delay-1000" />
            </div>

            {/* Hero Section */}
            <header className="relative h-screen flex flex-col overflow-hidden">
                {/* Parallax Background */}
                <motion.div style={{ y: y1, scale }} className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-luxury-charcoal z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-charcoal via-transparent to-black/50 z-10" />
                    <img
                        src="/dubai_hero.png"
                        alt="Dubai Skyline Luxury View"
                        className="w-full h-full object-cover object-center"
                    />
                </motion.div>

                {/* Navbar */}
                <nav className="relative z-20 w-full px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md">
                    <div className="text-xl font-serif font-bold tracking-[0.2em] text-white flex items-center gap-2">
                        <Star className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
                        CLOSIFY
                    </div>
                    <div className="hidden md:flex gap-10 text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">
                        {['Simulation', 'Mastery', 'Analytics'].map((item) => (
                            <a key={item} href="#" className="hover:text-luxury-gold transition-colors relative group">
                                {item}
                                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-luxury-gold transition-all duration-300 group-hover:w-full" />
                            </a>
                        ))}
                    </div>
                    <button
                        onClick={() => setStep('auth')}
                        className="px-8 py-3 bg-white/5 border border-white/10 text-white hover:bg-luxury-gold hover:text-luxury-navy hover:border-luxury-gold transition-all duration-500 rounded-sm text-[10px] font-bold tracking-[0.2em] uppercase backdrop-blur-md"
                    >
                        Login
                    </button>
                </nav>

                {/* Hero Content */}
                <motion.main
                    style={{ opacity }}
                    className="relative z-20 flex-grow flex flex-col items-center justify-center px-6 text-center"
                >
                    <div className="space-y-10 max-w-6xl">
                        {/* Decorative Top Line */}
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 80, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="w-[1px] bg-gradient-to-b from-transparent via-luxury-gold to-white/20 mx-auto"
                        />

                        {/* Title with Staggered Reveal */}
                        <h1 className="text-7xl md:text-[10rem] font-serif font-medium tracking-tighter text-white leading-none relative flex justify-center overflow-visible mix-blend-overlay">
                            {titleLetters.map((letter, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ y: 150, opacity: 0, skewY: 10 }}
                                    animate={{ y: 0, opacity: 1, skewY: 0 }}
                                    transition={{
                                        delay: index * 0.1,
                                        duration: 1.2,
                                        ease: [0.215, 0.61, 0.355, 1.0]
                                    }}
                                    className="inline-block hover:text-luxury-gold transition-colors duration-500 cursor-none" // custom cursor handles interaction
                                >
                                    {letter}
                                </motion.span>
                            ))}

                            {/* Accent Year */}
                            <motion.span
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.5, duration: 1 }}
                                className="absolute top-4 right-0 md:-right-12 text-sm font-sans font-bold text-luxury-gold/80 tracking-[0.3em] uppercase hidden md:block rotate-90 origin-left"
                            >
                                Est. 2026
                            </motion.span>
                        </h1>

                        {/* Subtitle / Quote */}
                        <div className="relative inline-block max-w-3xl">
                            <motion.p
                                initial={{ opacity: 0, filter: "blur(10px)" }}
                                animate={{ opacity: 1, filter: "blur(0px)" }}
                                transition={{ delay: 1.2, duration: 1 }}
                                className="text-2xl md:text-3xl font-light text-white/90 italic font-serif tracking-wide px-8 leading-relaxed"
                            >
                                <span className="text-luxury-gold/50 opacity-50 mr-2">"</span>
                                Where preparation meets opportunity
                                <span className="text-luxury-gold/50 opacity-50 ml-2">"</span>
                            </motion.p>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ delay: 1.4, duration: 1, ease: "circOut" }}
                                className="w-24 h-[1px] bg-luxury-gold mx-auto mt-6 opacity-60"
                            />
                        </div>

                        {/* Tagline */}
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.6, duration: 1 }}
                            className="text-white/60 tracking-[0.3em] uppercase text-xs md:text-sm font-semibold pt-4"
                        >
                            The Premier Training Ground for Dubai's Elite Agents
                        </motion.p>

                        {/* CTAs */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.8, duration: 0.8 }}
                            className="flex flex-col sm:flex-row gap-8 justify-center items-center pt-8"
                        >
                            <button
                                onClick={() => setStep('auth')}
                                className="group px-12 py-5 bg-gradient-to-r from-luxury-gold to-[#D4AF37] text-luxury-navy text-xs font-bold tracking-[0.2em] uppercase rounded-sm hover:text-white transition-all duration-500 shadow-[0_0_50px_rgba(197,160,89,0.3)] hover:shadow-[0_0_80px_rgba(197,160,89,0.5)] relative overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    Start Simulation
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <div className="absolute inset-0 bg-luxury-charcoal transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left ease-out" />
                            </button>

                            <button
                                onClick={() => setIsDemoOpen(true)}
                                className="group px-12 py-5 border border-white/20 text-white hover:border-white transition-all duration-300 rounded-sm text-xs font-bold tracking-[0.2em] uppercase backdrop-blur-sm flex items-center gap-3 hover:bg-white/5"
                            >
                                <Play className="w-3 h-3 fill-current group-hover:text-luxury-gold transition-colors" />
                                Watch Demo
                            </button>
                        </motion.div>
                    </div>
                </motion.main>

                {/* Scroll Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.5, duration: 1 }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30 pointer-events-none"
                >
                    <span className="text-[9px] tracking-[0.4em] text-white/40 uppercase">E x p l o r e</span>
                    <motion.div
                        animate={{ y: [0, 10, 0], opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    >
                        <ChevronDown className="w-5 h-5 text-luxury-gold/80" />
                    </motion.div>
                </motion.div>
            </header>

            {/* Scrollable Content Sections with Z-Index for stacking & Reveal Animation */}
            <div className="relative z-10 bg-luxury-charcoal shadow-2xl">

                {/* About Section */}
                <RevealSection width="100%">
                    <AboutSection />
                </RevealSection>

                {/* Features Grid */}
                <RevealSection width="100%">
                    <FeaturesGrid />
                </RevealSection>

                {/* Curriculum */}
                <RevealSection width="100%">
                    <CurriculumSection />
                </RevealSection>

                {/* How It Works */}
                <RevealSection width="100%">
                    <HowItWorks />
                </RevealSection>

                {/* Testimonials */}
                <RevealSection width="100%">
                    <TestimonialsSection />
                </RevealSection>

                {/* Final CTA Footer */}
                <footer className="py-32 bg-luxury-navy text-center relative overflow-hidden group">
                    {/* Hover Effect on Footer BG */}
                    <div className="absolute inset-0 bg-[url('/dubai_hero.png')] opacity-10 bg-cover bg-center fixed-attachment group-hover:scale-105 transition-transform duration-[2s]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-navy via-luxury-navy/90 to-transparent" />

                    <div className="relative z-10 container mx-auto px-6">
                        <RevealSection width="100%">
                            <div className="flex flex-col items-center">
                                <div className="w-20 h-1 bg-luxury-gold mb-10" />
                                <h2 className="text-5xl md:text-7xl font-serif text-white mb-8 tracking-tight">
                                    Ready to join the <span className="text-luxury-gold italic">1%</span>?
                                </h2>
                                <p className="text-white/50 text-lg max-w-2xl mb-12 font-light">
                                    The market doesn't wait. Your transformation begins now.
                                </p>
                                <button
                                    onClick={() => setStep('auth')}
                                    className="px-16 py-6 bg-white text-luxury-navy text-sm font-bold tracking-[0.25em] uppercase rounded-sm hover:bg-luxury-gold hover:text-white transition-all duration-500 shadow-2xl hover:shadow-[0_0_60px_rgba(197,160,89,0.4)]"
                                >
                                    Begin Assessment
                                </button>

                                <div className="mt-20 flex justify-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                                    {/* Placeholder Logos */}
                                    {['EMAAR', 'DAMAC', 'NAKHEEL', 'SOBHA'].map(brand => (
                                        <span key={brand} className="text-xl font-serif font-bold tracking-widest">{brand}</span>
                                    ))}
                                </div>
                                <p className="mt-12 text-white/20 text-[10px] tracking-[0.3em] uppercase">© 2026 CLOSIFY. DUBAI. ALL RIGHTS RESERVED.</p>
                            </div>
                        </RevealSection>
                    </div>
                </footer>
            </div>

            <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
        </div>
    );
};
