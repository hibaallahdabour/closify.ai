import { GoogleGenerativeAI } from "@google/generative-ai";
import type { PersonaConfig, AnalysisReport } from "../store/useAppStore";

// Initialize the API (Needs a key - better to use env var in production)
// For this demo, we can ask user or set a placeholder
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const genAI = new GoogleGenerativeAI(API_KEY);

export const generatePersonaConfig = async (topic: string): Promise<PersonaConfig> => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `
    You are an expert Real Estate Trainer for Dubai. 
    Create a challenging but realistic role-play persona based on this user request: "${topic}".
    The output MUST be valid JSON matching this structure:
    {
      "id": "generated-uuid",
      "name": "Full Name",
      "role": "Buyer" | "Seller" | "Tenant" | "Landlord",
      "difficulty": "Intermediate" | "Expert" | "Nightmare",
      "mood": "Adjective (e.g., Aggressive, Hesitant)",
      "context": "Detailed situation description including location (e.g., Dubai Marina, Downtown), budget, and specific constraints.",
      "objections": ["Objection 1", "Objection 2", "Objection 3"],
      "systemInstruction": "A concise paragraph instructing the AI how to act during the call. Mention specific Dubai laws or market trends relevant to the scenario."
    }
    Ensure the content is specific to Dubai Real Estate (RERA, DLD forms, etc.).
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        // Clean up markdown blocks if any
        const jsonStr = text.replace(/```json|```/g, '').trim();
        return JSON.parse(jsonStr) as PersonaConfig;
    } catch (error) {
        console.error("Failed to generate persona:", error);
        throw new Error("AI Generation Failed");
    }
};

export const generateAnalysisReport = async (transcript: { speaker: string, text: string, timestamp: number }[]): Promise<AnalysisReport> => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const transcriptText = transcript.map(t => `${t.speaker}: ${t.text}`).join('\n');

    const prompt = `
    Analyze this real estate sales call transcript set in Dubai.
    
    TRANSCRIPT:
    ${transcriptText}

    TASK:
    Generate a detailed grading report as valid JSON.
    1. Score from 0-100 on: Empathy, Closing Skills, Objection Handling, Professionalism (Confidence/Tone), and Legal Compliance (RERA knowledge).
    2. "Legal Compliance": Strictly check if the agent gave correct legal advice according to Dubai Land Department / RERA laws. If they guessed or were wrong, penalize heavily.
    3. Identify specific "Red Flag" lines where the agent failed or could do better. Provide a "Better Alternative" for those lines.
    
    JSON STRUCTURE:
    {
      "score": number (average),
      "breakdown": {
        "empathy": number,
        "closing": number,
        "objectionHandling": number,
        "professionalism": number,
        "legalCompliance": number
      },
      "feedback": "Overall summary paragraph.",
      "transcriptAnalysis": [
        {
          "originalText": "Exact text from transcript to flag",
          "betterAlternative": "What they should have said",
          "reason": "Why the original was weak or wrong"
        }
      ]
    }
  `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const jsonStr = text.replace(/```json|```/g, '').trim();
        const data = JSON.parse(jsonStr);

        // Merge analysis back into transcript structure for the UI
        const finalTranscript = transcript.map(t => {
            const analysis = data.transcriptAnalysis.find((a: any) => t.text.includes(a.originalText) || a.originalText.includes(t.text));
            if (analysis) {
                return { ...t, flagged: true, betterAlternative: `${analysis.reason}. Try saying: "${analysis.betterAlternative}"` };
            }
            return t;
        });

        return {
            score: data.score,
            breakdown: data.breakdown,
            feedback: data.feedback,
            transcript: finalTranscript as AnalysisReport['transcript']
        };
    } catch (error) {
        console.error("Failed to generate report:", error);
        // Return a dummy report on failure
        return {
            score: 0,
            breakdown: { empathy: 0, closing: 0, objectionHandling: 0, professionalism: 0, legalCompliance: 0 },
            feedback: "AI Analysis failed. Please try again.",
            transcript: transcript.map(t => ({ ...t, speaker: t.speaker as 'user' | 'ai' }))
        };
    }
};
