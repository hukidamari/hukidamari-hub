import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import styles from "../layout.module.css";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <>
    <SiteHeader />
    <div className={styles.mainContainer}>{children}</div>
    <SiteFooter />
  </>;
}
