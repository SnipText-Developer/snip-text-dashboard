import "./Notice.css";
import { useEffect, useRef, useState } from "react";
interface NoticeProps {
  placement?: "floating" | "inline";
  message: string;
  onClose: () => void;
}

export default function Notice({ message, onClose, placement = "floating" }: NoticeProps) {
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
    const timer = window.setTimeout(() => setClosing(true), 3000);
    return () => window.clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    if (!closing) return;
    const timer = window.setTimeout(() => {
      setDisplayedMessage("");
      if (message) onCloseRef.current();
    }, 240);
    return () => window.clearTimeout(timer);
  }, [closing, message]);

  if (!displayedMessage) return null;

  return (
    <div className={`notice-container notice-container--${placement}${closing ? " is-closing" : ""}`}>
      <div className="notice-clip">
        <div className="notice" role="status">
          <span>{displayedMessage}</span>
          <button type="button" aria-label="알림 닫기" disabled={closing} onClick={() => setClosing(true)}>×</button>
        </div>
      </div>
    </div>
  );
}
