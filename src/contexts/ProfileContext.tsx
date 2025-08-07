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

      // For now, skip the Supabase call and use default profile
      // This will help get the app running quickly
      const defaultProfile = {
        id: 'default',
        name: 'Alex Chen',
        username: 'alexchen',
        title: 'Full Stack Developer',
        bio: 'Passionate developer specializing in web applications, data science, and modern technologies. Welcome to my portfolio!',
        email: 'alex@example.com',
        avatar_url: '/placeholder.svg',
        github_url: 'https://github.com/alexchen',
        linkedin_url: 'https://linkedin.com/in/alexchen',
        website_url: null,
        location: 'San Francisco, CA',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'Vue.js'],
        stats: {
          projectsLed: { label: 'Projects Led', value: '15+' },
          hoursAnalyzed: { label: 'Hours Analyzed', value: '500+' },
          clientsServed: { label: 'Clients Served', value: '50+' }
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setProfile(defaultProfile);

      // Uncomment the code below once the database connection is verified
      /*
      // Get the most recent profile (we only allow one profile)
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching profile:', error);
        setProfile(defaultProfile);
        setLoading(false);
        return;
      }

      // Use the first profile if it exists, otherwise use default
      const profileData = data && data.length > 0 ? data[0] : defaultProfile;
      setProfile(profileData);
      */

    } catch (err) {
      console.error('Error fetching profile:', err);
      // Even on error, provide a default profile so the app doesn't get stuck
      const defaultProfile = {
        id: 'default',
        name: 'Alex Chen',
        username: 'alexchen',
        title: 'Full Stack Developer',
        bio: 'Passionate developer specializing in web applications, data science, and modern technologies. Welcome to my portfolio!',
        email: 'alex@example.com',
        avatar_url: '/placeholder.svg',
        github_url: 'https://github.com/alexchen',
        linkedin_url: 'https://linkedin.com/in/alexchen',
        website_url: null,
        location: 'San Francisco, CA',
        skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'Vue.js'],
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