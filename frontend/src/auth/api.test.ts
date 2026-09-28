import { expect, test, vi } from 'vitest';
import { login } from './api';
import type { LoginCredentials, LoginResponse } from './types';

// Helper to mock fetch response
function mockFetch(response: Partial<Response> & { json?: () => Promise<unknown> }) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({}),
    ...response,
  } as Response);
}

test('login sends correct POST request and returns response data', async () => {
  const credentials: LoginCredentials = { email: 'user@example.com', password: 'secret' };
  const mockResponse: LoginResponse = { access_token: 'abc123', token_type: 'bearer' };

  mockFetch({ ok: true, json: async () => mockResponse });

  const result = await login(credentials);

  // Verify fetch called with correct args
  expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  const [url, init] = (globalThis.fetch as any).mock.calls[0];
  expect(url).toBe('http://127.0.0.1:8000/auth/login');
  expect(init?.method).toBe('POST');
  expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(init?.body).toBe(JSON.stringify(credentials));

  // Verify returned data matches mock
  expect(result).toEqual(mockResponse);
});

test('login throws generic error on non‑OK response', async () => {
  const credentials: LoginCredentials = { email: 'bad@example.com', password: 'wrong' };
  mockFetch({ ok: false, status: 401 });

  await expect(login(credentials)).rejects.toThrow('Authentication failed');
});
