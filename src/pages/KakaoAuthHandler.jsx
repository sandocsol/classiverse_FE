import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiClient, API_ENDPOINTS } from '../config/api.js'; 
import { useAuth } from '../features/auth/hooks/useAuth.js';

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
    const { login } = useAuth(); 
    
    // ✅ [추가] 중복 호출 방지용 ref (카카오 인가 코드는 1회용!)
    const isRequestSent = useRef(false);

    useEffect(() => {
        // ✅ 이미 요청을 보냈으면 아무것도 하지 않음 (중복 호출 방지)
        if (isRequestSent.current) {
            return;
        }

        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        const error = searchParams.get('error');

        // 인가 코드가 있을 때만 백엔드에 토큰 교환 요청
        if (code) {
            isRequestSent.current = true; // ✅ 요청 시작 플래그 설정
            
            const requestServiceToken = async () => {
                try {
                    // 1. 백엔드 API 호출: 인가 코드(code)를 백엔드에 전달
                    const response = await apiClient.post(API_ENDPOINTS.AUTH_KAKAO, { 
                        authorizationCode: code 
                    }); 
                    
                    // 2. 응답에서 토큰 꺼내기 (accessToken + refreshToken 둘 다!)
                    const { accessToken, refreshToken } = response.data;
                    console.log('로그인 성공! 토큰 저장');
                    
                    // 3. 토큰을 브라우저(로컬 스토리지)에 저장
                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', refreshToken); // ✅ refreshToken도 저장!
                    
                    // 4. 전역 상태의 login 함수를 호출하여 사용자 프로필을 로드
                    await login(); 
                    
                    // 5. 온보딩 페이지로 이동
                    navigate('/onboarding');
                    
                } catch (err) {
                    // ✅ 상세한 에러 정보 로깅 (백엔드 디버깅용)
                    console.error('=== 로그인 처리 실패 ===');
                    
                    if (err.response) {
                        // 백엔드에서 응답이 온 경우 (500, 400 등)
                        console.error('🔴 HTTP 상태 코드:', err.response.status);
                        console.error('🔴 에러 응답 데이터 (전체):', JSON.stringify(err.response.data, null, 2));
                        console.error('🔴 에러 응답 데이터 (원본):', err.response.data);
                        
                        // 백엔드가 보낸 에러 메시지 추출 시도
                        const backendError = err.response.data;
                        if (backendError) {
                            console.error('🔴 백엔드 에러 메시지:', backendError.message || backendError.error || backendError);
                            if (backendError.timestamp) {
                                console.error('🔴 에러 발생 시간:', backendError.timestamp);
                            }
                            if (backendError.path) {
                                console.error('🔴 에러 발생 경로:', backendError.path);
                            }
                        }
                        console.error('🔴 에러 응답 헤더:', err.response.headers);
                    } else if (err.request) {
                        // 요청은 보냈지만 응답을 받지 못한 경우 (네트워크 에러 등)
                        console.error('🔴 요청은 전송됨, 응답 없음:', err.request);
                        console.error('🔴 네트워크 에러일 가능성이 높습니다.');
                    } else {
                        // 요청 설정 중 에러
                        console.error('🔴 요청 설정 에러:', err.message);
                    }
                    
                    console.error('📤 요청 URL:', API_ENDPOINTS.AUTH_KAKAO);
                    console.error('📤 요청 데이터:', { authorizationCode: code });
                    console.error('========================');
                    
                    // 사용자에게는 간단한 메시지만 표시
                    const errorMessage = err.response?.data?.message || 
                                        err.response?.data?.error ||
                                        err.message || 
                                        '로그인에 실패했습니다. 다시 시도해주세요.';
                    alert(`로그인 실패: ${errorMessage}`);
                    
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    navigate('/'); 
                }
            };
            
            requestServiceToken();
        } else if (error) {
            console.error('카카오 로그인 에러:', error);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            navigate('/'); 
        } else {
            console.warn('잘못된 접근입니다.');
            navigate('/');
        }
    }, [location.search, navigate, login]);


    return <LoadingPage />;
}