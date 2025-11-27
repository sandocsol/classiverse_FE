import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import BookInfoHeader from '../features/book-detail/components/BookInfoHeader.jsx';
import StoryList from '../features/book-detail/components/StoryList.jsx';
import CharacterList from '../features/book-detail/components/CharacterList.jsx';
import CharacterModal from '../features/character/components/CharacterModal.jsx';
import ViewpointModal from '../features/story-selector/components/ViewpointModal.jsx';
import StoryLockModal from '../features/book-detail/components/StoryLockModal.jsx';
import useBookDetail from '../features/book-detail/hooks/useBookDetail.js';
import { getOrCreateUserId, getAffinityData } from '../utils/affinityStorage.js';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
`;

const HeroWrap = styled.div`
  position: relative;
  width: 100%;
  height: 202.727px;
  margin-top: calc(86 / 812 * 100vh);
`;

const HeroArt = styled.img`
  position: absolute;
  left: 50%;
  top: 44.73px;
  width: 100%;
  height: 100%;
  transform: translateX(-50%);
  object-fit: contain;
  pointer-events: none;
`;

const Content = styled.div`
  width: 100%;
  padding: 0 28px;
  display: flex;
  flex-direction: column;
  gap: 35px;
`;

const FullBleed = styled.div`
  margin: 0 -28px;
`;

export default function BookDetailPage() {
  const { bookId } = useParams();
  const { data: bookData, loading, error } = useBookDetail(bookId);

  const [characterModalUrl, setCharacterModalUrl] = useState(null);
  const [viewpointModalUrl, setViewpointModalUrl] = useState(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockedStoryId, setLockedStoryId] = useState(null);

  // 사용자 ID 생성 및 초기 친밀도 데이터 초기화
  useEffect(() => {
    // 사용자 ID 생성 (최초 접속 시)
    getOrCreateUserId();

    // 등장인물 목록이 있으면 초기 친밀도 데이터 생성
    if (bookData?.characters && Array.isArray(bookData.characters)) {
      const characterIds = bookData.characters.map(char => char.characterId);
      // 초기 데이터 생성 (이미 있으면 업데이트만, 없으면 생성)
      getAffinityData(characterIds);
    }
  }, [bookData]);

  if (loading) {
    return <PageContainer style={{ padding: 20 }}>로딩 중…</PageContainer>;
  }

  if (error) {
    return (
      <PageContainer style={{ padding: 20 }}>
        데이터를 불러오지 못했습니다.
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <HeroWrap>
        <HeroArt src={bookData?.heroImage || bookData?.coverImage} alt="" />
      </HeroWrap>
      <Content>
        <BookInfoHeader book={bookData} />
        <StoryList
          book={bookData}
          onStoryClick={setViewpointModalUrl}
          activeStoryId={bookData?.activeStoryId}
          onLockedStoryClick={(storyId) => {
            setLockedStoryId(storyId);
            setShowLockModal(true);
          }}
        />
        <FullBleed>
          <CharacterList book={bookData} onCharacterClick={setCharacterModalUrl} />
        </FullBleed>
      </Content>

      {characterModalUrl ? (
        <CharacterModal
          dataUrl={characterModalUrl}
          onClose={() => setCharacterModalUrl(null)}
        />
      ) : null}

      {viewpointModalUrl ? (
        <ViewpointModal
          dataUrl={viewpointModalUrl}
          onClose={() => setViewpointModalUrl(null)}
        />
      ) : null}

      {showLockModal ? (
        <StoryLockModal
          onClose={() => {
            setShowLockModal(false);
            setLockedStoryId(null);
          }}
          storyId={lockedStoryId}
        />
      ) : null}
    </PageContainer>
  );
}


