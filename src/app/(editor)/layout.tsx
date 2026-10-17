import styles from "./layout.module.css";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>
    <div className={styles.content}>{children}</div>
  </div>;
}
