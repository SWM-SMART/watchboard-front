import Link from 'next/link';
import styles from './documentTitle.module.css';
import 'material-symbols';

interface DocumentTitleProps {
  document_name: string;
}

export default function DocumentTitle({ document_name }: DocumentTitleProps) {
  return (
    <div className={styles.container}>
      <Link href={'/'} style={{ textDecoration: 'none' }}>
        <p className={styles.label}>문서</p>
      </Link>
      <span className={`material-symbols-outlined ${styles.icon}`}>Chevron_Right</span>
      <p className={styles.label}>{document_name}</p>
    </div>
  );
}
