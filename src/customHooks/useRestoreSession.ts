import { useEffect, useRef, useState } from "react";

import { restoreSession } from "api/auth/session";

export default function useRestoreSession() {
  const [isRestoring, setIsRestoring] = useState(true);
  const justFinished = useRef(false);

  useEffect(() => {
    // Showing the routes after the initial check also causes a render.
    if (justFinished.current) {
      justFinished.current = false;
      return;
    }

    const restoration = restoreSession();
    if (!isRestoring) return;

    let active = true;
    void restoration.then(() => {
      if (active) {
        justFinished.current = true;
        setIsRestoring(false);
      }
    });
    return () => { active = false; };
  });

  return isRestoring;
}
