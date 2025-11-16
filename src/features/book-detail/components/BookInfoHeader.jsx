import styled from 'styled-components';

const HeaderSection = styled.section`
  display: flex;
  gap: 16px;
  padding: 0px 0px 8px 0px;
  align-items: flex-start;
  position: relative;
  z-index: 2;
`;


const Meta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`;

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  background: #212121;
  color: #f6d4ff;
  border-radius: 30px;
  font-size: 12px;
  font-weight: 500;
`;

const Title = styled.h1`
  margin: 0;
  color: #ffffff;
  word-break: keep-all;
  font-size: 22px;    /* Dev 모드: 22 / 28 Bold */
  line-height: 28px;
  font-weight: 700;
`;

const Author = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 22px;
  color: rgba(255,255,255,0.3);
  text-decoration: underline;
  text-underline-position: from-font;
`;

const Description = styled.p`
  margin: 0;
  padding: 0;
  font-size: 13px;    /* Dev 모드: 13 / 24 Light */
  line-height: 24px;
  color: #ffffff;
  white-space: pre-line;
  opacity: 1;
`;

export default function BookInfoHeader({ book }) {
  if (!book) return null;

  const { bookTitle, author, description, genre } = book;

  return (
    <div>
      <HeaderSection>
        <Meta>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Title>{bookTitle}</Title>
            <Chip>{genre || '서사'}</Chip>
          </div>
          <Author>{author}</Author>
        </Meta>
      </HeaderSection>
      {description ? <Description>{description}</Description> : null}
    </div>
  );
}

