import { FormEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { completeGoogleLogin, googleCallbackPath, startGoogleLogin } from "api/auth/google";
import Notice from "components/notice/Notice";
import { signUpWithGoogle } from "api/auth/session";

type LoginResult = Awaited<ReturnType<typeof completeGoogleLogin>>;

export default function GoogleCallback() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const request = useRef<Promise<LoginResult> | undefined>(undefined);
  const [signup, setSignup] = useState<LoginResult>(null);
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [restartRequired, setRestartRequired] = useState(false);

  useEffect(() => {
    let active = true;
    if (!request.current) {
      request.current = completeGoogleLogin(search);
      window.history.replaceState(window.history.state, "", googleCallbackPath);
    }
    request.current.then(
      result => {
        if (!active) return;
        if (result) setSignup(result);
        else navigate("/", { replace: true });
      },
      reason => {
        if (!active) return;
        if (reason?.code === "AUTH502_1") {
          setRestartRequired(true);
          setError("구글 로그인을 완료하지 못했어요. 구글 로그인부터 다시 시작해 주세요.");
          return;
        }
        setError(reason?.message || "구글 로그인에 실패했어요.");
      },
    );
    return () => { active = false; };
  }, [navigate, search]);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!signup || !agreed || busy) return;
    setBusy(true);
    setError("");
    try {
      await signUpWithGoogle(signup.signupToken);
      navigate("/", { replace: true });
    } catch (reason) {
      setError((reason as { message?: string })?.message || "회원가입을 완료하지 못했어요.");
    } finally {
      setBusy(false);
    }
  }

  async function restartGoogleLogin() {
    setBusy(true);
    try {
      await startGoogleLogin();
    } catch (reason) {
      setError((reason as { message?: string })?.message || "구글 로그인을 시작하지 못했어요.");
      setBusy(false);
    }
  }

  return (
    <main className="page-content page-entry">
      <h1>{signup ? "회원가입" : "구글 로그인"}</h1>
      {error && <Notice message={error} placement="inline" tone="error" />}
      {signup ? (
        <form onSubmit={handleSignup}>
          {signup.email && <p>{signup.email}</p>}
          <p>
            <label>
              <input type="checkbox" checked={agreed} onChange={event => setAgreed(event.target.checked)} />
              {" "}서비스 이용약관에 동의합니다.
            </label>
          </p>
          <button className="primary-button" type="submit" disabled={!agreed || busy}>
            {busy ? "가입하는 중…" : "가입하기"}
          </button>
        </form>
      ) : error ? (
        restartRequired ? (
          <button className="primary-button" type="button" disabled={busy} onClick={restartGoogleLogin}>
            Google로 다시 로그인
          </button>
        ) : <Link to="/" replace>대시보드로 돌아가기</Link>
      ) : (
        <p role="status">구글 로그인을 완료하는 중이에요.</p>
      )}
    </main>
  );
}
