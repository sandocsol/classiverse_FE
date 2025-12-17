import React from 'react';
import styled from 'styled-components';

const GridContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  width: 100%;
`;

const NebulaItem = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  transition: transform 0.2s ease;
  opacity: ${props => props.$isLocked ? 0.5 : 1};

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const NebulaImageWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`;

const NebulaImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
`;

const LockIcon = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 18px;
  height: 22px;
  display: ${props => props.isLocked ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 2;
  pointer-events: none;
`;

const LockImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 100%;
`;

const BookTitle = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #ffffff;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

/**
 * 책 제목을 7글자로 제한하는 헬퍼 함수
 * 공백을 포함하여 7글자 이상이면 앞 7글자만 표시하고 '...' 추가
 */
const truncateTitle = (title) => {
  if (!title) return '';
  if (title.length <= 6) return title;
  return title.slice(0, 6) + '...';
};

/**
 * 작가명을 7글자로 제한하는 헬퍼 함수
 * 공백을 포함하여 7글자 이상이면 앞 7글자만 표시하고 '...' 추가
 */
const truncateAuthor = (author) => {
  if (!author) return '';
  if (author.length <= 8) return author;
  return author.slice(0, 8) + '...';
};

const AuthorName = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
`;

/**
 * 성운(책) 그리드 컴포넌트
 * 한 줄에 3개씩 표시되는 재사용 가능한 컴포넌트
 * 
 * @param {Array} books - 책 데이터 배열
 * @param {Function} onBookClick - 책 클릭 시 호출되는 콜백 (bookId를 인자로 받음)
 * @param {Object} categoryLockStatus - 카테고리별 잠금 상태 (categoryId를 키로 사용)
 */
export default function NebulaGrid({ books, onBookClick, categoryLockStatus = {} }) {
  if (!books || books.length === 0) {
    return null;
  }

  // 3개씩 묶어서 행(row) 단위로 그룹화
  const rows = [];
  for (let i = 0; i < books.length; i += 3) {
    rows.push(books.slice(i, i + 3));
  }

  const handleBookClick = (book) => {
    // 카테고리 또는 책이 잠겨있으면 클릭 불가
    const isCategoryLocked = categoryLockStatus[book.categoryId] === false;
    // bookImages 배열이 비어있으면 잠금 상태
    const isBookLocked = !book.bookImages || book.bookImages.length === 0;
    if (!isCategoryLocked && !isBookLocked && onBookClick) {
      onBookClick(book.bookId);
    }
  };

  return (
    <GridContainer>
      {rows.map((row, rowIndex) => (
        <Row key={rowIndex}>
          {row.map((book) => {
            // 카테고리 또는 책의 잠금 상태 확인
            const isCategoryLocked = categoryLockStatus[book.categoryId] === false;
            // bookImages 배열이 비어있으면 잠금 상태
            const isBookLocked = !book.bookImages || book.bookImages.length === 0;
            const isLocked = isCategoryLocked || isBookLocked;

            return (
              <NebulaItem
                key={book.bookId}
                onClick={() => handleBookClick(book)}
                disabled={isLocked}
                $isLocked={isLocked}
              >
                <NebulaImageWrapper>
                  <NebulaImage
                    src={book.planetImage}
                    /** 목업 처리 시
                     * src={book.planetImage || '/public/images/planet-images/오만과편견.png'}
                    */
                    alt={book.title}
                    isLocked={isLocked}
                  />
                  {isLocked && (
                    <LockIcon isLocked={isLocked}>
                      <LockImage
                        src="/lock.svg"
                        alt="잠금"
                      />
                    </LockIcon>
                  )}
                </NebulaImageWrapper>
                <BookInfo>
                  <BookTitle>{truncateTitle(book.title)}</BookTitle>
                  <AuthorName>{truncateAuthor(book.author)}</AuthorName>
                </BookInfo>
              </NebulaItem>
            );
          })}
          {/* 빈 슬롯 채우기 (3개 미만일 경우) */}
          {Array.from({ length: 3 - row.length }).map((_, emptyIndex) => (
            <div key={`empty-${emptyIndex}`} style={{ visibility: 'hidden' }} />
          ))}
        </Row>
      ))}
    </GridContainer>
  );
}
