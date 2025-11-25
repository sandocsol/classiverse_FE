import ReactGA from 'react-ga';

ReactGA.initialize('YOUR_TRACKING_ID', {
  debug: true, // Enable debug mode
  // Other options can be added here, e.g., testMode: true
});

export const sendPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

/**
 * 등장인물 카드 클릭 이벤트 추적
 * @param {string} characterId - 등장인물 ID (필수)
 */
export const trackCharacterCardClick = (characterId) => {
  if (!characterId) {
    console.warn('trackCharacterCardClick: characterId is required');
    return;
  }

  ReactGA.event({
    category: 'engagement',
    action: 'character_card_click',
    label: characterId,
    value: 1,
  });
};