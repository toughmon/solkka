import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
