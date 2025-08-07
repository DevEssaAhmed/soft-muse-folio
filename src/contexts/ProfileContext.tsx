import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profile'>;

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get the most recent profile (we only allow one profile)
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching profile:', error);
        // If the table doesn't exist or we can't access it, create a default profile
        const defaultProfile = {
          id: 'default',
          name: 'Portfolio Owner',
          username: 'portfolio_owner',
          title: 'Developer',
          bio: 'Welcome to my portfolio. Please update your profile information.',
          email: null,
          avatar_url: null,
          github_url: null,
          linkedin_url: null,
          website_url: null,
          location: null,
          skills: ['JavaScript', 'React', 'Node.js'],
          stats: {
            projectsLed: { label: 'Projects Led', value: '15+' },
            hoursAnalyzed: { label: 'Hours Analyzed', value: '500+' },
            clientsServed: { label: 'Clients Served', value: '50+' }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }

      // Use the first profile if it exists, otherwise create default
      const profileData = data && data.length > 0 ? data[0] : {
        id: 'default',
        name: 'Portfolio Owner',
        username: 'portfolio_owner',
        title: 'Developer',
        bio: 'Welcome to my portfolio. Please update your profile information.',
        email: null,
        avatar_url: null,
        github_url: null,
        linkedin_url: null,
        website_url: null,
        location: null,
        skills: ['JavaScript', 'React', 'Node.js'],
        stats: {
          projectsLed: { label: 'Projects Led', value: '15+' },
          hoursAnalyzed: { label: 'Hours Analyzed', value: '500+' },
          clientsServed: { label: 'Clients Served', value: '50+' }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProfile(profileData);

    } catch (err) {
      console.error('Error fetching profile:', err);
      // Even on error, provide a default profile so the app doesn't get stuck
      const defaultProfile = {
        id: 'default',
        name: 'Portfolio Owner',
        username: 'portfolio_owner',
        title: 'Developer',
        bio: 'Welcome to my portfolio. Please update your profile information.',
        email: null,
        avatar_url: null,
        github_url: null,
        linkedin_url: null,
        website_url: null,
        location: null,
        skills: ['JavaScript', 'React', 'Node.js'],
        stats: {
          projectsLed: { label: 'Projects Led', value: '15+' },
          hoursAnalyzed: { label: 'Hours Analyzed', value: '500+' },
          clientsServed: { label: 'Clients Served', value: '50+' }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setProfile(defaultProfile);
      setError('Using default profile data. Please check your database connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);

      if (!profile) {
        // Create new profile if none exists - ensure required fields
        const profileData = {
          name: updates.name || 'New User',
          username: updates.username || 'user',
          ...updates,
          updated_at: new Date().toISOString()
        };
        
        const { data, error } = await supabase
          .from('profile')
          .insert([profileData])
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      } else {
        // Update existing profile
        const { data, error } = await supabase
          .from('profile')
          .update({
            ...updates,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id)
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{
      profile,
      loading,
      error,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export default ProfileContext;