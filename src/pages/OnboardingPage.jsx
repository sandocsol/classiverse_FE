import React, { useState } from 'react';
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

const TextContainer = styled.div`
  position: relative;
  z-index: 3;
  margin-top: 118px;
  align-self: flex-start;
  width: 100%;
  padding-left: 11px; /* 39px - 28px (page padding) = 11px */
`;

const Title = styled.h1`
  color: #FFFFFF;
  text-align: left;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 20px;
  font-style: normal;
  font-weight: 600;
  line-height: 30px;
  margin: 0;
  white-space: pre-line;
`;

const Subtitle = styled.p`
  color: #B7B7B7;
  text-align: left;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 15px;
  font-style: normal;
  font-weight: 400;
  line-height: 30px;
  margin: 0;
  margin-top: 8px;
`;

const InputContainer = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  margin-top: 97px;
  padding-left: 11px; /* 39px - 28px (page padding) = 11px */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InputField = styled.input`
  width: 200px;
  background: transparent;
  border: none;
  padding: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 20px;
  font-weight: 500;
  color: #FFFFFF;
  outline: none;
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &::-webkit-input-placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  &::-moz-placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Underline = styled.svg`
  width: 200px;
  height: 1px;
  margin-top: 4px;
  flex-shrink: 0;
`;

const PlanetContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 400px;
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
`;

const PlanetImage = styled.img`
  position: absolute;
  bottom: 0;
  width: 360px;
  height: 360px;
  object-fit: contain;
  object-position: bottom;
`;

const AstronautContainer = styled.div`
  position: absolute;
  top: 345px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 220px;
  height: 370px;
  max-width: 270px;
  max-height: 470px;
  pointer-events: none;
  
  @media (min-width: 375px) {
    width: 240px;
    height: 400px;
    max-width: 300px;
    max-height: 500px;
  }
  
  @media (min-width: 414px) {
    width: 260px;
    height: 430px;
    max-width: 320px;
    max-height: 530px;
  }
  
  @media (max-width: 375px) {
    top: calc(118px + 60px + 97px + 30px + 4px + 100px);
  }
`;

const AstronautImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const RocketContainer = styled.div`
  position: absolute;
  top: 375px;
  left: 270px;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 320px;
  max-width: 230px;
  max-height: 420px;
  pointer-events: none;
  
  @media (min-width: 375px) {
    width: 200px;
    height: 350px;
    max-width: 250px;
    max-height: 450px;
  }
  
  @media (min-width: 414px) {
    width: 220px;
    height: 380px;
    max-width: 270px;
    max-height: 480px;
  }
  
  @media (max-width: 375px) {
    top: 275px;
  }
`;

const RocketImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const ButtonContainer = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 340px;
  margin-top: auto;
  margin-bottom: 15px;
  align-self: center;
  display: flex;
  justify-content: center;
`;

const ConfirmButton = styled.button`
  width: 100%;
  max-width: 308px;
  height: 48px;
  background: #FFFFFF;
  border: none;
  border-radius: 12px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #070707;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: -0.01em;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    background: #F5F5F5;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default function OnboardingPage() {
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (name.trim()) {
      // TODO: 이름 저장 로직 추가
      console.log('이름:', name);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  return (
    <PageContainer>
      <TextContainer>
        <Title>클래시버스를 여행할{'\n'}이름을 알려주세요.</Title>
        <Subtitle>10글자 이내로 입력해주세요.</Subtitle>
      </TextContainer>

      <InputContainer>
        <InputField
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="이름을 입력하세요"
          maxLength={10}
        />
        <Underline
          xmlns="http://www.w3.org/2000/svg"
          width="200"
          height="1"
          viewBox="0 0 200 1"
          fill="none"
        >
          <path
            d="M0.398438 0.399902H199.598"
            stroke="white"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </Underline>
      </InputContainer>

      <PlanetContainer>
        <PlanetImage src="/images/onboarding/planet_half.png" alt="행성" />
      </PlanetContainer>

      <AstronautContainer>
        <AstronautImage 
          src="/images/onboarding/astronaut_full.png" 
          alt="우주비행사" 
        />
      </AstronautContainer>

      <RocketContainer>
        <RocketImage 
          src="/images/onboarding/rocket.png" 
          alt="로켓" 
        />
      </RocketContainer>

      <ButtonContainer>
        <ConfirmButton 
          onClick={handleConfirm}
          disabled={!name.trim()}
        >
          확인
        </ConfirmButton>
      </ButtonContainer>
    </PageContainer>
  );
}
