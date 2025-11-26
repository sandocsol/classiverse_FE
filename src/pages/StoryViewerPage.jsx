import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useStoryContent from '../features/story-viewer/hooks/useStoryContent.js';
import ScenePresenter from '../features/story-viewer/components/ScenePresenter.jsx';
import StoryEndScreen from '../features/story-viewer/components/StoryEndScreen.jsx';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #070707;
  position: relative;
  overflow: hidden;
`;

const LoadingText = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const ErrorText = styled.p`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  color: rgba(255, 100, 100, 0.9);
  text-align: center;
`;

export default function StoryViewerPage() {
  const { storyId, characterId, sceneId } = useParams();
  const navigate = useNavigate();
  
  // 모든 hooks는 early return 전에 호출되어야 합니다
  const dataUrl = storyId && characterId 
    ? `/data/story-content/${storyId}_${characterId}.json`
    : null;
  const { data: storyContent, loading, error } = useStoryContent(dataUrl);

  // sceneId가 없으면 시작 씬으로 리다이렉트
  useEffect(() => {
    if (storyContent?.startSceneId && !sceneId) {
      navigate(`/story/${storyId}/${characterId}/${storyContent.startSceneId}`, { replace: true });
    }
  }, [storyContent, sceneId, storyId, characterId, navigate]);

  if (!storyId || !characterId) {
    return (
      <PageContainer>
        <ErrorText>스토리 ID 또는 캐릭터 ID가 없습니다.</ErrorText>
      </PageContainer>
    );
  }

  const handleChoiceSelect = (nextSceneId) => {
    navigate(`/story/${storyId}/${characterId}/${nextSceneId}`);
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingText>스토리를 불러오는 중…</LoadingText>
      </PageContainer>
    );
  }

  if (error || !storyContent) {
    return (
      <PageContainer>
        <ErrorText>스토리를 불러오지 못했습니다.</ErrorText>
      </PageContainer>
    );
  }

  // sceneId가 없으면 리다이렉트 대기 중
  if (!sceneId) {
    return (
      <PageContainer>
        <LoadingText>씬을 준비하는 중…</LoadingText>
      </PageContainer>
    );
  }

  const currentSceneData = storyContent.scenes[sceneId];

  if (!currentSceneData) {
    return (
      <PageContainer>
        <ErrorText>씬 데이터를 찾을 수 없습니다.</ErrorText>
      </PageContainer>
    );
  }

  if (currentSceneData.type === 'end-screen') {
    return (
      <PageContainer>
        <StoryEndScreen 
          endData={currentSceneData} 
          characterId={characterId} 
          storyId={storyId}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ScenePresenter
        storyTitle={storyContent.storyTitle}
        characterName={storyContent.characterName}
        characterAvatar={storyContent.characterAvatar}
        sceneData={currentSceneData}
        onChoiceSelect={handleChoiceSelect}
      />
    </PageContainer>
  );
}

