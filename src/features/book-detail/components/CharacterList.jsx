import styled from 'styled-components';
import { trackCharacterCardClick } from '../../../analytics.js';

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

  if (!Array.isArray(list) || list.length === 0) return null;

  return (
    <Section>
      <SectionTitle>등장인물</SectionTitle>
      <Scroller>
        {list.map((c) => {
          // charId를 문자열로 변환하여 사용
          const characterId = String(c.charId);
          // API에서 받은 closeness 값만 사용 (서버의 최신 값)
          const percent = Math.max(0, Math.min(100, c.closeness ?? 0));
          return (
            <Card
              key={characterId}
              $hasAffinity={percent > 0}
              onClick={() => {
                // GA 이벤트 추적
                trackCharacterCardClick(characterId);
                // 기존 클릭 핸들러 실행
                onCharacterClick?.(characterId);
              }}
              data-character-id={characterId}
            >
              <AvatarCircle>
                <AvatarImg src={c.charImage} alt={`${c.name} 아바타`} />
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