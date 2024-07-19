import React from 'react';
import { createContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const handleLogin = (data, cb) => {
    sessionStorage.setItem('access', data.access);

    sessionStorage.setItem('refresh', data.refresh);

    sessionStorage.setItem('user_id', data.id);

    sessionStorage.setItem('user_fullname', data.full_name);

    localStorage.setItem('username', data.username);

    cb();
  };

  const handleLogout = (cb) => {
    sessionStorage.clear();

    cb();
  };

  const handleRefreshToken = (token) => {
    sessionStorage.setItem('access', token);
  }

  const value = {
    onLogin: handleLogin,
    onLogout: handleLogout,
    onRefresh: handleRefreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}