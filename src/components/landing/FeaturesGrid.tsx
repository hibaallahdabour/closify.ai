import React from 'react';
import { motion } from 'framer-motion';
import { Users, Scale, BarChart3, ShieldAlert, MapPin, TrendingUp } from 'lucide-react';

const FEATURES = [
    {
        icon: <Users className="w-6 h-6" />,
        title: "Multi-Persona Simulation",
        desc: "Face off against aggressive investors, hesitant first-time buyers, and strict landlords."
    },
    {
        icon: <Scale className="w-6 h-6" />,
        title: "Market Intelligence",
        desc: "AI trained on real transaction data, market trends, and investment logic."
    },
    {
        icon: <BarChart3 className="w-6 h-6" />,
        title: "Sentiment Analysis",
        desc: "Real-time tracking of empathy, confidence, and closing probability."
    },
    {
        icon: <ShieldAlert className="w-6 h-6" />,
        title: "Objection Handling",
        desc: "Master common Dubai-specific objections like 'Service charges are too high'."
    },
    {
        icon: <MapPin className="w-6 h-6" />,
        title: "Hyper-Local Context",
        desc: "The AI knows the difference between Palm Jumeirah and JVC."
    },
    {
        icon: <TrendingUp className="w-6 h-6" />,
        title: "Performance Tracking",
        desc: "Detailed report cards after every call to track your improvement over time."
    }
];

export const FeaturesGrid: React.FC = () => {
    return (
        <section className="py-24 px-6 bg-luxury-navy/50 relative">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-[0.2em] text-luxury-gold uppercase mb-4">
                        The Unfair Advantage
                    </h2>
                    <h3 className="text-3xl md:text-5xl font-serif text-white">
                        Why Top Agents Choose Closify
                    </h3>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                            className="p-8 bg-white/5 border border-white/10 hover:border-luxury-gold/50 hover:bg-white/10 transition-all duration-300 group rounded-xl"
                        >
                            <div className="mb-6 p-4 bg-luxury-gold/10 rounded-full w-fit text-luxury-gold group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h4 className="text-xl font-bold text-white mb-3 group-hover:text-luxury-gold transition-colors">
                                {feature.title}
                            </h4>
                            <p className="text-white/60 leading-relaxed text-sm">
                                {feature.desc}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};
