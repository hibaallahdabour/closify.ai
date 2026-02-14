import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
    {
        name: "James C.",
        role: "Senior Broker",
        company: "Haus & Haus",
        quote: "I used to freeze when clients asked about ROI and Cap Rates. After 3 hours on Closify, I explained the numbers like a pro and closed a 15M AED villa."
    },
    {
        name: "Sarah L.",
        role: "Investment Advisor",
        company: "Betterhomes",
        quote: "The 'Distressed Seller' simulation is terrifyingly real. It taught me patience and silence. My conversion rate doubled in a month."
    },
    {
        name: "Mohammed A.",
        role: "Off-Plan Specialist",
        company: "Fäm Properties",
        quote: "Finally, a training tool that actually understands the Dubai market. It knows the locations, the laws, and the excuses buyers make."
    }
];

export const TestimonialsSection: React.FC = () => {
    return (
        <section className="py-32 bg-luxury-navy relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '40px 40px' }} />

            <div className="container mx-auto px-6 md:px-12 relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-xs font-bold tracking-[0.3em] text-luxury-gold uppercase mb-4">
                        Social Proof
                    </h2>
                    <h3 className="text-4xl md:text-6xl font-serif text-white">
                        Trusted by the Elite
                    </h3>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {TESTIMONIALS.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.2 }}
                            className="bg-white/5 backdrop-blur-md p-10 border border-white/10 relative"
                        >
                            <div className="flex gap-1 mb-6 text-luxury-gold">
                                {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                            </div>
                            <p className="text-lg text-white/80 font-light italic mb-8 leading-loose">
                                "{t.quote}"
                            </p>
                            <div>
                                <div className="text-white font-bold tracking-wide">{t.name}</div>
                                <div className="text-sm text-white/40 uppercase tracking-wider">{t.role} • {t.company}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
