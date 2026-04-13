import { BrowserRouter, Routes, Route } from 'react-router';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import VerifyPage from './pages/VerifyPage';
import LoginPage from './pages/LoginPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ChatPage from './pages/ChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import CreatePostPage from './pages/CreatePostPage';
import PostDetailPage from './pages/PostDetailPage';
import MyPage from './pages/MyPage';
import ActivityTimelinePage from './pages/ActivityTimelinePage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/chat/:roomId" element={<ProtectedRoute><ChatRoomPage /></ProtectedRoute>} />
        <Route path="/create" element={<ProtectedRoute><CreatePostPage /></ProtectedRoute>} />
        <Route path="/post/:id" element={<PostDetailPage />} />
        <Route path="/mypage" element={<ProtectedRoute><MyPage /></ProtectedRoute>} />
        <Route path="/my/activities" element={<ProtectedRoute><ActivityTimelinePage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
