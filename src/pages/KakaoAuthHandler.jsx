import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient, API_ENDPOINTS } from '../config/api.js'; 
import { useAuth } from '../hooks/useAuth.js'; // ⚠️ [추가] useAuth 훅 임포트

// 토큰 요청이 진행되는 동안 로딩 상태를 표시할 수 있는 간단한 컴포넌트
const LoadingPage = () => (
    <div style={{
        display: 'flex',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        color: '#FFFFFF',
        backgroundColor: '#070707'
    }}>
        카카오 로그인 처리 중...
    </div>
);

export default function KakaoAuthHandler() {
    const location = useLocation();
    const navigate = useNavigate();
    // ⚠️ [수정] useAuth 훅에서 login 함수를 가져옵니다.
    const { login } = useAuth(); 

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // 인가 코드가 있을 때만 백엔드에 토큰 교환 요청
        if (code) {
            const requestServiceToken = async () => {
                try {
                    // 1. 백엔드 API 호출: 인가 코드(code)를 백엔드에 전달
                    const response = await apiClient.post(API_ENDPOINTS.AUTH_KAKAO, { 
                        authorizationCode: code 
                    }); 
                    
                    // 2. 응답에서 토큰 꺼내기
                    const { accessToken } = response.data;
                    console.log('로그인 성공! 토큰 저장');
                    
                    // 3. 토큰을 브라우저(로컬 스토리지)에 저장
                    localStorage.setItem('accessToken', accessToken);
                    
                    // ⚠️ [수정] 4. 전역 상태의 login 함수를 호출하여 사용자 프로필을 로드합니다.
                    // 이 함수 내부에서 /api/profile/me 호출 및 AuthContext 상태 업데이트가 일어납니다.
                    await login(); 
                    
                    // 5. 온보딩 페이지로 이동
                    navigate('/onboarding');
                    
                } catch (error) {
                    console.error('로그인 처리 실패:', error);
                    alert('로그인에 실패했습니다. 다시 시도해주세요.');
                    
                    // 실패 시, localStorage에 남아있을 수 있는 토큰을 정리하고 로그인 페이지로 보냅니다.
                    // AuthProvider의 login 함수가 실패하면 이미 performLogout을 호출할 수 있지만, 
                    // 안전을 위해 여기서도 토큰을 지우는 로직을 추가할 수 있습니다.
                    localStorage.removeItem('accessToken'); 
                    navigate('/'); 
                }
            };
            
            requestServiceToken();
        } else if (error) {
            // ... (기존 에러 처리 로직 유지)
            console.error('카카오 로그인 에러:', error);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            navigate('/'); 
        } else {
            // ... (기존 잘못된 접근 로직 유지)
            console.warn('잘못된 접근입니다.');
            navigate('/');
        }
    }, [location.search, navigate, login]); // ⚠️ [수정] login을 의존성 배열에 추가


    return <LoadingPage />;
}