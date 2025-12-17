import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "../config/api.js"; 
import { useAuth } from "../features/auth/hooks/useAuth.js";

export default function KakaoAuthHandler() {
  const navigate = useNavigate();
  const { login } = useAuth(); // 전역 상태 업데이트용
  const processing = useRef(false);

  useEffect(() => {
    // window.location.search를 직접 사용 (React Router location과 분리)
    const code = new URLSearchParams(window.location.search).get("code");

    // 1) code 없으면 종료
    if (!code) return;

    // 2) sessionStorage로 중복 호출 방지 (컴포넌트 재마운트/StrictMode 대응)
    const sessionKey = `kakao_callback_${code}`;
    if (sessionStorage.getItem(sessionKey)) {
      console.log("이미 처리된 요청입니다. 중복 호출 방지.");
      return;
    }
    sessionStorage.setItem(sessionKey, "processing");

    // 3) ref 가드 (추가 안전장치)
    if (processing.current) return;
    processing.current = true;

    // 4) 핵심: URL에서 code 제거 (새로고침/중복 호출 시 코드 재사용 방지)
    window.history.replaceState({}, document.title, window.location.pathname);

    (async () => {
      try {
        console.log("인가코드 전송:", code);

        // ✅ 로그인 요청 전에 찌꺼기 토큰 제거 (로그인 요청에 Authorization 붙을 여지 제거)
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // ✅ 백엔드 계약 준수: { "authorizationCode": "코드값" }
        const res = await apiClient.post("/api/auth/kakao/callback", {
          authorizationCode: code,
        });

        // 백엔드 응답: { accessToken, refreshToken, nickname, ... }
        const { accessToken, refreshToken } = res.data;

        // 토큰 저장 (필수)
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) {
          localStorage.setItem("refreshToken", refreshToken);
        }

        // 4) 전역 로그인 상태 갱신 (User Profile 가져오기 등)
        await login();

        // 5) 성공 시 sessionStorage 정리
        sessionStorage.removeItem(sessionKey);
        
        // 6) 온보딩 이동
        navigate("/onboarding");

      } catch (e) {
        console.error("로그인 실패:", e);
        // 실패 시 토큰 찌꺼기 제거 및 홈으로 이동
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem(sessionKey); // 실패 시에도 정리
        alert("로그인 처리에 실패했습니다. 다시 시도해주세요.");
        processing.current = false; // 에러 시 재시도 가능하게 플래그 초기화
        navigate("/");
      }
    })();
  }, [navigate, login]); // location.search 제거 (window.location.search 직접 사용)

  return (
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
}