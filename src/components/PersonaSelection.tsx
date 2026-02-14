import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Target, Loader2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import type { PersonaConfig } from '../store/useAppStore';
import { generatePersonaConfig } from '../services/gemini';
import { clsx } from 'clsx';

const HARDCODED_PERSONAS: PersonaConfig[] = [
    {
        id: '1',
        name: 'Sophia Rossi',
        role: 'Buyer',
        difficulty: 'Beginner',
        mood: 'Anxious & Skeptical',
        voiceName: 'Aoede',
        context: 'First-time buyer from Italy. Budget 1.2M AED. Wants a 1-bed in Marina. terrified of purchasing at the peak.',
        objections: ['Is this really the right time to buy?', 'My friend said prices are dropping', 'I don\'t want to lose my savings'],
        systemInstruction: 'You are Sophia. You are NERVOUS. Use filler words like "umm" and "well...". You rely on rumors. If the agent makes sense, say "Okay, that makes sense but...". Do not be aggressive, just scared.'
    },
    {
        id: '2',
        name: 'Mr. Zhang',
        role: 'Investor',
        difficulty: 'Expert',
        mood: 'Dominant & Impatient',
        voiceName: 'Charon',
        context: 'Cash buyer from Shanghai. Wants a bulk deal (3 floors) in Business Bay. Demands 15% discount. Only cares about ROI.',
        objections: ['Too expensive', 'I have a better offer next door', 'What is the net yield after ALL fees?'],
        systemInstruction: 'You are Mr. Zhang. You are busy. Speak in short bursts. "Show me numbers." "Too high." If the agent tries to sell you "lifestyle", cut them off. You only care about the bottom line.'
    },
    {
        id: '3',
        name: 'Elena K.',
        role: 'Buyer', // Changed from Seller
        difficulty: 'Intermediate',
        mood: 'Dreamer vs Reality',
        voiceName: 'Kore',
        context: 'End-user looking for a "Luxury Villa" on a townhouse budget (2.5M AED). Wants Palm Jumeirah vibes in JVC.',
        objections: ['The rooms look small', 'I want a sea view (impossible at budget)', 'This doesn\'t feel "luxury" enough'],
        systemInstruction: 'You are Elena. You are in love with the IDEA of Dubai luxury but have a limited budget. Be emotional. Use words like "vibe", "aesthetic", "energy". Disregard logic about price per sqft.'
    },
    {
        id: '4',
        name: 'Tariq Al-Hamad',
        role: 'Investor',
        difficulty: 'Nightmare',
        mood: 'The Local Pro',
        voiceName: 'Fenrir',
        context: 'Experienced local flipper. Knows every building and developer. Testing if you are an amateur.',
        objections: ['That developer is late on handover', 'The chiller fees there are crazy', 'I can get this cheaper on the secondary market'],
        systemInstruction: 'You are Tariq. You sound bored and knowledgeable. Test the agent. "Do you even know the service charges there?" If they lie, catch them. "No, that\'s wrong." Be arrogant but if they prove they know their stuff, respect them.'
    },
    {
        id: '5',
        name: 'Sarah Jenkins',
        role: 'Buyer', // Changed from Tenant
        difficulty: 'Intermediate',
        mood: 'Crypto & Flashy',
        voiceName: 'Aoede', // Young/Rich vibe
        context: '24-year-old crypto millionaire. Wants a "Trophy Asset" to show off on Instagram. Vague about source of funds.',
        objections: ['Can I pay in USDT?', 'Is the building famous?', 'I need something ready NOW'],
        systemInstruction: 'You are Sarah. You are young, rich, and impatient. You don\'t care about "layouts", you care about "views" and "status". Ask about crypto payments constantly. Be flighty.'
    },
    {
        id: '6',
        name: 'James Sterling',
        role: 'Investor', // Changed from Landlord
        difficulty: 'Expert',
        mood: 'The Analyst',
        voiceName: 'Puck',
        context: ' engineer/analyst type. Has a spreadsheet open. Obsessed with Capital Appreciation vs Rental Yield comparisons.',
        objections: ['Show me the historical data for the last 5 years', 'What is the internal rate of return?', 'I need to factor in the void periods'],
        systemInstruction: 'You are James. You are logical and cold. Do not respond to emotional sales pitches. Ask for specific percentages. "Okay, but what is the exact Cap Rate?" If the agent estimates, demand precision.'
    }
];

export const PersonaSelection: React.FC = () => {
    const { setSelectedPersona, setStep, isGeneratingScenario, setIsGeneratingScenario } = useAppStore();
    const [customTopic, setCustomTopic] = useState('');

    const handleSelect = (persona: PersonaConfig) => {
        setSelectedPersona(persona);
        setStep('simulation');
    };

    const handleGenerate = async () => {
        if (!customTopic.trim()) return;
        setIsGeneratingScenario(true);
        try {
            // Call Gemini to generate persona
            const newPersona = await generatePersonaConfig(customTopic);
            handleSelect(newPersona);
        } catch (error) {
            console.error(error);
            alert("Failed to generate scenario. Please try again.");
        } finally {
            setIsGeneratingScenario(false);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-off-white p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
                <button onClick={() => setStep('landing')} className="mb-8 text-luxury-slate hover:text-luxury-gold transition-colors">
                    ← Back to Home
                </button>

                <h2 className="text-4xl font-serif font-bold mb-2">Choose Your Challenge</h2>
                <p className="text-luxury-slate mb-12">Select a pre-designed scenario or generate a custom training situation.</p>

                {/* Custom Scenario Generator */}
                <div className="mb-16 p-8 glass-card bg-gradient-to-br from-white to-luxury-sand/30">
                    <div className="flex items-center gap-3 mb-4">
                        <Sparkles className="text-luxury-gold w-6 h-6" />
                        <h3 className="text-2xl font-bold">Dynamic Scenario Engine</h3>
                    </div>
                    <p className="mb-6 text-luxury-slate">Type any situation (e.g., "Angry landlord refusing to return deposit in Palm Jumeirah") and AI will generate the persona.</p>

                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="Describe your training scenario..."
                            className="flex-1 p-4 rounded-xl border border-gray-200 focus:border-luxury-gold focus:ring-2 focus:ring-luxury-gold/20 outline-none transition-all"
                            disabled={isGeneratingScenario}
                            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                        />
                        <button
                            onClick={handleGenerate}
                            disabled={isGeneratingScenario || !customTopic.trim()}
                            className="px-8 py-4 bg-luxury-navy text-white font-semibold rounded-xl hover:bg-luxury-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                        >
                            {isGeneratingScenario ? <Loader2 className="animate-spin" /> : 'Generate & Start'}
                        </button>
                    </div>
                </div>

                {/* Pre-defined Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {HARDCODED_PERSONAS.map((persona) => (
                        <motion.div
                            key={persona.id}
                            whileHover={{ y: -5 }}
                            onClick={() => handleSelect(persona)}
                            className="glass-card p-8 cursor-pointer hover:shadow-2xl transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Target className="w-24 h-24" />
                            </div>

                            <DifficultyBadge level={persona.difficulty} />

                            <h3 className="text-2xl font-serif font-bold mt-4 mb-2 group-hover:text-luxury-gold-dark transition-colors">
                                {persona.role}: {persona.name}
                            </h3>
                            <p className="text-sm font-semibold text-luxury-gold-dark mb-4 uppercase tracking-wider">{persona.mood}</p>

                            <p className="text-luxury-slate text-sm leading-relaxed mb-6 line-clamp-3">
                                {persona.context}
                            </p>

                            <div className="flex items-center gap-2 text-sm text-luxury-slate font-medium">
                                <ShieldCheck className="w-4 h-4 text-green-600" /> Negotiation Focus
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DifficultyBadge: React.FC<{ level: string }> = ({ level }) => {
    const color = {
        'Beginner': 'bg-green-100 text-green-700',
        'Intermediate': 'bg-yellow-100 text-yellow-700',
        'Expert': 'bg-red-100 text-red-700',
        'Nightmare': 'bg-purple-100 text-purple-700',
    }[level] || 'bg-gray-100';

    return (
        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", color)}>
            {level}
        </span>
    );
};
