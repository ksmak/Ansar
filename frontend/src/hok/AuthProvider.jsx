import React from 'react';
import { createContext } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
  
    const handleLogin = async (access_token, refresh_token, cb) => {
      localStorage.setItem('access', access_token);
      localStorage.setItem('refresh', refresh_token);
      cb();
    };
  
    const handleLogout = (cb) => {
      localStorage.removeItem('access');
      localStorage.removeItem('refresh');
      cb();
    };
  
    const value = {
      access_token: localStorage.getItem('access'),
      refresh_token: localStorage.getItem('refresh'),
      onLogin: handleLogin,
      onLogout: handleLogout,
    };
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
};