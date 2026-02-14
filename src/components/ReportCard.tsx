import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, CheckCircle, AlertTriangle, XCircle, Home, Bot } from 'lucide-react';

import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';

export const ReportCard: React.FC = () => {
    const { report, userProfile, selectedPersona, resetSimulation } = useAppStore();
    const reportRef = useRef<HTMLDivElement>(null);

    if (!report) return null;

    const handleDownloadPDF = async () => {
        if (!reportRef.current) return;

        try {
            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`RealEstateCoach_Report_${userProfile?.name.replace(' ', '_')}.pdf`);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-luxury-off-white py-12 px-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Actions */}
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-serif font-bold text-luxury-navy">Session Analysis</h2>
                    <div className="flex gap-4">
                        <button onClick={resetSimulation} className="flex items-center gap-2 text-luxury-slate hover:text-luxury-navy transition-colors">
                            <Home className="w-4 h-4" /> Home
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="flex items-center gap-2 px-6 py-2 bg-luxury-gold text-white rounded-lg hover:bg-luxury-gold-dark transition-colors shadow-lg"
                        >
                            <Download className="w-4 h-4" /> Download PDF
                        </button>
                    </div>
                </div>

                {/* Printable Area */}
                <div ref={reportRef} className="bg-white p-12 rounded-3xl shadow-2xl border border-gray-100 text-luxury-charcoal">
                    {/* Report Header */}
                    <div className="flex justify-between border-b border-gray-100 pb-8 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold font-serif text-luxury-gold-dark mb-1">Performance Report</h1>
                            <p className="text-sm text-luxury-slate">Trainee: {userProfile?.name} • Persona: {selectedPersona?.name}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-5xl font-bold text-luxury-navy">{report.score}</div>
                            <div className="text-xs text-luxury-slate uppercase tracking-wider">Overall Score</div>
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12">
                        <ScoreMetric label="Empathy" score={report.breakdown.empathy} />
                        <ScoreMetric label="Closing" score={report.breakdown.closing} />
                        <ScoreMetric label="RERA Law" score={report.breakdown.legalCompliance} isLegal />
                        <ScoreMetric label="Objections" score={report.breakdown.objectionHandling} />
                        <ScoreMetric label="Confidence" score={report.breakdown.professionalism} />
                    </div>

                    {/* Feedback Section */}
                    <div className="mb-12">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-luxury-gold" /> AI Coach Feedback
                        </h3>
                        <div className="p-6 bg-luxury-sand/30 rounded-xl text-luxury-slate leading-relaxed">
                            {report.feedback}
                        </div>
                    </div>

                    {/* Legal Compliance Check */}
                    {(report.breakdown.legalCompliance < 70) && (
                        <div className="mb-12 p-6 bg-red-50 border border-red-100 rounded-xl">
                            <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
                                <AlertTriangle className="w-5 h-5" /> Safety Violation: RERA Compliance
                            </h3>
                            <p className="text-red-600 text-sm">
                                Your knowledge of Dubai Real Estate Laws (RERA) was flagged as insufficient.
                                Ensure you review the Tenant Eviction rules (Law No. 26 of 2007 / Law No. 33 of 2008) and off-plan sales regulations (Law No. 13 of 2008).
                                Never give legal advice if unsure.
                            </p>
                        </div>
                    )}

                    {/* Transcript Analysis */}
                    <div>
                        <h3 className="text-lg font-bold mb-4">Transcript Critique</h3>
                        <div className="space-y-4">
                            {report.transcript.map((line, i) => (
                                <div key={i} className={`p-4 rounded-lg text-sm border-l-4 ${line.flagged ? 'bg-red-50 border-red-400' : 'bg-gray-50 border-transparent'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`font-bold uppercase text-xs ${line.speaker === 'user' ? 'text-luxury-gold-dark' : 'text-gray-500'}`}>
                                            {line.speaker}
                                        </span>
                                        {line.flagged && <span className="text-xs text-red-500 font-bold flex items-center gap-1"><XCircle className="w-3 h-3" /> Improvement Needed</span>}
                                    </div>
                                    <p className={line.flagged ? 'text-red-900' : 'text-gray-700'}>{line.text}</p>

                                    {line.flagged && line.betterAlternative && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="mt-3 pt-3 border-t border-red-100 text-green-700 bg-white/50 p-3 rounded"
                                        >
                                            <span className="font-bold flex items-center gap-2 mb-1"><CheckCircle className="w-3 h-3" /> Coach Suggestion:</span>
                                            "{line.betterAlternative}"
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ScoreMetric: React.FC<{ label: string, score: number, isLegal?: boolean }> = ({ label, score, isLegal }) => {
    let color = 'text-luxury-navy';
    if (score >= 80) color = 'text-green-600';
    else if (score >= 50) color = 'text-yellow-600';
    else color = 'text-red-600';

    return (
        <div className={`p-4 rounded-xl text-center border ${isLegal ? 'bg-luxury-off-white border-luxury-navy/10' : 'bg-white border-gray-100'}`}>
            <div className={`text-2xl font-bold ${color}`}>{score}%</div>
            <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
        </div>
    );
};
