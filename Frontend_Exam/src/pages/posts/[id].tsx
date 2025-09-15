import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import type { Post } from "@/types/Post";
import { getPost, updatePost } from "@/lib/blogApi";
import { getCachedPost, cachePost } from "@/lib/postCache";
import Loading from "@/components/Loading";

export default function PostDetailPage() {
  const router = useRouter();
  const id = Number(router.query.id);
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (!id) return;
    const cached = getCachedPost(id);
    if (cached) setPost(cached);
    (async () => {
      try {
        const p = await getPost(id);
        setPost(p);
        cachePost(p);
        setError(null);
      } catch (e: any) {
        if (!cached) setError(e.message || "Failed to load");
      }
    })();
  }, [id]);

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!post) return;
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") || post.title);
    const body = String(fd.get("body") || post.body);
    try {
      setSaving(true);
      const updated = await updatePost(post.id, { ...post, title, body });
      setPost(updated);
      cachePost(updated);
      setEditing(false);
    } catch (e: any) {
      setError(e.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!post) return;
    await deletePost(post.id);
    router.push("/posts");
  }

  return (
    <div>
      <h1 style={{ margin: "8px 0 16px" }}>Post Detail</h1>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {!post && !error && <Loading label="Loading post" />}
      {post && (
        <div style={{ display: "grid", gap: 12 }}>
          {!editing ? (
            <div style={{ display: "grid", gap: 8, maxWidth: 900 }}>
              <h2 style={{ margin: 0 }}>{post.title}</h2>
              <p style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{post.body}</p>
              <div style={{ display: "flex", gap: 8 }}>
                <button type="button" onClick={() => setEditing(true)}>Edit</button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSave} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr", maxWidth: 900 }}>
              <input name="title" defaultValue={post.title} style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)" }} />
              <textarea name="body" defaultValue={post.body} rows={8} style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)", resize: "vertical" }} />
              <div style={{ display: "flex", gap: 8 }}>
                <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save"}</button>
                <button type="button" onClick={() => setEditing(false)} style={{ background: "transparent", color: "var(--text)", border: "1px solid var(--border)" }}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
