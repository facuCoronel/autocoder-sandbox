import React, { useState, FormEvent } from 'react';
import { login } from './api';
import type { LoginCredentials, LoginResponse } from './types';

interface LoginFormProps {
  /**
   * Callback invoked when the login request succeeds.
   * Receives the response from the backend (access token and token type).
   */
  onLoginSuccess: (response: LoginResponse) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Simple client‑side validation: fields must not be empty.
    if (!email.trim() || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const credentials: LoginCredentials = { email: email.trim(), password };
    setLoading(true);
    try {
      const response = await login(credentials);
      onLoginSuccess(response);
    } catch {
      // Any error (401, network, etc.) is shown as a generic message.
      setError('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-describedby="login-error" noValidate>
      <div>
        <label htmlFor="email">Correo electrónico</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          required
        />
      </div>
      {error && (
        <div id="login-error" role="alert" aria-live="assertive" style={{ color: 'red' }}>
          {error}
        </div>
      )}
      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
};

export default LoginForm;
