import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient, API_ENDPOINTS } from '../config/api.js'; // TODO: 주석 해제 필요

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

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // 인가 코드가 있을 때만 백엔드에 토큰 교환 요청
        if (code) {
            const requestServiceToken = async () => {
                try {
                    // 1. 백엔드 API 호출: 인가 코드(code)를 백엔드에 전달
                    // 백엔드는 이 code로 카카오와 통신하여 유저 인증 후, 서비스 토큰을 발급합니다.
                    const response = await apiClient.post(API_ENDPOINTS.AUTH_KAKAO, { 
                        authorizationCode: code 
                    }); 
                    
                    // 2. 응답에서 토큰 꺼내기
                    const { accessToken } = response.data;
                    console.log('로그인 성공!');
                    
                    // 3. 토큰을 브라우저(로컬 스토리지)에 저장
                    // 백엔드 요구사항: localStorage 키는 'accessToken' 사용
                    localStorage.setItem('accessToken', accessToken);
                    
                    // 4. 온보딩 페이지로 이동
                    navigate('/onboarding');
                    
                } catch (error) {
                    console.error('로그인 실패:', error);
                    alert('로그인에 실패했습니다. 다시 시도해주세요.');
                    navigate('/'); 
                }
            };
            
            requestServiceToken();
        } else if (error) {
            // 사용자가 동의 화면에서 취소했거나 다른 에러 발생
            console.error('카카오 로그인 에러:', error);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            navigate('/'); // 로그인 페이지로 리다이렉트
        } else {
            console.warn('잘못된 접근입니다.');
            navigate('/');
        }
    }, [location.search, navigate]);


    return <LoadingPage />;
}