import React from 'react';
import { motion } from 'framer-motion';

const CURRICULUM = [
    {
        module: "01",
        title: "The Off-Plan Playbook",
        description: "Master the art of selling vision. Handle standard payment plan objections and project delay concerns."
    },
    {
        module: "02",
        title: "Secondary Market Warfare",
        description: "Navigate gazumping, distressing sellers, and emotional buyers in high-stakes secondary transfers."
    },
    {
        module: "03",
        title: "Distressed Deal Hunter",
        description: "Identify and close below-market opportunities. Negotiate hard with sellers who need liquidity fast."
    },
    {
        module: "04",
        title: "Ultra-High Net Worth",
        description: "Concierge-level service simulation. Handling privacy, crypto payments, and offshore structuring questions."
    }
];

export const CurriculumSection: React.FC = () => {
    return (
        <section className="py-24 bg-luxury-charcoal relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            <div className="container mx-auto px-6 md:px-12">
                <div className="mb-16">
                    <h2 className="text-xs font-bold tracking-[0.3em] text-luxury-gold uppercase mb-4">
                        Training Modules
                    </h2>
                    <h3 className="text-4xl md:text-5xl font-serif text-white max-w-2xl">
                        Simulate Every Scenario. <br />
                        <span className="text-white/50">Before it costs you a commision.</span>
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {CURRICULUM.map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-8 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-luxury-gold -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />

                            <div className="text-4xl font-serif text-white/10 group-hover:text-luxury-gold/50 transition-colors mb-6">
                                {item.module}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-4 group-hover:text-luxury-gold transition-colors">
                                {item.title}
                            </h4>
                            <p className="text-sm text-white/60 leading-relaxed group-hover:text-white/80 transition-colors">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
