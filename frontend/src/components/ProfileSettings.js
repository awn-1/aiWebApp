import React, { useState, useEffect } from 'react';
import { Heart, Users, UserPlus, Briefcase, Save, CheckCircle } from 'lucide-react';

const FormSection = ({ icon: Icon, title, description, children }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-pink-50 rounded-lg">
                <Icon className="w-6 h-6 text-pink-600" />
            </div>
            <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
            </div>
        </div>
        {children}
    </div>
);

const TextArea = ({ label, placeholder, helper, value, onChange }) => (
    <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
            {label}
        </label>
        <textarea
            rows="4"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-colors"
        />
        {helper && (
            <p className="text-xs text-gray-500">{helper}</p>
        )}
    </div>
);

const SaveNotification = ({ show }) => {
    if (!show) return null;

    return (
        <div className="fixed bottom-4 right-4 flex items-center gap-2 bg-green-100 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg animate-fade-in">
            <CheckCircle className="w-5 h-5" />
            <span>Profile saved successfully!</span>
        </div>
    );
};

export default function ProfileSettings() {
    const [formData, setFormData] = useState({
        // Romantic Relationships
        relationshipStatus: '',
        relationshipGoals: '',
        relationshipPatterns: '',
        relationshipChallenges: '',

        // Family
        familyDynamic: '',
        familyChallenges: '',
        familyGoals: '',
        familyHistory: '',

        // Friendships
        friendshipCircle: '',
        friendshipPatterns: '',
        socialGoals: '',
        friendshipChallenges: '',

        // Professional
        workplaceDynamic: '',
        communicationStyle: '',
        professionalBoundaries: '',
        careerGrowthAreas: ''
    });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Load saved profile data
        const savedData = localStorage.getItem('userProfile');
        if (savedData) {
            try {
                setFormData(JSON.parse(savedData));
            } catch (error) {
                console.error('Error loading profile data:', error);
            }
        }
    }, []);

    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        setHasUnsavedChanges(true);
    };

    const handleSave = () => {
        setIsSaving(true);

        // Simulate a brief loading state
        setTimeout(() => {
            // Save to localStorage
            localStorage.setItem('userProfile', JSON.stringify(formData));

            // Show success notification
            setShowSaveSuccess(true);
            setHasUnsavedChanges(false);
            setIsSaving(false);

            // Hide notification after 3 seconds
            setTimeout(() => {
                setShowSaveSuccess(false);
            }, 3000);
        }, 500); // Simulate network delay
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <p className="mt-2 text-gray-600">
                            Share your relationship dynamics to receive personalized coaching and insights
                        </p>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges || isSaving}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors ${hasUnsavedChanges && !isSaving
                                ? 'bg-pink-600 hover:bg-pink-700'
                                : 'bg-gray-400 cursor-not-allowed'
                            }`}
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            <FormSection
                icon={Heart}
                title="Romantic Relationships"
                description="Explore your romantic relationship patterns and goals"
            >
                <div className="space-y-6">
                    <TextArea
                        label="Current Relationship Status"
                        placeholder="Describe your current relationship situation (e.g., single, dating, married, etc.)"
                        helper="Include how long you've been in your current status"
                        value={formData.relationshipStatus}
                        onChange={(value) => handleFieldChange('relationshipStatus', value)}
                    />
                    <TextArea
                        label="Relationship Goals"
                        placeholder="What are you looking for in a romantic relationship?"
                        value={formData.relationshipGoals}
                        onChange={(value) => handleFieldChange('relationshipGoals', value)}
                    />
                    <TextArea
                        label="Relationship Patterns"
                        placeholder="Describe any patterns you've noticed in your relationships"
                        value={formData.relationshipPatterns}
                        onChange={(value) => handleFieldChange('relationshipPatterns', value)}
                    />
                    <TextArea
                        label="Challenges & Growth Areas"
                        placeholder="What relationship challenges would you like to work on?"
                        value={formData.relationshipChallenges}
                        onChange={(value) => handleFieldChange('relationshipChallenges', value)}
                    />
                </div>
            </FormSection>

            <FormSection
                icon={Users}
                title="Family Relationships"
                description="Reflect on your family dynamics and connections"
            >
                <div className="space-y-6">
                    <TextArea
                        label="Family Dynamic"
                        placeholder="Describe your relationship with family members"
                        value={formData.familyDynamic}
                        onChange={(value) => handleFieldChange('familyDynamic', value)}
                    />
                    <TextArea
                        label="Family Challenges"
                        placeholder="What challenges exist within your family relationships?"
                        value={formData.familyChallenges}
                        onChange={(value) => handleFieldChange('familyChallenges', value)}
                    />
                    <TextArea
                        label="Family Goals"
                        placeholder="How would you like to improve family relationships?"
                        value={formData.familyGoals}
                        onChange={(value) => handleFieldChange('familyGoals', value)}
                    />
                    <TextArea
                        label="Family History Impact"
                        placeholder="How does your family history influence your relationships?"
                        value={formData.familyHistory}
                        onChange={(value) => handleFieldChange('familyHistory', value)}
                    />
                </div>
            </FormSection>

            <FormSection
                icon={UserPlus}
                title="Friendships"
                description="Evaluate your friend relationships and social connections"
            >
                <div className="space-y-6">
                    <TextArea
                        label="Friendship Circle"
                        placeholder="Describe your current friendship network"
                        value={formData.friendshipCircle}
                        onChange={(value) => handleFieldChange('friendshipCircle', value)}
                    />
                    <TextArea
                        label="Friendship Patterns"
                        placeholder="How do you typically form and maintain friendships?"
                        value={formData.friendshipPatterns}
                        onChange={(value) => handleFieldChange('friendshipPatterns', value)}
                    />
                    <TextArea
                        label="Social Goals"
                        placeholder="How would you like to improve your social connections?"
                        value={formData.socialGoals}
                        onChange={(value) => handleFieldChange('socialGoals', value)}
                    />
                    <TextArea
                        label="Friendship Challenges"
                        placeholder="What challenges do you face in friendships?"
                        value={formData.friendshipChallenges}
                        onChange={(value) => handleFieldChange('friendshipChallenges', value)}
                    />
                </div>
            </FormSection>

            <FormSection
                icon={Briefcase}
                title="Professional Relationships"
                description="Assess your workplace relationships and communication"
            >
                <div className="space-y-6">
                    <TextArea
                        label="Workplace Dynamic"
                        placeholder="Describe your relationships at work"
                        value={formData.workplaceDynamic}
                        onChange={(value) => handleFieldChange('workplaceDynamic', value)}
                    />
                    <TextArea
                        label="Communication Style"
                        placeholder="How do you typically communicate at work?"
                        value={formData.communicationStyle}
                        onChange={(value) => handleFieldChange('communicationStyle', value)}
                    />
                    <TextArea
                        label="Professional Boundaries"
                        placeholder="How do you maintain professional boundaries?"
                        value={formData.professionalBoundaries}
                        onChange={(value) => handleFieldChange('professionalBoundaries', value)}
                    />
                    <TextArea
                        label="Growth Areas"
                        placeholder="What professional relationship aspects would you like to improve?"
                        value={formData.careerGrowthAreas}
                        onChange={(value) => handleFieldChange('careerGrowthAreas', value)}
                    />
                </div>
            </FormSection>

            <SaveNotification show={showSaveSuccess} />
        </div>
    );
}