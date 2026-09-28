import { LoginCredentials, LoginResponse } from './types';

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  // Resolve base URL from environment, strip trailing slashes, default to localhost.
  const rawBase = (import.meta.env?.VITE_API_BASE_URL ?? '') as string;
  const trimmed = rawBase.replace(/\/+$/,''); // remove trailing slashes
  const baseUrl = trimmed || 'http://127.0.0.1:8000';

  const response = await fetch(`${baseUrl}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    // Generic error without leaking credential details.
    throw new Error('Authentication failed');
  }

  const data = (await response.json()) as LoginResponse;
  return data;
}
