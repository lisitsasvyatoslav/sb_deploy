// Authentication types

// Add auth-specific types here as needed
// Currently most auth logic uses simple username/password strings
// and tokens stored in authStore

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthUser {
  email: string;
  id?: string;
}
