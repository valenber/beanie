import { useEffect, useState } from 'react';
import type { AuthContext } from '@beannie/auth-types';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function App() {
  const [apiStatus, setApiStatus] = useState<string>('loading...');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [authContext, setAuthContext] = useState<AuthContext | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data: { status: string }) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });

        if (!isMounted) {
          return;
        }

        if (!response.ok) {
          setAuthContext(null);
          setAuthStatus('unauthenticated');
          return;
        }

        const data = (await response.json()) as AuthContext;
        setAuthContext(data);
        setAuthStatus('authenticated');
      } catch {
        if (!isMounted) {
          return;
        }

        setAuthContext(null);
        setAuthStatus('unauthenticated');
        setAuthError('Unable to check authentication status.');
      }
    };

    loadAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogin = async () => {
    setAuthError(null);

    const response = await fetch('/api/auth/login');
    if (!response.ok) {
      setAuthError('Unable to start sign-in.');
      return;
    }

    const data = (await response.json()) as { authorizationUrl: string };
    window.location.assign(data.authorizationUrl);
  };

  const handleLogout = async () => {
    setAuthError(null);

    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      setAuthError('Unable to sign out.');
      return;
    }

    setAuthContext(null);
    setAuthStatus('unauthenticated');
  };

  return (
    <main>
      <h1>Beannie</h1>
      <section>
        <h2>API</h2>
        <p>
          API status: <strong>{apiStatus}</strong>
        </p>
      </section>
      <section>
        <h2>Auth</h2>
        {authStatus === 'loading' && <p>Checking session...</p>}
        {authStatus === 'authenticated' && authContext && (
          <div>
            <p>
              Signed in as <strong>{authContext.user.email}</strong>
            </p>
            <p>
              Name: <strong>{authContext.user.name}</strong>
            </p>
            <button type="button" onClick={handleLogout}>
              Sign out
            </button>
          </div>
        )}
        {authStatus === 'unauthenticated' && (
          <div>
            <p>Not signed in.</p>
            <button type="button" onClick={handleLogin}>
              Sign in
            </button>
          </div>
        )}
        {authError && (
          <p role="alert">
            <strong>{authError}</strong>
          </p>
        )}
      </section>
    </main>
  );
}

export default App;
