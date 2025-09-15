import styles from "@/styles/components/Loading.module.scss";

export default function Loading({ label = "Loading..." }: { label?: string }) {
  return (
    <div className={styles.wrap} role="status" aria-live="polite" aria-busy="true">
      <div className={styles.spinner} />
      <span style={{ position: "absolute", opacity: 0 }}>{label}</span>
    </div>
  );
}

