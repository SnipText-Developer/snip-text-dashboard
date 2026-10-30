import { useLocation } from "react-router-dom";

import ExtensionBanner from "./ExtensionBanner";
import TemplateSearch from "./TemplateSearch";

interface DashboardHeaderProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export default function DashboardHeader({ query, onQueryChange }: DashboardHeaderProps) {
  const { pathname } = useLocation();

  return (
    <header className="dashboard-header">
      <ExtensionBanner />
      {(pathname === "/" || pathname === "/templates") && (
        <TemplateSearch query={query} onQueryChange={onQueryChange} />
      )}
    </header>
  );
}
