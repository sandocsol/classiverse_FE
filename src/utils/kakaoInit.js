// 카카오 SDK 초기화
export const initKakao = () => {
  if (typeof window !== 'undefined' && window.Kakao) {
    const kakaoKey = import.meta.env.VITE_KAKAO_JS_KEY;
    
    if (!kakaoKey) {
      console.warn('VITE_KAKAO_JS_KEY가 설정되지 않았습니다.');
      return;
    }
    
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(kakaoKey);
      console.log('Kakao SDK 초기화 완료:', window.Kakao.isInitialized());
    }
  }
};

