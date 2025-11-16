import styled from 'styled-components';

const Section = styled.section`
  padding-bottom: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: #ffffff;
`;

const Scroller = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 2px;
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
  padding: 0 10px 12px 10px;
  min-width: 110px;
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
  width: 125%;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0px -2px 4px rgba(255,255,255,0.9));
`;

const Name = styled.span`
  font-size: 12px;
  color: #ffffff;
  font-weight: 600;
  margin-top: 10px; /* AvatarCircle와의 간격 10px */
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
          const percent = Math.max(0, Math.min(100, c.progress || 0));
          return (
            <Card
              key={c.characterId}
              $hasAffinity={percent > 0}
              onClick={() => onCharacterClick?.(c.detailDataUrl)}
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

