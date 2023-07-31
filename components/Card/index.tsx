import Link from 'next/link';
import { timeDifference } from '../../utils/ui';
import styles from './card.module.css';
interface CardProps {
  document: WBDocumentMetadata;
}

export default function Card({ document }: CardProps) {
  return (
    <Link href={`/document/${document.document_id}`} className={styles.link}>
      <div className={styles.card}>
        <div className={styles.labelContainer}>
          <p className={styles.labelTitle}>{document.document_name}</p>
          <p className={styles.labelDesc}>{timeDifference(document.modified_at)}</p>
        </div>
      </div>
    </Link>
  );
}
