import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import useCharacter from '../hooks/useCharacter.js';
import { getCharacterAffinity } from '../../../utils/affinityStorage.js';

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
  background: ${(props) =>
    props.$hasAffinity
      ? 'linear-gradient(221deg, #212121 0%, #4D3B51 49%, #212121 75%)'
      : '#212121'};
  border-radius: 20px;
  padding: 32px 28px 30px;
  width: min(320px, 86vw);
  box-sizing: border-box;
  color: #ffffff;
  text-align: center;
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
  font-size: 45px;
  cursor: pointer;
`;

const AffinityLabel = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${(props) => (props.$hasAffinity ? '#F6D4FF' : '#909090')};
  opacity: 0.9;
`;

const Name = styled.p`
  margin: 4px 0 16px;
  font-size: 17px;
  font-weight: 600;
`;

const AvatarWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 15px;
`;

const AvatarCircle = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
`;

const AvatarImg = styled.img`
  position: absolute;
  left: 50%;
  top: 95%;
  transform: translate(-50%, -50%);
  width: 130%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0px -2px 4px rgba(255,255,255,0.9));

`;

const Title = styled.p`
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
`;

const Description = styled.div`
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.5);

  p {
    margin: 0;
  }
`;

const StatusText = styled.p`
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
`;

export default function CharacterModal({ characterId, onClose }) {
  const dataUrl = characterId ? `/data/character-detail/${characterId}.json` : null;
  const { data, loading, error } = useCharacter(dataUrl);
  
  // localStorage에서 친밀도 데이터 가져오기 (초기값 설정)
  const getInitialProgress = () => {
    if (data?.characterId) {
      return getCharacterAffinity(data.characterId);
    }
    return 0;
  };
  const [storedProgress, setStoredProgress] = useState(getInitialProgress);

  // characterId가 변경될 때 친밀도 데이터 업데이트
  // localStorage에서 데이터를 동기화하는 것은 useEffect의 일반적인 사용 사례입니다
  useEffect(() => {
    if (data?.characterId) {
      const progress = getCharacterAffinity(data.characterId);
      setStoredProgress(progress);
    }
  }, [data?.characterId]);

  // storage 이벤트 리스너 추가
  useEffect(() => {
    // storage 이벤트 리스너 추가 (다른 탭에서 변경된 경우 감지)
    const handleStorageChange = (e) => {
      if (e.key === 'user_affinity_data' && data?.characterId) {
        const progress = getCharacterAffinity(data.characterId);
        setStoredProgress(progress);
      }
    };

    // 같은 탭에서 변경을 감지하기 위한 커스텀 이벤트 리스너
    const handleAffinityUpdate = (e) => {
      if (data?.characterId && e.detail?.characterId === data.characterId) {
        const progress = getCharacterAffinity(data.characterId);
        setStoredProgress(progress);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('affinityUpdated', handleAffinityUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('affinityUpdated', handleAffinityUpdate);
    };
  }, [data?.characterId]);

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  // localStorage에서 가져온 친밀도 데이터 사용
  const progress = Math.max(0, Math.min(100, storedProgress));
  const descriptionLines = data?.description ? data.description.split('\n') : [];

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <ModalCard onClick={stopPropagation} $hasAffinity={progress > 0}>
        <CloseButton type="button" aria-label="닫기" onClick={onClose}>
          ×
        </CloseButton>

        {loading && <StatusText>인물 정보를 불러오는 중…</StatusText>}
        {error && !loading && <StatusText>인물 정보를 불러오지 못했어요.</StatusText>}

        {!loading && !error && data && (
          <>
            <AffinityLabel $hasAffinity={progress > 0}>친밀도 {progress}%</AffinityLabel>
            <Name>{data.name}</Name>

            <AvatarWrapper>
              <AvatarCircle>
                <AvatarImg src={data.avatar} alt={`${data.name} 아바타`} />
              </AvatarCircle>
            </AvatarWrapper>

            <Title>{data.title}</Title>
            <Description>
              {descriptionLines.map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </Description>
          </>
        )}
      </ModalCard>
    </Overlay>
  );
}
