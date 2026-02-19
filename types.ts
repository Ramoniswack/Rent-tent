export interface User {
  _id: string;
  name: string;
  email: string;
  username?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  age?: string;
  gender?: string;
  dateOfBirth?: string;
  languages?: string[];
  interests?: string[];
  travelStyle?: string;
  verified?: boolean;
  isAdmin?: boolean;
  coordinates?: {
    lat: number;
    lng: number;
  };
  preferences?: {
    language?: string;
    currency?: string;
    emailNotifications?: boolean;
    publicProfile?: boolean;
    shareLocation?: boolean;
  };
  matchPreferences?: {
    ageRange: [number, number];
    travelStyles: string[];
    interests: string[];
    locationRange: number;
    genders: string[];
  };
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

export enum AuthStatus {
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated'
}
