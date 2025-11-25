import ReactGA from 'react-ga4';

// GA4 초기화 + 디버그모드 활성화(DebugView용)
export const initGA = () => {
  ReactGA.initialize(
    [
      {
        trackingId: "G-PM2BG6DG9D",
        debug_mode: true, // DebugView용 디버그 모드
      }
    ]
  );
};

// 페이지뷰 측정 함수
export const sendPageView = (path) => {
  ReactGA.send({
    hitType: "pageview",
    page: path,
  });
};

export const trackCharacterCardClick = (characterName) => {
  ReactGA.event({
    category: "Character",
    action: "Click Character Card",
    label: characterName,
  });
};