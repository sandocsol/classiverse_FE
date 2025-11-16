import { useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import BookInfoHeader from '../features/book-detail/components/BookInfoHeader.jsx';
import StoryList from '../features/book-detail/components/StoryList.jsx';
import CharacterList from '../features/book-detail/components/CharacterList.jsx';
import CharacterModal from '../features/character/components/CharacterModal.jsx';
import ViewpointModal from '../features/story-selector/components/ViewpointModal.jsx';
import useBookDetail from '../features/book-detail/hooks/useBookDetail.js';

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
  margin-top: 86px;
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
  width: 318px;
  margin: 0 auto 0 auto;
  display: flex;
  flex-direction: column;
  gap: 35px;
`;

const Divider = styled.hr`
  border: none;
  height: 8px;
  background: transparent;
  margin: 0;
`;

export default function BookDetailPage() {
  const { bookId } = useParams();
  const { data: bookData, loading, error } = useBookDetail(bookId);

  const [characterModalUrl, setCharacterModalUrl] = useState(null);
  const [viewpointModalUrl, setViewpointModalUrl] = useState(null);

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
        />
        <CharacterList book={bookData} onCharacterClick={setCharacterModalUrl} />
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
    </PageContainer>
  );
}


