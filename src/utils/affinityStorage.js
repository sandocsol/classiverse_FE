// 사용자 및 스토리 관련 데이터를 저장/조회할 때 사용하는 키
const USER_ID_KEY = 'unique_user_id';
const LAST_READ_STORY_KEY = 'last_read_story';

/**
 * 고유한 사용자 ID를 생성하거나 기존 ID를 반환합니다.
 * @returns {string} 사용자 ID
 */
export function getOrCreateUserId() {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // UUID 형식의 고유 ID 생성 (간단한 버전)
    // 실제 프로덕션에서는 crypto.randomUUID() 또는 uuid 라이브러리 사용 권장
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    userId = `guest_${timestamp}_${random}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
}


/**
 * 마지막으로 읽은 스토리 ID를 가져옵니다.
 * @returns {string|null} 마지막으로 읽은 스토리 ID, 없으면 null
 */
export function getLastReadStoryId() {
  try {
    return localStorage.getItem(LAST_READ_STORY_KEY);
  } catch (error) {
    console.error('마지막으로 읽은 스토리 ID를 불러오는 중 오류 발생:', error);
    return null;
  }
}

