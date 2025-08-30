// Authentication Types for Phase 1
// Based on Phase 1 Architecture Document

import { SDRStatus, SDRPriority, CustomerType, SourceType, UserInfo } from './sdr.types';

// MSAL Configuration Types
export interface MSALConfig {
  auth: {
    clientId: string;
    authority: string;
    redirectUri: string;
    postLogoutRedirectUri: string;
    navigateToLoginRequestUrl: boolean;
  };
  cache: {
    cacheLocation: 'localStorage' | 'sessionStorage';
    storeAuthStateInCookie: boolean;
  };
  system: {
    loggerOptions: {
      loggerCallback: (level: MSALLogLevel, message: string, containsPii: boolean) => void;
      piiLoggingEnabled: boolean;
      logLevel: MSALLogLevel;
    };
  };
}

export enum MSALLogLevel {
  Error = 0,
  Warning = 1,
  Info = 2,
  Verbose = 3
}

// Azure AD User Information
export interface AzureADUser {
  oid: string;                    // Object ID
  preferred_username: string;     // Email address
  name: string;                   // Display name
  given_name?: string;
  family_name?: string;
  roles: string[];
  groups: string[];
  aud: string;                    // Audience
  iss: string;                    // Issuer
  iat: number;                    // Issued At
  exp: number;                    // Expires At
}

// Authentication Context
export interface AuthContext {
  user: UserInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  acquireToken: (scopes: string[]) => Promise<string>;
  error: string | null;
}

// Authorization Context
export interface AuthorizationResult {
  allowed: boolean;
  reason?: string;
}

// Security Context for Runtime Authorization
export interface SecurityContext {
  user: UserInfo;
  operation: string;
  resourceId?: string;

  isAuthenticated(): boolean;
  isOwner(resourceId: string): boolean;
  validate(): AuthorizationResult;
}

// Permissions and Roles
export interface Permission {
  resource: string;
  action: string;
  scope?: string;
}

export interface RoleDefinition {
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole?: boolean;
}

// OAuth 2.0 / OpenID Connect Types
export interface OAuthFlow {
  authorizationCodeUrl: string;
  tokenEndpoint: string;
  userInfoEndpoint: string;
  jwksEndpoint: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface TokenCacheEntry {
  key: string;
  value: string;
  expires?: number;
}

// Key Vault Integration Types
export interface KeyVaultConfig {
  vaultUrl: string;
  credential: {
    type: 'environment' | 'managedIdentity' | 'clientSecret';
    clientId?: string;
    clientSecret?: string;
    tenantId?: string;
  };
}

export interface SecretDescriptor {
  name: string;
  value?: string;
  expiresOn?: Date;
  tags?: Record<string, string>;
}

// JWT Token Validation Types
export interface JWTValidationConfig {
  issuer: string;
  audience: string;
  algorithms: string[];
  ignoreExpiration?: boolean;
  clockTolerance?: number;
}

// Authentication Error Types
export interface AuthenticationError {
  code: 'INVALID_TOKEN' | 'EXPIRED_TOKEN' | 'MISSING_TOKEN' | 'INVALID_SIGNATURE';
  message: string;
  details?: any;
}

export interface AuthorizationError {
  code: 'INSUFFICIENT_PERMISSIONS' | 'OWNER_MISMATCH' | 'RESOURCE_NOT_FOUND';
  message: string;
  details?: any;
}