'use client';
import Link from 'next/link';
import { timeDifference } from '../../utils/ui';
import styles from './card.module.css';
import { ContextMenuItem, useContextMenu } from '@/states/contextMenu';
import { deleteDocument } from '@/utils/api';
import { useDocument } from '@/states/document';
interface CardProps {
  document: WBDocument;
}

export default function Card({ document }: CardProps) {
  const setMenu = useContextMenu((state) => state.setMenu);
  const deleteDocument = useDocument((state) => state.deleteDocument);
  return (
    <Link
      href={`/document/${document.documentId}`}
      className={styles.link}
      onContextMenu={(e) => {
        e.preventDefault();
        setMenu({
          items: [
            {
              onClick: async () => {
                deleteDocument(document.documentId);
              },
              label: `삭제`,
            },
          ],
          position: { x: e.pageX, y: e.pageY },
        });
      }}
    >
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
