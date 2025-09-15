import type { Post } from "@/types/Post";

const KEY = "session_posts_cache";

function read(): Record<number, Post> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) as Record<number, Post> : {};
  } catch {
    return {};
  }
}

function write(map: Record<number, Post>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(KEY, JSON.stringify(map));
}

export function cachePost(p: Post) {
  const map = read();
  map[p.id] = p;
  write(map);
}

export function getCachedPost(id: number): Post | null {
  const map = read();
  return map[id] || null;
}

export function removeCachedPost(id: number) {
  const map = read();
  if (map[id]) {
    delete map[id];
    write(map);
  }
}

