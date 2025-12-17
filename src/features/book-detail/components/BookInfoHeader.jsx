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
  gap: 16px;
  min-width: 0;
`;

const TitleAuthorContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: -26px;
  position: relative;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  flex-wrap: wrap;
`;

const ChipContainer = styled.div`
  display: flex;
  align-items: flex-end;
  margin-top: -18px;
  margin-left: 5px;
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
  transform: translateY(4px);
`;

const Title = styled.h1`
  margin: 0;
  color: #fff;
  font-family: "Pretendard Variable", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 40px;
  font-style: normal;
  font-weight: 700;
  line-height: 28px; /* 70% */
  word-break: keep-all;
`;

const Author = styled.p`
  margin: 0;
  color: #fff;
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  opacity: 0.4;
  line-height: normal;
  text-decoration-line: underline;
  text-decoration-style: solid;
  text-decoration-skip-ink: auto;
  text-decoration-thickness: auto;
  text-underline-offset: auto;
  text-underline-position: from-font;
`;

const SynopsisTitle = styled.h2`
  margin: 25px 0 12px 0;
  font-size: 18px;
  color: #ffffff;
`;

const Description = styled.p`
  margin: 0;
  padding: 0;
  font-size: 13px;    /* Dev 모드: 13 / 24 Light */
  line-height: 24px;
  color: #ffffff;
  white-space: pre-line;
  opacity: 1;
  margin-top: 0;
`;

export default function BookInfoHeader({ book }) {
  if (!book) return null;

  const { title, author, introduction, categoryName } = book;

  return (
    <div>
      <HeaderSection>
        <Meta>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <TitleAuthorContainer>
              <TitleRow>
                <Title>{title}</Title>
              </TitleRow>
              <Author>{author}</Author>
            </TitleAuthorContainer>
            {categoryName && (
              <ChipContainer>
                <Chip>{categoryName}</Chip>
              </ChipContainer>
            )}
          </div>
        </Meta>
      </HeaderSection>
      {introduction ? (
        <>
          <SynopsisTitle>줄거리</SynopsisTitle>
          <Description>{introduction}</Description>
        </>
      ) : null}
    </div>
  );
}
