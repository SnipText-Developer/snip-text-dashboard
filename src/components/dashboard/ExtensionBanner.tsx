import { useState } from "react";

export default function ExtensionBanner() {
  const [bannerVisible, setBannerVisible] = useState(true);

  if (!bannerVisible) return null;

  return (
    <section
      className="extension-banner"
      aria-label="Chrome 확장 프로그램 안내">
      <span className="extension-mark" aria-hidden="true">
        S
      </span>
      <div className="banner-copy">
        <strong>어디서든 단축어로 바로 불러오세요</strong>
        <p>
          Chrome 확장 프로그램을 설치하면 단축어를 통해 템플릿을 바로 삽입할 수
          있어요.
        </p>
      </div>
      <button type="button" className="install-button" disabled>
        Chrome에 추가
      </button>
      <button
        className="close-banner"
        aria-label="확장 프로그램 안내 닫기"
        onClick={() => setBannerVisible(false)}>
        ×
      </button>
    </section>
  );
}
