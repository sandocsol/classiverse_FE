import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getOrCreateUserId, increaseAffinity, getCharacterAffinity } from '../../../utils/affinityStorage.js';

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
  gap: 4px;
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

export default function StoryEndScreen({ endData, characterId, storyId }) {
  const navigate = useNavigate();
  
  // 초기 친밀도 값 설정 (함수형 초기화)
  const getInitialProgress = () => {
    if (characterId) {
      return getCharacterAffinity(characterId);
    }
    return 0;
  };
  const [progress, setProgress] = useState(getInitialProgress);

  // 사용자 ID 생성 (최초 접속 시)
  useEffect(() => {
    getOrCreateUserId();
  }, []);

  // characterId가 변경될 때 친밀도 업데이트
  // localStorage에서 데이터를 동기화하는 것은 useEffect의 일반적인 사용 사례입니다
  useEffect(() => {
    if (characterId) {
      const currentProgress = getCharacterAffinity(characterId);
      setProgress(currentProgress);
    }
  }, [characterId]);

  // 친밀도 데이터 업데이트 (스토리 종료 시 - 증가량 방식)
  // useRef를 사용하여 한 번만 실행되도록 보장
  const hasUpdatedRef = useRef(false);
  useEffect(() => {
    if (endData?.status && characterId && storyId && !hasUpdatedRef.current) {
      const increment = endData.status.progress ?? 0;
      // localStorage에 친밀도 데이터 저장 (현재 값에 증가량을 더함)
      // storyId를 전달하여 중복 완료 방지
      const newProgress = increaseAffinity(characterId, increment, storyId);
      // 업데이트된 친밀도 값으로 state 업데이트
      // localStorage에서 데이터를 동기화하는 것은 useEffect의 일반적인 사용 사례입니다
      setProgress(newProgress);
      hasUpdatedRef.current = true;
    }
  }, [endData, characterId, storyId]);

  const handleNextClick = () => {
    if (endData?.nextPagePath) {
      navigate(endData.nextPagePath);
    }
  };

  const message = endData?.status?.message ?? '';
  const messageLines = message ? message.split('\n') : [];

  return (
    <Container>
      {endData?.clearMessage && (
        <TopMessageArea>
          <ClearMessage>{endData.clearMessage}</ClearMessage>
          {endData?.relationshipUpdate && (
            <RelationshipUpdate>
              {endData.relationshipUpdate.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </RelationshipUpdate>
          )}
        </TopMessageArea>
      )}

      {endData?.status && (
        <StatusCardWrapper>
          <StatusCard>
            <ProgressBarContainer>
              <ProgressBar>
                <ProgressFill $progress={Math.max(0, Math.min(100, progress))} />
              </ProgressBar>
            </ProgressBarContainer>

            <ProgressInfo>
              <ProgressText>친밀도 {progress}%</ProgressText>
              {endData.status.characterName && (
                <CharacterName>{endData.status.characterName}</CharacterName>
              )}
            </ProgressInfo>

            <AvatarSection>
              {endData.status.avatar && (
                <AvatarWrapper>
                  <AvatarImg
                    src={endData.status.avatar}
                    alt={`${endData.status.characterName} 아바타`}
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
      )}

      {endData?.nextPagePath && (
        <NextButton onClick={handleNextClick}>
          <NextButtonText>다음 이야기 보기</NextButtonText>
        </NextButton>
      )}
    </Container>
  );
}
