import { useEffect, useState } from "react";
import type { Post } from "@/types/Post";
import { listPosts, createPost, deletePost } from "@/lib/blogApi";
import Loading from "@/components/Loading";
import { cachePost, removeCachedPost } from "@/lib/postCache";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function refresh() {
    try {
      const data = await listPosts();
      setPosts(data.slice(0, 20));
    } catch (e: any) {
      setError(e.message || "Failed to load");
    }
  }

  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") || "");
    const body = String(fd.get("body") || "");
    if (!title || !body) return;
    try {
      setSaving(true);
      setActionError(null);
      const created = await createPost(title, body, undefined);
      setPosts(p => (p ? [created, ...p] : [created]));
      cachePost(created);
      form.reset();
    } catch (e: any) {
      setActionError(e.message || "Create failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    try {
      setActionError(null);
      await deletePost(id);
      removeCachedPost(id);
      setPosts(p => p?.filter(x => x.id !== id) || null);
    } catch (e: any) {
      setActionError(e.message || "Delete failed");
    }
  }

  return (
    <div>
      <h1 style={{ margin: "8px 0 16px" }}>Simple Blog</h1>
      <form onSubmit={add} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 8, marginBottom: 16 }}>
        <input name="title" placeholder="Title" style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)" }} />
        <input name="body" placeholder="Body" style={{ padding: 10, borderRadius: 10, border: "1px solid var(--border)", background: "var(--card)", color: "var(--text)" }} />
        <button type="submit" disabled={saving}>{saving ? "Saving..." : "Create"}</button>
      </form>

      {error && <p style={{ color: "#ef4444" }}>{error}</p>}
      {actionError && <p style={{ color: "#ef4444" }}>{actionError}</p>}
      {!posts && !error && <Loading label="Loading posts" />}
      {posts && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {posts.map(p => (
            <PostCard
              key={p.id}
              post={p}
              onDelete={remove}
              onSaved={(u) => setPosts(cur => cur?.map(x => x.id === u.id ? u : x) || null)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
