// 친밀도 데이터를 저장/조회할 때 사용하는 키
const AFFINITY_STORAGE_KEY = 'user_affinity_data';
const USER_ID_KEY = 'unique_user_id';
const COMPLETED_STORIES_KEY = 'completed_stories';
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
 * 초기 친밀도 데이터 구조를 생성합니다.
 * 모든 등장인물에 대해 친밀도가 0인 기본 구조를 반환합니다.
 * @param {Array<string>} characterIds - 등장인물 ID 배열
 * @returns {Object} 초기 친밀도 데이터 구조
 */
function createInitialAffinityData(characterIds = []) {
  const affinityData = {};
  
  characterIds.forEach(characterId => {
    affinityData[characterId] = {
      progress: 0,
      lastUpdated: new Date().toISOString()
    };
  });
  
  return affinityData;
}

/**
 * localStorage에서 친밀도 데이터를 가져옵니다.
 * 데이터가 없으면 초기 구조를 생성하여 저장합니다.
 * @param {Array<string>} characterIds - 등장인물 ID 배열 (초기화 시 필요)
 * @returns {Object} 친밀도 데이터 객체
 */
export function getAffinityData(characterIds = []) {
  try {
    const stored = localStorage.getItem(AFFINITY_STORAGE_KEY);
    
    if (!stored) {
      // 최초 접속: 초기 데이터 생성 및 저장
      const initialData = createInitialAffinityData(characterIds);
      localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(initialData));
      return initialData;
    }
    
    const parsed = JSON.parse(stored);
    
    // 새로운 등장인물이 추가된 경우를 대비하여 기존 데이터에 없는 등장인물 추가
    let hasNewCharacter = false;
    characterIds.forEach(characterId => {
      if (!parsed[characterId]) {
        parsed[characterId] = {
          progress: 0,
          lastUpdated: new Date().toISOString()
        };
        hasNewCharacter = true;
      }
    });
    
    // 새로운 등장인물이 추가되었다면 저장
    if (hasNewCharacter) {
      localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(parsed));
    }
    
    return parsed;
  } catch (error) {
    console.error('친밀도 데이터를 불러오는 중 오류 발생:', error);
    // 오류 발생 시 초기 데이터 반환
    const initialData = createInitialAffinityData(characterIds);
    localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(initialData));
    return initialData;
  }
}

/**
 * 특정 등장인물의 친밀도를 업데이트합니다.
 * @param {string} characterId - 등장인물 ID
 * @param {number} newProgress - 새로운 친밀도 값 (0-100)
 * @param {Array<string>} characterIds - 등장인물 ID 배열 (데이터 초기화 시 필요)
 */
export function updateAffinity(characterId, newProgress, characterIds = []) {
  try {
    const affinityData = getAffinityData(characterIds);
    
    // 친밀도 값 검증 (0-100 범위)
    const progress = Math.max(0, Math.min(100, newProgress));
    
    affinityData[characterId] = {
      progress: progress,
      lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem(AFFINITY_STORAGE_KEY, JSON.stringify(affinityData));
    
    // 같은 탭에서 변경을 감지하기 위한 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('affinityUpdated', { 
      detail: { characterId, progress } 
    }));
  } catch (error) {
    console.error('친밀도 데이터를 업데이트하는 중 오류 발생:', error);
  }
}

/**
 * 완료한 스토리 목록을 가져옵니다.
 * @returns {Set<string>} 완료한 스토리 ID 집합 (형식: "storyId_characterId")
 */
function getCompletedStories() {
  try {
    const stored = localStorage.getItem(COMPLETED_STORIES_KEY);
    if (!stored) {
      return new Set();
    }
    const completed = JSON.parse(stored);
    return new Set(completed);
  } catch (error) {
    console.error('완료한 스토리 목록을 불러오는 중 오류 발생:', error);
    return new Set();
  }
}

/**
 * 스토리 완료 여부를 저장합니다.
 * @param {string} storyId - 스토리 ID
 * @param {string} characterId - 등장인물 ID
 */
function markStoryAsCompleted(storyId, characterId) {
  try {
    const completed = getCompletedStories();
    const storyKey = `${storyId}_${characterId}`;
    completed.add(storyKey);
    localStorage.setItem(COMPLETED_STORIES_KEY, JSON.stringify(Array.from(completed)));
    
    // 마지막으로 읽은 스토리 ID 저장
    localStorage.setItem(LAST_READ_STORY_KEY, storyId);
    
    // 같은 탭에서 변경을 감지하기 위한 커스텀 이벤트 발생
    window.dispatchEvent(new CustomEvent('lastReadStoryUpdated', { 
      detail: { storyId } 
    }));
  } catch (error) {
    console.error('스토리 완료 여부를 저장하는 중 오류 발생:', error);
  }
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

/**
 * 스토리가 이미 완료되었는지 확인합니다.
 * @param {string} storyId - 스토리 ID
 * @param {string} characterId - 등장인물 ID
 * @returns {boolean} 완료 여부
 */
export function isStoryCompleted(storyId, characterId) {
  const completed = getCompletedStories();
  const storyKey = `${storyId}_${characterId}`;
  return completed.has(storyKey);
}

/**
 * 특정 등장인물의 친밀도를 증가시킵니다.
 * 스토리 완료 여부를 확인하여 중복 증가를 방지합니다.
 * @param {string} characterId - 등장인물 ID
 * @param {number} increment - 증가할 친밀도 값
 * @param {string} storyId - 스토리 ID (중복 방지용)
 * @param {Array<string>} characterIds - 등장인물 ID 배열 (데이터 초기화 시 필요)
 * @returns {number} 업데이트된 친밀도 값
 */
export function increaseAffinity(characterId, increment, storyId = null, characterIds = []) {
  try {
    const isAlreadyCompleted = storyId && isStoryCompleted(storyId, characterId);
    
    // 스토리 ID가 제공된 경우, 이미 완료한 스토리인지 확인
    if (isAlreadyCompleted) {
      // 이미 완료한 스토리면 친밀도는 증가시키지 않지만, 마지막으로 읽은 스토리는 업데이트
      const affinityData = getAffinityData(characterIds);
      
      // 마지막으로 읽은 스토리 ID 업데이트 (이미 완료한 스토리를 다시 읽은 경우)
      if (storyId) {
        try {
          localStorage.setItem(LAST_READ_STORY_KEY, storyId);
          // 같은 탭에서 변경을 감지하기 위한 커스텀 이벤트 발생
          window.dispatchEvent(new CustomEvent('lastReadStoryUpdated', { 
            detail: { storyId } 
          }));
        } catch (error) {
          console.error('마지막으로 읽은 스토리 ID를 저장하는 중 오류 발생:', error);
        }
      }
      
      return affinityData[characterId]?.progress || 0;
    }

    const affinityData = getAffinityData(characterIds);
    const currentProgress = affinityData[characterId]?.progress || 0;
    const newProgress = Math.max(0, Math.min(100, currentProgress + increment));
    
    updateAffinity(characterId, newProgress, characterIds);
    
    // 스토리 ID가 제공된 경우, 완료 여부 저장
    if (storyId) {
      markStoryAsCompleted(storyId, characterId);
    }
    
    return newProgress;
  } catch (error) {
    console.error('친밀도를 증가시키는 중 오류 발생:', error);
    return 0;
  }
}

/**
 * 특정 등장인물의 친밀도를 가져옵니다.
 * @param {string} characterId - 등장인물 ID
 * @param {Array<string>} characterIds - 등장인물 ID 배열 (데이터 초기화 시 필요)
 * @returns {number} 친밀도 값 (0-100)
 */
export function getCharacterAffinity(characterId, characterIds = []) {
  try {
    const affinityData = getAffinityData(characterIds);
    return affinityData[characterId]?.progress || 0;
  } catch (error) {
    console.error('친밀도를 가져오는 중 오류 발생:', error);
    return 0;
  }
}
