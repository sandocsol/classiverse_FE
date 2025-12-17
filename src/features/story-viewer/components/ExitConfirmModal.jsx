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
  background: #212121;
  border-radius: 20px;
  width: 282px;
  height: 152px;
  padding: 41px 86px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
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

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  text-align: center;
`;

const Subtitle = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
`;

const Question = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #ffffff;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }
`;

const EndButton = styled(ActionButton)`
  background: #2a2a2a;
  color: #ffffff;
`;

const StayButton = styled(ActionButton)`
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
    // 모달만 닫기
    if (onClose) onClose();
  };

  const handleStay = () => {
    // BookDetailPage로 이동
    navigate('/books/1');
  };

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <ModalCard onClick={stopPropagation}>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ×
        </CloseButton>
        <TextContent>
          <Subtitle>홈으로 돌아가기</Subtitle>
          <Question>대화를 끝내시겠습니까?</Question>
        </TextContent>
        <ButtonContainer>
          <EndButton onClick={handleEnd}>끝낼래요</EndButton>
          <StayButton onClick={handleStay}>더 있을래요</StayButton>
        </ButtonContainer>
      </ModalCard>
    </Overlay>
  );
}
