import ChannelServiceWrapper from './components/ChannelServiceWrapper';
import DocumentCount from './components/DocumentCount';
import DocumentList from './components/DocumentList';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <div className={styles.content}>
      <ChannelServiceWrapper />
      <div className={styles.contentHeader}>
        <h1 className={styles.title}>문서</h1>
        <DocumentCount />
      </div>
      <div className={styles.contentList}>
        <DocumentList />
      </div>
    </div>
  );
}
