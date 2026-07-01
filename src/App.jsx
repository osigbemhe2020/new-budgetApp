// App.jsx
import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import MainPage from './component/MainPage.jsx';
import SignUp from './component/SignUp.jsx';
import Login from './component/Login.jsx';
import { setUnauthorizedHandler } from './hooks/apiClient.js';

const queryClient = new QueryClient();

const App = () => {
  const [view, setView] = useState(() => {
    return localStorage.getItem('token') ? 'main' : 'login';
  });

  // Register the global 401 handler once. Any apiFetch call anywhere in the
  // app that gets a 401 funnels here — this is what actually fixes the
  // "stuck on MainPage with a dead token" problem, since nothing inside
  // MainPage's own render path was ever wired to flip `view` back.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      queryClient.clear(); // drop any cached protected data sitting in memory
      setView('login');
    });
  }, []);

  console.log('Current view:', view);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        {view === 'login' && (
          <Login 
            onLoginSuccess={() => setView('main')} 
            onNavigateToSignUp={() => setView('signup')} 
          />
        )}
        {view === 'signup' && (
          <SignUp 
            onSignUpSuccess={() => setView('login')} 
            onNavigateToLogin={() => setView('login')} 
          />
        )}
        {view === 'main' && (
          <MainPage onLogout={() => setView('login')} />
        )}
      </div>
    </QueryClientProvider>
  );
};

export default App;