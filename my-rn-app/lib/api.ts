import { Platform } from 'react-native';
import { supabase } from './supabase';

// Get the correct API URL for React Native
const getApiBaseUrl = () => {
  if (!__DEV__) {
    return 'http://localhost:8000'; // Production
  }
  
  // Development - Check for environment variable first, then fallback
  const envApiUrl = process.env.EXPO_PUBLIC_API_URL;
  
  if (envApiUrl) {
    console.log('🔧 Using API URL from environment:', envApiUrl);
    return envApiUrl;
  }
  
  // Fallback for different platforms when no env var is set
  if (Platform.OS === 'ios') {
    return 'http://localhost:8000';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  } else {
    return 'http://localhost:8000';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Enable real API calls
const DISABLE_API_CALLS = false;

// Helper function to get authorization headers
async function getAuthHeaders() {
  try {
    console.log('🔐 Getting authentication headers...');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('❌ Supabase session error:', error);
      throw new Error(`Session error: ${error.message}`);
    }
    
    if (!session?.access_token) {
      console.error('❌ No valid session found - user may not be logged in');
      throw new Error('No valid session found');
    }

    console.log('✅ Session found for user:', session.user?.email);
    console.log('🔑 Token length:', session.access_token.length);
    
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  } catch (error) {
    console.error('❌ Error getting auth headers:', error);
    throw error;
  }
}

// Test backend connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const url = `${API_BASE_URL}/health`;
    console.log('🔗 Testing backend connection to:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend connection successful:', data);
      return true;
    } else {
      console.error('❌ Backend connection failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ Backend connection error:', error);
    return false;
  }
};

// API service
export const api = {
  // Get user profile with children
  async getUserProfile() {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock user profile (API disabled)');
      return {
        id: 'mock-user-1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '+1234567890',
        relationship: 'parent',
        role: 'parent',
        school: 'Mock Elementary School',
        grade: 'K1',
        locale: 'en',
        children: [
          {
            id: 'mock-child-1',
            name: 'Emma',
            age: 5,
            grade: 'K1',
            parent_id: 'mock-user-1',
            class: {
              id: 'mock-class-1',
              name: 'Sunny Hills Elementary',
              grade: 'K1'
            }
          }
        ]
      };
    }

    try {
      const url = `${API_BASE_URL}/api/v1/profiles/me`;
      console.log('🌐 Fetching user profile from:', url);
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
        } else if (response.status >= 500) {
          throw new Error('Server error - please try again later');
        } else {
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('🔍 Raw backend response:', JSON.stringify(data, null, 2));
      
      // Handle different response formats from backend
      let profile, children;
      
      if (data.profile) {
        // MeResponse format: { profile: {...}, children: [...] }
        profile = data.profile;
        children = data.children || [];
      } else {
        // Direct profile format: { user_id: ..., full_name: ... }
        profile = data;
        children = data.children || [];
      }
      
      // Map to our frontend UserProfile interface
      const mappedProfile = {
        id: profile?.user_id || profile?.id,
        name: profile?.full_name || profile?.name || profile?.email?.split('@')[0] || 'User',
        email: profile?.email,
        phone: profile?.phone,
        relationship: profile?.relationship || 'parent',
        role: profile?.role || 'parent',
        school: profile?.school,
        grade: profile?.grade,
        locale: profile?.locale,
        children: children
      };
      
      console.log('✅ Mapped profile data:', mappedProfile);
      console.log('✅ User profile fetched successfully:', mappedProfile?.name || 'Unknown user');
      return mappedProfile;
    } catch (error) {
      console.error('💥 Error fetching user profile:', error);
      throw error;
    }
  },

  // Get booklet progress for a child
  async getBookletProgress(childId: string) {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock booklet progress (API disabled)');
      return [
        {
          booklet_id: 'vocab-1',
          booklet_name: 'Vocabulary Time',
          total_modules: 20,
          completed_modules: 5,
          current_module: 5,
          progress_percentage: 25,
          estimated_completion_time: '4 months remaining'
        },
        {
          booklet_id: 'sight-1',
          booklet_name: 'Sight Words Time',
          total_modules: 15,
          completed_modules: 8,
          current_module: 8,
          progress_percentage: 53,
          estimated_completion_time: '3 months remaining'
        },
        {
          booklet_id: 'reading-1',
          booklet_name: 'Reading Time',
          total_modules: 24,
          completed_modules: 3,
          current_module: 3,
          progress_percentage: 12,
          estimated_completion_time: '8 months remaining'
        },
        {
          booklet_id: 'phonics-1',
          booklet_name: 'Phonics Time',
          total_modules: 18,
          completed_modules: 2,
          current_module: 2,
          progress_percentage: 11,
          estimated_completion_time: '6 months remaining'
        }
      ];
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/content/progress/booklets?child_id=${childId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch booklet progress: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching booklet progress:', error);
      throw error;
    }
  },

  // Get weekly progress for a child
  async getWeeklyProgress(childId: string, weeks: number = 1) {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock weekly progress (API disabled)');
      return [
        {
          week: '2025-W02',
          total_activities: 5,
          completed_activities: 3,
          completion_percentage: 60
        }
      ];
    }

    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/content/progress/weekly?child_id=${childId}&weeks=${weeks}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch weekly progress: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly progress:', error);
      throw error;
    }
  },

  // Get children list
  async getChildren() {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/api/v1/profiles/children`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch children: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching children:', error);
      throw error;
    }
  },

  // Get child certificates
  async getChildCertificates(childId: string) {
    try {
      // For now, since there's no backend endpoint, return empty array
      // TODO: Add backend endpoint for certificates
      return [];
    } catch (error) {
      console.error('Error fetching child certificates:', error);
      throw error;
    }
  },

  // Get booklets with activities for Learn page
  async getBooklets(childId?: string) {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock booklets (API disabled)');
      return [
        {
          id: 'booklet-1',
          title: 'Week 1: Letter Recognition',
          subject: 'Reading',
          modules: [
            {
              id: 'module-1',
              title: 'Letter A-E',
              activities: [
                {
                  id: 'activity-1',
                  title: 'Identify Letter A',
                  type: 'in_app',
                  status: 'completed',
                  points: 10
                },
                {
                  id: 'activity-2', 
                  title: 'Write Letter B',
                  type: 'pen_paper',
                  status: 'in_progress',
                  points: 15
                }
              ]
            }
          ]
        }
      ];
    }

    try {
      const url = `${API_BASE_URL}/api/v1/content/booklets${childId ? `?child_id=${childId}` : ''}`;
      console.log('🌐 Fetching booklets from:', url);
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Booklets fetched successfully');
      return data;
    } catch (error) {
      console.error('💥 Error fetching booklets:', error);
      throw error;
    }
  },

  // Get token balance for child
  async getTokenBalance(childId: string) {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock token balance (API disabled)');
      return {
        balance: 150,
        weekly_earned: 45,
        total_earned: 500
      };
    }

    try {
      const url = `${API_BASE_URL}/api/v1/tokens/balance?child_id=${childId}`;
      console.log('🌐 Fetching token balance from:', url);
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Token balance fetched successfully');
      return data;
    } catch (error) {
      console.error('💥 Error fetching token balance:', error);
      throw error;
    }
  },

  // Get shop items
  async getShopItems() {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock shop items (API disabled)');
      return [
        {
          id: '1',
          name: 'Colorful Pencils Set',
          category: 'Stationery',
          cost: 50,
          description: 'Fun colored pencils for drawing',
          emoji: '✏️'
        },
        {
          id: '2',
          name: 'Fun Stickers Pack',
          category: 'Stationery', 
          cost: 30,
          description: 'Reward stickers',
          emoji: '⭐'
        }
      ];
    }

    try {
      const url = `${API_BASE_URL}/api/v1/tokens/shop/items`;
      console.log('🌐 Fetching shop items from:', url);
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Shop items fetched successfully');
      return data;
    } catch (error) {
      console.error('💥 Error fetching shop items:', error);
      throw error;
    }
  },

  // Get token transaction history
  async getTokenHistory(childId: string) {
    if (DISABLE_API_CALLS) {
      console.log('API: Using mock token history (API disabled)');
      return [
        {
          id: '1',
          description: 'Completed Reading Activity',
          amount: 15,
          type: 'earned',
          created_at: '2025-01-09T10:00:00Z'
        },
        {
          id: '2',
          description: 'Bought Stickers Pack',
          amount: -30,
          type: 'spent',
          created_at: '2025-01-08T15:30:00Z'
        }
      ];
    }

    try {
      const url = `${API_BASE_URL}/api/v1/tokens/history?child_id=${childId}`;
      console.log('🌐 Fetching token history from:', url);
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Token history fetched successfully');
      return data;
    } catch (error) {
      console.error('💥 Error fetching token history:', error);
      throw error;
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<UserProfile>) {
    try {
      const url = `${API_BASE_URL}/api/v1/profiles/me`;
      console.log('🌐 Updating user profile:', url);
      
      const headers = await getAuthHeaders();
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
        } else if (response.status >= 500) {
          throw new Error('Server error - please try again later');
        } else {
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Profile updated successfully');
      return data;
    } catch (error) {
      console.error('💥 Error updating profile:', error);
      throw error;
    }
  },
};

// Types for API responses
export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  role: string;
  school?: string;
  grade?: string;
  locale?: string;
  children?: Child[];
}

export interface Child {
  id: string;
  name: string;
  age?: number;
  grade?: string;
  parent_id: string;
  class?: {
    id: string;
    name: string;
    grade: string;
  };
}

export interface BookletProgress {
  booklet_id: string;
  booklet_name: string;
  total_modules: number;
  completed_modules: number;
  current_module: number;
  progress_percentage: number;
  estimated_completion_time?: string;
}

export interface WeeklyProgress {
  week: string;
  total_activities: number;
  completed_activities: number;
  completion_percentage: number;
}

export interface Certificate {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  awarded_at: string;
}

export interface Activity {
  id: string;
  title: string;
  type: 'in_app' | 'pen_paper' | 'game' | 'audio';
  status: 'not_started' | 'in_progress' | 'completed';
  points: number;
  est_minutes?: number;
  instructions?: string;
}

export interface Module {
  id: string;
  title: string;
  description?: string;
  activities: Activity[];
}

export interface BookletWithModules {
  id: string;
  title: string;
  subtitle?: string;
  subject?: string;
  modules: Module[];
}

export interface TokenBalance {
  balance: number;
  weekly_earned: number;
  total_earned: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: string;
  cost: number;
  description?: string;
  emoji?: string;
  icon?: string;
}

export interface TokenTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'earned' | 'spent' | 'gift';
  created_at: string;
}

// Explain screenshot with AI
export const explainScreenshot = async (base64Image: string): Promise<string> => {
  try {
    const url = `${API_BASE_URL}/api/v1/ai/explain-screenshot`;
    console.log('🌐 Sending screenshot to AI service:', url);
    
    const headers = await getAuthHeaders();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_data: base64Image
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ AI API Error Response:', errorText);
      throw new Error(`AI API Error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ AI explanation received');
    return data.explanation || data.response || 'No explanation available';
  } catch (error) {
    console.error('💥 Error getting AI explanation:', error);
    throw error;
  }
}; 