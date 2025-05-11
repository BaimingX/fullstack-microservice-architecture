import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/nextauth';
import serverAxios from '@/lib/axios-server';
import ProfileClient from './client';
import { Metadata } from 'next';

// Page metadata
export const metadata: Metadata = {
  title: 'Profile | Cool Stuff',
  description: 'View and manage your profile information',
};

// Filter response data, remove sensitive fields
const filterSensitiveData = (userData: any) => {
  if (!userData) return null;
  
  // Keep required fields, ignore sensitive ones
  const { 
    id, username, email, phone, 
    addressLine1, addressLine2, suburb, state, postalCode, country,
    nickname, avatar, createTime 
  } = userData;
  
  return {
    id, username, email, phone,
    addressLine1, addressLine2, suburb, state, postalCode, country,
    nickname, avatar,
    createdAt: createTime
  };
};

export default async function ProfilePage() {
  // Get session information
  const session = await getServerSession(authOptions);
  
  // If not logged in, return client component to handle
  if (!session?.user) {
    return <ProfileClient />;
  }
  
  try {
    // Get user data from backend
    const response = await serverAxios.get(`/coolStuffUser/selectById/${session.user.id}`, {
      headers: {
        'headlesscmstoken': session.backendToken || ''
      }
    });
    
    // Parse response data
    const responseData = response.data || {};
    
    // Check response format
    if (responseData.code === "200" && responseData.data) {
      // Filter sensitive data
      const filteredData = filterSensitiveData(responseData.data);
      
      // Pass filtered data to client component
      return <ProfileClient initialData={filteredData} />;
    } else {
      // Return client component to handle errors
      return <ProfileClient />;
    }
  } catch (error) {
    // Error handling is responsibility of client component
    return <ProfileClient />;
  }
} 