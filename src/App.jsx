import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import GlobalStyle from './styles/GlobalStyle';
import { initGA, sendPageView } from './analytics';
// import { userApi } from './api/userApi'; // TODO: 실제 사용자 API 연동 시 주석 해제

function App() {
  // 사용자 정보 상태 관리
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();

  // ⭐ GA 초기화 + 첫 페이지뷰 전송
  useEffect(() => {
    initGA();  // GA4 초기화
    sendPageView(window.location.pathname); // 첫 화면 페이지뷰 측정
  }, []);

  // ⭐ React Router 경로 변화 감지 → 페이지뷰 전송
  useEffect(() => {
    sendPageView(location.pathname);
  }, [location.pathname]);

  // 앱 진입 시 사용자 정보 로드
  useEffect(() => {
    // TODO: 실제 사용자 정보 API 호출로 교체
    // const fetchUser = async () => {
    //   try {
    //     const userData = await userApi.getCurrentUser();
    //     setUser(userData);
    //   } catch (error) {
    //     console.error('Failed to fetch user:', error);
    //     // 에러 발생 시에도 로딩은 완료 처리 (비로그인 사용자도 접근 가능하도록)
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchUser();
  }, []);

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

export default App;