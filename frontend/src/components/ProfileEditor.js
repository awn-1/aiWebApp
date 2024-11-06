import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Check, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const ProfileEditor = () => {
    const [domains, setDomains] = useState([]);
    const [sections, setSections] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        fetchDomains();
        fetchProfileSections();
    }, []);

    const fetchDomains = async () => {
        try {
            const { data, error } = await supabase
                .from('life_domains')
                .select('*')
                .order('name');

            if (error) throw error;
            setDomains(data);
        } catch (err) {
            setError('Failed to load life domains');
            console.error('Error:', err);
        }
    };

    const fetchProfileSections = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) return;

            const { data, error } = await supabase
                .from('profile_sections')
                .select('*')
                .eq('user_id', session.user.id);

            if (error) throw error;

            const sectionsMap = {};
            data.forEach(section => {
                sectionsMap[section.domain_id] = section;
            });
            setSections(sectionsMap);
        } catch (err) {
            setError('Failed to load profile sections');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (domainId, content) => {
        setSaving(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) throw new Error('No user session');

            const { error } = await supabase
                .from('profile_sections')
                .upsert({
                    user_id: session.user.id,
                    domain_id: domainId,
                    content,
                    last_updated: new Date().toISOString()
                });

            if (error) throw error;

            setSections(prev => ({
                ...prev,
                [domainId]: { domain_id: domainId, content }
            }));

            setSuccessMessage('Changes saved successfully!');
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setError('Failed to save changes');
            console.error('Error:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Life Domains Profile</h1>
                <p className="text-gray-600">Complete your profile to get more personalized coaching</p>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {successMessage && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                    <Check className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {domains.map(domain => (
                    <Card
                        key={domain.id}
                        className={`transition-shadow hover:shadow-lg ${activeSection === domain.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                    >
                        <CardHeader>
                            <div className="flex justify-between items-start mb-2">
                                <CardTitle className="text-xl font-semibold">{domain.name}</CardTitle>
                                {sections[domain.id]?.is_private ? (
                                    <Lock className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Unlock className="h-4 w-4 text-gray-500" />
                                )}
                            </div>
                            <CardDescription>{domain.description}</CardDescription>
                        </CardHeader>

                        <CardContent>
                            <DomainForm
                                domain={domain}
                                initialData={sections[domain.id]?.content || {}}
                                onSave={(content) => handleSave(domain.id, content)}
                                isActive={activeSection === domain.id}
                                onActivate={() => setActiveSection(domain.id)}
                            />
                        </CardContent>

                        <CardFooter className="flex justify-between items-center text-sm text-gray-500">
                            <span>
                                Last updated: {sections[domain.id]?.last_updated
                                    ? new Date(sections[domain.id].last_updated).toLocaleDateString()
                                    : 'Never'}
                            </span>
                            <Badge variant={sections[domain.id] ? "success" : "default"}>
                                {sections[domain.id] ? "Completed" : "Incomplete"}
                            </Badge>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProfileEditor;