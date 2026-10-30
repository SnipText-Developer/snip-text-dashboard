import { useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";

import { testApiEnabled, testAccessToken } from "testApi/templates";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const [bannerVisible, setBannerVisible] = useState(true);
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();

  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">본문으로 이동</a>
      <aside className="sidebar" aria-label="워크스페이스">
        <NavLink to="/" className="brand"><span className="brand-mark" aria-hidden="true">S</span>SnipText</NavLink>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="workspace-nav" aria-label="주 메뉴">
          <NavLink to="/templates" className={() => pathname === "/" || pathname === "/templates" ? "active" : ""}><span className="nav-icon" aria-hidden="true">▤</span>내 템플릿</NavLink>
          <NavLink to="/gallery"><span className="nav-icon" aria-hidden="true">▦</span>템플릿 갤러리</NavLink>
          <NavLink to="/ai-tone"><span className="nav-icon" aria-hidden="true">✧</span>AI 톤 교정<span className="pro-badge">PRO</span></NavLink>
        </nav>
        <div className="sidebar-bottom">
          <section className="plan-card" aria-label="현재 플랜">
            <div className="plan-title"><strong>Free 플랜</strong><span>사용량 미연결</span></div>
            <div className="usage-track" aria-hidden="true" />
            <p>템플릿을 간편하게 관리해 보세요.</p>
            <button type="button" className="upgrade-button" disabled>Pro로 업그레이드</button>
          </section>
          <div className="account">
            <div className="account-button">
              <span className="avatar" aria-hidden="true">S</span>
              <span className="account-identity"><strong>내 계정</strong><span>계정 정보</span></span>
            </div>
          </div>
        </div>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-header">
        {bannerVisible && <section className="extension-banner" aria-label="Chrome 확장 프로그램 안내">
          <span className="extension-mark" aria-hidden="true">S</span>
          <div className="banner-copy"><strong>어디서든 단축어로 바로 불러오세요</strong><p>Chrome 확장 프로그램을 설치하면 단축어를 통해 템플릿을 바로 삽입할 수 있어요.</p></div>
          <button type="button" className="install-button" disabled>Chrome에 추가</button>
          <button className="close-banner" aria-label="확장 프로그램 안내 닫기" onClick={() => setBannerVisible(false)}>×</button>
        </section>}
        {(pathname === "/" || pathname === "/templates") && <div className="search-header templates-search"><div className="search-field"><span aria-hidden="true">⌕</span><input aria-label="템플릿 검색" placeholder="템플릿 검색" type="search" value={query} onChange={event => setQuery(event.target.value)} /></div></div>}
        </header>
        <main key={pathname} id="main-content" className="page-content" tabIndex={-1}><Outlet context={{ query, accessToken: testApiEnabled ? testAccessToken : "" }} /></main>

      </div>

    </div>
  );
}
