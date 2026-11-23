import "./Notice.css";
import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
interface NoticeProps {
  placement?: "floating" | "inline";
  message: string;
  onClose?: () => void;
  tone?: "info" | "warning" | "error";
  autoDismiss?: boolean;
  children?: ReactNode;
}

export default function Notice({
  message, onClose, placement = "floating", tone = "info", autoDismiss = Boolean(onClose), children,
}: NoticeProps) {
  const [displayedMessage, setDisplayedMessage] = useState(message);
  const [closing, setClosing] = useState(false);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!message) {
      setClosing(true);
      return;
    }
    setDisplayedMessage(message);
    setClosing(false);
    if (!autoDismiss) return;
    const timer = window.setTimeout(() => setClosing(true), 3000);
    return () => window.clearTimeout(timer);
  }, [message, autoDismiss]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setDisplayedMessage("");
      if (message) onCloseRef.current?.();
    }, 240);
    return () => window.clearTimeout(timer);
  }, [closing, message]);

  if (!displayedMessage) return null;

  const notice = (
    <div className={`notice-container notice-container--${placement}${closing ? " is-closing" : ""}`}>
      <div className="notice-clip">
        <div className={`notice notice--${tone}`}>
          <div className="notice-content" role={tone === "info" ? "status" : "alert"}>
            <div>{displayedMessage}</div>
            {children}
          </div>
          {onClose && <button type="button" className="notice-close" aria-label="알림 닫기" disabled={closing} onClick={() => setClosing(true)}>×</button>}
        </div>
      </div>
    </div>
  );
  return placement === "floating" ? createPortal(notice, document.body) : notice;
}
