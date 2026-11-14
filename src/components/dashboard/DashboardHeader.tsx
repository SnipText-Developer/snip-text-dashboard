import { NavLink, useLocation } from "react-router-dom";
import TemplateSearch from "./TemplateSearch";
import DashboardAccount from "./DashboardAccount";
import helpIcon from "assets/icons/help.svg";
import callIcon from "assets/icons/call.svg";

interface DashboardHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function DashboardHeader({ query, onQueryChange }: DashboardHeaderProps) {
  const { pathname } = useLocation();
  return (
    <header className="dashboard-header">
      <NavLink to="/" className="brand">SNIPTEXT</NavLink>
      {(pathname === "/" || pathname === "/templates" || pathname.startsWith("/templates/") || pathname === "/gallery") && (
        <TemplateSearch query={query} onQueryChange={onQueryChange} />
      )}
      <div className="header-actions">
        <button type="button" className="install-button" disabled>Chrome에 추가</button>
        <span className="header-symbol"><img src={helpIcon} alt="도움말" width={24} height={24} /></span>
        <span className="header-symbol"><img src={callIcon} alt="문의" width={24} height={24} /></span>
        <DashboardAccount />
      </div>
    </header>
  );
}
