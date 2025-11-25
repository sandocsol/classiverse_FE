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

// 2. 고정할 책의 ID를 상수로 정의합니다. (나중에 바꾸기 쉽도록)
const DEFAULT_BOOK_ID = "pride-and-prejudice";

// 3. 라우터 객체 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, 
    children: [
      
      // 1. 루트 '/' 경로로 접속하면, 고정된 책 상세 페이지로 바로 리디렉션합니다.
      {
        index: true,
        element: <Navigate replace to={`/books/${DEFAULT_BOOK_ID}`} />
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

      // 4. 스토리 뷰어 페이지 경로 (씬 ID 포함)
      {
        path: '/story/:storyId/:characterId/:sceneId',
        element: <StoryViewerPage />
      },
      // 4-1. 씬 ID가 없을 때는 시작 씬으로 리다이렉트 (StoryViewerPage에서 처리)
      {
        path: '/story/:storyId/:characterId',
        element: <StoryViewerPage />
      },
    ],
  },
]);

// 5. RouterProvider로 앱 렌더링
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppShell>
      <RouterProvider router={router} />
    </AppShell>
  </React.StrictMode>
);