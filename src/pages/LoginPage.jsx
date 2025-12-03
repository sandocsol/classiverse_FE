import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  height: 100dvh;
  background: #070707;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px 40px;
  box-sizing: border-box;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 124px;
  z-index: 2;
`;

const Title = styled.h1`
  color: #F6D4FF;
  text-align: center;
  font-family: "Hakgyoansim SamulhamOTF", sans-serif;
  font-size: 40px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin: 0;
`;

const RocketContainer = styled.div`
  position: relative;
  width: 375px;
  height: 165px;
  aspect-ratio: 25 / 11;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  margin-top: 4px;
  margin-bottom: 273px;
`;

const RocketVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const PlanetContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 400px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  margin-top: auto;
`;

const Planet = styled.img`
  position: absolute;
  bottom: -60px;
  width: 360px;
  height: 360px;
  object-fit: contain;
`;

const ButtonContainer = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 340px;
  margin-top: -100px;
  display: flex;
  justify-content: center;
`;

const KakaoButton = styled.button`
  width: 308px;
  height: 45.567px;
  background: #FEE500;
  border: none;
  border-radius: 12.6px;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0 14.176px;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(254, 229, 0, 0.3);
  transition: all 0.2s ease;
  
  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(254, 229, 0, 0.2);
  }
  
  &:hover {
    background: #FDD835;
  }
`;

const KakaoIcon = styled.img`
  width: 18.23px;
  height: 18.23px;
  flex-shrink: 0;
  position: absolute;
  left: 28.356px;
`;

const ButtonText = styled.span`
  font-size: 16px;
  font-weight: 600;
  letter-spacing: -0.01em;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

export default function LoginPage() {
  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 기능 구현
    console.log('카카오 로그인 클릭');
  };

  return (
    <PageContainer>
      <TitleContainer>
        <Title>
          CLASSI<br />VERSE
        </Title>
      </TitleContainer>

      <RocketContainer>
        <RocketVideo
          src="/images/login/rocket-video.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </RocketContainer>

      <PlanetContainer>
        <Planet src="/images/login/planet.png" alt="행성" />
        <ButtonContainer>
          <KakaoButton onClick={handleKakaoLogin}>
            <KakaoIcon src="/images/login/kakao-icon.svg" alt="카카오톡" />
            <ButtonText>카카오 로그인</ButtonText>
          </KakaoButton>
        </ButtonContainer>
      </PlanetContainer>
    </PageContainer>
  );
}

