import { create } from 'zustand';

export type SimulationStep = 'landing' | 'auth' | 'persona-selection' | 'simulation' | 'report';

export interface PersonaConfig {
    id: string;
    name: string;
    role: 'Buyer' | 'Seller' | 'Tenant' | 'Landlord' | 'Investor';
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
    breakdown: {
        empathy: number;
        closing: number;
        objectionHandling: number;
        professionalism: number;
        legalCompliance: number;
    };
    feedback: string;
    transcript: {
        speaker: 'user' | 'ai';
        text: string;
        timestamp: number;
        flagged?: boolean;
        betterAlternative?: string;
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
    report: AnalysisReport | null;
    setReport: (report: AnalysisReport) => void;

    // Helpers
    resetSimulation: () => void;
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

    resetSimulation: () => set({
        currentStep: 'landing',
        selectedPersona: null,
        report: null,
        isConnected: false,
        customScenarioInput: ''
    })
}));
