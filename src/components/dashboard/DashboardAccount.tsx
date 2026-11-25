import { useState, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";

import Notice from "components/notice/Notice";
import { getSessionToken, logout, subscribeToSession } from "api/auth/session";

export default function DashboardAccount() {
  const accessToken = useSyncExternalStore(subscribeToSession, getSessionToken);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function handleLogout() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const { serverEnded, extensionCleared } = await logout();
      const message = serverEnded
        ? "로그아웃했어요."
        : "이 브라우저에서 로그아웃했어요. 서버 세션 종료는 확인하지 못했어요.";
      setNotice(extensionCleared === false ? message + " 확장 프로그램에서도 로그아웃 상태를 확인해 주세요." : message);
    } catch (reason) {
      setError((reason as { message?: string })?.message || "인증 요청에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account">
      {accessToken ? (
        <button type="button" className="account-button" disabled={busy} onClick={handleLogout}>
          로그아웃
        </button>
      ) : (
        <Link className="account-button" to="/login">로그인</Link>
      )}
      <Notice
        message={error || notice}
        tone={error ? "error" : "info"}
        autoDismiss={!error}
        onClose={() => { setError(""); setNotice(""); }}
      />
    </div>
  );
}
