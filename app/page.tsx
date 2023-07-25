import BackgroundButton from '../components/BackgroundButton';
import Button from '../components/Button';
import Card from '../components/Card';
import { getDocumentList } from '../utils/api';
import styles from './page.module.css';
import { cookies } from 'next/headers';

export default async function HomePage() {
  // cookies from client request
  const cookieStore = cookies();

  // fetch document list
  const documents = await getDocumentList(cookieStore);
  const count = documents.length;

  return (
    <>
      <div className={styles.overlay}> </div>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Button text={'로그인'} href={'/login'} icon="login" />
          </div>
          <div className={styles.headerRight}>
            <BackgroundButton text={'녹음으로 생성'} href="/create" invert={true} icon="add" />
            <BackgroundButton text={'문서 생성'} href="/create" icon="add" />
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.contentHeader}>
            <h1 className={styles.title}>문서</h1>
            <p className={styles.count}>{`${count}개`}</p>
          </div>
          <div className={styles.contentList}>
            {documents.map((document) => {
              console.log(document);
              return <Card key={`document-card-${document.document_id}`} document={document} />;
            })}
          </div>
        </div>
      </div>
    </>
  );
}
