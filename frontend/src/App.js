import { BrowserRouter, Route, Routes } from "react-router-dom";
import LoginPage from './components/pages/LoginPage';
import MainPage from "./components/pages/MainPage";
import { ProtectedRouter } from "./hoc/ProtectedRouter";
import { AuthProvider } from "./hoc/AuthProvider";

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
