import BackgroundButton from '../components/BackgroundButton';
import DocumentCount from './components/DocumentCount';
import DocumentList from './components/DocumentList';
import LoginButton from './components/LoginButton';
import styles from './page.module.css';
import DocumentCreateDialogue from './components/DocumentCreateDialogue';
import RecordDialogue from './components/RecordDialogue';

export default function HomePage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <LoginButton />
          </div>
          <div className={styles.headerRight}>
            <BackgroundButton
              text={'녹음으로 생성'}
              href="/?create=record"
              invert={true}
              icon="add"
            />
            <BackgroundButton text={'문서 생성'} href="/?create" icon="add" />
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
      <DialogueWrapper create={searchParams.create} />
    </>
  );
}

interface DialogueWrapperProps {
  create?: string | string[];
}

function DialogueWrapper({ create }: DialogueWrapperProps) {
  switch (create) {
    case '':
      return (
        <div className={styles.overlay}>
          <DocumentCreateDialogue />
        </div>
      );
    case 'record':
      return <RecordDialogue />;
  }

  return <></>;
}
