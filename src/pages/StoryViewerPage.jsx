import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useStoryContent from '../features/story-viewer/hooks/useStoryContent.js';
import useViewpoints from '../features/story-selector/hooks/useViewpoints.js';
import ScenePresenter from '../features/story-viewer/components/ScenePresenter.jsx';
import StoryEndScreen from '../features/story-viewer/components/StoryEndScreen.jsx';
import ExitConfirmModal from '../features/story-viewer/components/ExitConfirmModal.jsx';

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

const ExitButton = styled.button`
  position: absolute;
  top: 44px;
  left: 25px;
  display: inline-flex;
  padding: 5px;
  align-items: center;
  gap: 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 100;
`;

const ExitIcon = styled.img`
  width: 18.2px;
  height: 18.2px;
  display: block;
`;

export default function StoryViewerPage() {
  const { storyId, characterId, contentId } = useParams();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  
  // 모든 hooks는 early return 전에 호출되어야 합니다
  const { data: contentData, loading, error } = useStoryContent(storyId, characterId, contentId);
  // contentId가 없을 때만 viewpointsData를 로드 (직접 URL 접근 시에만 필요)
  const { data: viewpointsData } = useViewpoints(!contentId ? storyId : null);

  // contentId가 없으면 시작 씬으로 리다이렉트
  useEffect(() => {
    if (!contentId && storyId && characterId && viewpointsData) {
      // 해당 캐릭터의 startContentId 찾기
      const viewpoint = viewpointsData.viewpoints?.find(
        v => v.characterId === Number(characterId)
      );
      const startContentId = viewpoint?.startContentId ?? 1;
      navigate(`/story/${storyId}/${characterId}/${startContentId}`, { replace: true });
    }
  }, [contentId, storyId, characterId, navigate, viewpointsData]);

  if (!storyId || !characterId) {
    return (
      <PageContainer>
        <ErrorText>스토리 ID 또는 캐릭터 ID가 없습니다.</ErrorText>
      </PageContainer>
    );
  }

  const handleChoiceSelect = (nextId) => {
    // nextId가 null이거나 undefined면 스토리 완료 화면으로 이동
    if (!nextId || nextId === null) {
      navigate(`/story/${storyId}/${characterId}/complete`);
      return;
    }
    // nextId가 있으면 다른 씬으로 이동
    navigate(`/story/${storyId}/${characterId}/${nextId}`);
  }

  // contentId가 'complete'이면 스토리 완료 화면 표시
  if (contentId === 'complete') {
    return (
      <PageContainer>
        <StoryEndScreen 
          storyId={storyId}
          characterId={characterId}
          initialCloseness={0}
        />
      </PageContainer>
    );
  }

  if (loading) {
    return (
      <PageContainer>
        <LoadingText>스토리를 불러오는 중…</LoadingText>
      </PageContainer>
    );
  }

  if (error || !contentData) {
    return (
      <PageContainer>
        <ErrorText>스토리를 불러오지 못했습니다.</ErrorText>
      </PageContainer>
    );
  }

  // contentId가 없으면 리다이렉트 대기 중
  if (!contentId) {
    return (
      <PageContainer>
        <LoadingText>씬을 준비하는 중…</LoadingText>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ExitButton onClick={() => setShowExitModal(true)} aria-label="나가기">
        <ExitIcon src="/images/storyviewer/exit.png" alt="나가기" />
      </ExitButton>
      <ScenePresenter
        storyTitle={contentData.storyTitle}
        characterName={contentData.characterName}
        characterId={characterId}
        contentData={contentData}
        onChoiceSelect={handleChoiceSelect}
      />
      {showExitModal && (
        <ExitConfirmModal onClose={() => setShowExitModal(false)} />
      )}
    </PageContainer>
  );
}

