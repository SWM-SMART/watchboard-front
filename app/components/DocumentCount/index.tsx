'use client';
import { useDocument } from '@/states/document';
import styles from './documentCount.module.css';

export default function DocumentCount() {
  const { documentList } = useDocument();
  const length = documentList.length;
  return <p className={styles.count}>{length > 0 ? length : '...'}</p>;
}
