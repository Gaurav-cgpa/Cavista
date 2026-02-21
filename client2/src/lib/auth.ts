export const API_BASE = "http://localhost:3001";
const AUTH_TOKEN_KEY = "healthai_token";
const AUTH_USER_KEY = "healthai_user";

export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getUser(): User | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function setUser(user: User): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}
