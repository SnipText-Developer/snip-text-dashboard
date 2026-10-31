import { useState } from "react";
import { Outlet, useLocation, useNavigationType } from "react-router-dom";

import { testApiEnabled, testAccessToken } from "testApi/templates";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import "./DashboardLayout.css";

export default function DashboardLayout() {
  const [query, setQuery] = useState("");
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  return (
    <div className="dashboard">
      <a className="skip-link" href="#main-content">
        본문으로 이동
      </a>
      <DashboardHeader query={query} onQueryChange={setQuery} />
      <DashboardSidebar />
      <div className="dashboard-main">
        <main
          key={pathname}
          id="main-content"
          className="page-content"
          data-navigation={navigationType}
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
