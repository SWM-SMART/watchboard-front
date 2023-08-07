import BackgroundButton from '../components/BackgroundButton';
import DocumentCount from './components/DocumentCount';
import DocumentList from './components/DocumentList';
import LoginButton from './components/LoginButton';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <div className={styles.overlay}> </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <LoginButton />
          </div>
          <div className={styles.headerRight}>
            <BackgroundButton text={'녹음으로 생성'} href="/create" invert={true} icon="add" />
            <BackgroundButton text={'문서 생성'} href="/create" icon="add" />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h1 className={styles.title}>문서</h1>
            <DocumentCount />
          </div>
          <div className={styles.contentList}>
            <DocumentList />
          </div>
        </div>
      </div>
    </>
  );
}
