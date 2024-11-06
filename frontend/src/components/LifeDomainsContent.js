import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Lock, Unlock, Check, X } from 'lucide-react';
import { DomainForm, DomainView } from './DomainComponents';

const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
);

function LifeDomainsContent() {
    const [domains, setDomains] = useState([]);
    const [sections, setSections] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState(null);
    const [editingSection, setEditingSection] = useState(null);
    const [formData, setFormData] = useState({});

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
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (domainId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user?.id) throw new Error('No user session');

            const { error } = await supabase
                .from('profile_sections')
                .upsert({
                    user_id: session.user.id,
                    domain_id: domainId,
                    content: formData[domainId],
                    last_updated: new Date().toISOString()
                });

            if (error) throw error;

            setSections(prev => ({
                ...prev,
                [domainId]: {
                    domain_id: domainId,
                    content: formData[domainId],
                    last_updated: new Date().toISOString()
                }
            }));
            setEditingSection(null);
        } catch (err) {
            setError('Failed to save changes');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map(domain => (
                <div
                    key={domain.id}
                    className={`bg-white rounded-lg border ${activeSection === domain.id ? 'ring-2 ring-blue-500' : ''
                        } shadow-sm hover:shadow-md transition-shadow`}
                >
                    <div className="p-4">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{domain.name}</h3>
                            {sections[domain.id]?.is_private ? (
                                <Lock className="w-4 h-4 text-gray-500" />
                            ) : (
                                <Unlock className="w-4 h-4 text-gray-500" />
                            )}
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{domain.description}</p>

                        {editingSection === domain.id ? (
                            <DomainForm
                                domain={domain}
                                initialData={sections[domain.id]?.content || {}}
                                formData={formData[domain.id] || {}}
                                onChange={(data) => setFormData(prev => ({
                                    ...prev,
                                    [domain.id]: data
                                }))}
                                onSave={() => handleSave(domain.id)}
                                onCancel={() => setEditingSection(null)}
                            />
                        ) : (
                            <div className="space-y-4">
                                <DomainView
                                    domain={domain}
                                    content={sections[domain.id]?.content}
                                />
                                <button
                                    onClick={() => setEditingSection(domain.id)}
                                    className="w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
                                >
                                    {sections[domain.id] ? 'Edit' : 'Add Information'}
                                </button>
                            </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
                            <span>
                                {sections[domain.id]?.last_updated
                                    ? `Updated ${new Date(sections[domain.id].last_updated).toLocaleDateString()}`
                                    : 'Not yet updated'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${sections[domain.id]
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                {sections[domain.id] ? 'Completed' : 'Incomplete'}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default LifeDomainsContent;