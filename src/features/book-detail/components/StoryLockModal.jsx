import React from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  position: relative;
  background: #212121;
  border-radius: 20px;
  padding: 32px 28px 30px;
  width: min(320px, 86vw);
  box-sizing: border-box;
  color: #ffffff;
  text-align: center;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
`;

const LockImage = styled.img`
  width: 100%;
  height: auto;
  object-fit: contain;
  display: block;
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  text-align: center;
  width: 100%;
  margin-bottom: 0;
`;

const Title = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 19.8px;
  color: #ffffff;
`;

const Description = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 19.8px;
  color: rgba(255, 255, 255, 0.9);
  white-space: pre-line;
`;

const ConfirmButton = styled.button`
  width: 100%;
  background: #F6D4FF;
  border: none;
  border-radius: 10px;
  padding: 12px 24px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  transition: background 0.2s;
  margin-top: 8px;

  &:hover {
    background: #e8c0f0;
  }

  &:active {
    background: #d9abdf;
  }
`;

const ButtonText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: #212121;
`;

export default function StoryLockModal({ onClose, storyId }) {
  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  const handleConfirmClick = () => {
    if (onClose) onClose();
  };

  // storyId에서 스토리 번호 추출 (예: 'story-4' -> '4', 'story-5' -> '5')
  const storyNumber = storyId?.replace('story-', '') || '4';
  const lockImageSrc = `/images/story-${storyNumber}-lock.png`;

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <ModalCard onClick={stopPropagation}>
        <TextContent>
          <Title>이 이야기는 잠겨있어요.</Title>
          <Description>오만과 편견의 다음 전개가 궁금하다면,{'\n'}곧 출시될 클래시버스에서 확인해보세요!</Description>
        </TextContent>
        <ImageContainer>
          <LockImage src={lockImageSrc} alt="잠긴 스토리" />
        </ImageContainer>
        <ConfirmButton onClick={handleConfirmClick}>
          <ButtonText>확인</ButtonText>
        </ConfirmButton>
      </ModalCard>
    </Overlay>
  );
}

