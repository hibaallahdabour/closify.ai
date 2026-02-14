import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export const AuthModal: React.FC = () => {
    const { setUserProfile, setStep } = useAppStore();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email) {
            setUserProfile({ name, email });
            setStep('persona-selection');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-navy/40 backdrop-blur-sm">
            <div className="glass-card p-8 w-full max-w-md m-4">
                <h2 className="text-3xl font-serif font-bold mb-6 text-center">Identity</h2>
                <p className="text-center text-luxury-slate mb-8">Enter your details to generate personalized training reports.</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-luxury-slate mb-2">Full Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:border-luxury-gold outline-none"
                            placeholder="e.g. John Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-luxury-slate mb-2">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:border-luxury-gold outline-none"
                            placeholder="john@agency.com"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-luxury-gold hover:bg-luxury-gold-dark text-white font-bold rounded-lg transition-colors"
                    >
                        Continue
                    </button>
                </form>
            </div>
        </div>
    );
};
