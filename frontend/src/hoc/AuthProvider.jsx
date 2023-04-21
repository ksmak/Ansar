import React from 'react';
import { createContext  } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const handleLogin = async (data, cb) => {
      sessionStorage.setItem('access', data.access);
      sessionStorage.setItem('refresh', data.refresh);
      sessionStorage.setItem('id', data.id);
      sessionStorage.setItem('full_name', data.full_name);
      cb();
    };
  
    const handleLogout = (cb) => {
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('refresh');
      sessionStorage.removeItem('id');
      sessionStorage.removeItem('full_name');
      cb();
    };

    const handleRefreshToken = (token) => {
      sessionStorage.setItem('access');
    }
  
    const value = {
      accessToken: sessionStorage.getItem('access'),
      refreshToken: sessionStorage.getItem('refresh'),
      userId: sessionStorage.getItem('id'),
      userFullname: sessionStorage.getItem('full_name'),
      onLogin: handleLogin,
      onLogout: handleLogout,
      onRefresh: handleRefreshToken
    };
  
    return (
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    );
};