import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export function UserContextProvider({ children }) {
    const [userProfile, setUserProfile] = useState({
        relationships: null,
        // Add other profile sections as needed
    });

    // Load all profile data when the provider mounts
    useEffect(() => {
        const loadProfileData = () => {
            // Load relationship data from localStorage
            const relationshipData = localStorage.getItem('relationshipFormData');
            if (relationshipData) {
                try {
                    const parsedData = JSON.parse(relationshipData);
                    setUserProfile(prev => ({
                        ...prev,
                        relationships: parsedData
                    }));
                } catch (error) {
                    console.error('Error loading relationship data:', error);
                }
            }
            // Load other profile sections here as needed
        };

        loadProfileData();
    }, []);

    const updateUserProfile = (section, data) => {
        setUserProfile(prev => ({
            ...prev,
            [section]: data
        }));
    };

    return (
        <UserContext.Provider value={{ userProfile, updateUserProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUserContext() {
    return useContext(UserContext);
}