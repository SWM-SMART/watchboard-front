import Link from 'next/link';
import styles from './documentTitle.module.css';
import 'material-symbols';

interface DocumentTitleProps {
  documentName: string;
}

export default function DocumentTitle({ documentName: documentName }: DocumentTitleProps) {
  return (
    <div className={styles.container}>
      <Link href={'/'} style={{ textDecoration: 'none' }}>
        <p className={styles.label}>문서</p>
      </Link>
      <span className={`material-symbols-outlined ${styles.icon}`}>Chevron_Right</span>
      <p className={styles.label}>{documentName}</p>
    </div>
  );
}
