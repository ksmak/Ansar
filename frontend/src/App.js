import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from './components/pages/LoginPage';
import MainPage from "./components/pages/MainPage";
import { AuthProvider, ProtectedRouter } from "./components/hooks/auth";

function App() {
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
