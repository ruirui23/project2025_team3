// src/components/common/Modal.jsx
import { useEffect, useId, useMemo, useRef } from "react";
import "./Modal.css";

/**
 * Reusable Modal (parent)
 * - Login / Signup / Post など任意のフォームを children に入れて使う
 * - Escape で閉じる / 背景クリックで閉じる / 初期フォーカス / フォーカス復帰
 */
export default function Modal({
  open,
  title,
  description,
  onClose,
  children,

  closeOnBackdrop = true,
  maxWidth = 520,

  /** 初期フォーカス先を明示したいとき（例: ログインのメール入力） */
  initialFocusRef = null,
}) {
  const titleId = useId();
  const descId = useId();

  const cardRef = useRef(null);
  const backdropRef = useRef(null);
  const prevFocusRef = useRef(null);

  const styleVars = useMemo(
    () => ({ "--modal-max-width": `${maxWidth}px` }),
    [maxWidth]
  );

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  // 背景スクロール停止
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // フォーカス保存→初期フォーカス→閉じたら復帰
  useEffect(() => {
    if (!open) return;

    prevFocusRef.current = document.activeElement;

    const focusFirst = () => {
      // 1) initialFocusRef があればそこへ
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus?.();
        return;
      }

      // 2) card 内の最初のフォーカス可能要素へ
      const root = cardRef.current;
      if (!root) return;

      const el = root.querySelector(
        [
          "button:not([disabled])",
          "[href]",
          "input:not([disabled])",
          "select:not([disabled])",
          "textarea:not([disabled])",
          "[tabindex]:not([tabindex='-1'])",
        ].join(",")
      );
      (el || root).focus?.();
    };

    // 描画後にフォーカス
    const t = window.setTimeout(focusFirst, 0);

    return () => {
      window.clearTimeout(t);
      const prev = prevFocusRef.current;
      prev?.focus?.();
    };
  }, [open, initialFocusRef]);

  // 簡易フォーカストラップ（Tab を modal 内に閉じ込める）
  const onTrapKeyDown = (e) => {
    if (e.key !== "Tab") return;

    const root = cardRef.current;
    if (!root) return;

    const nodes = root.querySelectorAll(
      [
        "button:not([disabled])",
        "[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        "[tabindex]:not([tabindex='-1'])",
      ].join(",")
    );

    const list = Array.from(nodes);
    if (list.length === 0) return;

    const first = list[0];
    const last = list[list.length - 1];

    if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  };

  if (!open) return null;

  return (
    <div
      className="modal-backdrop"
      ref={backdropRef}
      role="presentation"
      onMouseDown={(e) => {
        if (!closeOnBackdrop) return;
        if (e.target === backdropRef.current) onClose?.();
      }}
      style={styleVars}
    >
      <div
        className="modal-card"
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        onKeyDown={onTrapKeyDown}
      >
        <div className="modal-header">
          <div className="modal-headings">
            {title && (
              <div className="modal-title" id={titleId}>
                {title}
              </div>
            )}
            {description && (
              <div className="modal-desc" id={descId}>
                {description}
              </div>
            )}
          </div>

          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
