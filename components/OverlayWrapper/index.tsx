import { ReactNode } from 'react';
import styles from './OverlayWrapper.module.css';

interface OverlayWrapperProps {
  children: ReactNode | null;
  onCancel?: () => void;
}

export default function OverlayWrapper({ children, onCancel }: OverlayWrapperProps) {
  if (children === null || children === undefined) return <></>;
  return (
    <div className={styles.overlay} onClick={onCancel}>
      {onCancel === undefined ? (
        children
      ) : (
        <div onClick={(e) => e.stopPropagation()}>{children}</div>
      )}
    </div>
  );
}
