import { useAppStore } from './store/useAppStore';
import { LandingPage } from './components/LandingPage';
import { AuthModal } from './components/AuthModal';
import { PersonaSelection } from './components/PersonaSelection';
import { SimulationMode } from './components/SimulationMode';
import { ReportCard } from './components/ReportCard';

function App() {
    const { currentStep } = useAppStore();

    return (
        <div className="font-sans antialiased text-luxury-navy">
            {currentStep === 'landing' && <LandingPage />}

            {currentStep === 'auth' && (
                <>
                    <LandingPage /> {/* Keep background */}
                    <AuthModal />
                </>
            )}

            {currentStep === 'persona-selection' && <PersonaSelection />}

            {currentStep === 'simulation' && <SimulationMode />}

            {currentStep === 'report' && <ReportCard />}
        </div>
    );
}

export default App;
