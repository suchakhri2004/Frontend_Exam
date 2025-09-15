import type { Post } from "@/types/Post";

const API = "/api/posts";

function normalize(p: any): Post {
  if (p.user_id && !p.userId) return { userId: p.user_id, id: p.id, title: p.title, body: p.body };
  return p as Post;
}

export async function listPosts(): Promise<Post[]> {
  const res = await fetch(API);
  if (!res.ok) throw new Error("Failed to fetch posts");
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map(normalize);
}

export async function getPost(id: number): Promise<Post> {
  const res = await fetch(`${API}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return normalize(await res.json());
}

export async function createPost(title: string, body: string, userId?: number): Promise<Post> {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body, userId })
  });
  if (!res.ok) {
    let msg = `Create failed: ${res.status}`;
    try {
      const j = await res.json();
      if (Array.isArray(j)) {
        msg += ` - ${j.map((e: any) => `${e.field || ''} ${e.message || ''}`.trim()).join('; ')}`;
      } else if (j?.error) {
        msg += ` - ${j.error}`;
      }
    } catch {}
    throw new Error(msg);
  }
  return normalize(await res.json());
}

export async function updatePost(id: number, patch: Partial<Post>): Promise<Post> {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  if (!res.ok) {
    let msg = `Update failed: ${res.status}`;
    try {
      const j = await res.json();
      if (Array.isArray(j)) {
        msg += ` - ${j.map((e: any) => `${e.field || ''} ${e.message || ''}`.trim()).join('; ')}`;
      } else if (j?.error) {
        msg += ` - ${j.error}`;
      }
    } catch {}
    throw new Error(msg);
  }
  return normalize(await res.json());
}

export async function deletePost(id: number): Promise<void> {
  const res = await fetch(`${API}/${id}`, { method: "DELETE" });
  if (!res.ok && res.status !== 204) {
    let msg = `Delete failed: ${res.status}`;
    try {
      const j = await res.json();
      if (Array.isArray(j)) {
        msg += ` - ${j.map((e: any) => `${e.field || ''} ${e.message || ''}`.trim()).join('; ')}`;
      } else if (j?.error) {
        msg += ` - ${j.error}`;
      }
    } catch {}
    throw new Error(msg);
  }
}
