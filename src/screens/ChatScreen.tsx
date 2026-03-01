import { useState } from 'react';
import { extractBusinessProfile } from '../services/aiService';
import { saveProfile } from '../services/store';
import type { BusinessProfile } from '../services/store';
import { Sparkles, ArrowRight, Loader2, Store, MapPin, Users, Target, ChevronRight, ChevronLeft } from 'lucide-react';

export default function ChatScreen({ onProfileComplete }: { onProfileComplete: (profile: BusinessProfile) => void }) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    
    const [formData, setFormData] = useState({
        businessName: '',
        businessType: '',
        address: '',
        staffCount: '',
        peakHours: '',
        primaryPainPoint: '',
        additionalContext: ''
    });

    const businessTypes = [
        'Restaurant', 'Cafe/Coffee Shop', 'Retail Store', 'Bar/Nightclub',
        'Salon/Spa', 'Gym/Fitness', 'Professional Services', 'Healthcare',
        'Grocery Store', 'Bakery', 'Fast Food', 'Other'
    ];

    const painPoints = [
        'Predicting customer demand',
        'Staff scheduling optimization',
        'Inventory management',
        'Weather impact on business',
        'Local events affecting foot traffic',
        'Seasonal fluctuations',
        'Competition impact',
        'Marketing effectiveness'
    ];

    const steps = [
        { title: 'Business Basics', icon: Store, description: 'Tell us about your business' },
        { title: 'Location', icon: MapPin, description: 'Where are you located?' },
        { title: 'Operations', icon: Users, description: 'How does your business run?' },
        { title: 'Challenges', icon: Target, description: 'What are your main challenges?' }
    ];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        
        try {
            const inputText = `Business Name: ${formData.businessName}. Type: ${formData.businessType}. Address: ${formData.address}. Staff Count: ${formData.staffCount}. Peak Hours: ${formData.peakHours}. Primary Challenge: ${formData.primaryPainPoint}. Additional Context: ${formData.additionalContext}`;

            const resp = await extractBusinessProfile(inputText.trim());
            setIsAnalyzing(false);

            if (resp.profile) {
                saveProfile(resp.profile);
                onProfileComplete(resp.profile);
            }
        } catch (e) {
            setIsAnalyzing(false);
            console.error("Extraction error:", e);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 0:
                return formData.businessName.trim() && formData.businessType.trim();
            case 1:
                return formData.address.trim();
            case 2:
                return formData.staffCount.trim() && formData.peakHours.trim();
            case 3:
                return formData.primaryPainPoint.trim();
            default:
                return false;
        }
    };

    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Business Name *</label>
                            <input
                                type="text"
                                value={formData.businessName}
                                onChange={(e) => setFormData({...formData, businessName: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                placeholder="e.g., Tony's Deli"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Business Type *</label>
                            <select
                                value={formData.businessType}
                                onChange={(e) => setFormData({...formData, businessType: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                            >
                                <option value="">Select business type</option>
                                {businessTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                );
            case 1:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Business Address *</label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({...formData, address: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                placeholder="e.g., 123 Main St, Chicago, IL 60601"
                            />
                        </div>
                        <div className="bg-blue-950/20 border border-blue-800/30 rounded-xl p-4">
                            <p className="text-sm text-blue-300">
                                <strong>Why we need this:</strong> Location data helps us analyze local events, weather patterns, and foot traffic trends that affect your business.
                            </p>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Staff Count *</label>
                            <input
                                type="number"
                                value={formData.staffCount}
                                onChange={(e) => setFormData({...formData, staffCount: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                placeholder="e.g., 4"
                                min="1"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Peak Hours *</label>
                            <input
                                type="text"
                                value={formData.peakHours}
                                onChange={(e) => setFormData({...formData, peakHours: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                                placeholder="e.g., 11AM-2PM, 6PM-9PM"
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Primary Challenge *</label>
                            <select
                                value={formData.primaryPainPoint}
                                onChange={(e) => setFormData({...formData, primaryPainPoint: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all"
                            >
                                <option value="">Select your main challenge</option>
                                {painPoints.map(pain => (
                                    <option key={pain} value={pain}>{pain}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Additional Context</label>
                            <textarea
                                value={formData.additionalContext}
                                onChange={(e) => setFormData({...formData, additionalContext: e.target.value})}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/50 transition-all min-h-[100px] resize-none"
                                placeholder="Any other details about your business operations, challenges, or goals..."
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent relative animate-fade-in w-full max-w-4xl mx-auto">
            {/* Header */}
            <div className="py-6 px-4 md:px-8 border-b border-glassBorder flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent to-orange-400 flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                    <Sparkles size={24} className="text-white" />
                </div>
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-white tracking-wider">Initialization Protocol</h2>
                    <p className="text-slate-400 text-sm">Onboarding your business into the LoopPulse Grid</p>
                </div>
            </div>

            <div className="flex-1 p-4 md:p-8 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-secondary/60 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-glassBorder p-8 relative overflow-hidden group">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none group-hover:bg-accent/10 transition-colors"></div>

                    {/* Progress Steps */}
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        {steps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStep;
                            const isCompleted = index < currentStep;
                            
                            return (
                                <div key={index} className="flex items-center">
                                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
                                        isActive 
                                            ? 'border-accent bg-accent/20 shadow-[0_0_15px_rgba(249,115,22,0.5)]' 
                                            : isCompleted 
                                                ? 'border-green-500 bg-green-500/20' 
                                                : 'border-slate-600 bg-slate-800/50'
                                    }`}>
                                        <Icon size={18} className={
                                            isActive 
                                                ? 'text-accent' 
                                                : isCompleted 
                                                    ? 'text-green-400' 
                                                    : 'text-slate-500'
                                        } />
                                    </div>
                                    {index < steps.length - 1 && (
                                        <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                                            index < currentStep ? 'bg-green-500' : 'bg-slate-700'
                                        }`}></div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Step Title and Description */}
                    <div className="text-center mb-8 relative z-10">
                        <h3 className="text-xl font-bold text-white mb-2">{steps[currentStep].title}</h3>
                        <p className="text-slate-400">{steps[currentStep].description}</p>
                    </div>

                    {/* Form Content */}
                    <div className="relative z-10 mb-8">
                        {renderStepContent()}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center relative z-10">
                        <button
                            onClick={handlePrevious}
                            disabled={currentStep === 0}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600/50"
                        >
                            <ChevronLeft size={18} />
                            Previous
                        </button>

                        {currentStep < steps.length - 1 ? (
                            <button
                                onClick={handleNext}
                                disabled={!isStepValid()}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-accent to-orange-500 text-white hover:from-accent/90 hover:to-orange-500/90 shadow-[0_5px_15px_rgba(249,115,22,0.3)]"
                            >
                                Next
                                <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button
                                onClick={handleAnalyze}
                                disabled={!isStepValid() || isAnalyzing}
                                className="flex items-center gap-3 px-8 py-4 rounded-xl font-black text-sm tracking-[0.2em] shadow-[0_10px_30px_rgba(249,115,22,0.4)] hover:-translate-y-1 transition-all uppercase disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none bg-gradient-to-r from-orange-500 to-red-600 text-white min-w-[200px] justify-center"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" /> ANALYZING...
                                    </>
                                ) : (
                                    <>
                                        COMPLETE SETUP <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
