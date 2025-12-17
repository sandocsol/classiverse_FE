import React from 'react';
import { useNavigate } from 'react-router-dom';
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
  display: flex;
  flex-direction: column;
  width: 330px;
  min-height: 152px;
  padding: 41px 24px;
  justify-content: center;
  align-items: center;
  gap: 0;
  border-radius: 20px;
  background: #212121;
  box-sizing: border-box;
  color: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.7);
`;

const CloseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #414141;
  font-size: 24px;
  cursor: pointer;
  line-height: 1;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
`;

const Subtitle = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;
  color: #F6D4FF;
  text-align: center;
  white-space: nowrap;
`;

const Question = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 18px;
  font-weight: 500;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  width: 100%;
`;

const BaseButton = styled.button`
  flex: 1;
  height: 42px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;
  white-space: nowrap;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const EndButton = styled(BaseButton)`
  background: #2a2a2a;
  color: #ffffff;
`;

const StayButton = styled(BaseButton)`
  background: #F6D4FF;
  color: #212121;
`;

export default function ExitConfirmModal({ onClose }) {
  const navigate = useNavigate();

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  const handleEnd = () => {
    navigate('/books/1');
  };

  const handleStay = () => {
    if (onClose) onClose();
  };

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <ModalCard onClick={stopPropagation}>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ×
        </CloseButton>
        <TextContainer>
          <Subtitle>홈으로 돌아가기</Subtitle>
          <Question>탐험을 종료하시겠습니까?</Question>
        </TextContainer>
        <ButtonContainer>
          <EndButton onClick={handleEnd}>끝낼래요</EndButton>
          <StayButton onClick={handleStay}>더 있을래요</StayButton>
        </ButtonContainer>
      </ModalCard>
    </Overlay>
  );
}
