import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { testApiEnabled, testAccessToken } from "testApi/templates";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();

  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <DashboardSidebar />
      <div className="dashboard-main">
        <DashboardHeader query={query} onQueryChange={setQuery} />
        <main
          key={pathname}
          id="main-content"
          className="page-content"
          tabIndex={-1}>
          <Outlet
            context={{
              query,
              accessToken: testApiEnabled ? testAccessToken : "",
            }}
          />
        </main>
      </div>
    </div>
  );
}
