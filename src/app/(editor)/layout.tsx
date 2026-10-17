import SiteHeader from "@/components/site/site-header";
import styles from "./layout.module.css";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.shell}>
    <SiteHeader compact />
    <div className={styles.content}>{children}</div>
  </div>;
}
