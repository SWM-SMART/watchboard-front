import Link from 'next/link';
import styles from './documentTitle.module.css';
import 'material-symbols';

interface DocumentTitleProps {
  documentName: string;
  sourceDataType: WBSourceDataType;
}

export default function DocumentTitle({ documentName, sourceDataType }: DocumentTitleProps) {
  return (
    <div className={styles.container}>
      <span className={`material-symbols-outlined ${styles.icon}`}>
        {typeToIcon(sourceDataType)}
      </span>
      <p className={styles.label}>{documentName}</p>
    </div>
  );
}

function typeToIcon(type: WBSourceDataType): string {
  switch (type) {
    case 'pdf':
      return 'picture_as_pdf';
    case 'audio':
      return 'text_to_speech';
  }
}
