import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export const AboutSection: React.FC = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });

    // Parallax effect for the image
    const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

    return (
        <section ref={ref} className="relative py-32 px-6 md:px-12 lg:px-24 bg-luxury-charcoal overflow-hidden border-t border-white/5">
            <div className="container mx-auto grid md:grid-cols-2 gap-20 items-center">

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className="space-y-10 relative z-10"
                >
                    <div>
                        <h2 className="text-xs font-bold tracking-[0.3em] text-luxury-gold uppercase mb-6 flex items-center gap-4">
                            <span className="w-12 h-[1px] bg-luxury-gold"></span>
                            THE REALITY
                        </h2>
                        <h3 className="text-4xl md:text-6xl font-serif text-white leading-[1.1]">
                            Why do 90% of new agents fail in Year 1?
                        </h3>
                    </div>

                    <div className="space-y-6 text-lg text-white/60 font-light leading-relaxed">
                        <p>
                            It's not lack of ambition. It's <span className="text-white font-normal">lack of repetitions</span>.
                            In the real world, practicing on a client costs you the deal.
                        </p>
                        <p>
                            You freeze when they ask about the ROI. You stutter when they mention a competitor. You lose the lead.
                        </p>
                        <motion.div
                            whileHover={{ x: 10 }}
                            className="pl-6 border-l-2 border-luxury-gold text-white font-medium italic"
                        >
                            "Closify solves this by giving you infinite repetitions with zero risk. Make your mistakes here, so you remain flawless out there."
                        </motion.div>
                    </div>

                    <div className="pt-8 flex gap-12 border-t border-white/10">
                        <div>
                            <div className="text-5xl font-serif text-luxury-gold mb-2">10k+</div>
                            <div className="text-xs text-white/40 tracking-widest uppercase">Hours Simulated</div>
                        </div>
                        <div>
                            <div className="text-5xl font-serif text-luxury-gold mb-2">3x</div>
                            <div className="text-xs text-white/40 tracking-widest uppercase">Faster Closings</div>
                        </div>
                    </div>
                </motion.div>

                {/* Visual Content */}
                <div className="relative h-[700px] w-full">
                    <motion.div
                        style={{ y }}
                        className="absolute inset-0"
                    >
                        <div className="absolute top-0 right-0 w-full h-full bg-luxury-gold/5 -translate-y-8 translate-x-8 border border-luxury-gold/20 z-0" />
                        <img
                            src="/dubai_abstract.png"
                            alt="Dubai Architecture"
                            className="relative z-10 w-full h-full object-cover grayscale brightness-[0.6] hover:grayscale-0 transition-all duration-1000 ease-out border border-white/10 shadow-2xl"
                        />
                        {/* Floating Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 0.8 }}
                            className="absolute -bottom-10 -left-10 z-20 bg-luxury-navy/90 backdrop-blur-xl p-8 border border-white/10 shadow-2xl max-w-sm hidden md:block"
                        >
                            <div className="text-luxury-gold text-4xl font-serif mb-2">“</div>
                            <p className="text-white/80 font-light italic text-sm">
                                I practiced the 'Service Charge Objection' 50 times on Closify. When it came up in my 40M AED deal, I didn't even blink.
                            </p>
                            <div className="mt-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white/10" />
                                <div className="text-xs uppercase tracking-widest text-white/50">Top Broker 2025</div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};
