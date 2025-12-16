import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useCategories from '../features/search/hooks/useCategories.js';
import useCategoryBooks from '../features/search/hooks/useCategoryBooks.js';
import NebulaGrid from '../features/search/components/NebulaGrid.jsx';

// 사용자 프로필 아바타 컨테이너
const UserProfileContainer = styled.div`
  position: absolute;
  top: 50px;
  right: 30px;
  width: 45px;
  height: 45px;
  border-radius: 100px;
  background: #1B1B1B;
  overflow: hidden;
  cursor: pointer;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
`;

 // 사용자 프로필 아이콘
const UserProfileIcon = styled.img`
  position: absolute;
  left: 50%;
  top: -22px;
  transform: translateX(-50%);
  width: 133%;
  height: auto;
  object-fit: contain;
  object-position: center top;
`;

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  background: #070707;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
`;

const CategoryNavigation = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 90%;
  max-width: 330px;
  margin-left: auto;
  margin-right: auto;
  padding: 14px 14px 15px 14.5px;
  margin-top: 120px;
  box-sizing: border-box;
  border-radius: 20px;
  background: #1B1B1B;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  transition: opacity 0.2s ease;

  &:disabled {
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    opacity: 0.8;
  }

  &:not(:disabled):active {
    opacity: 0.6;
  }
`;

const ArrowIconSvg = styled.svg`
  width: 12px;
  height: 12px;
  transition: fill 0.2s ease;
`;

const ArrowPath = styled.path`
  fill: ${props => props.$isActive ? '#F6D4FF' : 'rgba(255, 255, 255, 0.3)'};
  stroke: ${props => props.$isActive ? '#F6D4FF' : 'rgba(255, 255, 255, 0.3)'};
  stroke-width: 0.5;
  stroke-linejoin: round;
  transition: fill 0.2s ease, stroke 0.2s ease;
`;

const LeftArrowWrapper = styled.div`
  transform: scaleX(-1);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryNameGroup = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex: 1;
  min-width: 0;
  padding: 0 20px;
`;

const NebulaOrderText = styled.p`
  margin: 0;
  color: #F6D4FF;
  text-align: center;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
  white-space: nowrap;
`;

const CategoryNameText = styled.p`
  margin: 0;
  color: #FFF;
  text-align: center;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
  white-space: nowrap;
`;

const ContentArea = styled.div`
  width: 98%;
  max-width: 360px;
  margin-top: 20px;
  margin-left: auto;
  margin-right: auto;
  padding: 20px 0 40px;
  box-sizing: border-box;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 28px;
`;

const LoadingText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 28px;
  gap: 16px;
`;

const ErrorText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 100, 100, 0.9);
  text-align: center;
`;

const RetryButton = styled.button`
  background: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: #070707;
  cursor: pointer;
  transition: background 0.2s ease;

  &:active {
    background: #f5f5f5;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 40px 28px;
`;

const EmptyText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
`;

export default function SearchPage() {
  const navigate = useNavigate();
  
  // 카테고리 데이터 및 사용자 프로필 이미지 로드
  const { 
    data: categoriesData, 
    userProfileImage: userProfileImageFromHook, 
    loading: categoriesLoading, 
    error: categoriesError 
  } = useCategories();
  
  // 카테고리별 잠금 상태 맵 생성 (categoryId -> unlocked boolean)
  const categoryLockStatus = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData)) return {};
    
    return categoriesData.reduce((acc, category) => {
      acc[category.categoryId] = category.unlocked;
      return acc;
    }, {});
  }, [categoriesData]);

  // 사용자 프로필 이미지 (목업: astronaut-orange.png, 실제 API 연동 시 백엔드에서 받은 값 사용)
  const userProfileImage = useMemo(() => {
    // 목업 모드일 때는 astronaut-orange.png 사용
    const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';
    if (USE_MOCK_DATA) {
      return '/images/astronauts/astronaut-orange.png';
    }
    
    // 실제 API 연동 시: useCategories 훅에서 이미 사용자 프로필 이미지를 추출한 경우
    if (userProfileImageFromHook) {
      return userProfileImageFromHook;
    }
    
    // 훅에서 추출하지 못한 경우, categoriesData에서 직접 추출 시도
    if (categoriesData && !Array.isArray(categoriesData)) {
      return categoriesData.userProfileImage || 
             categoriesData.avatarImage || 
             categoriesData.profileImage || 
             categoriesData.user?.profileImage ||
             categoriesData.user?.avatarImage ||
             null;
    }
    
    return null;
  }, [userProfileImageFromHook, categoriesData]);

  // 현재 선택된 카테고리 인덱스 (기본값: 0 - 첫 번째 카테고리 "19세기 영국")
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);

  // 현재 카테고리 정보
  const currentCategory = useMemo(() => {
    if (!categoriesData || !Array.isArray(categoriesData) || categoriesData.length === 0) {
      return null;
    }
    return categoriesData[currentCategoryIndex] || categoriesData[0];
  }, [categoriesData, currentCategoryIndex]);

  // 현재 카테고리의 책 목록 로드
  const { 
    data: booksData, 
    loading: booksLoading, 
    error: booksError 
  } = useCategoryBooks(currentCategory?.categoryId);

  // 카테고리 인덱스가 범위를 벗어나면 조정
  useEffect(() => {
    if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0) {
      if (currentCategoryIndex >= categoriesData.length) {
        setCurrentCategoryIndex(0);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesData]);

  // 네비게이션 핸들러
  const handlePrevCategory = () => {
    if (categoriesData && currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  const handleNextCategory = () => {
    if (categoriesData && currentCategoryIndex < categoriesData.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  // 책 클릭 핸들러
  const handleBookClick = (bookId) => {
    navigate(`/books/${bookId}`);
  };

  // 프로필 아바타 클릭 핸들러
  const handleProfileClick = () => {
    navigate('/mypage');
  };

  // 에러 상태에서 재시도
  const handleRetry = () => {
    window.location.reload();
  };

  // 카테고리 로딩 상태
  if (categoriesLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <LoadingText>카테고리를 불러오는 중...</LoadingText>
        </LoadingContainer>
      </PageContainer>
    );
  }

  // 카테고리 에러 상태
  if (categoriesError) {
    return (
      <PageContainer>
        <ErrorContainer>
          <ErrorText>카테고리를 불러오지 못했습니다.</ErrorText>
          <RetryButton onClick={handleRetry}>다시 시도</RetryButton>
        </ErrorContainer>
      </PageContainer>
    );
  }

  // 카테고리 데이터가 없을 때
  if (!categoriesData || !Array.isArray(categoriesData) || categoriesData.length === 0) {
    return (
      <PageContainer>
        <EmptyState>
          <EmptyText>표시할 카테고리가 없습니다.</EmptyText>
        </EmptyState>
      </PageContainer>
    );
  }

  // 이전/다음 버튼 활성화 여부
  const canGoPrev = currentCategoryIndex > 0;
  const canGoNext = currentCategoryIndex < categoriesData.length - 1;

  // 'n번째 성운' 텍스트 생성
  const nebulaOrdinal = `${['첫', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉', '열'][currentCategoryIndex] || (currentCategoryIndex + 1)}번째 성운`;

  // 카테고리 이름에서 'n번째 성운' 부분 제거 (있을 경우)
  const getCategoryNameOnly = (categoryName) => {
    if (!categoryName) return '카테고리 없음';
    // "n번째 성운 " 패턴 제거
    return categoryName.replace(/^[가-힣]*번째\s*성운\s+/, '').trim() || categoryName;
  };

  const categoryNameOnly = getCategoryNameOnly(currentCategory?.categoryName);

  return (
    <PageContainer>
      {/* 사용자 프로필 아바타 (오른쪽 상단, 상단에서 63px) */}
      <UserProfileContainer onClick={handleProfileClick}>
        <UserProfileIcon 
          src={userProfileImage || '/images/astronauts/astronaut-orange.png'} 
          alt="사용자 프로필"
          onError={(e) => {
            e.target.src = '/images/astronauts/astronaut-orange.png';
          }}
        />
      </UserProfileContainer>

      {/* 카테고리 네비게이션 바 */}
      <CategoryNavigation>
        <NavButton
          onClick={handlePrevCategory}
          disabled={!canGoPrev}
          aria-label="이전 카테고리"
        >
          <LeftArrowWrapper>
            <ArrowIconSvg viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ArrowPath
                d="M0.344159 11.7359C0.123794 11.5667 0 11.3373 0 11.098C0 10.8588 0.123794 10.6294 0.344159 10.4602L6.16269 5.99455L0.344159 1.52889C0.130039 1.35874 0.0115592 1.13086 0.0142373 0.894314C0.0169155 0.657771 0.140538 0.431499 0.358478 0.264233C0.576418 0.0969658 0.871238 0.00208855 1.17944 3.33786e-05C1.48764 -0.00202274 1.78457 0.0889101 2.00626 0.253245L8.65584 5.35673C8.87621 5.52591 9 5.75533 9 5.99455C9 6.23377 8.87621 6.4632 8.65584 6.63238L2.00626 11.7359C1.78583 11.905 1.4869 12 1.17521 12C0.863519 12 0.56459 11.905 0.344159 11.7359Z"
                $isActive={canGoPrev}
              />
            </ArrowIconSvg>
          </LeftArrowWrapper>
        </NavButton>

        <CategoryNameGroup>
          <NebulaOrderText>{nebulaOrdinal}</NebulaOrderText>
          <CategoryNameText>{categoryNameOnly}</CategoryNameText>
        </CategoryNameGroup>

        <NavButton
          onClick={handleNextCategory}
          disabled={!canGoNext}
          aria-label="다음 카테고리"
        >
          <ArrowIconSvg viewBox="0 0 9 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ArrowPath
              d="M0.344159 11.7359C0.123794 11.5667 0 11.3373 0 11.098C0 10.8588 0.123794 10.6294 0.344159 10.4602L6.16269 5.99455L0.344159 1.52889C0.130039 1.35874 0.0115592 1.13086 0.0142373 0.894314C0.0169155 0.657771 0.140538 0.431499 0.358478 0.264233C0.576418 0.0969658 0.871238 0.00208855 1.17944 3.33786e-05C1.48764 -0.00202274 1.78457 0.0889101 2.00626 0.253245L8.65584 5.35673C8.87621 5.52591 9 5.75533 9 5.99455C9 6.23377 8.87621 6.4632 8.65584 6.63238L2.00626 11.7359C1.78583 11.905 1.4869 12 1.17521 12C0.863519 12 0.56459 11.905 0.344159 11.7359Z"
              $isActive={canGoNext}
            />
          </ArrowIconSvg>
        </NavButton>
      </CategoryNavigation>

      {/* 책 목록 그리드 영역 (NebulaGrid 컴포넌트 재사용) */}
      <ContentArea>
        {booksLoading ? (
          <LoadingContainer>
            <LoadingText>책 목록을 불러오는 중...</LoadingText>
          </LoadingContainer>
        ) : booksError ? (
          <ErrorContainer>
            <ErrorText>책 목록을 불러오지 못했습니다.</ErrorText>
            <RetryButton onClick={handleRetry}>다시 시도</RetryButton>
          </ErrorContainer>
        ) : !booksData || !Array.isArray(booksData) || booksData.length === 0 ? (
          <EmptyState>
            <EmptyText>이 카테고리에 책이 없습니다.</EmptyText>
          </EmptyState>
        ) : (
          <NebulaGrid
            books={booksData?.map(book => ({
              ...book,
              categoryId: currentCategory?.categoryId
            })) || []}
            onBookClick={handleBookClick}
            categoryLockStatus={categoryLockStatus}
          />
        )}
      </ContentArea>
    </PageContainer>
  );
}
