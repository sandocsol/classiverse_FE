import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';

// 1. App.jsx (공통 레이아웃 + Outlet) 임포트
import App from './App.jsx';

// 3. 라우터 객체 정의
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App.jsx가 모든 페이지의 부모(레이아웃)가 됨
    // 4. App.jsx의 <Outlet>에 렌더링될 자식 페이지들
    children: [
      { index: true, element: <BookInfoPage /> }, // path: '/'의 기본 페이지
      { path: '/story/:storyId', element: <StoryViewerPage /> },
      
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