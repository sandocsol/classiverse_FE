import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #070707;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.div`
  position: absolute;
  top: 43px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  text-align: center;
  z-index: 10;
`;

const StoryTitle = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 600;
  font-size: 15px;
  line-height: 19.8px;
  color: #ffffff;
`;

const CharacterName = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 19.8px;
  color: rgba(255, 255, 255, 0.5);
`;

const ContentArea = styled.div`
  position: absolute;
  top: 119px;
  left: 29px;
  width: 318px;
  display: flex;
  flex-direction: column;
  gap: 26px;
  align-items: flex-start;
  z-index: 10;
`;

const SceneTitle = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  color: #ffffff;
`;

const Dialogue = styled.div`
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 300;
  font-size: 15px;
  line-height: 24px;
  color: #ffffff;

  p {
    margin: 0;
  }
`;

const CharacterVideo = styled.div`
  position: absolute;
  left: 50%;
  top: 357px;
  transform: translateX(-50%);
  width: 160px;
  height: 240px;
  z-index: 5;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-width: none;
`;

const FallbackImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  max-width: none;
`;

const ChoicesContainer = styled.div`
  position: absolute;
  bottom: 56px;
  left: 50%;
  transform: translateX(-50%);
  width: 330px;
  display: flex;
  flex-direction: column;
  gap: 13px;
  align-items: center;
  z-index: 10;
`;

const ChoiceButton = styled.button`
  background: #212121;
  border: none;
  border-radius: 10px;
  padding: 6px 139px;
  width: 100%;
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

const ChoiceText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: 30px;
  color: #f6d4ff;
  opacity: 0.9;
  white-space: pre;
`;

export default function ScenePresenter({
  storyTitle,
  characterName,
  characterId,
  contentData,
  onChoiceSelect,
}) {
  const formatContent = (content) => {
    if (!content) return [];
    return content.split('\n').filter((line) => line.trim());
  };

  const contentLines = formatContent(contentData.content);
  // API에서 받은 동영상 URL 사용, 없으면 fallback으로 characterId 기반 경로 사용
  const videoPath = contentData.videoUrl || 
    (characterId ? `/images/avatars/${characterId}-video.mp4` : null);
  const characterAvatar = contentData.characterAvatar || 
    (characterId ? `/images/avatars/${characterId}.png` : null);
  
  const videoRef = useRef(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const prevVideoPathRef = useRef(videoPath);

  // videoPath가 변경될 때 videoFailed 상태 리셋
  useEffect(() => {
    if (prevVideoPathRef.current !== videoPath) {
      setVideoFailed(false);
      prevVideoPathRef.current = videoPath;
    }
  }, [videoPath]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoPath) return;

    // 비디오가 로드되면 자동재생 시도
    const attemptPlay = async () => {
      try {
        // muted 속성이 있어야 자동재생이 가능
        video.muted = true;
        const playPromise = video.play();
        
        if (playPromise !== undefined) {
          await playPromise;
        }
      } catch (error) {
        // 자동재생 실패 시 fallback 이미지로 전환
        console.warn('Video autoplay failed, falling back to image:', error);
        setVideoFailed(true);
      }
    };

    // 비디오 로드 완료 시 재생 시도
    const handleCanPlay = () => {
      attemptPlay();
    };

    // 이미 로드된 경우 바로 시도
    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener('canplay', handleCanPlay);
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, [videoPath]);

  return (
    <Container>
      <Header>
        <StoryTitle>{storyTitle}</StoryTitle>
        <CharacterName>{characterName}</CharacterName>
      </Header>

      <ContentArea>
        <SceneTitle>{contentData.header}</SceneTitle>
        <Dialogue>
          {contentLines.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </Dialogue>
      </ContentArea>

      {videoPath && (
        <CharacterVideo key={videoPath}>
          {videoFailed ? (
            <FallbackImage src={characterAvatar} alt={characterName} />
          ) : (
            <Video
              ref={videoRef}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              controlsList="nodownload"
            >
              <source src={videoPath} type="video/mp4" />
            </Video>
          )}
        </CharacterVideo>
      )}

      {contentData.reactions && contentData.reactions.length > 0 && (
        <ChoicesContainer>
          {contentData.reactions.map((reaction, index) => (
            <ChoiceButton
              key={index}
              onClick={() => onChoiceSelect(reaction.nextId)}
            >
              <ChoiceText>{reaction.text}</ChoiceText>
            </ChoiceButton>
          ))}
        </ChoicesContainer>
      )}
    </Container>
  );
}

