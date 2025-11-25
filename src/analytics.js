import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-PM2BG6DG9D');
};

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