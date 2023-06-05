import React, { useState } from 'react';
import { createContext  } from 'react';

export const AuthContext = createContext(null);


export const AuthProvider = ({children}) => {
    const [userId, setUserId] = useState(null)
    const [userFullname, setUserFullname] = useState(null);

    const handleLogin = async (data, cb) => {
      sessionStorage.setItem('access', data.access);
      sessionStorage.setItem('refresh', data.refresh);
      setUserId(data.id);
      setUserFullname(data.full_name);
      cb();
    };
  
    const handleLogout = (cb) => {
      sessionStorage.removeItem('access');
      sessionStorage.removeItem('refresh');
      setUserId(null);
      setUserFullname(null);
      cb();
    };

    const handleRefreshToken = (token) => {
      sessionStorage.setItem('access');
    }
  
    const value = {
      accessToken: sessionStorage.getItem('access'),
      refreshToken: sessionStorage.getItem('refresh'),
      userId: userId,
      userFullname: userFullname,
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