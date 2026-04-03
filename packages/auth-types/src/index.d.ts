export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  sessionId: string;
  userId: string;
  email: string;
  issuedAt: string;
  expiresAt: string;
}

export interface AuthContext {
  user: User;
  isAuthenticated: boolean;
}
