import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

const DomainForm = ({ domain, initialData, onSave, isActive, onActivate }) => {
    const [formData, setFormData] = useState(initialData);
    const [isEditing, setIsEditing] = useState(false);

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
                        options: [
                            'single',
                            'dating',
                            'married',
                            'divorced',
                            'other'
                        ]
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

            // Add more cases for other domains

            default:
                return [
                    { name: 'generalNotes', label: 'Notes', type: 'textarea' }
                ];
        }
    };

    const handleChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        setIsEditing(false);
    };

    const renderField = (field) => {
        switch (field.type) {
            case 'textarea':
                return (
                    <Textarea
                        id={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                        className="min-h-[100px]"
                    />
                );

            case 'select':
                return (
                    <select
                        id={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="w-full p-2 border rounded-md"
                    >
                        <option value="">Select {field.label}</option>
                        {field.options.map(option => (
                            <option key={option} value={option}>
                                {option.charAt(0).toUpperCase() + option.slice(1)}
                            </option>
                        ))}
                    </select>
                );

            default:
                return (
                    <Input
                        type={field.type}
                        id={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={`Enter ${field.label.toLowerCase()}...`}
                    />
                );
        }
    };

    if (!isActive && !isEditing) {
        return (
            <Button
                variant="outline"
                className="w-full"
                onClick={onActivate}
            >
                {Object.keys(formData).length > 0 ? 'View Details' : 'Start Filling'}
            </Button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isEditing ? (
                <div className="space-y-4">
                    {getFormFields().map(field => (
                        <div key={field.name} className="space-y-2">
                            <Label className="font-medium">{field.label}</Label>
                            <p className="text-gray-700 whitespace-pre-wrap">
                                {formData[field.name] || 'Not specified'}
                            </p>
                        </div>
                    ))}
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="flex-1"
                        >
                            Edit
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                    {getFormFields().map(field => (
                        <div key={field.name} className="space-y-2">
                            <Label htmlFor={field.name}>{field.label}</Label>
                            {renderField(field)}
                        </div>
                    ))}
                    <div className="flex gap-2 pt-4">
                        <Button
                            type="submit"
                            className="flex-1"
                        >
                            <Check className="w-4 h-4 mr-2" />
                            Save
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </form>
    );
};

export default DomainForm;