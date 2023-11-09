import Link from 'next/link';
import { timeDifference } from '../../utils/ui';
import styles from './card.module.css';
interface CardProps {
  document: WBDocument;
}

export default function Card({ document }: CardProps) {
  return (
    <Link href={`/document/${document.documentId}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.preview}></div>
        <div className={styles.labelContainer}>
          <p className={styles.labelTitle}>{document.documentName}</p>
          <p className={styles.labelDesc}>{timeDifference(document.modifiedAt)}</p>
        </div>
      </div>
    </Link>
  );
}
