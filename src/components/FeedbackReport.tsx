import React, { useRef } from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, PolarRadiusAxis } from 'recharts';
import { motion, type Variants } from 'framer-motion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
    Download,
    Home,
    RefreshCw,
    Trophy,
    Zap,
    Activity,
    Brain,
    Mic,
    Building2,
    MapPin,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { clsx } from 'clsx';

export const FeedbackReport: React.FC = () => {
    const { report, selectedPersona, resetSimulation } = useAppStore();
    const reportRef = useRef<HTMLDivElement>(null);

    if (!report) return null;

    // --- PDF Download Logic ---
    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;
        const buttons = reportRef.current.querySelectorAll('.no-print');
        buttons.forEach(el => (el as HTMLElement).style.display = 'none');

        const canvas = await html2canvas(reportRef.current, {
            scale: 2,
            backgroundColor: '#1a1a1a',
            useCORS: true
        });

        buttons.forEach(el => (el as HTMLElement).style.display = '');

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`RealtyVoice_Report_${selectedPersona?.name}.pdf`);
    };

    // --- Animations ---
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants: Variants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 50 } }
    };

    return (
        <div className="min-h-screen bg-luxury-charcoal text-white font-sans selection:bg-luxury-gold selection:text-white pb-20">
            {/* Nav */}
            <nav className="sticky top-0 z-50 bg-luxury-charcoal/90 backdrop-blur-xl border-b border-white/5 py-4 px-6 md:px-12 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-luxury-gold flex items-center justify-center font-serif font-black text-luxury-charcoal">R</div>
                    <span className="font-serif text-xl tracking-wide">RealtyVoice AI</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={resetSimulation} className="text-white/60 hover:text-white transition-colors text-sm flex items-center gap-2">
                        <Home className="w-4 h-4" /> Dashboard
                    </button>
                    <button onClick={handleDownloadPDF} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                </div>
            </nav>

            <motion.div
                ref={reportRef}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto p-6 md:p-12 space-y-12"
            >
                {/* 1. HERO SECTION: Score & Deal Brief */}
                <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Score Ring */}
                    {/* Radar Chart (Replacing Score Ring) */}
                    <motion.div variants={itemVariants} className="flex flex-col items-center justify-center relative w-full h-[400px]">
                        <div className="absolute top-4 right-10 z-10 text-right">
                            <div className="text-luxury-gold/80 text-sm font-bold tracking-widest uppercase">Score</div>
                            <div className="text-4xl font-black text-white">{report.score}</div>
                        </div>

                        <div className="w-full h-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: 'Empathy', A: report.breakdown?.empathy || 0, fullMark: 100 },
                                    { subject: 'Logic', A: report.breakdown?.logic || 0, fullMark: 100 },
                                    { subject: 'Closing', A: report.breakdown?.closing || 0, fullMark: 100 },
                                    { subject: 'Knowledge', A: report.breakdown?.knowledge || 0, fullMark: 100 },
                                    { subject: 'Professionalism', A: report.breakdown?.professionalism || 0, fullMark: 100 },
                                ]}>
                                    <PolarGrid gridType="polygon" stroke="#ffffff20" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: '#ffffff80', fontSize: 12, fontWeight: 600 }}
                                    />
                                    <Radar
                                        name="Performance"
                                        dataKey="A"
                                        stroke="#d4af37"
                                        strokeWidth={3}
                                        fill="#d4af37"
                                        fillOpacity={0.4}
                                        dot={{ r: 4, fill: "#d4af37", strokeWidth: 0 }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>

                    {/* Deal Intelligence Card */}
                    <motion.div variants={itemVariants} className="bg-white/5 rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Building2 className="w-48 h-48" /></div>
                        <h3 className="text-luxury-gold font-serif text-2xl mb-6 flex items-center gap-2">
                            <Zap className="w-6 h-6" /> Deal Intelligence
                        </h3>

                        {report.dealBrief ? (
                            <div className="space-y-6 relative z-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Client</label>
                                        <div className="text-xl font-medium">{report.dealBrief.clientName}</div>
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Outcome</label>
                                        <div className={clsx("text-xl font-bold px-3 py-1 inline-block rounded-lg text-sm",
                                            report.dealBrief.outcome === "Success" ? "bg-green-500/20 text-green-400" :
                                                report.dealBrief.outcome === "Fail" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                                        )}>
                                            {report.dealBrief.outcome}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Budget</label>
                                        <div className="text-lg text-white/80">{report.dealBrief.budget}</div>
                                    </div>
                                    <div>
                                        <label className="text-white/40 text-xs uppercase tracking-widest block mb-1">Location</label>
                                        <div className="text-lg text-white/80 flex items-center gap-1"><MapPin className="w-4 h-4 text-luxury-gold" /> {report.dealBrief.location}</div>
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-white/10">
                                    <label className="text-white/40 text-xs uppercase tracking-widest block mb-2">Key Highlight</label>
                                    <p className="text-white/70 italic text-sm">
                                        "{report.keyMoments?.[0]?.description || "No specific highlight detected."}"
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-white/30 italic">
                                Insight data unavailable for this session.
                            </div>
                        )}
                    </motion.div>
                </header>

                {/* 2. PERFORMANCE BREAKDOWN GRID */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <MetricCard icon={<Trophy />} label="Confidence" value={`${report.breakdown.confidence}%`} color={report.breakdown.confidence > 80 ? 'green' : 'amber'} />
                    <MetricCard icon={<Brain />} label="Market IQ" value={`${report.breakdown.knowledge}%`} color={report.breakdown.knowledge > 80 ? 'green' : 'amber'} />
                    <MetricCard icon={<Mic />} label="Filler Words" value={String(report.fillerWordCount)} subtext="Target: <5" color={report.fillerWordCount < 5 ? 'green' : 'red'} />
                    <MetricCard icon={<Activity />} label="Pace (WPM)" value={String(report.wpm)} subtext="Target: 130-150" color={report.wpm >= 130 && report.wpm <= 160 ? 'green' : 'amber'} />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Skills */}
                    <div className="bg-white/5 rounded-3xl p-8 border border-white/10">
                        <h3 className="text-xl font-serif text-white mb-6">Skill Proficiency</h3>
                        <div className="space-y-5">
                            <SkillBar label="Empathy & Rapport" score={report.breakdown.empathy} />
                            <SkillBar label="Objection Handling" score={report.breakdown.objectionHandling} />
                            <SkillBar label="Closing Techniques" score={report.breakdown.closing} />
                            <SkillBar label="Professionalism" score={report.breakdown.professionalism} />
                        </div>
                    </div>

                    {/* Action Plan */}
                    <div className="bg-luxury-gold/5 rounded-3xl p-8 border border-luxury-gold/20">
                        <h3 className="text-xl font-serif text-luxury-gold mb-6">Coaching Plan</h3>
                        <div className="space-y-4">
                            {report.actionPlan.slice(0, 3).map((action, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-luxury-gold/20 text-luxury-gold flex items-center justify-center font-bold text-sm">
                                        {i + 1}
                                    </span>
                                    <p className="text-white/80 leading-relaxed text-sm pt-1">{action}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* 3. TRANSCRIPT ANALYSIS */}
                <motion.div variants={itemVariants} className="space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4">
                        <h3 className="text-2xl font-serif">Conversation Analysis</h3>
                        <span className="text-white/40 text-sm uppercase tracking-wider">{report.transcript.length} turns</span>
                    </div>

                    <div className="space-y-4">
                        {report.transcript.filter(t => t.speaker === 'user').map((line, i) => (
                            <div key={i} className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
                                {/* User's Speech */}
                                <div className="flex gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                                        YOU
                                    </div>
                                    <div>
                                        <span className="text-white/30 text-[10px] uppercase tracking-widest block mb-1">Your Pitch</span>
                                        <p className="text-xl text-white/90 leading-relaxed font-medium">"{line.text}"</p>
                                    </div>
                                </div>

                                {/* Coach Feedback */}
                                <div className="ml-14 bg-luxury-gold/10 rounded-xl p-5 border border-luxury-gold/20 relative animate-in fade-in slide-in-from-top-2">
                                    <div className="absolute -top-3 left-6 bg-luxury-charcoal px-2 text-luxury-gold text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                                        <AlertCircle className="w-3 h-3" /> Coach Suggestion
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <span className="text-green-400 text-xs font-bold uppercase tracking-widest block mb-1">Better Phrasing</span>
                                            <p className="text-green-100/90 text-sm leading-relaxed">"{line.betterAlternative || "Could you clarify this point further?"}"</p>
                                        </div>
                                        <div className="border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
                                            <span className="text-white/40 text-xs font-bold uppercase tracking-widest block mb-1">Why?</span>
                                            <p className="text-white/60 text-sm italic">{line.reasoning || "Ensure you are guiding the conversation with clear, professional questions."}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Footer */}
                <div className="flex justify-center pt-12 pb-24 no-print gap-6">
                    <button
                        onClick={resetSimulation}
                        className="px-8 py-4 bg-luxury-gold hover:bg-white hover:text-luxury-charcoal text-luxury-charcoal font-bold rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <RefreshCw className="w-5 h-5" /> Start New Simulation
                    </button>

                    <button
                        onClick={useAppStore.getState().startRematch}
                        className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-full transition-all flex items-center gap-2 shadow-lg hover:shadow-red-900/50 shadow-red-900/30"
                    >
                        <Zap className="w-5 h-5 fill-current" /> Re-Match (Harder Version)
                    </button>
                </div>
            </motion.div>
        </div>
    );
};


// --- Components ---

const MetricCard = ({ icon, label, value, subtext, color }: any) => (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
        <div className="flex justify-between items-start mb-4">
            <div className={clsx("p-3 rounded-xl", color === 'green' ? "bg-green-500/20 text-green-400" : color === 'red' ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400")}>
                {icon}
            </div>
            <span className={clsx("text-3xl font-bold", color === 'green' ? "text-green-400" : color === 'red' ? "text-red-400" : "text-amber-400")}>{value}</span>
        </div>
        <div>
            <h4 className="text-white font-medium">{label}</h4>
            {subtext && <p className="text-white/40 text-xs mt-1">{subtext}</p>}
        </div>
    </div>
);

const SkillBar = ({ label, score }: { label: string, score: number }) => (
    <div>
        <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-white/70">{label}</span>
            <span className={clsx(score > 75 ? "text-green-400" : "text-amber-400")}>{score}%</span>
        </div>
        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${score}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={clsx("h-full rounded-full", score > 75 ? "bg-green-500" : "bg-amber-500")}
            />
        </div>
    </div>
);
