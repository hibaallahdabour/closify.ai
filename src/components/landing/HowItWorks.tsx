import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
    { title: "Select Persona", desc: "Choose from a library of Buyer, Seller, Landlord, or Tenant profiles." },
    { title: "Start Simulation", desc: "Initiate a voice call. No typing, just real conversation." },
    { title: "Negotiate Live", desc: "The AI reacts to your tone, price offers, and legal knowledge." },
    { title: "Get Graded", desc: "Receive immediate feedback on where you won and where you lost." }
];

export const HowItWorks: React.FC = () => {
    return (
        <section className="py-24 px-6 bg-luxury-charcoal relative overflow-hidden">
            {/* Background Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-white/10 -translate-x-1/2 hidden md:block" />

            <div className="container mx-auto max-w-4xl relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-4">
                        Process
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-serif text-white">
                        How It Works
                    </h3>
                </div>

                <div className="space-y-12 relative">
                    {STEPS.map((step, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6 }}
                            className="flex flex-col md:flex-row items-center gap-8"
                        >
                            {/* Left Side */}
                            <div className={`flex-1 text-center md:text-right ${i % 2 !== 0 ? 'hidden md:block opacity-0' : ''}`}>
                                {i % 2 === 0 && (
                                    <>
                                        <h4 className="text-2xl font-bold text-white mb-2">{step.title}</h4>
                                        <p className="text-white/60">{step.desc}</p>
                                    </>
                                )}
                            </div>

                            {/* Center Circle */}
                            <div className="w-12 h-12 shrink-0 rounded-full bg-luxury-gold border-4 border-luxury-charcoal flex items-center justify-center font-bold text-luxury-navy z-10 shadow-[0_0_20px_rgba(197,160,89,0.5)]">
                                {i + 1}
                            </div>

                            {/* Right Side */}
                            <div className={`flex-1 text-center md:text-left ${i % 2 === 0 ? 'hidden md:block opacity-0' : ''}`}>
                                {i % 2 !== 0 && (
                                    <>
                                        <h4 className="text-2xl font-bold text-white mb-2">{step.title}</h4>
                                        <p className="text-white/60">{step.desc}</p>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
