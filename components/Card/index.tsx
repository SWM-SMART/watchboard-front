import { timeDifference } from '../../utils/ui';
import styles from './card.module.css';
interface DocumentCardProps {
  document: WBDocumentMetadata;
}

export default function Card({ document }: DocumentCardProps) {
  return (
    <div className={styles.card}>
      <div className={styles.labelContainer}>
        <p className={styles.labelTitle}>{document.document_name}</p>
        <p className={styles.labelDesc}>{timeDifference(document.modified_at)}</p>
      </div>
    </div>
  );
}
