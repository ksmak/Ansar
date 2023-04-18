import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./main.scss"

import LoginPage from "../pages/LoginPage/LoginPage";
import MainPage from "../pages/MainPage/MainPage";

import { ProtectedRouter } from "../../hok/ProtectedRouter";

function App () {
  return (
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
  );
};

export default App;