import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { getLastReadStoryId } from '../../../utils/affinityStorage.js';

const Section = styled.section`
  padding: 0;
`;

const SectionTitle = styled.h2`
  margin: 0 0 12px 0;
  font-size: 18px; /* Dev 모드: 섹션 타이틀 18 */
  color: #ffffff;
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  position: relative;
`;

const Rail = styled.div`
  position: absolute;
  right: -7px;
  top: 1px;
  width: 5px;
  height: 242px;
  background: #1b1b1b;
  border-radius: 5px;
`;

const RailHighlight = styled.div`
  position: absolute;
  right: -7px;
  width: 5px;
  height: 43px;
  background: #f6d4ff;
  border-radius: 5px;
`;

const Item = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 98%;
  padding: 14px 10px; /* Dev 모드: px10 py14 */
  background: #1b1b1b;
  border: 1px solid #1b1b1b;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.06s ease;

  &:active {
    transform: translateY(1px);
  }
`;

const StoryTitle = styled.span`
  font-size: 13px;
  color: #ffffff;
  text-align: left;
  font-weight: 400;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
`;

const LockIcon = styled.img`
  width: 9px;
  height: 10.8px;
  flex-shrink: 0;
`;

const LockedItem = styled(Item)`
  opacity: 0.5;
  cursor: not-allowed;
  justify-content: flex-start;
  
  &:active {
    transform: none;
  }
`;

export default function StoryList({ stories, onStoryClick, book, activeStoryId }) {
  const [highlightTop, setHighlightTop] = useState(1);
  const [storageVersion, setStorageVersion] = useState(0);
  const itemRefs = useRef({});

  const list = useMemo(() => {
    const storyList = stories ?? book?.stories ?? [];
    return Array.isArray(storyList) ? storyList : [];
  }, [stories, book?.stories]);

  // 마지막으로 읽은 스토리 ID 가져오기 (storageVersion이 변경되면 다시 계산)
  const lastReadStoryId = useMemo(() => getLastReadStoryId(), [storageVersion]);

  // 다음 읽을 스토리 인덱스 찾기
  const nextStoryIndex = useMemo(() => {
    // 마지막으로 읽은 스토리 인덱스 찾기
    let lastReadIndex = -1;
    list.forEach((story, index) => {
      if (story.storyId === lastReadStoryId) {
        lastReadIndex = index;
      }
    });

    // 다음 스토리 인덱스 결정
    let targetIndex = lastReadIndex + 1;
    
    // 다음 스토리가 없거나 잠겨있으면 마지막으로 읽은 스토리에 표시
    if (targetIndex >= list.length || (list[targetIndex] && list[targetIndex].locked)) {
      targetIndex = Math.max(0, lastReadIndex);
    }

    // 스토리를 하나도 안 읽은 경우 첫 번째 스토리에 표시
    if (lastReadIndex === -1) {
      targetIndex = 0;
    }

    return targetIndex;
  }, [list, lastReadStoryId]);

  // RailHighlight 위치 계산
  useEffect(() => {
    const itemElement = itemRefs.current[`story-${nextStoryIndex}`];
    if (itemElement) {
      const listElement = itemElement.parentElement;
      if (listElement) {
        const itemTop = itemElement.offsetTop;
        setHighlightTop(itemTop + 1);
      }
    } else {
      // 폴백: 아이템 높이와 gap을 기반으로 계산
      // 아이템 높이: padding(14px * 2) + 텍스트 높이(약 13px) = 약 41px
      // gap: 8px
      // 총: 49px
      const itemHeight = 49; // 대략적인 값
      setHighlightTop(1 + nextStoryIndex * itemHeight);
    }
  }, [nextStoryIndex, list]);

  // localStorage 변경 감지
  useEffect(() => {
    const handleStorageChange = (e) => {
      // 다른 탭에서 last_read_story 또는 completed_stories가 변경된 경우에만 업데이트
      if (!e || e.key === 'last_read_story' || e.key === 'completed_stories') {
        setStorageVersion(prev => prev + 1);
      }
    };

    const handleCustomEvent = () => {
      // 같은 탭에서의 변경 감지
      setStorageVersion(prev => prev + 1);
    };

    window.addEventListener('storage', handleStorageChange);
    // 같은 탭에서의 변경도 감지하기 위해 커스텀 이벤트 리스너 추가
    window.addEventListener('affinityUpdated', handleCustomEvent);
    window.addEventListener('lastReadStoryUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('affinityUpdated', handleCustomEvent);
      window.removeEventListener('lastReadStoryUpdated', handleCustomEvent);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <Section>
      <SectionTitle>5가지 이야기</SectionTitle>
      <List>
        <Rail />
        <RailHighlight 
          style={{ top: `${highlightTop}px` }}
        />
        {list.map((story, index) => {
          const isActive = activeStoryId && activeStoryId === story.storyId;
          const isLocked = story.locked === true;
          const isNextStory = index === nextStoryIndex;
          const ItemComponent = isLocked ? LockedItem : Item;
          
          return (
            <ItemComponent
              key={story.storyId}
              ref={(el) => {
                if (el) {
                  itemRefs.current[`story-${index}`] = el;
                }
              }}
              onClick={() => !isLocked && onStoryClick?.(story.viewpointsDataUrl)}
              disabled={isLocked}
              data-story-id={story.storyId}
              style={isActive ? { color: '#f6d4ff', borderColor: '#f6d4ff' } : undefined}
            >
              {isLocked ? (
                <TitleWrapper>
                  <StoryTitle 
                    style={
                      isActive || isNextStory 
                        ? { color: '#f6d4ff' } 
                        : undefined
                    }
                  >
                    {story.title}
                  </StoryTitle>
                  <LockIcon src="/images/story-lock.svg" alt="locked" />
                </TitleWrapper>
              ) : (
                <StoryTitle 
                  style={
                    isActive || isNextStory 
                      ? { color: '#f6d4ff' } 
                      : undefined
                  }
                >
                  {story.title}
                </StoryTitle>
              )}
            </ItemComponent>
          );
        })}
      </List>
    </Section>
  );
}

