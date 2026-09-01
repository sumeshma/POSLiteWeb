"use client";

import { useCallback, useEffect, useState } from "react";
import { Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function fullscreenElement(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

async function enterFullscreen(): Promise<void> {
  const el = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => void;
  };
  if (el.requestFullscreen) {
    await el.requestFullscreen();
    return;
  }
  el.webkitRequestFullscreen?.();
}

async function exitFullscreen(): Promise<void> {
  const doc = document as Document & { webkitExitFullscreen?: () => void };
  if (document.exitFullscreen) {
    await document.exitFullscreen();
    return;
  }
  doc.webkitExitFullscreen?.();
}

export function FullscreenToggle() {
  const [active, setActive] = useState(false);

  const sync = useCallback(() => {
    setActive(Boolean(fullscreenElement()));
  }, []);

  useEffect(() => {
    sync();
    document.addEventListener("fullscreenchange", sync);
    document.addEventListener("webkitfullscreenchange", sync);
    return () => {
      document.removeEventListener("fullscreenchange", sync);
      document.removeEventListener("webkitfullscreenchange", sync);
    };
  }, [sync]);

  async function toggle() {
    try {
      if (fullscreenElement()) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch {
      // Browser may reject fullscreen outside a user gesture or in an embedded view.
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => void toggle()}
      aria-label={active ? "Exit full screen" : "Full screen"}
      aria-pressed={active}
      title={active ? "Exit full screen" : "Full screen"}
    >
      {active ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
    </Button>
  );
}
