# API 연동 가이드

## 개요

이 프로젝트는 목 데이터(정적 JSON 파일)와 실제 API를 환경 변수로 전환할 수 있도록 구성되어 있습니다. 모든 API 요청은 **axios**를 통해 `apiClient` 인스턴스를 사용하여 일관되게 처리됩니다.

## 환경 변수 설정

### 1. `.env` 파일 생성

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# API Base URL
# 개발 환경: http://localhost:8080
# 프로덕션: https://api.yourdomain.com
VITE_API_BASE_URL=http://localhost:8080

# 목 데이터 사용 여부
# true: /data/* 경로 사용 (정적 파일)
# false: 실제 API 사용
VITE_USE_MOCK_DATA=true
```

### 2. 환경별 설정

#### 개발 환경 (로컬)
```env
VITE_API_BASE_URL=http://localhost:8080
VITE_USE_MOCK_DATA=true  # 또는 false (API 서버 실행 시)
```

#### 프로덕션 환경
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_USE_MOCK_DATA=false
```

## 아키텍처

### Axios 인스턴스 (`apiClient`)

모든 API 요청은 `src/config/api.js`에서 생성된 `apiClient` 인스턴스를 사용합니다:

```javascript
import { apiClient } from '../../../config/api.js';

// GET 요청
const response = await apiClient.get('/api/endpoint');
const data = response.data;

// POST 요청
const response = await apiClient.post('/api/endpoint');
const data = response.data;
```

**장점:**
- 일관된 요청 처리 (목데이터와 실제 API 모두 동일한 방식)
- 전역 인터셉터 설정 가능 (토큰 자동 추가, 에러 처리 등)
- baseURL 자동 설정

## API 엔드포인트

### 1. 책 기본 정보

**엔드포인트:** `GET /api/books/{bookId}`

**Hook:** `useBookDetail(bookId)`

**응답 예시:**
```json
{
  "id": 1,
  "title": "오만과 편견",
  "author": "제인 오스틴",
  "coverImage": "/images/covers/pride-and-prejudice.png"
}
```

### 2. 스토리 목록

**엔드포인트:** `GET /api/books/{bookId}/stories`

**Hook:** `useBookDetail(bookId)` (병렬 호출)

**응답 예시:**
```json
[
  {
    "storyId": 1,
    "storyTitle": "첫인상 최악의 남자",
    "isLocked": false
  }
]
```

### 3. 캐릭터 및 친밀도

**엔드포인트:** `GET /api/books/{bookId}/characters`

**Hook:** `useBookDetail(bookId)` (병렬 호출)

**응답 예시:**
```json
[
  {
    "charId": 1,
    "name": "엘리자베스 베넷",
    "closeness": 20,
    "avatar": "/images/avatars/elizabeth.png"
  }
]
```

### 4. 캐릭터 상세 정보

**엔드포인트:** `GET /api/books/{bookId}/characters/{characterId}`

**Hook:** `useCharacter(bookId, characterId)`

**응답 예시:**
```json
{
  "charId": 1,
  "name": "엘리자베스 베넷",
  "closeness": 20,
  "intro": "오만과 편견의 주인공",
  "info": "독립적이고 똑똑한 여성",
  "charImage": "/images/avatars/elizabeth.png"
}
```

**⚠️ 중요:** 
- API 응답 필드명은 `charId`, `charImage`를 사용합니다.
- 프론트엔드에서는 `characterId` 변수명을 사용하지만, API와 통신할 때는 `charId`로 변환됩니다.

### 5. 스토리 한줄소개 (Viewpoints)

**엔드포인트:** `GET /api/stories/{storyId}/intro`

**Hook:** `useViewpoints(storyId)`

**응답 예시:**
```json
{
  "storyTitle": "첫인상 최악의 남자",
  "introductions": [
    {
      "charId": 1,
      "characterName": "엘리자베스 베넷",
      "introText": "무도회에 갔다가 듣지 말아야 할 말을 들었어.",
      "isLeader": "Y",
      "charImage": "/images/avatars/elizabeth.png",
      "firstContentId": 18
    },
    {
      "charId": 2,
      "characterName": "피츠윌리엄 다아시",
      "introText": "솔직히 그녀가 눈에 띄었다 하지만...",
      "isLeader": "N",
      "charImage": "/images/avatars/darcy.png",
      "firstContentId": 10
    }
  ]
}
```

**⚠️ 중요:** 
- API 응답의 `firstContentId`는 프론트엔드에서 `startContentId`로 변환됩니다.
- `charId`는 `characterId`로 변환됩니다.
- `charImage`는 `avatar`로 변환됩니다.

### 6. 스토리 보기 (Content)

**엔드포인트:** `GET /api/stories/{storyId}/characters/{characterId}/contents/{contentId}`

**Hook:** `useStoryContent(storyId, characterId, contentId)`

**응답 예시:**
```json
{
  "storyTitle": "첫인상 최악의 남자",
  "charId": 1,
  "characterName": "엘리자베스 베넷",
  "header": "너한테 좀 말하고 싶어서.",
  "content": "오늘은 무도회가 있어서 다녀왔어...",
  "reactions": [
    {
      "text": "무슨 일이 있었는데?",
      "nextId": 19
    }
  ]
}
```

### 7. 스토리 완료 및 친밀도 상승

**엔드포인트:** `POST /api/stories/{storyId}/characters/{characterId}/complete`

**Hook:** `useStoryComplete(storyId, characterId)`

**⚠️ 중요:** 
- 이 API는 **POST** 메서드를 사용합니다.
- 요청 body는 필요 없습니다 (빈 POST 요청).

**응답 예시:**
```json
{
  "storyTitle": "첫인상 최악의 남자",
  "characterName": "엘리자베스 베넷",
  "currentCloseness": 80,
  "finalText": "정말 긴 꿈을 꾼 것 같구나.",
  "charImage": "https://classiverse-storage.s3.ap-northeast-2.amazonaws.com/...",
  "bookId": 1
}
```

**⚠️ 중요:**
- API 응답 필드명은 `charImage`를 사용합니다 (목데이터와 동일).
- `currentCloseness`는 업데이트된 친밀도 값입니다.

## 인증 토큰 설정

로그인 기능을 추가할 때는 `src/config/api.js`의 인터셉터를 활성화하세요:

```javascript
// 요청 인터셉터: 모든 요청에 토큰 자동 추가
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 에러 시 자동 로그아웃 처리
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 토큰 만료 또는 인증 실패 시 처리
      localStorage.removeItem('authToken');
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 사용 가능한 Hooks

### 1. `useBookDetail(bookId)`
책 기본 정보, 스토리 목록, 캐릭터 목록을 병렬로 가져옵니다.

```javascript
const { data, loading, error } = useBookDetail(bookId);
// data: { ...bookData, stories: [...], characters: [...] }
```

### 2. `useCharacter(bookId, characterId)`
캐릭터 상세 정보를 가져옵니다.

```javascript
const { data, loading, error } = useCharacter(bookId, characterId);
// data: { charId, name, closeness, intro, info, charImage }
```

### 3. `useViewpoints(storyId)`
스토리의 모든 캐릭터 시점 정보를 가져옵니다.

```javascript
const { data, loading, error } = useViewpoints(storyId);
// data: { storyId, storyTitle, prompt, viewpoints: [...] }
```

### 4. `useStoryContent(storyId, characterId, contentId)`
스토리의 특정 씬 내용을 가져옵니다.

```javascript
const { data, loading, error } = useStoryContent(storyId, characterId, contentId);
// data: { storyTitle, charId, characterName, header, content, reactions: [...] }
```

### 5. `useStoryComplete(storyId, characterId)`
스토리 완료 처리 및 친밀도 상승을 처리합니다.

```javascript
const { data, loading, error } = useStoryComplete(storyId, characterId);
// data: { storyTitle, characterName, currentCloseness, finalText, charImage, bookId }
```

## 테스트 방법

### 1. 목 데이터로 테스트
```env
VITE_USE_MOCK_DATA=true
```

목 데이터는 `/public/data/` 디렉토리의 JSON 파일을 사용합니다.

### 2. 실제 API로 테스트
```env
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=http://localhost:8080
```

## 주의사항

1. **CORS 설정**: API 서버에서 CORS를 허용해야 합니다.
2. **에러 처리**: 모든 훅은 `error` 상태를 반환하므로 적절히 처리하세요.
3. **로딩 상태**: API 응답이 느릴 수 있으므로 로딩 상태를 적절히 표시하세요.
4. **필드명 일관성**: 
   - API는 `charId`, `charImage`를 사용
   - 프론트엔드 내부는 `characterId` 변수명 사용
   - 변환은 각 훅에서 자동 처리됨

## 다음 단계

1. `.env` 파일 생성 및 설정
2. API 서버 실행 및 테스트
3. API 응답 구조 확인 및 필요시 변환 로직 추가
4. 로그인 기능 추가 시 인터셉터 활성화
5. 프로덕션 배포 시 환경 변수 설정
