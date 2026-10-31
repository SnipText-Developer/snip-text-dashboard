import { NavLink, useLocation } from "react-router-dom";
import TemplateSearch from "./TemplateSearch";
import DashboardAccount from "./DashboardAccount";

interface DashboardHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function DashboardHeader({ query, onQueryChange }: DashboardHeaderProps) {
  const { pathname } = useLocation();
  return (
    <header className="dashboard-header">
      <NavLink to="/" className="brand">SNIP TEXT</NavLink>
      {(pathname === "/" || pathname === "/templates" || pathname.startsWith("/templates/")) && (
        <TemplateSearch query={query} onQueryChange={onQueryChange} />
      )}
      <div className="header-actions">
        <button type="button" className="install-button" disabled>Chrome에 추가</button>
        <span className="header-symbol" role="img" aria-label="도움말"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="12" r="10" /><path d="M9 9a3 3 0 0 1 6 0c0 2-3 2-3 5M12 17v1" /></svg></span>
        <span className="header-symbol" role="img" aria-label="문의"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M5 3 3 5c-2 5 11 18 16 16l2-2v-3l-5-3-2 2-5-5 2-2-3-5Z" strokeLinejoin="round" /></svg></span>
        <DashboardAccount />
      </div>
    </header>
  );
}
