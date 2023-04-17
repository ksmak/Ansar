import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./main.scss"

import LoginPage from "../pages/LoginPage/LoginPage";
import MainPage from "../pages/MainPage/MainPage";

import { AuthProvider } from "../../hok/AuthProvider";
import { ProtectedRouter } from "../../hok/ProtectedRouter";

function App () {
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