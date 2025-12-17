import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getOrCreateUserId } from '../../../utils/affinityStorage.js';
import useStoryComplete from '../hooks/useStoryComplete.js';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #070707;
  position: relative;
  overflow: hidden;
`;

const TopMessageArea = styled.div`
  position: absolute;
  top: clamp(80px, 13.05vh, 150px);
  left: 29px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: flex-start;
`;

const ClearMessage = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 28px;
  color: rgba(255, 255, 255, 0.5);
`;

const RelationshipUpdate = styled.div`
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 28px;
  color: #ffffff;

  p {
    margin: 0;
  }
`;

const StatusCardWrapper = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 236px;
  height: 264px;
  padding: 15px;
  box-sizing: border-box;
`;

const StatusCard = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  transform: translateX(-50%);
  background: #151515;
  border-radius: 20px;
  padding: 20px 15px;
  width: 236px;
  height: 264px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

const ProgressInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  width: 100%;
`;

const ProgressText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 12px;
  line-height: normal;
  color: #f6d4ff;
  opacity: 0.9;
`;

const CharacterName = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: normal;
  color: #ffffff;
`;

const AvatarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  margin-top: 0;
`;

const AvatarWrapper = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
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

const Message = styled.div`
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: #dfc1e8;
  opacity: 0.9;
  text-align: center;
  white-space: pre-line;

  p {
    margin: 0;
  }
`;

const ProgressBarContainer = styled.div`
  width: 206px;
  height: 7px;
  margin-top: 0;
  margin-bottom: 14px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 7px;
  background: #353535;
  border-radius: 10px;
  overflow: hidden;
  position: relative;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: #dfc1e8;
  border-radius: 10px;
  transition: width 0.3s ease;
  width: ${(props) => props.$progress}%;
`;

const NextButton = styled.button`
  position: absolute;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  background: #212121;
  border: none;
  border-radius: 10px;
  padding: 6px 139px;
  width: 330px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  transition: background 0.2s;

  &:hover {
    background: #2a2a2a;
  }

  &:active {
    background: #1a1a1a;
  }
`;

const NextButtonText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 30px;
  color: #f6d4ff;
  opacity: 0.9;
  white-space: pre;
`;

export default function StoryEndScreen({ storyId, characterId, initialCloseness }) {
  const navigate = useNavigate();
  const { data: completeData, loading, error } = useStoryComplete(storyId, characterId);

  // 사용자 ID 생성 (최초 접속 시)
  useEffect(() => {
    getOrCreateUserId();
  }, []);

  // bookId를 가져와서 책 상세 페이지로 이동
  const handleNextClick = () => {
    // story-complete API에서 bookId를 가져오거나, 없으면 기본값 사용
    const bookId = completeData?.bookId || 1;
    navigate(`/books/${bookId}`);
  };

  // 동적으로 메시지 생성 (story-complete API 응답 데이터 사용)
  const storyTitle = completeData?.storyTitle ?? '';
  const characterName = completeData?.characterName ?? '';
  const clearMessage = storyTitle ? `'${storyTitle}' 클리어` : '';
  const relationshipUpdate = characterName ? `${characterName}와의 관계가\n한 단계 더 깊어졌어요!` : '';
  const finalText = completeData?.finalText ?? '';
  const messageLines = finalText ? finalText.split('\n') : [];
  const currentCloseness = completeData?.currentCloseness ?? initialCloseness ?? 0;

  if (loading) {
    return (
      <Container>
        <StatusCardWrapper>
          <StatusCard>
            <ProgressText>스토리 완료 처리 중...</ProgressText>
          </StatusCard>
        </StatusCardWrapper>
      </Container>
    );
  }

  if (error || !completeData) {
    return (
      <Container>
        <StatusCardWrapper>
          <StatusCard>
            <ProgressText>스토리 완료 데이터를 불러오지 못했습니다.</ProgressText>
          </StatusCard>
        </StatusCardWrapper>
      </Container>
    );
  }

  return (
    <Container>
      {clearMessage && (
        <TopMessageArea>
          <ClearMessage>{clearMessage}</ClearMessage>
          {relationshipUpdate && (
            <RelationshipUpdate>
              {relationshipUpdate.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </RelationshipUpdate>
          )}
        </TopMessageArea>
      )}

      <StatusCardWrapper>
        <StatusCard>
          <ProgressBarContainer>
            <ProgressBar>
              <ProgressFill $progress={Math.max(0, Math.min(100, currentCloseness))} />
            </ProgressBar>
          </ProgressBarContainer>

          <ProgressInfo>
            <ProgressText>친밀도 {currentCloseness}%</ProgressText>
            {characterName && (
              <CharacterName>{characterName}</CharacterName>
            )}
          </ProgressInfo>

          <AvatarSection>
            {completeData.charImage && (
              <AvatarWrapper>
                <AvatarImg
                  src={completeData.charImage}
                  alt={`${characterName} 아바타`}
                />
              </AvatarWrapper>
            )}

            {messageLines.length > 0 && (
              <Message>
                {messageLines.map((line, index) => (
                  <p key={index}>{line}</p>
                ))}
              </Message>
            )}
          </AvatarSection>
        </StatusCard>
      </StatusCardWrapper>

      <NextButton onClick={handleNextClick}>
        <NextButtonText>다음 이야기 보기</NextButtonText>
      </NextButton>
    </Container>
  );
}
