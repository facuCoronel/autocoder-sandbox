import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import LoginForm from './LoginForm';
import * as api from './api';

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnSuccess.mockReset();
  });

  test('renders email and password fields and submit button', () => {
    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
  });

  test('client‑side validation prevents submit when fields are empty', async () => {
    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    const button = screen.getByRole('button', { name: /iniciar sesión/i });
    fireEvent.click(button);
    expect(await screen.findByText(/por favor, completa todos los campos/i)).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('successful login calls onLoginSuccess and resets loading', async () => {
    const mockResponse = { access_token: 'abc', token_type: 'bearer' };
    vi.spyOn(api, 'login').mockResolvedValue(mockResponse as any);

    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    // Button should show loading state
    expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled();

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse));
    // After success loading should be false again
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).not.toBeDisabled();
  });

  test('failed login shows generic error and allows retry', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Authentication failed'));

    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

    expect(screen.getByRole('button', { name: /iniciando sesión/i })).toBeDisabled();
    await waitFor(() => expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument());
    // Button should be enabled again for retry
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).not.toBeDisabled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});
