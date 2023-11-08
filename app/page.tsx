'use client';
import DocumentCount from './components/DocumentCount';
import DocumentList from './components/DocumentList';
import LoginButton from './components/LoginButton';
import styles from './page.module.css';
import DocumentCreateDialogue from './components/DocumentCreateDialogue';
import OverlayWrapper from '@/components/OverlayWrapper';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { ReactNode, useState } from 'react';

export default function HomePage() {
  const [overlay, setOverlay] = useState<ReactNode>(null);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <LoginButton />
          </div>
          <div className={styles.headerRight}>
            <ClickableBackgroundButton
              invert={true}
              text={'문서 생성'}
              icon="add"
              onClick={() =>
                setOverlay(<DocumentCreateDialogue onCancel={() => setOverlay(null)} />)
              }
            />
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
      <OverlayWrapper>{overlay}</OverlayWrapper>
    </>
  );
}
