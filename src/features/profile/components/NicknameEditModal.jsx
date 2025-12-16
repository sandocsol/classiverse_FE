import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { API_ENDPOINTS, apiClient } from '../../../config/api.js';

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: #212121;
  border-radius: 20px;
  padding: 24px 20px;
  width: min(320px, 86vw);
  box-sizing: border-box;
  color: #ffffff;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 12px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  background: #2a2a2a;
  border: none;
  border-radius: 8px;
  color: #ffffff;
  font-size: 14px;
  box-sizing: border-box;
  margin-bottom: 8px;
  font-family: 'Pretendard Variable', sans-serif;

  &:focus {
    outline: none;
    background: #333333;
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const StatusMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: ${props => props.$isValid ? '#909090' : '#ff6b6b'};
  margin-bottom: 16px;
  min-height: 18px;
`;

const CheckIcon = styled.span`
  color: #F6D4FF;
  font-size: 16px;
`;

const ConfirmButton = styled.button`
  width: 100%;
  padding: 14px;
  background: #ffffff;
  border: none;
  border-radius: 8px;
  color: #000000;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #f0f0f0;
  }

  &:active {
    background: #e0e0e0;
  }

  &:disabled {
    background: #666666;
    color: #999999;
    cursor: not-allowed;
  }
`;

export default function NicknameEditModal({ currentNickname, onClose, onUpdate }) {
  const [nickname, setNickname] = useState(currentNickname || '');
  const [isChecking, setIsChecking] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // 초기값이 현재 닉네임과 같으면 유효한 상태로 설정
    if (nickname === currentNickname) {
      setIsValid(true);
      setStatusMessage('');
    }
  }, [nickname, currentNickname]);

  const checkNickname = async (value) => {
    if (!value || value.trim() === '') {
      setIsValid(false);
      setStatusMessage('');
      return;
    }

    if (value === currentNickname) {
      setIsValid(true);
      setStatusMessage('');
      return;
    }

    if (USE_MOCK_DATA) {
      // 목 데이터 모드: 항상 사용 가능한 것으로 처리
      setIsValid(true);
      setStatusMessage('사용가능한 이름입니다.');
      return;
    }

    setIsChecking(true);
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE_NICKNAME_CHECK, {
        params: { nickname: value }
      });
      
      const available = response.data?.available ?? false;
      setIsValid(available);
      setStatusMessage(available ? '사용가능한 이름입니다.' : '이미 사용 중인 이름입니다.');
    } catch (err) {
      setIsValid(false);
      setStatusMessage('닉네임 확인 중 오류가 발생했습니다.');
    } finally {
      setIsChecking(false);
    }
  };

  const handleNicknameChange = (e) => {
    const value = e.target.value;
    setNickname(value);
    
    // 디바운싱: 입력 후 500ms 후에 체크
    if (value.trim() === '') {
      setIsValid(false);
      setStatusMessage('');
      return;
    }

    if (value === currentNickname) {
      setIsValid(true);
      setStatusMessage('');
      return;
    }

    // 디바운싱을 위한 타이머
    const timer = setTimeout(() => {
      checkNickname(value);
    }, 500);

    return () => clearTimeout(timer);
  };

  const handleConfirm = async () => {
    if (!isValid || nickname.trim() === '' || nickname === currentNickname) {
      return;
    }

    setIsUpdating(true);
    try {
      if (!USE_MOCK_DATA) {
        // 실제 API 모드: API 호출
        await apiClient.put(API_ENDPOINTS.PROFILE_NICKNAME_UPDATE, {
          nickname: nickname.trim()
        });
      }
      // 목 데이터 모드 또는 API 성공 시: 콜백 호출
      if (onUpdate) {
        onUpdate(nickname.trim());
      }
      onClose();
    } catch (err) {
      setStatusMessage('닉네임 업데이트 중 오류가 발생했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <ModalCard onClick={stopPropagation}>
        <Label>닉네임</Label>
        <Input
          type="text"
          value={nickname}
          onChange={handleNicknameChange}
          placeholder="닉네임을 입력하세요"
          disabled={isUpdating}
        />
        <StatusMessage $isValid={isValid}>
          {isValid && statusMessage && <CheckIcon>✓</CheckIcon>}
          {statusMessage}
        </StatusMessage>
        <ConfirmButton
          onClick={handleConfirm}
          disabled={!isValid || nickname.trim() === '' || nickname === currentNickname || isUpdating || isChecking}
        >
          {isUpdating ? '확인 중...' : '확인'}
        </ConfirmButton>
      </ModalCard>
    </Overlay>
  );
}

