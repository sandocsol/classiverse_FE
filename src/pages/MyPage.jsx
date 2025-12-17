import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../features/auth/hooks/useAuth.js';
import { getUserProfile } from '../features/auth/api/authApi.js';
import useProfileCharacters from '../features/profile/hooks/useProfileCharacters.js';
import CharacterList from '../features/book-detail/components/CharacterList.jsx';
import NicknameEditModal from '../features/profile/components/NicknameEditModal.jsx';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: #070707;
  padding-top: 90px;
  box-sizing: border-box;
  position: relative;
`;

const BackButton = styled.button`
  position: absolute;
  left: 26px;
  top: 50px;
  width: 12px;
  height: 16px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ProfileSection = styled.section`
  display: flex;
  flex-direction: column;
  padding: 0 29px;
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
`;

const AvatarCircle = styled.div`
  position: relative;
  width: 171px;
  height: 171px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 20px;
  border: 1px solid #000000;
`;

const AvatarImg = styled.img`
  position: absolute;
  left: 50%;
  top: 85%;
  transform: translate(-50%, -55%);
  width: 120%;
  height: auto;
  object-fit: contain;
  /* filter: drop-shadow(0px -2px 4px rgba(255,255,255,0.9)); */
`;

const NicknameRow = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
`;

const Nickname = styled.span`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  text-align: center;
  padding-bottom: 4px;
  white-space: nowrap;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    height: 2px;
    background-color: #424242;
  }
`;

const EditButton = styled.button`
  position: absolute;
  left: ${props => props.$leftOffset ? `calc(50% + ${props.$leftOffset}px)` : 'calc(50% + 8px)'};
  transform: translateX(0);
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 13px;
  height: 13px;
  color: #424242;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }

  path {
    fill: currentColor;
  }

  &:active {
    opacity: 0.7;
  }
`;

const FriendsSection = styled.section`
  padding: 0;
  margin-bottom: 40px;
`;

const FriendsHeader = styled.div`
  margin-bottom: 7px;
  padding-left: 28px;
`;

const FriendsTitle = styled.h2`
  margin: 0 0 7px 0;
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
`;

const FriendsSubtitle = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
`;

const LoadingText = styled.p`
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
`;

const ErrorText = styled.p`
  color: rgba(255, 100, 100, 0.9);
  text-align: center;
  padding: 40px 20px;
  font-size: 14px;
`;

// 목 데이터 사용 여부 (환경 변수로 제어)
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, reloadUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const { data: characters, loading: loadingCharacters, error: charactersError } = useProfileCharacters();
  const nicknameRef = useRef(null);
  const [editButtonOffset, setEditButtonOffset] = useState(8);

  // 프로필 정보 로드
  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        if (USE_MOCK_DATA) {
          // 목 데이터 모드: 목 데이터 파일에서 직접 로드
          const response = await fetch('/data/profile-me.json');
          const profileData = await response.json();
          if (!cancelled) {
            setProfile(profileData);
          }
        } else {
          // 실제 API 모드: AuthProvider의 user가 있으면 사용, 없으면 직접 API 호출
          if (user) {
            setProfile(user);
          } else {
            const profileData = await getUserProfile();
            if (!cancelled) {
              setProfile(profileData);
            }
          }
        }
      } catch (err) {
        console.error('프로필 로드 실패:', err);
        // 에러 발생 시에도 로딩은 완료 처리
        if (!cancelled) {
          // 목 데이터 모드에서 에러 발생 시 기본값 설정
          if (USE_MOCK_DATA) {
            setProfile({
              nickname: '코난',
              profileImage: '/images/astronauts/astronaut-orange.png'
            });
          }
        }
      } finally {
        if (!cancelled) {
          setLoadingProfile(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // 닉네임 너비 측정하여 EditButton 위치 조정
  useEffect(() => {
    if (nicknameRef.current && profile?.nickname) {
      const nicknameWidth = nicknameRef.current.offsetWidth;
      const gap = 8;
      setEditButtonOffset(nicknameWidth / 2 + gap);
    }
  }, [profile?.nickname]);

  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleNicknameUpdate = async (newNickname) => {
    if (USE_MOCK_DATA) {
      // 목 데이터 모드: 로컬 상태만 업데이트
      setProfile(prev => ({
        ...prev,
        nickname: newNickname
      }));
    } else {
      // 실제 API 모드: 프로필 정보 다시 로드
      if (reloadUser) {
        await reloadUser();
      }
      // 프로필 상태 업데이트
      const updatedProfile = await getUserProfile();
      setProfile(updatedProfile);
    }
  };

  const handleCharacterClick = (characterId) => {
    // CharacterList에서 캐릭터 클릭 시 처리
    // 필요시 캐릭터 상세 페이지로 이동하거나 모달 표시
    console.log('Character clicked:', characterId);
  };

  const handleBackClick = () => {
    navigate('/search');
  };

  if (loadingProfile) {
    return (
      <PageContainer>
        <LoadingText>프로필을 불러오는 중...</LoadingText>
      </PageContainer>
    );
  }

  if (!profile) {
    return (
      <PageContainer>
        <ErrorText>프로필을 불러오지 못했습니다.</ErrorText>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <BackButton onClick={handleBackClick} aria-label="뒤로가기">
        <img src="/images/icons/back-btn.svg" alt="뒤로가기" />
      </BackButton>
      <ProfileSection>
        <SectionTitle>내 프로필</SectionTitle>
        <AvatarCircle>
          <AvatarImg 
            src={profile.profileImage || '/images/default-avatar.png'} 
            alt="프로필 이미지" 
          />
        </AvatarCircle>
        <NicknameRow>
          <Nickname ref={nicknameRef}>{profile.nickname || '닉네임 없음'}</Nickname>
          <EditButton $leftOffset={editButtonOffset} onClick={handleEditClick} aria-label="닉네임 수정">
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M11.8854 0.617369C11.4899 0.222068 10.9537 0 10.3946 0C9.83545 0 9.29921 0.222068 8.90379 0.617369L8.40687 1.115L11.8861 4.59419L12.3823 4.09726C12.5781 3.90145 12.7335 3.66899 12.8395 3.41314C12.9454 3.15729 13 2.88306 13 2.60613C13 2.32919 12.9454 2.05497 12.8395 1.79912C12.7335 1.54327 12.5781 1.3108 12.3823 1.115L11.8854 0.617369ZM10.8915 5.58804L7.41231 2.10885L1.02326 8.49861C0.883444 8.63845 0.785777 8.81478 0.741408 9.00748L0.018158 12.1388C-0.00879056 12.255 -0.00569943 12.3762 0.0271401 12.4909C0.0599797 12.6056 0.121486 12.7101 0.205865 12.7945C0.290243 12.8789 0.394715 12.9404 0.509436 12.9732C0.624158 13.0061 0.745351 13.0091 0.861598 12.9822L3.99357 12.2596C4.18602 12.2152 4.3621 12.1175 4.50174 11.9778L10.8915 5.58804Z" />
            </svg>
          </EditButton>
        </NicknameRow>
      </ProfileSection>

      <FriendsSection>
        <FriendsHeader>
          <FriendsTitle>친구 목록</FriendsTitle>
          <FriendsSubtitle>모험을 하며 이런 친구를 사귀었어요</FriendsSubtitle>
        </FriendsHeader>
        {loadingCharacters ? (
          <LoadingText>친구 목록을 불러오는 중...</LoadingText>
        ) : charactersError ? (
          <ErrorText>친구 목록을 불러오지 못했습니다.</ErrorText>
        ) : (
          <CharacterList 
            characters={characters} 
            onCharacterClick={handleCharacterClick}
            hideTitle={true}
          />
        )}
      </FriendsSection>

      {showEditModal && (
        <NicknameEditModal
          currentNickname={profile.nickname}
          onClose={() => setShowEditModal(false)}
          onUpdate={handleNicknameUpdate}
        />
      )}
    </PageContainer>
  );
}

