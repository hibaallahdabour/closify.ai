import { create } from 'zustand';

export type SimulationStep = 'landing' | 'auth' | 'persona-selection' | 'simulation' | 'report';

export interface PersonaConfig {
    id: string;
    name: string;
    role: 'Buyer' | 'Seller' | 'Tenant' | 'Landlord' | 'Investor' | 'End-User' | 'Flipper' | 'Rep';
    difficulty: 'Beginner' | 'Intermediate' | 'Expert' | 'Nightmare';
    mood: string;
    context: string;
    objections: string[];
    voiceName?: string; // "Puck", "Charon", "Aoede", "Kore", "Fenrir"
    systemInstruction?: string; // Generated specifically for the AI
}

export interface UserProfile {
    name: string;
    email: string;
}

export interface AnalysisReport {
    score: number;
    overallGrade: string; // 'A+', 'B', etc.
    breakdown: {
        empathy: number;
        closing: number;
        objectionHandling: number;
        logic: number;
        professionalism: number;
        confidence: number;
        knowledge: number;
    };
    fillerWordCount: number;
    wpm: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
    actionPlan: string[];
    transcript: {
        speaker: 'user' | 'ai';
        text: string;
        timestamp: number;
        flagged?: boolean;
        betterAlternative?: string;
        reasoning?: string;
    }[];
    dealBrief?: {
        clientName: string;
        budget: string;
        location: string;
        propertyType: string;
        outcome: "Success" | "Fail" | "In Progress";
    };
    keyMoments?: {
        timestamp: string;
        title: string;
        description: string;
        type: "positive" | "negative" | "neutral";
    }[];
}

interface AppState {
    // Navigation
    currentStep: SimulationStep;
    setStep: (step: SimulationStep) => void;

    // User Data
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile) => void;

    // Simulation Config
    selectedPersona: PersonaConfig | null;
    setSelectedPersona: (persona: PersonaConfig) => void;
    customScenarioInput: string;
    setCustomScenarioInput: (input: string) => void;
    isGeneratingScenario: boolean;
    setIsGeneratingScenario: (isGenerating: boolean) => void;

    // Active Simulation State
    isConnected: boolean;
    setIsConnected: (connected: boolean) => void;
    isSpeaking: boolean;
    setIsSpeaking: (speaking: boolean) => void;
    audioVolume: number; // For visualizer
    setAudioVolume: (vol: number) => void;

    // Results
    // Results
    report: AnalysisReport | null;
    setReport: (report: AnalysisReport) => void;

    // Transcript (Global Persistence)
    transcript: { speaker: 'user' | 'ai', text: string, timestamp: number }[];
    addTranscriptLine: (line: { speaker: 'user' | 'ai', text: string, timestamp: number }) => void;
    clearTranscript: () => void;

    // Helpers
    resetSimulation: () => void;
    startRematch: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    currentStep: 'landing',
    setStep: (step) => set({ currentStep: step }),

    userProfile: null,
    setUserProfile: (profile) => set({ userProfile: profile }),

    selectedPersona: null,
    setSelectedPersona: (persona) => set({ selectedPersona: persona }),

    customScenarioInput: '',
    setCustomScenarioInput: (input) => set({ customScenarioInput: input }),
    isGeneratingScenario: false,
    setIsGeneratingScenario: (isGenerating) => set({ isGeneratingScenario: isGenerating }),

    isConnected: false,
    setIsConnected: (connected) => set({ isConnected: connected }),
    isSpeaking: false,
    setIsSpeaking: (speaking) => set({ isSpeaking: speaking }),
    audioVolume: 0,
    setAudioVolume: (vol) => set({ audioVolume: vol }),

    report: null,
    setReport: (report) => set({ report }),

    transcript: [],
    addTranscriptLine: (line) => set((state) => ({ transcript: [...state.transcript, line] })),
    clearTranscript: () => set({ transcript: [] }),

    resetSimulation: () => set({
        currentStep: 'landing',
        selectedPersona: null,
        report: null,
        isConnected: false,
        customScenarioInput: '',
        transcript: []
    }),

    startRematch: () => set((state) => {
        if (!state.selectedPersona) return {}; // Should not happen in report view

        const evolvedPersona: PersonaConfig = {
            ...state.selectedPersona,
            id: `${state.selectedPersona.id}-hard`,
            name: `${state.selectedPersona.name} (Evolved)`,
            difficulty: 'Nightmare',
            systemInstruction: (state.selectedPersona.systemInstruction || "") +
                "\n\n[CRITICAL ADJUSTMENT]: The user has requested a HARDER CHALLENGE. You must now be significantly more skeptical, shorter in your responses, and harder to please. Raise more objections. Do not be easily swayed. Challenge every claim.",
        };

        return {
            currentStep: 'simulation',
            selectedPersona: evolvedPersona,
            report: null,
            transcript: [], // Start fresh
            isConnected: false // Will reconnect in SimulationMode
        };
    })
}));
