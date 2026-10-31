import { NavLink, useLocation } from "react-router-dom";

import DashboardPlanCard from "./DashboardPlanCard";

export default function DashboardSidebar() {
  const { pathname } = useLocation();

  return (
    <aside className="sidebar" aria-label="워크스페이스">
      <nav className="workspace-nav" aria-label="주 메뉴">
        <NavLink
          to="/templates"
          className={() =>
            pathname === "/" || pathname === "/templates" || pathname.startsWith("/templates/") ? "active" : ""
          }>
          <span className="nav-icon" aria-hidden="true">
            ⌂
          </span>
          내 템플릿
        </NavLink>
        <NavLink to="/gallery">
          <span className="nav-icon" aria-hidden="true">
            ▧
          </span>
          템플릿 갤러리
        </NavLink>
        <NavLink to="/ai-tone">
          <span className="nav-icon" aria-hidden="true">
            ♢
          </span>
          AI 톤 교정
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <DashboardPlanCard />
      </div>
    </aside>
  );
}
