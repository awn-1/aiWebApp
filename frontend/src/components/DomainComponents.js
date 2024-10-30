import React from 'react';
import { Check, X } from 'lucide-react';

// Domain Form Component
export function DomainForm({ domain, initialData, formData, onChange, onSave, onCancel }) {
    const getFormFields = () => {
        switch (domain.name) {
            case 'Career':
                return [
                    { name: 'currentRole', label: 'Current Role', type: 'text' },
                    { name: 'company', label: 'Company', type: 'text' },
                    { name: 'industry', label: 'Industry', type: 'text' },
                    { name: 'yearsExperience', label: 'Years of Experience', type: 'number' },
                    { name: 'careerGoals', label: 'Career Goals', type: 'textarea' },
                    { name: 'challenges', label: 'Current Challenges', type: 'textarea' },
                    { name: 'skills', label: 'Key Skills', type: 'textarea' },
                    { name: 'workStyle', label: 'Work Style', type: 'textarea' },
                ];

            case 'Relationships':
                return [
                    {
                        name: 'relationshipStatus',
                        label: 'Relationship Status',
                        type: 'select',
                        options: ['single', 'dating', 'married', 'divorced', 'other']
                    },
                    { name: 'relationshipGoals', label: 'Relationship Goals', type: 'textarea' },
                    { name: 'dealBreakers', label: 'Deal Breakers', type: 'textarea' },
                    { name: 'attachmentStyle', label: 'Attachment Style', type: 'text' },
                    { name: 'loveLanguages', label: 'Love Languages', type: 'textarea' },
                ];

            case 'Personal Growth':
                return [
                    { name: 'values', label: 'Core Values', type: 'textarea' },
                    { name: 'strengths', label: 'Key Strengths', type: 'textarea' },
                    { name: 'growthAreas', label: 'Areas for Growth', type: 'textarea' },
                    { name: 'lifeGoals', label: 'Life Goals', type: 'textarea' },
                    { name: 'personalityTraits', label: 'Personality Traits', type: 'textarea' },
                    { name: 'copingMechanisms', label: 'Coping Mechanisms', type: 'textarea' },
                ];

            default:
                return [
                    { name: 'generalNotes', label: 'Notes', type: 'textarea' }
                ];
        }
    };

    const handleChange = (name, value) => {
        onChange({
            ...formData,
            [name]: value
        });
    };

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
            {getFormFields().map(field => (
                <div key={field.name} className="space-y-2">
                    <label
                        htmlFor={field.name}
                        className="block text-sm font-medium text-gray-700"
                    >
                        {field.label}
                    </label>

                    {field.type === 'textarea' ? (
                        <textarea
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                            rows={4}
                        />
                    ) : field.type === 'select' ? (
                        <select
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select {field.label}</option>
                            {field.options.map(option => (
                                <option key={option} value={option}>
                                    {option.charAt(0).toUpperCase() + option.slice(1)}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={field.type}
                            id={field.name}
                            value={formData[field.name] || ''}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    )}
                </div>
            ))}

            <div className="flex gap-2 pt-4">
                <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Check className="w-4 h-4 inline-block mr-2" />
                    Save
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <X className="w-4 h-4 inline-block mr-2" />
                    Cancel
                </button>
            </div>
        </form>
    );
}

// Domain View Component
export function DomainView({ domain, content }) {
    const getFields = () => {
        switch (domain.name) {
            case 'Career':
                return [
                    { name: 'currentRole', label: 'Current Role' },
                    { name: 'company', label: 'Company' },
                    { name: 'industry', label: 'Industry' },
                    { name: 'yearsExperience', label: 'Years of Experience' },
                    { name: 'careerGoals', label: 'Career Goals' },
                    { name: 'challenges', label: 'Current Challenges' },
                    { name: 'skills', label: 'Key Skills' },
                    { name: 'workStyle', label: 'Work Style' },
                ];

            case 'Relationships':
                return [
                    { name: 'relationshipStatus', label: 'Relationship Status' },
                    { name: 'relationshipGoals', label: 'Relationship Goals' },
                    { name: 'dealBreakers', label: 'Deal Breakers' },
                    { name: 'attachmentStyle', label: 'Attachment Style' },
                    { name: 'loveLanguages', label: 'Love Languages' },
                ];

            case 'Personal Growth':
                return [
                    { name: 'values', label: 'Core Values' },
                    { name: 'strengths', label: 'Key Strengths' },
                    { name: 'growthAreas', label: 'Areas for Growth' },
                    { name: 'lifeGoals', label: 'Life Goals' },
                    { name: 'personalityTraits', label: 'Personality Traits' },
                    { name: 'copingMechanisms', label: 'Coping Mechanisms' },
                ];

            default:
                return [
                    { name: 'generalNotes', label: 'Notes' }
                ];
        }
    };

    if (!content) {
        return (
            <p className="text-sm text-gray-500 italic">
                No information added yet
            </p>
        );
    }

    return (
        <div className="space-y-4">
            {getFields().map(field => (
                <div key={field.name} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-700">
                        {field.label}
                    </h4>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">
                        {content[field.name] || 'Not specified'}
                    </p>
                </div>
            ))}
        </div>
    );
}