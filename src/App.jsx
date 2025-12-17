import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import { initGA, sendPageView } from './analytics';
import { initKakao } from './utils/kakaoInit';
import { AuthProvider } from './features/auth/AuthProvider.jsx';
import { useAuth } from './features/auth/hooks/useAuth.js';

function AppContent() {
  const { user, loading: isLoading } = useAuth();
  const location = useLocation();

  // ⭐ GA 초기화 + 첫 페이지뷰 전송 + 카카오 SDK 초기화
  useEffect(() => {
    initGA();  // GA4 초기화
    sendPageView(window.location.pathname); // 첫 화면 페이지뷰 측정
    
    // 카카오 SDK 초기화 (스크립트 로드 대기)
    const initKakaoSDK = () => {
      if (window.Kakao) {
        initKakao();
      } else {
        // 카카오 SDK 스크립트가 아직 로드되지 않은 경우, 약간의 지연 후 재시도
        setTimeout(initKakaoSDK, 100);
      }
    };
    initKakaoSDK();
  }, []);

  // ⭐ React Router 경로 변화 감지 → 페이지뷰 전송
  useEffect(() => {
    sendPageView(location.pathname);
  }, [location.pathname]);


  // 사용자 정보 로딩 중일 때
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  // 로딩 완료 후, 공통 레이아웃과 자식 페이지(Outlet) 렌더링
  return (
    <>
      {/* TODO: 공통 헤더 추가 */}
      {/* <Header user={user} /> */}

      <main>
        {/* 이 <Outlet /> 부분에
          HomePage, ReaderPage, QuizPage 등이 렌더링됩니다.
          context를 사용해 user 정보를 모든 하위 페이지에 전달할 수도 있습니다.
        */}
        <GlobalStyle />
        <Outlet context={{ user, isUserLoading: isLoading }} />
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;