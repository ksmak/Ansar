import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./main.scss"

import LoginPage from './components/pages/LoginPage/LoginPage'
import MainPage from "./components/pages/MainPage/MainPage";

import { ProtectedRouter } from "./hoc/ProtectedRouter";
import { AuthProvider } from "./hoc/AuthProvider";
import { useEffect } from "react";

import axios from 'axios';


function App () {
  const checkRefreshToken = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_HOST}/api/token/refresh/`, 
        {
            refresh: sessionStorage.getItem('refresh')
        },
        { 
            headers: {'Content-Type': 'application/json'}
        }, 
        { 
            withCredentials: true 
        });
      
      if (response.status === 200) {
        console.log('Authorization success!');
        sessionStorage.setItem('access', response.data.access);
      } else {
        console.log('No authorization.');
        sessionStorage.clear();
      }
    } catch(error) {
      console.log(error);
      sessionStorage.clear();
    }

  };
 
  useEffect(() => {
    checkRefreshToken();
    // eslint-disable-next-line
  }, []);

  return (
    <AuthProvider>
      <BrowserRouter>
      <Routes>
        <Route path='/' element={
          <ProtectedRouter>
            <MainPage />
          </ProtectedRouter>
        } />
        <Route path='/login' element={<LoginPage />} />
      </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
