"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import styles from "@/styles/components/MovieCard.module.scss";
import type { Movie } from "@/types/Movie";
import { createFavorite, deleteFavorite, isFav, listFavorites } from "@/lib/favApi";

type Props = {
  movie: Movie;
  onChanged?: () => void;
};

export default function MovieCard({ movie, onChanged }: Props) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const startX = useRef(0);
  const [fav, setFav] = useState<boolean>(isFav(movie.id));

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

  async function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return;
    setDragging(false);
    const dx = e.clientX - startX.current;
    const threshold = 80;
    setDragX(0);
    if (dx > threshold) {
      await doFavorite();
    } else if (dx < -threshold) {
      await doUnfavorite();
    }
  }

  async function doFavorite() {
    if (fav) return;
    try {
      setSaving(true);
      await createFavorite(movie.id, movie.title);
      setFav(true);
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  async function doUnfavorite() {
    if (!fav) return;
    try {
      setSaving(true);
      const all = await listFavorites();
      const current = all.find(a => a.movieId === movie.id);
      if (current) await deleteFavorite(current.id);
      setFav(false);
      onChanged?.();
    } finally {
      setSaving(false);
    }
  }

  const transform = dragging ? `translateX(${dragX}px) rotate(${dragX / 40}deg)` : undefined;
  const hint = dragX > 40 ? "Add to favorites" : dragX < -40 ? "Remove" : "";

  return (
    <div
      className={`${styles.card} ${dragging ? styles.dragging : ""}`}
      style={{ transform }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div className={styles.imgWrap}>
        {hint && <div className={styles.swipeHint}>{hint}</div>}
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            fill
            style={{ objectFit: "cover" }}
            priority={false}
          />
        ) : null}
      </div>
      <div className={styles.body}>
        <div className={styles.title}>{movie.title}</div>
        <div className={styles.meta}>⭐ {movie.vote_average.toFixed(1)}</div>
        <div style={{ fontSize: 14, opacity: 0.8, lineHeight: 1.35 }}>
          {movie.overview?.slice(0, 120)}{movie.overview && movie.overview.length > 120 ? "…" : ""}
        </div>
      </div>
      <div className={styles.actions}>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={doFavorite} disabled={saving || fav}>{saving ? "Saving..." : fav ? "Favorited" : "Favorite"}</button>
        <button onPointerDown={(e) => e.stopPropagation()} onClick={doUnfavorite} disabled={saving || !fav} style={{ background: "#ef4444" }}>
          {saving ? "Saving..." : "Remove"}
        </button>
      </div>
    </div>
  );
}
