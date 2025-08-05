"use client";

import { useState, useEffect } from 'react';

// Custom hook for client-side cookie management
export function useCookies() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get cookie value
  const getCookie = (name: string): string | undefined => {
    if (!isClient) return undefined;
    
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift();
    }
    return undefined;
  };

  // Set cookie value
  const setCookie = (name: string, value: string, options?: {
    expires?: number; // days
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }): void => {
    if (!isClient) return;

    let cookieString = `${name}=${value}`;

    if (options?.expires) {
      const date = new Date();
      date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
      cookieString += `; expires=${date.toUTCString()}`;
    }

    if (options?.path) {
      cookieString += `; path=${options.path}`;
    }

    if (options?.domain) {
      cookieString += `; domain=${options.domain}`;
    }

    if (options?.secure) {
      cookieString += '; secure';
    }

    if (options?.sameSite) {
      cookieString += `; samesite=${options.sameSite}`;
    }

    document.cookie = cookieString;
  };

  // Remove cookie
  const removeCookie = (name: string, options?: {
    path?: string;
    domain?: string;
  }): void => {
    if (!isClient) return;
    
    setCookie(name, '', { 
      expires: -1, 
      path: options?.path || '/',
      domain: options?.domain 
    });
  };

  // Get JSON cookie
  const getJsonCookie = <T = any>(name: string): T | undefined => {    
    const value = getCookie(name);

    if (!value) return undefined;

    try {
      return JSON.parse(decodeURIComponent(value)) as T;
    } catch {
      return undefined;
    }
  };

  // Set JSON cookie
  const setJsonCookie = <T = any>(name: string, value: T, options?: {
    expires?: number;
    path?: string;
    domain?: string;
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
  }): void => {
    setCookie(name, JSON.stringify(value), options);
  };

  // Check if cookie exists
  const hasCookie = (name: string): boolean => {
    return getCookie(name) !== undefined;
  };

  // Get all cookies
  const getAllCookies = (): Record<string, string> => {
    if (!isClient) return {};
    
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[name] = value;
      }
    });
    return cookies;
  };

  return {
    isClient,
    getCookie,
    setCookie,
    removeCookie,
    getJsonCookie,
    setJsonCookie,
    hasCookie,
    getAllCookies,
  };
}

// Specialized hooks for common use cases
export function useAuthCookies() {
  const { getCookie, setCookie, removeCookie, getJsonCookie, setJsonCookie } = useCookies();

  return {
    getAuthToken: () => getCookie('token'),
    setIdToken: (token: string) => setCookie('idToken', token),
    getIdToken: () => getCookie('idToken'),
    getProfileData: () => getJsonCookie('profileData'),
    setProfileData: (data: any) => setJsonCookie('profileData', data),
    clearAuth: () => {
      removeCookie('token');
      removeCookie('idToken');
      removeCookie('refreshToken');
      removeCookie('profileData');
    },
  };
}

export function useUserPreferences() {
  const { getJsonCookie, setJsonCookie, getCookie, setCookie } = useCookies();

  return {
    getTheme: () => getCookie('theme') || 'light',
    setTheme: (theme: string) => setCookie('theme', theme),
    getLanguage: () => getCookie('language') || 'en',
    setLanguage: (language: string) => setCookie('language', language),
    getPreferences: () => getJsonCookie('user_preferences') || {},
    setPreferences: (preferences: any) => setJsonCookie('user_preferences', preferences),
  };
} 