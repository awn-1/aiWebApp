import React, { useState, useEffect } from 'react';
import { Heart, Users, UserPlus } from 'lucide-react';
import { useUserContext } from './UserContext';
import './RelationshipForm.css';

const SectionHeader = ({ icon: Icon, title, description }) => (
    <div className="flex flex-col items-center text-center mb-10">
        <div className="p-3 bg-pink-50 rounded-full mb-4">
            <Icon className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-3xl font-semibold text-gray-900 mb-3">
            {title}
        </h2>
        <p className="text-gray-600 max-w-xl">
            {description}
        </p>
    </div>
);

const FormField = ({ label, placeholder, value, onChange }) => (
    <div className="form-field">
        <label>{label}</label>
        <textarea
            placeholder={placeholder}
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);

export default function RelationshipForm() {
    const { userProfile, updateUserProfile } = useUserContext();
    const [formData, setFormData] = useState({
        relationshipStatus: '',
        relationshipPatterns: '',
        challengesAndGrowth: '',
    });

    // Load saved data when component mounts
    useEffect(() => {
        const savedData = localStorage.getItem('relationshipFormData');
        if (savedData) {
            try {
                const parsedData = JSON.parse(savedData);
                setFormData(parsedData);
                updateUserProfile('relationships', parsedData); // Update context
            } catch (error) {
                console.error('Error loading saved data:', error);
            }
        }
    }, []);

    // Handle individual field changes
    const handleFieldChange = (field) => (value) => {
        const updatedData = {
            ...formData,
            [field]: value
        };
        setFormData(updatedData);

        // Save to localStorage and update context
        localStorage.setItem('relationshipFormData', JSON.stringify(updatedData));
        updateUserProfile('relationships', updatedData);
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            // Save to localStorage
            localStorage.setItem('relationshipFormData', JSON.stringify(formData));

            // Log the data being saved
            console.log('Saving form data:', formData);

            // Example API call (replace with your actual API endpoint)
            // const response = await fetch('/api/relationships', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(formData)
            // });

            // Show success message
            alert('Form data saved successfully!');

        } catch (error) {
            console.error('Error saving form:', error);
            alert('Error saving form data. Please try again.');
        }
    };

    return (
        <div className="form-container">
            {/* Romantic Relationships Section */}
            <section className="form-section">
                <SectionHeader
                    icon={Heart}
                    title="Romantic Relationships"
                    description="Explore your romantic relationship patterns and goals"
                />

                <div className="form-field-container">
                    <FormField
                        label="Current Relationship Status"
                        placeholder="Describe your current relationship situation (e.g., single, dating, married, etc.)"
                        value={formData.relationshipStatus}
                        onChange={handleFieldChange('relationshipStatus')}
                    />

                    <FormField
                        label="Relationship Patterns"
                        placeholder="Describe any patterns you've noticed in your past relationships or current relationship dynamics"
                        value={formData.relationshipPatterns}
                        onChange={handleFieldChange('relationshipPatterns')}
                    />

                    <FormField
                        label="Challenges & Growth Areas"
                        placeholder="What relationship challenges would you like to work on? What aspects of yourself would you like to develop?"
                        value={formData.challengesAndGrowth}
                        onChange={handleFieldChange('challengesAndGrowth')}
                    />
                </div>
            </section>

            {/* Save Button */}
            <div className="save-button-container">
                <button
                    className="save-button"
                    onClick={handleSubmit}
                >
                    Save Changes
                </button>
            </div>
        </div>
    );
}