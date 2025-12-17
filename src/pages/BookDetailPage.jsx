import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

import BookInfoHeader from '../features/book-detail/components/BookInfoHeader.jsx';
import StoryList from '../features/book-detail/components/StoryList.jsx';
import CharacterList from '../features/book-detail/components/CharacterList.jsx';
import CharacterModal from '../features/character/components/CharacterModal.jsx';
import ViewpointModal from '../features/story-selector/components/ViewpointModal.jsx';
import StoryLockModal from '../features/book-detail/components/StoryLockModal.jsx';
import useBookDetail from '../features/book-detail/hooks/useBookDetail.js';
import { getOrCreateUserId } from '../utils/affinityStorage.js';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: calc(26px - (75px - 12px) / 2);
  top: calc(50px - (71px - 16px) / 2);
  width: 75px;
  height: 71px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: opacity 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(50% 50% at 50% 50%, rgba(0, 0, 0, 0.80) 0%, rgba(0, 0, 0, 0.00) 100%);
    border-radius: 50%;
    z-index: -1;
  }

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  img {
    width: 12px;
    height: 16px;
    object-fit: contain;
    position: relative;
    z-index: 1;
  }
`;

const BookImageCarousel = styled.div`
  position: relative;
  width: 375px;
  height: 280px;
  margin: 0 auto;
  overflow: hidden;

  /* 🔥 하단 radius 제거 — 계단/박스 착시의 주범 */
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;

  /* ❗ 배경색 절대 주지 마세요 (투명 필수) */

  /* 👇 피그마식 “자연스러운 어둠 연결” */
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 90px;
    pointer-events: none;
    z-index: 2;

    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 0.25) 55%,
      rgba(0, 0, 0, 0.6) 80%,
      rgba(0, 0, 0, 1) 100%
    );
  }
`;

const CarouselImage = styled.img`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;

  opacity: ${({ $isActive }) => ($isActive ? 1 : 0)};
  transition: opacity 0.5s ease-in-out;
  pointer-events: none;

  /* 🎯 이미지 자체를 아래에서 자연스럽게 사라지게 */
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 72%,
    rgba(0, 0, 0, 0.85) 78%,
    rgba(0, 0, 0, 0.6) 84%,
    rgba(0, 0, 0, 0.35) 90%,
    rgba(0, 0, 0, 0.15) 95%,
    rgba(0, 0, 0, 0) 100%
  );

  -webkit-mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 1) 72%,
    rgba(0, 0, 0, 0.85) 78%,
    rgba(0, 0, 0, 0.6) 84%,
    rgba(0, 0, 0, 0.35) 90%,
    rgba(0, 0, 0, 0.15) 95%,
    rgba(0, 0, 0, 0) 100%
  );
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
  const navigate = useNavigate();
  const { data: bookData, loading, error } = useBookDetail(bookId);

  const [characterId, setCharacterId] = useState(null);
  const [viewpointStoryId, setViewpointStoryId] = useState(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [lockedStoryId, setLockedStoryId] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // 사용자 ID 생성 (최초 접속 시)
  useEffect(() => {
    getOrCreateUserId();
  }, []);

  // 목 데이터 이미지 경로 (백엔드 작업 중일 때 사용)
  const mockBookImages = useMemo(() => [
    '/images/covers/bookcover1.png',
    '/images/covers/bookcover2.png',
    '/images/covers/bookcover3.png',
    '/images/covers/bookcover4.png',
    '/images/covers/bookcover5.png',
  ], []);

  // 실제 데이터가 있으면 사용하고, 없으면 목 데이터 사용
  const bookImages = useMemo(() => {
    return bookData?.bookImages && bookData.bookImages.length > 0
      ? bookData.bookImages
      : mockBookImages;
  }, [bookData, mockBookImages]);

  // 이미지 배열이 변경되면 인덱스 리셋
  const bookImagesKey = bookData?.bookImages?.length ?? 0;
  
  useEffect(() => {
    // 비동기로 처리하여 cascading renders 방지
    const timeoutId = setTimeout(() => {
      setCurrentImageIndex(0);
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [bookImagesKey]);

  // 이미지 자동 캐러셀 애니메이션
  useEffect(() => {
    if (bookImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === bookImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // 3초마다 이미지 변경

    return () => clearInterval(interval);
  }, [bookImages]);

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

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <PageContainer>
      <BackButton onClick={handleBackClick} aria-label="뒤로가기">
        <img src="/images/icons/back-btn.svg" alt="뒤로가기" />
      </BackButton>
      {bookImages.length > 0 && (
        <BookImageCarousel>
          {bookImages.map((imageUrl, index) => (
            <CarouselImage
              key={index}
              src={imageUrl}
              alt={`${bookData?.title || 'Book'} cover ${index + 1}`}
              $isActive={index === currentImageIndex}
            />
          ))}
        </BookImageCarousel>
      )}
      <Content>
        <BookInfoHeader book={bookData} />
        <StoryList
          book={bookData}
          onStoryClick={setViewpointStoryId}
          activeStoryId={bookData?.activeStoryId}
          onLockedStoryClick={(storyId) => {
            setLockedStoryId(storyId);
            setShowLockModal(true);
          }}
        />
        <FullBleed>
          <CharacterList 
            book={bookData} 
            onCharacterClick={(arg) => {
              // CharacterList에서 객체로 전달될 수도 있고, characterId만 전달될 수도 있음
              const characterId = typeof arg === 'object' ? arg.characterId : arg;
              setCharacterId(characterId);
            }} 
          />
        </FullBleed>
      </Content>

      {characterId ? (
        <CharacterModal
          bookId={bookId}
          characterId={characterId}
          onClose={() => setCharacterId(null)}
        />
      ) : null}

      {viewpointStoryId ? (
        <ViewpointModal
          storyId={viewpointStoryId}
          onClose={() => setViewpointStoryId(null)}
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
