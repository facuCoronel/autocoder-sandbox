import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, beforeEach, test, expect, vi } from 'vitest';
import LoginForm from './LoginForm';
import * as api from './api';
import '@testing-library/jest-dom/vitest';
import type { LoginResponse } from './types';

describe('LoginForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.restoreAllMocks();
    mockOnSuccess.mockReset();
  });

  test('renders email and password fields and submit button', () => {
    const { getByLabelText, getAllByRole } = render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    expect(getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(getAllByRole('button', { name: /iniciar sesión/i })[0]).toBeInTheDocument();
  });

  test('client‑side validation prevents submit when fields are empty', async () => {
    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    const button = screen.getAllByRole('button', { name: /iniciar sesión/i })[0];
    fireEvent.click(button);
    expect(await screen.findByText(/por favor, completa todos los campos/i)).toBeInTheDocument();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });

  test('successful login calls onLoginSuccess and resets loading', async () => {
    const mockResponse = { access_token: 'abc', token_type: 'bearer' };
    vi.spyOn(api, 'login').mockResolvedValue(mockResponse as LoginResponse);

    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'user@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'secret' } });
    fireEvent.click(screen.getAllByRole('button', { name: /iniciar sesión/i })[0]);

    // Button should show loading state
    expect(screen.getAllByRole('button', { name: /iniciando sesión/i })[0]).toBeDisabled();

    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledWith(mockResponse));
    // After success loading should be false again
    expect(screen.getAllByRole('button', { name: /iniciar sesión/i })[0]).not.toBeDisabled();
  });

  test('failed login shows generic error and allows retry', async () => {
    vi.spyOn(api, 'login').mockRejectedValue(new Error('Authentication failed'));

    render(<LoginForm onLoginSuccess={mockOnSuccess} />);
    fireEvent.change(screen.getByLabelText(/correo electrónico/i), { target: { value: 'bad@example.com' } });
    fireEvent.change(screen.getByLabelText(/contraseña/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getAllByRole('button', { name: /iniciar sesión/i })[0]);

    expect(screen.getAllByRole('button', { name: /iniciando sesión/i })[0]).toBeDisabled();
    await waitFor(() => expect(screen.getByText(/error al iniciar sesión/i)).toBeInTheDocument());
    // Button should be enabled again for retry
    expect(screen.getAllByRole('button', { name: /iniciar sesión/i })[0]).not.toBeDisabled();
    expect(mockOnSuccess).not.toHaveBeenCalled();
  });
});