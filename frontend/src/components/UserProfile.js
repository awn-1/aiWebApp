import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import './UserProfile.css';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const CHARACTER_LIMIT = 1000;
const WARNING_THRESHOLD = 900;

function UserProfile() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    general_information: ''
  });

  const remainingCharacters = CHARACTER_LIMIT - (profile.general_information?.length || 0);
  const isApproachingLimit = remainingCharacters <= (CHARACTER_LIMIT - WARNING_THRESHOLD);
  const hasReachedLimit = remainingCharacters === 0;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id);
      } else {
        navigate('/auth');
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error fetching profile:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      alert('Error updating profile!');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'general_information') {
      if (value.length <= CHARACTER_LIMIT) {
        setProfile({ ...profile, [name]: value });
      }
    } else {
      setProfile({ ...profile, [name]: value });
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile Settings</h1>
        <p className="user-email">{session?.user?.email}</p>
      </div>

      {successMessage && (
        <div className="success-message">
          <svg xmlns="http://www.w3.org/2000/svg" className="success-icon" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          {successMessage}
        </div>
      )}

      <div className="profile-container">
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name || ''}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="form-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="age">Age</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={profile.age || ''}
                  onChange={handleChange}
                  placeholder="Enter your age"
                  className="form-input"
                  min="0"
                  max="150"
                />
              </div>

              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={profile.gender || ''}
                  onChange={handleChange}
                  className="form-input"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Additional Information</h2>
            <div className="form-group">
              <label htmlFor="general_information">
                About Me
                <span className={`character-count ${isApproachingLimit ? 'warning' : ''} ${hasReachedLimit ? 'limit-reached' : ''}`}>
                  {remainingCharacters} characters remaining
                </span>
              </label>
              <textarea
                id="general_information"
                name="general_information"
                value={profile.general_information || ''}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                className={`form-input textarea ${isApproachingLimit ? 'warning-border' : ''} ${hasReachedLimit ? 'limit-reached-border' : ''}`}
                rows="4"
                maxLength={CHARACTER_LIMIT}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-button" disabled={saving}>
              {saving ? (
                <>
                  <span className="button-spinner"></span>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
            <button type="button" onClick={handleSignOut} className="sign-out-button">
              Sign Out
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default UserProfile;