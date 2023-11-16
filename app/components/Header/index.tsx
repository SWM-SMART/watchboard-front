'use client';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import LoginButton from '../LoginButton';
import styles from './header.module.css';
import { useOverlay } from '@/states/overlay';
import DocumentCreateDialogue from '../DocumentCreateDialogue';
import Logo from '@/components/Logo';
import { useUser } from '@/states/user';

export default function Header() {
  const { setOverlay } = useOverlay((state) => ({
    setOverlay: state.setOverlay,
  }));
  const userDataExists = useUser((state) => state.userData !== null);

  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <Logo width={178} height={40} />
      </div>
      <div className={styles.headerRight}>
        {userDataExists ? (
          <ClickableBackgroundButton
            invert={true}
            text={'학습 생성'}
            icon="add"
            onClick={() =>
              setOverlay(
                <DocumentCreateDialogue
                  onCancel={() => setOverlay(null)}
                  onSuccess={() => setOverlay(null)}
                />,
              )
            }
          />
        ) : undefined}
        <LoginButton />
      </div>
    </div>
  );
}
