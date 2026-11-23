import { useState, useSyncExternalStore } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { getSessionToken, subscribeToSession } from "api/auth/session";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const [query, setQuery] = useState("");
  const accessToken = useSyncExternalStore(subscribeToSession, getSessionToken);
  const { pathname } = useLocation();

  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <DashboardHeader query={query} onQueryChange={setQuery} />
      <DashboardSidebar />
      <div className="dashboard-main">
        <main
          key={`${pathname}:${Boolean(accessToken)}`}
          id="main-content"
          className="page-content"
          tabIndex={-1}>
          <Outlet
            context={{
              query,
              accessToken,
            }}
          />
        </main>
      </div>
    </div>
  );
}
