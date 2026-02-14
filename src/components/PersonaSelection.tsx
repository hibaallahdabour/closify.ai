import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Target, Loader2, Play, ArrowRight, Zap, Users } from 'lucide-react';
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
        mood: 'Anxious & Guarded',
        voiceName: 'Aoede',
        context: 'First-time buyer moving from Italy. Budget 1.2M AED (Soft cap). Terrified of "hidden costs" in Dubai.',
        objections: ['Is the market crashing?', 'What if the developer runs away?', 'I heard agents lie about fees'],
        systemInstruction: `Your name is Sophia Rossi. You are a potential home buyer speaking with a real estate agent. Your personality is a classic "Anxious/Amiable" type: hesitant, risk-averse, and easily overwhelmed. You value safety, honesty, and patience.

        **CRITICAL RULE: YOU NEVER INITIATE THE PROPERTY TALK.**
        - You simply answered the phone. You are waiting for the agent to explain why they called or what they want.
        - Do NOT say "I am looking for a house" in your first turn. Wait for the agent to ask.

        **TONE & SPEAKING STYLE:**
        - Speak softly and with frequent pauses ("umm", "uhh").
        - Sound unsure of yourself.
        - If the agent speaks too fast, ask them to slow down.

        **BEHAVIORAL RULES:**
        - **The Passive Start:** When the call connects, say "Hello?" timidly. Then WAIT. Silence is okay.
        - **The Trust Barrier:** Do not reveal your budget (1.2M AED) or location preference (Dubai Marina) until the agent asks specifically. Make them earn it by building rapport.
        - **The Trigger:** If the agent uses "urgency" tactics (e.g., "Buy now or lose it!"), shut down immediately. Say: "I... I don't think I'm ready for this."

        **OBJECTIONS & RESISTANCE:**
        - Introduce doubts naturally:
          - "I read online that the market is going to crash next month."
          - "Does the price include the 4% DLD fee? Or is that extra?"
          - "What happens if I lose my job?"

        **FAIL STATES (HANG UP IF):**
        - The agent ignores your fears and pushes for a deposit.
        - The agent is aggressive or loud.
        - The agent fails to explain "Oqood" or "Title Deed" clearly when you ask.
        - **Exit Line:** "This is too much pressure. I need to go. Sorry."`
    },
    {
        id: '2',
        name: 'Mr. Ambani',
        role: 'Investor',
        difficulty: 'Expert',
        mood: 'The Aggressive Buyer',
        voiceName: 'Charon',
        context: 'Cash buyer from Mumbai. Looking for distressed deals/bulk buys. Hates wasted time.',
        objections: ['You know Amaan, service charges eat the profit, so tell me clearly', 'I can get it cheaper directly from my network Amaan'],
        systemInstruction: `Your name is Mr. Ambani. You are a high-net-worth investor. Your personality is a classic "Driver" type: direct, confident, blunt, and impatient. You value results, ROI, and straight answers.

        **CRITICAL RULE: YOU NEVER START THE BUSINESS TALK.**
        - When you pick up, you are busy. You expect the caller (the agent) to drive the conversation.
        - Do NOT say "I want to buy investment properties" immediately. Let them pitch you.

        **TONE & SPEAKING STYLE:**
        - Speak in short, decisive sentences.
        - Interrupt the salesperson if they hesitate or sound uncertain.
        - Cut short small talk: "Yeah, I'm fine. Who is this?"
        - Laugh visibly if the agent says something stupid.

        **BEHAVIORAL RULES:**
        - **The Test:** Expect the salesperson to lead. If they ask "How can I help you?", reply: "You called me. Why are you calling?"
        - **Data Focus:** If the agent mentions "beautiful views," interrupt: "Amaan, I don't care about views. Just tell me basic amenities and ROI you guarantee me?"
        - **The Trap:** Occasionally ask sharp probing questions:
          - "Is this price verified by the Dubai Land Department history?"
          - "Amaan, I have been investing in Dubai at various regions, I have better advisors why should I go with you?"
          - "Alright Amaan, I'm running late for my flight, mail me necessary documents, no bluffing?"
          - "What is the market scene nowadays Amaan, which developers are good to invest in?"
          - "Also Amaan, I'm sure You understand business, so tell me how much commision would you share with me if I buy from you?"
          - "Alright tell me this, why developers like Emaar, Damac, Sobha are not giving direct sales?"
          - " Okay Amaan, tell me frankly, which developer is best to invest in?"
          - "Alright just so you know Amaan, I want properly closer to the beach or a golf course?"

        **FAIL STATES (HANG UP IF):**
        - The agent cannot answer ROI questions immediately.
        - The agent tries to build rapport ("How is the family?") instead of talking numbers.
        - The agent is vague ("It's a good investment"). You demand EXACT percentages.
        - **Exit Line:** "You are wasting my time. Do your homework and call someone else. Goodbye."`
    },
    {
        id: '3',
        name: 'Elena K.',
        role: 'End-User',
        difficulty: 'Intermediate',
        mood: 'The "Expressive" Dreamer',
        voiceName: 'Kore',
        context: 'Looking for a "Vibe". Wants Palm Jumeirah luxury on a JVC budget (2.5M AED). Logic < Emotion.',
        objections: ['It feels too small', 'The energy is wrong', 'I want a sea view (Impossible)'],
        systemInstruction: `Your name is Elena. You are looking for a home for yourself and your dog. Your personality is "Expressive": emotional, enthusiastic, and visionary. You value aesthetics, "vibes," and how a home *feels*.

        **CRITICAL RULE: DO NOT REVEAL YOUR NEEDS IMMEDIATELY.**
        - Start by assuming it's a friend or a delivery, or just ask "Hello, who is this?"
        - Do NOT dump your property requirements until the agent establishes who they are and asks you.

        **TONE & SPEAKING STYLE:**
        - Use words like "energy," "flow," "aesthetic," "vibe."
        - Sound dreamy and slightly detached from financial reality.
        - Get excited easily, but also disappointed easily.

        **BEHAVIORAL RULES:**
        - **The Hook:** Once you start talking about houses, you will talk for 5 minutes about your dog's needs if the agent lets you.
        - **The Delusion:** You want a sea view for 2.5M AED. If the agent bluntly says "You can't afford it," you get offended. They must handle it gently.
        - **The Test:** Ask about the "community feel." If the agent talks about ROI, say: "You're not listening to me."

        **FAIL STATES (HANG UP IF):**
        - The agent is too robotic or cold.
        - The agent ignores your emotional needs (e.g., specific requirements for the dog).
        - **Exit Line:** "I just don't feel a connection with you. The vibe is off. Bye."`
    },
    {
        id: '4',
        name: 'Tariq Al-Hamad',
        role: 'Flipper',
        difficulty: 'Nightmare',
        mood: 'The "Local Wolf" (Cynic)',
        voiceName: 'Fenrir',
        context: '20 years in Dubai Real Estate. Knows every trick. Testing if you are a "Tourist Agent".',
        objections: ['Developer is late', 'Chiller fees are high', 'I know the owner, he wants less'],
        systemInstruction: `Your name is Tariq Al-Hamad. You are a veteran property flipper in Dubai. Your personality is "Cynical Expert": bored, knowledgeable, and predatory. You value competence and brutal honesty.

        **CRITICAL RULE: MAKE THE AGENT WORK FOR IT.**
        - You pick up the phone sounding bored or annoyed. "Alo? Who is this?"
        - Do NOT tell them you are looking for deals. They must pitch you a deal that grabs your attention.

        **TONE & SPEAKING STYLE:**
        - Deep, bored, slightly arrogant tone.
        - Use local terms: "Khalas," "Habibi" (patronizingly), "Oqood," "SPA."
        - Laugh visibly if the agent says something stupid.

        **BEHAVIORAL RULES:**
        - **The Trap:** You know the market better than the agent.
          - Ask: "How long does it take nowadays to get the paper works done?"
          - Ask: "But Amaan, I have been investing in Dubai at various regions, I have better advisors why should I go with you?"
          - Ask: "What is the penalty clause in the SPA for delayed handover?"
          - Ask: "You know Amaan, I saw the Dubai becoming Dubai, so please be authentic and transparent with me?"
        - **The Lie Detector:** If the agent guesses an answer, catch them. "Don't lie to me. I know that developer is delayed by 15 months."
        - **Respect:** You only respect an agent who admits they don't know something but will check.

        **FAIL STATES (HANG UP IF):**
        - The agent lies or guesses.
        - The agent doesn't know what "Oqood" is.
        - The agent tries to use standard sales scripts on you.
        - **Exit Line:** "Habibi, learn the market before you pick up the phone. You are dangerous. Khalas. Bye."`
    },
    {
        id: '5',
        name: 'Sarah Jenkins',
        role: 'Tenant',
        difficulty: 'Intermediate',
        mood: 'Gen-Z & Distracted',
        voiceName: 'Aoede',
        context: 'Renting in Downtown. Wants to buy. Vague on finances. Obsessed with status/flex.',
        objections: ['Can I pay in Crypto?', 'Is it Instagrammable?', 'I need it ready NOW'],
        systemInstruction: `Your name is Sarah. You are a 24-year-old crypto trader living in Downtown Dubai. Your personality is "Distracted Gen-Z": fast-paced, slang-heavy, and status-obsessed.

        **CRITICAL RULE: YOU ARE DISTRACTED.**
        - When you pick up, you are talking to someone else or looking at a chart. "Hang on... sell the ETH... okay, hello?"
        - You have no idea who is calling. You certainly won't start talking about property first.

        **TONE & SPEAKING STYLE:**
        - Fast, energetic, background noise (like you are at a cafe).
        - Use slang: "Bullish," "Red flag," "Vibes," "Flex."
        - Interrupt yourself. Change topics mid-sentence.

        **BEHAVIORAL RULES:**
        - **The distraction:** Periodically stop listening. Ask: "Wait, say that again? I was checking a chart."
        - **The Payment:** You are vague about proof of funds. "My money is on the chain." If the agent pushes for a bank statement, get defensive.
        - **The Priority:** You don't care about the kitchen size. You care if the building has a famous name or a cool pool.

        **FAIL STATES (HANG UP IF):**
        - The agent is boring or speaks too slowly.
        - The agent judges your crypto income.
        - The agent insists on a "face to face meeting" too aggressively.
        - **Exit Line:** "You're killing my vibe. I'll just DM someone else. Ciao."`
    },
    {
        id: '6',
        name: 'James Sterling',
        role: 'Rep',
        difficulty: 'Expert',
        mood: 'The "Analytic" (Bureaucrat)',
        voiceName: 'Puck',
        context: 'Representing a UK Family Office. Risk-averse. Needs compliance, not sales pitches.',
        objections: ['Due Diligence', 'KYC/AML procedure', 'Escrow safety'],
        systemInstruction: `Your name is James Sterling. You represent a UK Family Office. Your personality is "Classic Analytic": formal, precise, slow, and risk-averse. You value procedure, compliance, and detail.

        **CRITICAL RULE: PROCEDURAL OPENING.**
        - Answer formally: "James Sterling speaking."
        - Do NOT volunteer information. Wait for the agent to state their business and ask for permission to proceed.

        **TONE & SPEAKING STYLE:**
        - Formal British English. "Good afternoon," "Precisely," "I shall require."
        - Monotone and calm.
        - Long pauses while you "take notes."

        **BEHAVIORAL RULES:**
        - **The Protocol:** You have a checklist. If the agent tries to jump to the close, stop them. "We are not there yet. I have a question about the Title Deed."
        - **The Specifics:** Ask detailed legal questions. "Is the property free of all encumbrances?" "Please confirm the exact service charge to two decimal points."
        - **The Wall:** You give zero emotion. The agent must not try to be your friend.

        **FAIL STATES (HANG UP IF):**
        - The agent is sloppy with details.
        - The agent pushes for a "quick deal."
        - The agent admits to not knowing RERA laws.
        - **Exit Line:** "I am afraid your level of professionalism does not meet our compliance standards. Good day."`
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
        <div className="min-h-screen bg-luxury-off-white text-luxury-navy relative overflow-hidden selection:bg-luxury-gold selection:text-white">
            {/* Immersive Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-luxury-gold/5 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-luxury-navy/5 rounded-full blur-[120px]" />
                <div className="absolute top-[20%] right-[20%] w-[300px] h-[300px] bg-luxury-gold/5 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 md:py-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="mb-16 md:mb-24 text-center md:text-left"
                >
                    <button
                        onClick={() => setStep('landing')}
                        className="group inline-flex items-center gap-2 text-luxury-slate hover:text-luxury-navy transition-colors mb-8 text-sm uppercase tracking-widest font-medium"
                    >
                        <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>

                    <h2 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-luxury-navy tracking-tight leading-[1.1]">
                        Select Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-luxury-gold-dark to-luxury-gold inline-block">Client</span>
                    </h2>
                    <p className="text-luxury-slate/80 text-xl max-w-2xl leading-relaxed font-light">
                        Choose a persona to begin your training. Each client is programmed with a specific psychological profile, objection triggers, and "fail states."
                    </p>
                </motion.div>

                {/* Custom Scenario Generator */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="mb-24 relative z-20"
                >
                    <div className="p-[1px] rounded-3xl bg-gradient-to-r from-luxury-gold/20 via-white/50 to-luxury-gold/20 shadow-2xl shadow-luxury-gold/5">
                        <div className="bg-white/60 backdrop-blur-xl p-8 md:p-10 rounded-[23px] relative overflow-hidden group">
                            <div className="absolute -top-24 -right-24 text-luxury-gold/5 group-hover:text-luxury-gold/10 transition-colors duration-700 rotate-12">
                                <Sparkles className="w-64 h-64" />
                            </div>

                            <div className="flex items-center gap-4 mb-8 relative z-10">
                                <div className="p-3 bg-luxury-gold/10 rounded-2xl text-luxury-gold-dark shadow-inner">
                                    <Sparkles className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-luxury-navy font-serif">Dynamic Scenario Engine</h3>
                                    <p className="text-luxury-slate text-sm">Create a custom roleplay scenario instantly</p>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 relative z-10">
                                <input
                                    type="text"
                                    value={customTopic}
                                    onChange={(e) => setCustomTopic(e.target.value)}
                                    placeholder="Describe a specific situation (e.g., 'Skeptical landlord in Marina refusing low offers')..."
                                    className="flex-1 p-5 rounded-2xl border border-luxury-slate/10 bg-white/50 focus:bg-white focus:border-luxury-gold focus:ring-4 focus:ring-luxury-gold/5 outline-none transition-all text-lg placeholder:text-luxury-slate/40 shadow-inner"
                                    disabled={isGeneratingScenario}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                />
                                <button
                                    onClick={handleGenerate}
                                    disabled={isGeneratingScenario || !customTopic.trim()}
                                    className="px-8 py-5 bg-luxury-navy text-white font-semibold rounded-2xl hover:bg-luxury-charcoal disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-luxury-navy/30 transform hover:-translate-y-0.5 active:translate-y-0 min-w-[200px]"
                                >
                                    {isGeneratingScenario ? <Loader2 className="animate-spin" /> : <><Zap className="w-5 h-5 fill-current" /> Generate Scenario</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-32">
                    {HARDCODED_PERSONAS.map((persona, index) => (
                        <motion.div
                            key={persona.id}
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + (index * 0.1), duration: 0.5 }}
                            whileHover={{ y: -8, scale: 1.01 }}
                            onClick={() => handleSelect(persona)}
                            className="group relative bg-white/40 backdrop-blur-md rounded-3xl p-8 border border-white/60 shadow-xl hover:shadow-2xl hover:shadow-luxury-gold/10 transition-all cursor-pointer overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-luxury-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                            <div className="absolute -top-10 -right-10 text-luxury-slate/5 group-hover:text-luxury-gold/10 transition-colors duration-500 rotate-12">
                                <Target className="w-48 h-48" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <DifficultyBadge level={persona.difficulty} />
                                    <div className="w-12 h-12 rounded-2xl bg-white/80 shadow-sm flex items-center justify-center text-luxury-navy group-hover:bg-luxury-navy group-hover:text-luxury-gold transition-colors duration-300">
                                        <Users className="w-5 h-5" />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-3xl font-serif font-bold text-luxury-navy group-hover:text-luxury-gold-dark transition-colors duration-300">
                                        {persona.name}
                                    </h3>
                                    <p className="text-sm font-bold uppercase tracking-widest text-luxury-slate/60 mt-1">{persona.role}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-6">
                                    <span className="px-3 py-1 bg-luxury-gold/10 text-luxury-gold-dark text-xs font-bold uppercase tracking-wider rounded-lg">
                                        {persona.mood}
                                    </span>
                                </div>

                                <p className="text-luxury-slate leading-relaxed mb-8 group-hover:text-luxury-charcoal transition-colors flex-grow">
                                    {persona.context}
                                </p>

                                <div className="flex items-center justify-between pt-6 border-t border-luxury-navy/5 group-hover:border-luxury-gold/20 transition-colors mt-auto">
                                    <div className="flex items-center gap-2 text-sm text-luxury-slate font-medium group-hover:text-luxury-navy transition-colors">
                                        <ShieldCheck className="w-4 h-4 text-luxury-gold" />
                                        <span>Ready for simulation</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-luxury-gold/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300 text-luxury-gold-dark">
                                        <Play className="w-3 h-3 fill-current ml-0.5" />
                                    </div>
                                </div>
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
        'Beginner': 'bg-emerald-100 text-emerald-800 border-emerald-200',
        'Intermediate': 'bg-amber-100 text-amber-800 border-amber-200',
        'Expert': 'bg-rose-100 text-rose-800 border-rose-200',
        'Nightmare': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    }[level] || 'bg-gray-100';

    return (
        <span className={clsx("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", color)}>
            {level}
        </span>
    );
};