# SnipText Dashboard

반복해서 사용하는 문장을 템플릿으로 관리하고, 갤러리 탐색과 AI 톤 교정을 제공하는 React 19 · TypeScript 대시보드입니다.

발표 PPT 구성과 발표자 메모는 [발표 준비 문서](docs/presentation.md)를 참고하세요.

## 환경 설정 및 빌드

Node.js 20 이상과 npm이 설치된 환경에서 프로젝트 루트로 이동합니다.

1. 환경 변수 예제 파일을 `.env.local`로 복사합니다. `.env.local`이 이미 있으면 기존 파일을 열어 설정을 확인합니다.

   ```sh
   cp -n .env.example .env.local
   ```

2. Chrome 확장 프로그램과 로그인을 연동하려면 `chrome://extensions`에서 확장 프로그램 ID를 확인한 뒤 `.env.local`의 `REACT_APP_CHROME_EXTENSION_ID`에 입력합니다. 연동이 필요 없으면 값을 비워 둡니다.

3. 의존성을 설치하고 운영용 번들을 생성합니다.

   ```sh
   npm ci
   GENERATE_SOURCEMAP=false npm exec -- react-scripts build
   ```

   빌드 결과는 `build/`에 생성됩니다. `.env.local` 값을 변경하면 다시 빌드해야 반영됩니다.

현재 `npm run build`는 번들 생성 후 `sudo`로 정적 안내 페이지의 압축 스크립트를 실행합니다. 압축에 필요한 `minify`, `try-to-catch`, `url-join`이 프로젝트 의존성에 등록되어 있지 않아, 위 절차에서는 `react-scripts build`를 직접 실행합니다. 정적 안내 페이지는 `public/`에서 `build/`로 복사됩니다.

## 프로젝트 구조

화면 구성, 상태 관리, API 요청을 분리하여 기능을 수정할 때 확인할 코드 범위를 줄였습니다.

```text
src/
├── App.tsx          # 공통 레이아웃과 라우팅
├── pages/           # 내 템플릿, 템플릿 갤러리, AI 톤 교정
│   └── index.ts     # 페이지 모음 export
├── components/      # 대시보드, 템플릿 상세, 모달 등 공통 UI
├── customHooks/     # 데이터 조회와 재사용 상태 관리
├── api/             # 생성·수정·삭제 등 API 요청 함수
├── models/          # 공통 데이터·오류 타입
├── contexts/        # 전역 로딩 상태
└── utils/           # 공통 유틸리티
public/
├── error-page/      # 정적 오류 안내 페이지
└── noscript-page/   # JavaScript 비활성화 안내 페이지
```

페이지별 전용 컴포넌트와 상태 훅은 해당 `pages/` 하위에 배치했습니다. 데이터 조회는 `customHooks/`, 변경 요청은 `api/`에서 담당합니다.

## 구현 진척도

2026-11-02 코드 기준입니다. 아래 상태는 프런트엔드 구현 범위이며, 운영 서버에서의 동작 검증을 의미하지 않습니다.

| 영역 | 구현 내용 | 남은 작업 |
| --- | --- | --- |
| 공통 화면 | 헤더·사이드바·본문 레이아웃, 라우팅, 검색 입력, 로딩·오류 처리 | 계정 정보·플랜·사용량 표시 연동 |
| 내 템플릿 | 목록·검색·상세, 생성·수정·삭제, 변수 입력 후 복사 | 실제 인증·서버 환경에서 저장 및 조회 검증 |
| 템플릿 갤러리 | API 목록, 검색·카테고리 필터, 상세·복사, 내 템플릿에 추가 및 중복 확인 | 운영 화면 검증 |
| AI 톤 교정 | 7가지 스타일, 1,000자 입력 제한, 교정 요청·결과 복사·템플릿 저장 | 실제 AI 교정 및 플랜·사용량 연동 검증 |
| 추가 API | 내 정보·설정, 사용량, 단축어 중복 확인, 휴지통 조회·복구·영구 삭제 등 요청 코드 | 관련 화면 연결 여부와 서버 동작 검증 |
| 오류 안내 | React 오류 경계, 정적 오류·JavaScript 비활성화 안내 페이지 | 오류 리다이렉트 주소 설정 및 이동 확인 |

주요 화면은 실제 API를 사용하며, 구글 로그인과 인증 토큰 전달이 연결되어 있습니다. 휴지통·계정·결제 전용 페이지는 현재 라우트에 없습니다.

## SEO·브라우저 호환성·오류 처리 설계

검색 엔진과 공유 화면에 서비스 정보를 전달하기 위해 제목·설명 메타태그와 Open Graph·Twitter Card를 적용했습니다. 운영 배포 시 사이트명·대표 URL·이미지 경로는 실제 서비스 값으로 확정해야 합니다.

Mac의 트랙패드 뒤로가기와 iPhone의 뒤로가기 제스처(이하 ‘긴 터치 뒤로가기 제스처’)에서 발생하는 화면 멈춤 현상을 브라우저 히스토리(`popstate`) 동작 분석을 기반으로 개선했습니다. 현재 코드에는 Mac Safari에서 뒤로가기·앞으로가기 시 캐시된 페이지가 복원되면 `pageshow`의 `persisted` 값을 확인하여 새로고침하는 처리가 적용되어 있습니다. iPhone 환경의 개선 효과는 별도 기기 검증이 필요합니다.

안드로이드 네이버 앱에서 `error` 이벤트를 리스닝할 때 개인정보보호 브라우징·공유하기 기능의 브라우저 콜백 오류가 서비스 오류로 처리되는 문제를 해결했습니다. 현재 전역 비동기 오류 처리는 `unhandledrejection`을 대상으로 구성했습니다.

브라우저별 기본 스타일 차이는 CSS Reset/Normalize로 줄이고, Pretendard와 시스템 폰트 대체 순서를 지정했습니다. HTML5·CSS Variables·CSS Selector 지원 여부를 확인한 뒤 필요한 Polyfill만 Dynamic Import로 불러오도록 구성하여 브라우저 호환성과 번들 최적화를 함께 고려했습니다.

오류 발생 위치에 따라 처리 책임을 나누는 **Error Handling Architecture**를 설계했습니다. React 렌더링 오류는 `ErrorBoundary`, 처리되지 않은 Promise 오류는 전역 `unhandledrejection` 리스너, API 오류는 요청 함수와 조회 훅에서 처리합니다. 화면에서 복구할 수 있는 오류는 안내·재시도로 대응하고, 전역 오류는 공통 리다이렉트 함수와 정적 오류 안내 페이지로 연결하도록 구성했습니다. 실제 오류 페이지 이동을 위해서는 리다이렉트 주소 설정이 필요합니다.

## 개발 환경과 확인 범위

- `npm run dev`: 개발 서버 실행
- `CI=true npm test -- --watchAll=false`: 테스트 실행
- `npx tsc --noEmit`: 타입 검사

로컬 개발과 운영 화면은 `https://api.sniptext.kr/api/v1/`을 API 기본 주소로 사용합니다.

API·훅·주요 UI 테스트 파일이 작성되어 있습니다. 이 문서 작성 시 테스트·빌드·브라우저 검증은 실행하지 않았습니다. 오류 리다이렉트 설정(`src/config.ts`)은 현재 `"url"` 임시 값입니다.


## 구글 로그인

Google OAuth 공개 클라이언트 ID는 기본 설정에 포함되어 있습니다. 다른 웹 클라이언트로 테스트할 때는 `.env.local` 또는 빌드 환경에서 `REACT_APP_GOOGLE_CLIENT_ID`를 지정합니다.

`npm run dev`를 실행한 후 Chrome에서 `http://localhost:3000`으로 접속합니다. 포트 3000을 사용 중이면 해당 프로세스를 종료한 뒤 다시 실행합니다. Google Cloud에는 아래 리디렉션 URI를 끝 슬래시 없이 등록합니다.

- `http://localhost:3000/auth/google/callback`
- `https://sniptext.kr/auth/google/callback`

Google 앱이 테스트 상태인 동안에는 등록된 Gmail 계정으로 로그인합니다. 로컬에서 API에 직접 연결하므로 브라우저가 교차 사이트 쿠키를 차단하면 재발급이 실패할 수 있습니다. 연동 확인에는 교차 사이트 쿠키를 허용한 Chrome을 사용합니다.

접근 토큰은 메모리에 보관합니다. 새로고침과 만료 때는 HttpOnly 쿠키로 재발급을 요청하며, 같은 출처의 탭은 Web Locks로 요청 순서를 조정합니다. 로그인 API가 `AUTH502_1`을 반환하면 로그인 화면에서 Google 인증을 새로 시작합니다.

운영 정적 호스팅에서는 콜백 경로를 SPA의 `index.html`로 연결해야 합니다.

개발용 API만 확인하려면 아래 요청의 `result.accessToken`을 Swagger의 **Authorize** 또는 API 요청의 `Authorization: Bearer <토큰>` 헤더에 사용합니다. 시드 회원 ID는 `1`, `2`입니다.

```sh
curl -X POST 'https://api.sniptext.kr/api/v1/auth/dev-token' \
  -H 'Content-Type: application/json' \
  --data '{"userId":1}'
```


### Chrome 확장 프로그램 로그인 연결

`chrome://extensions`에서 설치된 Snip Text 확장 프로그램의 ID를 확인합니다. 로컬 `.env.local` 또는 운영 빌드 환경에 아래 값을 설정한 뒤 개발 서버를 재시작하거나 운영 번들을 다시 빌드합니다.

```dotenv
REACT_APP_CHROME_EXTENSION_ID=설치된_확장_프로그램_ID
```

Chrome에서 로그인이나 신규 가입을 완료하거나 세션을 복원·갱신하면 대시보드가 확장 프로그램 background의 `PUT /auth/token`으로 최신 SnipText 접근 토큰을 전달합니다. 확장 프로그램 ID가 없거나 메시지가 실패해도 대시보드 로그인은 정상적으로 완료됩니다.


### 로그아웃

로그아웃하면 메모리의 접근 토큰을 비우고, 같은 출처의 열린 탭과 확장 프로그램에도 로그아웃을 반영합니다. 브라우저에는 로그아웃 표시만 남겨 새로고침 시 이전 쿠키로 로그인 상태를 복원하는 것을 막습니다. 새 Google 로그인이나 신규 가입이 완료되면 이 표시를 지웁니다.

서버 로그아웃은 `POST /api/v1/auth/logout`으로 요청합니다. 현재 서버는 이 경로에 `404 COMMON404_1`을 반환합니다. 이 경우 화면에 서버 세션 종료를 확인하지 못했다는 안내가 표시됩니다.
