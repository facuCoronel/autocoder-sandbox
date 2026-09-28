import React, { useState } from 'react';
import LoginForm from './auth/LoginForm';
import type { LoginResponse } from './auth/types';

/**
 * Root application component.
 * Renders the login form and, upon successful authentication, shows a simple
 * confirmation message. No token is stored or displayed.
 */
const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState(false);

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const handleLoginSuccess = (_response: LoginResponse) => {
    // The token is intentionally not stored or displayed.
    setAuthenticated(true);
    // In a real app you would forward the token to a context/provider.
    // This component only confirms that the HTTP request succeeded.
    console.debug('Login successful');
  };

  return (
    <main className="app-container">
      {authenticated ? (
        <section className="login-success" aria-live="polite">
          <h2>Sesión iniciada</h2>
          <p>¡Bienvenido! La autenticación se completó correctamente.</p>
        </section>
      ) : (
        <section className="login-section">
          <h2>Iniciar sesión</h2>
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </section>
      )}
    </main>
  );
};

export default App;
