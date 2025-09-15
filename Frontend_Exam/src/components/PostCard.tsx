"use client";
import { useRef, useState } from "react";
import styles from "@/styles/components/MovieCard.module.scss";
import type { Post } from "@/types/Post";
import { updatePost } from "@/lib/blogApi";

type Props = {
  post: Post;
  onDelete: (id: number) => void;
  onSaved?: (post: Post) => void;
};

export default function PostCard({ post, onDelete, onSaved }: Props) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState(post.title);
  const [body, setBody] = useState(post.body);
  const [error, setError] = useState<string | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    const target = e.target as HTMLElement;
    if (target.closest("button, input, textarea, a")) return;
    startX.current = e.clientX;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const dx = e.clientX - startX.current;
    setDragX(dx);
  }
  function onPointerUp() {
    if (!dragging) return;
    setDragging(false);
    const leftThreshold = -80;
    const rightThreshold = 80;
    if (dragX < leftThreshold) onDelete(post.id);
    if (dragX > rightThreshold) setEditing(true);
    setDragX(0);
  }

  const transform = dragging ? `translateX(${dragX}px) rotate(${dragX / 50}deg)` : undefined;
  const hint = dragX < -40 ? "Delete" : dragX > 40 ? "Edit" : "";

  async function saveEdit() {
    try {
      setSaving(true);
      setError(null);
      const updated = await updatePost(post.id, { ...post, title, body });
      onSaved?.(updated);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`${styles.card} ${dragging ? styles.dragging : ""}`}
      style={{ transform, gridTemplateRows: "1fr auto", minHeight: 220 }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className={styles.body}>
        {hint && <div className={styles.swipeHint}>{hint}</div>}
        {!editing ? (
          <>
            <div className={styles.title}>{post.title}</div>
            <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.35 }}>{post.body.slice(0, 160)}{post.body.length > 160 ? "…" : ""}</div>
          </>
        ) : (
          <div style={{ display: "grid", gap: 8 }}>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)" }} />
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={6} placeholder="Body" style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", resize: "vertical" }} />
            {error && <div style={{ color: '#ef4444', fontSize: 12 }}>{error}</div>}
          </div>
        )}
      </div>
      <div className={styles.actions}>
        {!editing ? (
          <>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => setEditing(true)} style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }}>Edit</button>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onDelete(post.id)} style={{ background: "#ef4444" }}>Delete</button>
          </>
        ) : (
          <>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={saveEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button onPointerDown={(e) => e.stopPropagation()} onClick={() => { setEditing(false); setTitle(post.title); setBody(post.body); }} style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }}>Cancel</button>
          </>
        )}
      </div>
    </div>
  );
}
