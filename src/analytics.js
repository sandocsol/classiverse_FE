import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-PM2BG6DG9D');
};

export const sendPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};