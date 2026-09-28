import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { describe, beforeEach, afterEach, test, expect, vi } from 'vitest';
import App from './App';

/**
 * Integration tests for the full login flow, exercising the HTTP boundary.
 * The global fetch is stubbed to capture the request and provide controlled
 * responses (200 and 401) without performing real network calls.
 */

describe('App integration – login flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('successful login triggers POST request and shows authenticated UI', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ access_token: 'abc123', token_type: 'bearer' }),
    } as Response);

    render(<App />);

    // Fill form fields
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secret' } });

    // Submit form
    fireEvent.click(screen.getAllByRole('button', { name: /iniciar sesión/i })[0]);

    // Verify fetch called with correct arguments
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('http://127.0.0.1:8000/auth/login');
    expect(init?.method).toBe('POST');
    expect(init?.headers).toEqual({ 'Content-Type': 'application/json' });
    expect(init?.body).toBe(JSON.stringify({ email: 'user@example.com', password: 'secret' }));

    // Wait for UI to reflect authenticated state
    await waitFor(() => expect(screen.getByText(/sesión iniciada/i)).toBeInTheDocument());
    expect(screen.getByText(/¡bienvenido! la autenticación se completó correctamente\./i)).toBeInTheDocument();
  });

  test('failed login (401) keeps form and displays generic error', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({}),
    } as Response);

    render(<App />);

    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getAllByRole('button', { name: /iniciar sesión/i })[0]);

    // Verify fetch called
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Expect generic error message
    await waitFor(() => expect(screen.getByText(/error al iniciar sesión\. por favor, inténtalo de nuevo\./i)).toBeInTheDocument());

    // Form should still be present (email input exists)
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    // Authenticated UI should not be rendered
    expect(screen.queryByText(/sesión iniciada/i)).not.toBeInTheDocument();
  });
});

