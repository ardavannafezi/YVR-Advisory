"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface Props {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function AdminModal({ title, onClose, children }: Props) {
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, zIndex: 9999, backgroundColor: "rgba(0,0,0,0.82)", overflowY: "auto" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{ width: "100%", maxWidth: "896px", backgroundColor: "#111", border: "1px solid rgba(255,255,255,0.08)", padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <h2 style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "22px", fontWeight: "normal", color: "#e8e0d0" }}>{title}</h2>
            <button
              onClick={onClose}
              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: "24px", lineHeight: 1, padding: "4px 8px" }}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
