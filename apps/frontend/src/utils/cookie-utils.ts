import Cookies from 'js-cookie';

// Cookie utility functions for client-side access
export class CookieUtils {
  // Set a cookie
  static set(name: string, value: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(name, value, options);
  }

  // Get a cookie
  static get(name: string): string | undefined {
    return Cookies.get(name);
  }

  // Get all cookies
  static getAll(): { [key: string]: string } {
    return Cookies.get();
  }

  // Remove a cookie
  static remove(name: string, options?: Cookies.CookieAttributes): void {
    Cookies.remove(name, options);
  }

  // Check if a cookie exists
  static exists(name: string): boolean {
    return Cookies.get(name) !== undefined;
  }

  // Set cookie with JSON value
  static setJson(name: string, value: any, options?: Cookies.CookieAttributes): void {
    Cookies.set(name, JSON.stringify(value), options);
  }

  // Get cookie and parse as JSON
  static getJson<T = any>(name: string): T | undefined {
    const value = Cookies.get(name);
    if (!value) return undefined;
    
    try {
      return JSON.parse(value) as T;
    } catch {
      return undefined;
    }
  }

  // Set cookie with expiration in days
  static setWithExpiry(name: string, value: string, days: number): void {
    Cookies.set(name, value, { expires: days });
  }

  // Set secure cookie (HTTPS only)
  static setSecure(name: string, value: string, options?: Cookies.CookieAttributes): void {
    Cookies.set(name, value, { ...options, secure: true, sameSite: 'strict' });
  }
}

// Common cookie names used in your app
export const COOKIE_NAMES = {
  SIDEBAR_STATE: 'sidebar_state',
  AUTH_TOKEN: 'token',
  ID_TOKEN: 'idToken',
  REFRESH_TOKEN: 'refreshToken',
  PROFILE_DATA: 'profileData',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
} as const;

// Type-safe cookie getters
export const getAuthToken = (): string | undefined => CookieUtils.get(COOKIE_NAMES.AUTH_TOKEN);
export const getIdToken = (): string | undefined => CookieUtils.get(COOKIE_NAMES.ID_TOKEN);
export const getProfileData = () => CookieUtils.getJson(COOKIE_NAMES.PROFILE_DATA);
export const getSidebarState = (): string | undefined => CookieUtils.get(COOKIE_NAMES.SIDEBAR_STATE);
export const getUserPreferences = () => CookieUtils.getJson(COOKIE_NAMES.USER_PREFERENCES);
export const getTheme = (): string | undefined => CookieUtils.get(COOKIE_NAMES.THEME);
export const getLanguage = (): string | undefined => CookieUtils.get(COOKIE_NAMES.LANGUAGE);

// Type-safe cookie setters
export const setAuthToken = (token: string): void => CookieUtils.setSecure(COOKIE_NAMES.AUTH_TOKEN, token);
export const setIdToken = (token: string): void => CookieUtils.set(COOKIE_NAMES.ID_TOKEN, token);
export const setProfileData = (data: any): void => CookieUtils.setJson(COOKIE_NAMES.PROFILE_DATA, data);
export const setSidebarState = (state: string): void => CookieUtils.set(COOKIE_NAMES.SIDEBAR_STATE, state);
export const setUserPreferences = (preferences: any): void => CookieUtils.setJson(COOKIE_NAMES.USER_PREFERENCES, preferences);
export const setTheme = (theme: string): void => CookieUtils.set(COOKIE_NAMES.THEME, theme);
export const setLanguage = (language: string): void => CookieUtils.set(COOKIE_NAMES.LANGUAGE, language);

// Clear all auth cookies
export const clearAuthCookies = (): void => {
  CookieUtils.remove(COOKIE_NAMES.AUTH_TOKEN);
  CookieUtils.remove(COOKIE_NAMES.ID_TOKEN);
  CookieUtils.remove(COOKIE_NAMES.REFRESH_TOKEN);
  CookieUtils.remove(COOKIE_NAMES.PROFILE_DATA);
}; 