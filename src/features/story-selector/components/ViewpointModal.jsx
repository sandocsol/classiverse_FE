import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import useViewpoints from '../hooks/useViewpoints.js';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: grid;
  place-items: center;
  z-index: 1000;
`;

const ModalCard = styled.div`
  background: #212121;
  border-radius: 22px;
  padding: 34.1px;
  width: 320px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 11px;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4.4px;
  align-items: center;
  text-align: center;
`;

const Title = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 600;
  font-size: 20px;
  line-height: 19.8px;
  color: #ffffff;
`;

const Prompt = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 13px;
  line-height: 19.8px;
  color: rgba(255, 255, 255, 0.5);
`;

const ViewpointList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 11px;
  align-items: flex-start;
  width: 110%;
  cursor: pointer;
`;

const ViewpointButton = styled.button`
  background: #2a2a2a;
  border: none;
  border-radius: 16.5px;
  padding:0 0 5.5px 0;
  display: flex;
  gap: 4.4px;
  align-items: center;
  width: 100%;
  cursor: pointer;
  box-sizing: border-box;
  transition: background 0.2s;

  &:hover {
    background: #333333;
  }

  &:active {
    background: #2a2a2a;
  }
`;

const AvatarCircle = styled.div`
  position: relative;
  width: 85px;
  height: 85px;
  border-radius: 50%;
  overflow: hidden;
  border: none;
  background: none;
  flex-shrink: 0;
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

const ViewpointInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
  padding-top: 5.5px;
  flex: 1;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  gap: 4.4px;
  align-items: center;
`;

const CharacterName = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 700;
  font-size: 15px;
  line-height: normal;
  color: #ffffff;
  white-space: nowrap;
`;

const Tag = styled.div`
  background: #ffffff;
  border-radius: 8.8px;
  padding: 4.4px 6.6px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const TagText = styled.span`
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 700;
  font-size: 10px;
  line-height: 8.8px;
  color: #c255df;
  opacity: 0.8;
`;

const Preview = styled.div`
  font-family: 'Pretendard Variable', sans-serif;
  font-weight: 400;
  font-size: 12px;
  line-height: 14.3px;
  color: rgba(255, 255, 255, 0.9);
  min-width: 0;
  text-align: left;
`;

const PreviewLine = styled.p`
  margin: 0;
`;

const LoadingText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
`;

const ErrorText = styled.p`
  margin: 0;
  font-family: 'Pretendard Variable', sans-serif;
  font-size: 14px;
  color: rgba(255, 100, 100, 0.9);
  text-align: center;
`;

export default function ViewpointModal({ storyId, onClose }) {
  const navigate = useNavigate();
  const { data, loading, error } = useViewpoints(storyId);

  const handleOverlayClick = () => {
    if (onClose) onClose();
  };

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  const handleViewpointClick = (viewpoint) => {
    if (data?.storyId && viewpoint?.characterId) {
      // characterId를 문자열로 변환 (URL 파라미터는 문자열이어야 함)
      const characterId = String(viewpoint.characterId);
      // startContentId가 있으면 사용하고, 없으면 기본값 1 사용
      const startContentId = viewpoint.startContentId ?? 1;
      navigate(`/story/${data.storyId}/${characterId}/${startContentId}`);
      if (onClose) onClose();
    }
  };

  const formatPreview = (preview) => {
    if (!preview) return [];
    return preview.split('\n').filter((line) => line.trim());
  };

  return (
    <Overlay role="dialog" aria-modal="true" onClick={handleOverlayClick}>
      <ModalCard onClick={stopPropagation}>
        {loading && <LoadingText>시점 정보를 불러오는 중…</LoadingText>}
        {error && !loading && (
          <ErrorText>시점 정보를 불러오지 못했습니다.</ErrorText>
        )}

        {!loading && !error && data && (
          <>
            <Header>
              <Title>{data.storyTitle}</Title>
              <Prompt>{data.prompt}</Prompt>
            </Header>

            <ViewpointList>
              {data.viewpoints?.map((viewpoint) => {
                const previewLines = formatPreview(viewpoint.preview);
                return (
                  <ViewpointButton
                    key={viewpoint.characterId}
                    onClick={() => handleViewpointClick(viewpoint)}
                  >
                    <AvatarCircle>
                      <AvatarImg
                        src={viewpoint.avatar}
                        alt={`${viewpoint.name} 아바타`}
                      />
                    </AvatarCircle>
                    <ViewpointInfo>
                      <NameRow>
                        <CharacterName>{viewpoint.name}</CharacterName>
                        {viewpoint.tag && (
                          <Tag>
                            <TagText>{viewpoint.tag}</TagText>
                          </Tag>
                        )}
                      </NameRow>
                      <Preview>
                        {previewLines.map((line, index) => (
                          <PreviewLine key={index}>{line}</PreviewLine>
                        ))}
                      </Preview>
                    </ViewpointInfo>
                  </ViewpointButton>
                );
              })}
            </ViewpointList>
          </>
        )}
      </ModalCard>
    </Overlay>
  );
}

