import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom'; // 리다이렉트를 위해 useNavigate 사용
import { AuthContext } from './AuthContext.js';
import { getUserProfile, logoutApi } from '../api/authApi.js'; // 새로 만든 API 함수

/**
 * 인증 상태와 사용자 정보를 제공하는 Provider 컴포넌트
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); // React Router 네비게이션 훅

    // ----------------------------------------------------
    // 1. 공통 로그아웃 처리 (클라이언트 상태 초기화 및 리다이렉트)
    // ----------------------------------------------------
    const performLogout = useCallback(() => {
        // 1. 클라이언트 토큰 삭제 (api.js 인터셉터에서 401 시 이미 제거하지만, 명시적으로 다시 호출)
        localStorage.removeItem('accessToken'); 
        
        // 2. 전역 상태 초기화
        setUser(null);
        setError(null);
        setLoading(false); // 로딩 종료
        
        // 3. 로그인 페이지로 리다이렉트
        navigate('/'); 
    }, [navigate]);

    // ----------------------------------------------------
    // 2. 전역 401 에러 감지 (모든 API 호출에서 발생하는 401 처리)
    // ----------------------------------------------------
    useEffect(() => {
        const handleTokenExpired = () => {
            console.log('전역 401 에러 감지: 자동 로그아웃 처리');
            performLogout();
        };

        // api.js 인터셉터에서 발생시키는 이벤트 구독
        window.addEventListener('auth:token-expired', handleTokenExpired);

        return () => {
            window.removeEventListener('auth:token-expired', handleTokenExpired);
        };
    }, [performLogout]);

    // ----------------------------------------------------
    // 3. 초기 로드 시 사용자 프로필 조회 (자동 로그인)
    // ----------------------------------------------------
    useEffect(() => {
        let cancelled = false;

        async function loadUser() {
            // 토큰이 없으면 로딩 종료 후 사용자 없음 상태로 설정
            if (!localStorage.getItem('accessToken')) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // 토큰이 있다면 /api/profile/me를 호출하여 사용자 정보 로드
                const userData = await getUserProfile();
                
                if (!cancelled) {
                    setUser(userData);
                }
            } catch (err) {
                if (!cancelled) {
                    const status = err.response?.status;
                    
                    // 401 에러(액세스/리프레시 토큰 만료) 발생 시 강제 로그아웃
                    // api.js 인터셉터에서 토큰 재발급을 시도했지만 실패한 경우
                    // (전역 이벤트도 발생하지만, 여기서도 명시적으로 처리)
                    if (status === 401) {
                        console.log('초기 로드 시 토큰 만료로 인해 자동 로그아웃 처리');
                        performLogout(); 
                    } else {
                        // 기타 에러 처리
                        setError(err);
                        console.error('사용자 프로필 초기 로드 실패:', err);
                    }
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        loadUser();

        return () => {
            cancelled = true;
        };
    }, [performLogout]);

    // ----------------------------------------------------
    // 4. 로그인 (카카오 인증 후 토큰을 받은 상태에서 호출됨)
    // ----------------------------------------------------
    /**
     * 카카오 인증 후 토큰이 localStorage에 저장된 상태에서 호출되어 
     * 사용자 프로필을 로드하고 전역 상태를 업데이트합니다.
     */
    const login = useCallback(async () => {
        setError(null);
        setLoading(true);
        
        try {
            // 토큰은 이미 KakaoAuthHandler에서 저장했으므로, 바로 프로필 정보를 가져옴
            const userData = await getUserProfile(); 
            
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err);
            // 401 에러(토큰 유효하지 않음) 또는 기타 에러 발생 시 로그아웃 처리
            // api.js 인터셉터에서 토큰 재발급을 시도했지만 실패한 경우
            const status = err.response?.status;
            if (status === 401) {
                console.log('로그인 시 토큰 만료로 인해 자동 로그아웃 처리');
            }
            performLogout();
            throw err;
        } finally {
             setLoading(false);
        }
    }, [performLogout]);

    // ----------------------------------------------------
    // 5. 로그아웃 
    // ----------------------------------------------------
    const logout = useCallback(async () => {
        try {
            // 서버에 로그아웃 요청 (토큰 무효화)
            await logoutApi();
        } catch (err) {
            // 서버 로그아웃 실패해도 클라이언트 상태는 정리해야 함
            console.error('Logout API error:', err);
        } finally {
            // 클라이언트 상태 정리 및 리다이렉트
            performLogout();
        }
    }, [performLogout]);
    
    // ----------------------------------------------------
    // 6. 기타 유틸리티 함수 (reloadUser, updateUser 등)
    // ----------------------------------------------------
    
    const reloadUser = useCallback(async () => {
        try {
            setLoading(true);
            const userData = await getUserProfile();
            setUser(userData);
            return userData;
        } catch (err) {
            console.error('사용자 프로필 재로드 실패:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);
    
    // ... (updateUser 등 기타 필요한 함수는 이전 프로젝트 코드 참고하여 추가)

    // Context에 제공할 값
    const value = useMemo(
        () => ({
            user,
            loading,
            error,
            login,
            logout,
            reloadUser,
            isAuthenticated: !!user, // 로그인 여부 플래그
        }),
        [user, loading, error, login, logout, reloadUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}