import Navbar from "./navbar/navbar";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>Hi</main>
    </div>
  );
}
