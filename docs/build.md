# SnipText Dashboard 빌드

프로젝트 루트에서 운영용 정적 파일을 생성합니다. 설치된 React Router의 요구 사항에 따라 Node.js 20 이상과 npm을 사용합니다.

```sh
npm ci
```

## 환경 변수 설정

Chrome 확장 프로그램에 템플릿 변경을 알리려면 `.env.example`을 참고해 `.env.production.local` 또는 빌드를 실행하는 환경에 `REACT_APP_CHROME_EXTENSION_ID`를 설정합니다. 값은 설치된 Snip Text 확장 프로그램에서 확인한 ID를 사용합니다.

`REACT_APP_*` 값은 빌드 결과에 포함되므로 비밀 키를 넣지 않습니다. 값을 변경하면 다시 빌드해야 합니다. 테스트 API는 개발 모드에서만 활성화됩니다.

## 운영용 파일 생성

```sh
GENERATE_SOURCEMAP=false npm exec -- react-scripts build
```

빌드가 완료되면 `build/index.html`과 `build/static/`이 생성됩니다. `public/`의 오류 안내 페이지와 JavaScript 비활성화 안내 페이지도 각각 `build/error-page/`, `build/noscript-page/`에 복사됩니다. `GENERATE_SOURCEMAP=false`는 소스맵 생성을 끕니다.

### 정적 안내 페이지 압축

`npm run build`는 React 빌드가 성공한 뒤 `sudo node ./scripts/minify.js`를 실행해 정적 안내 페이지를 압축합니다. 현재 `scripts/minify.js`가 사용하는 `minify`, `try-to-catch`, `url-join`이 `package.json`에 선언되어 있지 않아, `npm ci`만 수행한 환경에서는 후처리 단계가 실패할 수 있습니다. 안내 페이지를 원본 그대로 포함하려면 위의 `react-scripts build` 명령을 사용합니다.

## 배포 확인

- 정적 호스팅에 `build/` 디렉터리의 내용 전체를 배포합니다.
- `/templates`, `/gallery`, `/ai-tone`에 직접 접속하거나 새로고침할 때 `index.html`로 연결되도록 호스팅을 설정합니다. 실제로 존재하는 정적 파일은 해당 경로에서 제공해야 합니다.
- 운영 환경에서 오류 안내 페이지로 이동하려면 `src/config.ts`의 `errorRedirectUrl`을 실제 안내 페이지 주소로 설정한 후 빌드합니다.
