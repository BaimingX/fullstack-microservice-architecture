"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import serverAxios from "@/lib/axios-server";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  callbackUrl?: string;
};

export default function AuthModal({ isOpen, onClose, initialMode = 'login', callbackUrl }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [codeCountdown, setCodeCountdown] = useState(0);
  const router = useRouter();
  
  // Use separate refs for login and register forms to avoid conflicts
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  
  const registerEmailRef = useRef<HTMLInputElement>(null);
  const registerPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const verificationCodeRef = useRef<HTMLInputElement>(null);
  
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Store finalCallbackUrl in a ref to avoid SSR issues with window
  const finalCallbackUrlRef = useRef<string>(callbackUrl || '/');
  
  // Safely set the callback URL after component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      finalCallbackUrlRef.current = callbackUrl || window.location.href;
    }
  }, [callbackUrl]);
  
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
    }
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);
  
  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmailRef.current || !loginPasswordRef.current) return;
    
    const email = loginEmailRef.current.value;
    const password = loginPasswordRef.current.value;
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Use NextAuth's signIn method for login with callbackUrl
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false // Prevent automatic redirect to handle errors
      });
      
      if (result?.error) {
        // Login failed
        setError(result.error || "Invalid email or password");
      } else {
        // Login successful, close modal
        onClose();
        // Redirect to callback URL
        window.location.href = finalCallbackUrlRef.current;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Validate username rules
  const validateUsername = (username: string): string | null => {
    if (username.length < 4 || username.length > 20) {
      return "Username must be 4-20 characters long";
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return "Username can only contain letters, numbers and underscores";
    }
    
    if (/^\d+$/.test(username)) {
      return "Username cannot be all numbers";
    }
    
    return null;
  };
  
  // Validate password rules
  const validatePassword = (password: string): string | null => {
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    
    if (!/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
      return "Password must contain both letters and numbers";
    }
    
    return null;
  };
  
  // Validate email format
  const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return null;
  };
  
  // Handle sending verification code
  const handleSendVerificationCode = async () => {
    if (!registerEmailRef.current) return;
    
    const email = registerEmailRef.current.value;
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      // Call API to send verification code
      const response = await serverAxios.post('/coolStuffUser/sendEmailCode', { 
        email: email
      });
      
      // Check response
      const responseData = response.data?.code ? response.data : response;
      if (responseData.code !== "200") {
        throw new Error(responseData.msg || 'Failed to send verification code');
      }
      
      // Set code sent to true
      setCodeSent(true);
      setSuccess("Verification code sent! Please check your email.");
      
      // Start countdown timer
      setCodeCountdown(60);
      const timer = setInterval(() => {
        setCodeCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
    } catch (error: any) {
      setError(error.message || 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle register form submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerEmailRef.current || !registerPasswordRef.current || 
        !confirmPasswordRef.current || !verificationCodeRef.current) return;
    
    const email = registerEmailRef.current.value;
    const password = registerPasswordRef.current.value;
    const confirmPassword = confirmPasswordRef.current.value;
    const verificationCode = verificationCodeRef.current.value;
    
    if (!email || !password || !confirmPassword || !verificationCode) {
      setError("Please fill in all fields");
      return;
    }
    
    // Validate email
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }
    
    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (!codeSent) {
      setError("Please request a verification code first");
      return;
    }
    
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Call Spring Boot backend registration API
      const response = await serverAxios.post('/coolStuffUser/register', { 
        email: email,
        password: password,
        loginType: 0,  // Local account registration
        status: 1      // Status enabled
      }, {
        params: {
          codeFromUser: verificationCode
        }
      });
      
      // Check the code field in the response to determine success
      const responseData = response.data?.code ? response.data : response;
      if (responseData.code !== "200") {
        throw new Error(responseData.msg || 'Registration failed');
      }
      
      // Registration successful, show success message
      setSuccess("Registration successful! Logging in...");
      
      // Clear registration form
      if (registerEmailRef.current) registerEmailRef.current.value = '';
      if (registerPasswordRef.current) registerPasswordRef.current.value = '';
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
      if (verificationCodeRef.current) verificationCodeRef.current.value = '';
      
      // Reset verification code state
      setCodeSent(false);
      
      // Auto-login after successful registration
      setTimeout(async () => {
        try {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false
          });
          
          if (result?.error) {
            throw new Error(result.error);
          }
          
          setSuccess("");
          onClose(); // Close modal after successful login
          // Redirect to callback URL
          window.location.href = finalCallbackUrlRef.current;
        } catch (error) {
          console.error("Auto-login failed:", error);
          setSuccess("");
          setMode('login'); // Switch to login mode if auto-login fails
        }
      }, 1500);
      
    } catch (error: any) {
      setError(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle Google sign-in
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Directly use NextAuth signIn method with redirect to callbackUrl
      await signIn('google', { callbackUrl: finalCallbackUrlRef.current });
      
    } catch (error: any) {
      setIsLoading(false);
      setError(error.message || "Google sign in is temporarily unavailable");
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div 
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative"
      >
        {/* Close button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 text-xl font-bold"
        >
          &times;
        </button>
        
        {/* Modal title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {mode === 'login' ? 'Sign In' : 'Create Account'}
        </h2>
        
        {/* Error message */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        {/* Success message */}
        {success && (
          <div className="mb-4 p-2 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}
        
        {/* Login form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="login-email"
                name="email"
                type="email"
                ref={loginEmailRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                autoComplete="email"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="login-password"
                name="password"
                type="password"
                ref={loginPasswordRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                autoComplete="current-password"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 mt-4"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}
        
        {/* Register form */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <label htmlFor="register-email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="register-email"
                name="email"
                type="email"
                ref={registerEmailRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                autoComplete="email"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="register-password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="register-password"
                name="password"
                type="password"
                ref={registerPasswordRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                autoComplete="new-password"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="register-confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="register-confirm-password"
                name="confirmPassword"
                type="password"
                ref={confirmPasswordRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                autoComplete="new-password"
              />
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700">
                  Verification Code
                </label>
                <button
                  type="button"
                  onClick={handleSendVerificationCode}
                  disabled={isLoading || codeCountdown > 0}
                  className="text-xs text-pink-600 hover:text-pink-700 disabled:text-gray-400"
                >
                  {codeCountdown > 0 
                    ? `Resend in ${codeCountdown}s` 
                    : codeSent ? 'Resend Code' : 'Send Code'}
                </button>
              </div>
              <input
                id="verification-code"
                name="verificationCode"
                type="text"
                ref={verificationCodeRef}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900"
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 mt-4"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
        
        {/* Social login */}
        <div className="mt-6" onClick={(e) => e.stopPropagation()}>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="mt-4 w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Image src="/icons/google.svg" alt="Google" width={16} height={16} className="mr-2" />
            {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
          </button>
        </div>
        
        {/* Mode toggle */}
        <div className="mt-6 text-center text-sm" onClick={(e) => e.stopPropagation()}>
          {mode === 'login' ? (
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button 
                type="button"
                onClick={() => setMode('register')}
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                Register
              </button>
            </p>
          ) : (
            <p className="text-gray-600">
              Already have an account?{' '}
              <button 
                type="button"
                onClick={() => setMode('login')}
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
