"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import { User, Mail, Calendar, MapPin, Phone, Home, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

// 定义Google Maps API的全局类型
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: any
          ) => any;
          AutocompleteSessionToken: new () => any;
        };
      };
    };
  }
}

// 创建一个客户端axios实例
const clientAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  timeout: 30000,
});

// 请求拦截器
clientAxios.interceptors.request.use(config => {
  config.headers['Content-Type'] = 'application/json;charset=utf-8';
  return config;
}, error => {
  return Promise.reject(error);
});

// 更新UserProfile类型定义，只包含需要在界面上显示的字段
type UserProfile = {
  id: number;
  username: string;
  email: string;
  phone?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  suburb?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  createdAt?: string | null;
};

// 处理API响应数据，过滤敏感字段
const processUserData = (data: any): UserProfile => {
  return {
    id: data.id,
    username: data.username,
    email: data.email,
    phone: data.phone,
    addressLine1: data.addressLine1,
    addressLine2: data.addressLine2,
    suburb: data.suburb,
    state: data.state,
    postalCode: data.postalCode,
    country: data.country,
    createdAt: data.createTime || data.createdAt // 适配不同的字段名
  };
};

export default function ProfileClient({ initialData }: { initialData?: any }) {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<UserProfile | null>(initialData ? processUserData(initialData) : null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();
  
  // 地址输入框引用和session token引用
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  const sessionTokenRef = useRef<any>(null);

  useEffect(() => {    
    if (!initialData && session?.user?.id) {
      fetchUserProfile();
    } else if (initialData) {
      setProfile(processUserData(initialData));
    }
  }, [session, initialData]);

  // 初始化地址自动补全
  const initAutocomplete = useCallback(() => {
    if (!window.google || !addressInputRef.current) return;

    // 创建一个新的会话令牌以优化API调用
    if (!sessionTokenRef.current) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    }

    const autocomplete = new window.google.maps.places.Autocomplete(addressInputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'au' }, // 限制为澳大利亚地址
      fields: ['address_components', 'formatted_address'],
      sessionToken: sessionTokenRef.current, // 使用会话令牌
      language: 'en' // 强制使用英文
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.address_components) return;
      
      // 解析地址组件
      const components: Record<string, string> = {};
      place.address_components.forEach((component: any) => {
        const type = component.types[0];
        components[type] = component.long_name;
      });

      // 更新profile状态
      if (profile) {
        setProfile({
          ...profile,
          addressLine1: place.formatted_address || '',
          suburb: components['locality'] || '',
          state: components['administrative_area_level_1'] || '',
          postalCode: components['postal_code'] || '',
          country: components['country'] || 'Australia'
        });
      }

      // 重置会话令牌，为下一次搜索准备
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken();
    });
  }, [profile]);

  // 当组件挂载和Google API加载完成后初始化自动补全
  useEffect(() => {
    const checkAndInitGoogle = () => {
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        initAutocomplete();
      } else {
        // 等待Google API加载完成
        const interval = setInterval(() => {
          if (typeof window !== 'undefined' && window.google?.maps?.places) {
            clearInterval(interval);
            initAutocomplete();
          }
        }, 100);
        
        // 5秒后停止检查，避免无限循环
        setTimeout(() => clearInterval(interval), 5000);
      }
    };
    
    checkAndInitGoogle();
    
    // 清理函数
    return () => {};
  }, [initAutocomplete]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = session?.backendToken;
      
      const response = await clientAxios.get(`/coolStuffUser/selectById/${session?.user?.id}`, {
        headers: {
          'headlesscmstoken': token || ''
        }
      });
      
      const responseData = response.data;
      
      if (responseData.code === "200" && responseData.data) {
        setProfile(processUserData(responseData.data));
      } else {
        setError(responseData.msg || 'Failed to retrieve profile');
      }
    } catch (error: any) {
      setError(error?.message || 'Error getting profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (profile) {
      setProfile({
        ...profile,
        [name]: value
      });
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || !session?.user?.id) return;
    
    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');
      
      const token = session?.backendToken;
      
      const response = await clientAxios.put('/coolStuffUser/update', {
        ...profile,
        id: profile.id
      }, {
        headers: {
          'headlesscmstoken': token || ''
        }
      });
      
      const responseData = response.data;
      
      if (responseData.code === "200") {
        setSuccessMessage('Profile updated successfully');
      } else {
        setError(responseData.msg || 'Failed to update profile');
      }
    } catch (error: any) {
      setError(error?.message || 'Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-500 mb-4">{error}</div>
        <button 
          onClick={fetchUserProfile}
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-500 mb-4">Profile not found</div>
        <button 
          onClick={fetchUserProfile}
          className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 p-6 text-white">
          <h1 className="text-2xl font-bold">Profile</h1>
          <p className="opacity-90">Manage your personal information</p>
        </div>

        {/* Profile Content */}
        <form onSubmit={handleUpdateProfile} className="p-6">
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          <div className="space-y-6">
            {/* Username - Read only */}
            <div className="flex items-start space-x-4">
              <User className="w-6 h-6 text-black mt-1" />
              <div>
                <h3 className="text-sm font-medium text-black">Username</h3>
                <p className="text-lg font-medium text-black">{profile.username || 'Not set'}</p>
              </div>
            </div>

            {/* Email - Read only */}
            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-black mt-1" />
              <div>
                <h3 className="text-sm font-medium text-black">Email</h3>
                <p className="text-lg text-black">{profile.email || 'Not set'}</p>
              </div>
            </div>

            {/* Phone - Editable */}
            <div className="flex items-start space-x-4">
              <Phone className="w-6 h-6 text-black mt-1" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-black">Phone</h3>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                  placeholder="Enter your phone number"
                />
              </div>
            </div>

            {/* Address - Editable with Autocomplete */}
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-black mt-1" />
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium text-black">Default Shipping Address</h3>
                
                <input
                  ref={addressInputRef}
                  type="text"
                  name="addressLine1"
                  value={profile.addressLine1 || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                  placeholder="Start typing your address (e.g. 4 Lith...)"
                />
                
                <input
                  type="text"
                  name="addressLine2"
                  value={profile.addressLine2 || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                  placeholder="Address Line 2 (Optional)"
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="suburb"
                    value={profile.suburb || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                    placeholder="Suburb"
                  />
                  
                  <input
                    type="text"
                    name="state"
                    value={profile.state || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                    placeholder="State"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    name="postalCode"
                    value={profile.postalCode || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                    placeholder="Postal Code"
                  />
                  
                  <input
                    type="text"
                    name="country"
                    value={profile.country || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-black"
                    placeholder="Country"
                  />
                </div>
              </div>
            </div>

            {/* Registration Date - Read only */}
            {profile.createdAt && (
              <div className="flex items-start space-x-4">
                <Calendar className="w-6 h-6 text-black mt-1" />
                <div>
                  <h3 className="text-sm font-medium text-black">Registration Date</h3>
                  <p className="text-lg text-black">{new Date(profile.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-3">
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </button>
            
            <button 
              type="button"
              onClick={() => router.push('/')}
              className="flex items-center px-6 py-2 bg-gray-100 text-black rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <Home className="w-5 h-5 mr-2" />
              Back to Home
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 