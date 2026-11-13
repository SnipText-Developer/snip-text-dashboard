import { NavLink, useLocation } from "react-router-dom";

import templatesIcon from "assets/icons/nav-templates.svg";
import templatesActiveIcon from "assets/icons/nav-templates-active.svg";
import galleryIcon from "assets/icons/nav-gallery.svg";
import galleryActiveIcon from "assets/icons/nav-gallery-active.svg";
import aiToneIcon from "assets/icons/nav-ai-tone.svg";
import aiToneActiveIcon from "assets/icons/nav-ai-tone-active.svg";

export default function DashboardSidebar() {
  const { pathname } = useLocation();
  const templatesActive = pathname === "/" || pathname === "/templates" || pathname.startsWith("/templates/");

  return (
    <aside className="sidebar" aria-label="워크스페이스">
      <nav className="workspace-nav" aria-label="주 메뉴">
        <NavLink to="/templates" className={() => (templatesActive ? "active" : "")}>
          <img className="nav-icon" src={templatesActive ? templatesActiveIcon : templatesIcon} alt="" width={20} height={20} />
          <span className="nav-label">내 템플릿</span>
        </NavLink>
        <NavLink to="/gallery">
          {({ isActive }) => <>
            <img className="nav-icon" src={isActive ? galleryActiveIcon : galleryIcon} alt="" width={20} height={20} />
            <span className="nav-label">템플릿 갤러리</span>
          </>}
        </NavLink>
        <NavLink to="/ai-tone">
          {({ isActive }) => <>
            <img className="nav-icon" src={isActive ? aiToneActiveIcon : aiToneIcon} alt="" width={20} height={20} />
            <span className="nav-label">AI 톤 교정</span>
          </>}
        </NavLink>
      </nav>
    </aside>
  );
}
