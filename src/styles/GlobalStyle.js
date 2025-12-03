// src/styles/GlobalStyle.js
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* Pretendard Variable 폰트 로드 */
  @font-face {
    font-family: 'Pretendard Variable';
    src: url('/font/PretendardVariable.woff2') format('woff2');
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
  }

  /* VITRO PRIDE OTF 폰트 로드 */
  @font-face {
    font-family: 'VITRO_PRIDE_OTF';
    src: url('/fonts/VITRO PRIDE OTF.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }

  /* Hakgyoansim SamulhamOTF 폰트 로드 */
  @font-face {
    font-family: 'Hakgyoansim SamulhamOTF';
    src: url('/font/HakgyoansimSamulhamOTFR.otf') format('opentype');
    font-weight: 400;
    font-style: normal;
    font-display: swap;
  }

  /* 전역 초기화 스타일 */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html, body {
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
    min-height: 100%;
    overflow-x: hidden; /* 가로 스크롤 방지 */
    overflow-y: auto; /* 세로 스크롤 허용 */
    background: #070707;
    font-family: 'Pretendard Variable', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    
    /* 스크롤바 숨기기 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  html::-webkit-scrollbar,
  body::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }

  #root {
    height: 100%;
    width: 100%;
    overflow-x: hidden; /* 가로 스크롤 방지 */
    
    /* 스크롤바 숨기기 */
    scrollbar-width: none; /* Firefox */
    -ms-overflow-style: none; /* IE and Edge */
  }
  
  #root::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`;

export default GlobalStyle;
