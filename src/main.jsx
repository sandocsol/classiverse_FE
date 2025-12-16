import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from 'react-router-dom';

// 1. App.jsx (공통 레이아웃 + Outlet) 임포트
import App from './App.jsx';
import AppShell from './styles/AppShell.jsx';
import BookDetailPage from './pages/BookDetailPage.jsx';
import StoryViewerPage from './pages/StoryViewerPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import OnboardingPage from './pages/OnboardingPage.jsx';
import SearchPage from './pages/SearchPage.jsx';

// 2. 고정할 책의 ID를 상수로 정의합니다. (나중에 바꾸기 쉽도록)
const DEFAULT_BOOK_ID = 1;

// 3. 라우터 객체 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      
      // 0. 로그인 페이지
      {
        path: '/login',
        element: <LoginPage />
      },
      
      // 0-1. 온보딩 페이지
      {
        path: '/onboarding',
        element: <OnboardingPage />
      },
      
      // 0-2. 탐색 페이지
      {
        path: '/search',
        element: <SearchPage />
      },
      
      // 1. 루트 '/' 경로로 접속하면, 로그인 페이지로 바로 리디렉션합니다.
      {
        index: true,
        element: <Navigate replace to="/login" />
      },
      
      // 2. '/books' (원래 목록 페이지) 경로로 접속해도, 고정된 책 상세 페이지로 리디렉션합니다.
      {
        path: '/books',
        element: <Navigate replace to={`/books/${DEFAULT_BOOK_ID}`} />
      },

      // 3. 책 상세 페이지 경로는 그대로 둡니다.
      // (이 경로가 리디렉션의 '목적지'가 됩니다)
      {
        path: '/books/:bookId',
        element: <BookDetailPage />
      },

      // 4. 스토리 뷰어 페이지 경로 (contentId 포함)
      {
        path: '/story/:storyId/:characterId/:contentId',
        element: <StoryViewerPage />
      },
      // 4-1. contentId가 없을 때는 시작 씬(contentId=1)으로 리다이렉트 (StoryViewerPage에서 처리)
      {
        path: '/story/:storyId/:characterId',
        element: <StoryViewerPage />
      },
      // 5. 카카오 리다이렉트 페이지 경로
      {
        path: '/auth/kakao/callback',
        element: <KakaoAuthHandler />
      },
    ],
  },
]);

// 5. RouterProvider로 앱 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
  <AppShell>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </AppShell>
);