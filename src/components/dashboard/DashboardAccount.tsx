import { useEffect, useState, useSyncExternalStore } from "react";

import Notice from "components/notice/Notice";
import { startGoogleLogin } from "api/auth/google";
import { getSessionToken, logout, restoreSession, subscribeToSession } from "api/auth/session";

export default function DashboardAccount() {
  const accessToken = useSyncExternalStore(subscribeToSession, getSessionToken);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (process.env.NODE_ENV === "test" || accessToken) return;
    let active = true;
    restoreSession().catch(() => {
      if (active) setError("로그인 상태를 확인할 수 없어요. 다시 로그인해 주세요.");
    });
    return () => { active = false; };
    // Restore only when mounting the dashboard, including after an OAuth redirect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleAccountAction() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (accessToken) {
        const { serverEnded, extensionCleared } = await logout();
        const message = serverEnded
          ? "로그아웃했어요."
          : "이 브라우저에서 로그아웃했어요. 서버 세션 종료는 확인하지 못했어요.";
        setNotice(extensionCleared === false ? message + " 확장 프로그램에서도 로그아웃 상태를 확인해 주세요." : message);
      } else {
        await startGoogleLogin();
      }
    } catch (reason) {
      setError((reason as { message?: string })?.message || "인증 요청에 실패했어요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="account">
      <button type="button" className="account-button" disabled={busy} onClick={handleAccountAction}>
        {accessToken ? "로그아웃" : "Google로 로그인"}
      </button>
      <Notice
        message={error || notice}
        tone={error ? "error" : "info"}
        autoDismiss={!error}
        onClose={() => { setError(""); setNotice(""); }}
      />
    </div>
  );
}
