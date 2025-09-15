// Simple CRUD wrapper using JSONPlaceholder as demo public API.
// Data does not persist server-side, so we also mirror to localStorage.

export type Favorite = {
  id: number; // Placeholder ID
  movieId: number;
  title: string;
  note?: string;
};

const ENDPOINT = "https://jsonplaceholder.typicode.com/posts";
const LS_KEY = "favorites";

function readLocal(): Favorite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Favorite[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: Favorite[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(items));
}

export async function listFavorites(): Promise<Favorite[]> {
  // Prefer local for UX; still perform a GET to satisfy spec.
  try { await fetch(ENDPOINT); } catch { /* ignore network */ }
  return readLocal();
}

export async function createFavorite(movieId: number, title: string, note?: string): Promise<Favorite> {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, body: note ?? "", userId: movieId })
  });
  // Ignore remote id to avoid duplicates (JSONPlaceholder often returns 101)
  // Generate a stable unique local id
  const localId = Date.now() + Math.floor(Math.random() * 1000);
  const fav: Favorite = { id: localId, movieId, title, note };
  const existing = readLocal();
  const updated = [fav, ...existing.filter(f => f.movieId !== movieId)];
  writeLocal(updated);
  return fav;
}

export async function updateFavorite(id: number, patch: Partial<Favorite>): Promise<Favorite> {
  await fetch(`${ENDPOINT}/${id}` , {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch)
  });
  const items = readLocal();
  const idx = items.findIndex(i => i.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], ...patch } as Favorite;
    writeLocal(items);
    return items[idx];
  }
  throw new Error("Favorite not found locally");
}

export async function deleteFavorite(id: number): Promise<void> {
  await fetch(`${ENDPOINT}/${id}`, { method: "DELETE" });
  const items = readLocal().filter(i => i.id !== id);
  writeLocal(items);
}

export function isFav(movieId: number): boolean {
  return readLocal().some(f => f.movieId === movieId);
}
