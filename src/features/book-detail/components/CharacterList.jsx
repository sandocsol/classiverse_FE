import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { trackCharacterCardClick } from '../../../analytics.js';
import { getCharacterAffinity } from '../../../utils/affinityStorage.js';

const Section = styled.section`
  padding-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #ffffff;
  padding-left: 28px;
`;

const Scroller = styled.div`
  display: flex;
  gap: 8px;
  padding-left: 28px;
  padding-right: 28px;
  overflow-x: auto;
  padding-bottom: 25px;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Card = styled.button`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
  padding: 0 4px 12px 4px;
  min-width: 105px;
  background: ${props => props.$hasAffinity
    ? 'linear-gradient(221deg, #212121 0%, #4D3B51 49%, #212121 75%)'
    : '#212121'};
  border-radius: 10px;
  border: none;
  cursor: pointer;
  text-align: center;
  transition: transform 0.06s ease;

  &:active {
    transform: translateY(1px);
  }
`;

const AvatarCircle = styled.div`
  position: relative;
  width: 85px;
  height: 85px;
  border-radius: 50%;
  overflow: hidden;
  border: none;
  background: none;
`;

const AvatarImg = styled.img`
  position: absolute;
  left: 50%;
  top: 110%;
  transform: translate(-50%, -55%);
  width: 120%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0px -2px 4px rgba(255,255,255,0.9));
`;

const Name = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 500;
  margin-top: 10px; /* AvatarCircle와의 간격 10px */
  white-space: nowrap;
`;

const SubText = styled.span`
  font-size: 10px;
  color: #f6d4ff;
  opacity: ${props => (props.dim ? 0.5 : 1)};
  margin-top: 2px; /* Name과의 간격 2px */
`;

export default function CharacterList({ characters, onCharacterClick, book }) {
  const list = characters ?? book?.characters ?? [];
  const [affinityData, setAffinityData] = useState({});

  // localStorage에서 친밀도 데이터 가져오기
  const updateAffinityData = () => {
    if (list.length > 0) {
      const characterIds = list.map(c => c.characterId);
      const data = {};
      characterIds.forEach(characterId => {
        data[characterId] = getCharacterAffinity(characterId, characterIds);
      });
      setAffinityData(data);
    }
  };

  useEffect(() => {
    updateAffinityData();

    // storage 이벤트 리스너 추가 (다른 탭에서 변경된 경우 감지)
    const handleStorageChange = (e) => {
      if (e.key === 'user_affinity_data') {
        updateAffinityData();
      }
    };

    // 같은 탭에서 변경을 감지하기 위한 커스텀 이벤트 리스너
    const handleAffinityUpdate = () => {
      updateAffinityData();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('affinityUpdated', handleAffinityUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('affinityUpdated', handleAffinityUpdate);
    };
  }, [list]);

  if (!Array.isArray(list) || list.length === 0) return null;

  return (
    <Section>
      <SectionTitle>등장인물</SectionTitle>
      <Scroller>
        {list.map((c) => {
          // localStorage에서 친밀도 데이터를 가져오거나, 기본값 사용
          const storedProgress = affinityData[c.characterId] ?? 0;
          const percent = Math.max(0, Math.min(100, storedProgress));
          return (
            <Card
              key={c.characterId}
              $hasAffinity={percent > 0}
              onClick={() => {
                // GA 이벤트 추적
                trackCharacterCardClick(c.characterId);
                // 기존 클릭 핸들러 실행
                onCharacterClick?.(c.detailDataUrl);
              }}
              data-character-id={c.characterId}
            >
              <AvatarCircle>
                <AvatarImg src={c.avatar} alt={`${c.name} 아바타`} />
              </AvatarCircle>
              <Name>{c.name}</Name>
              <SubText dim={percent === 0}>친밀도 {percent}%</SubText>
            </Card>
          );
        })}
      </Scroller>
    </Section>
  );
}