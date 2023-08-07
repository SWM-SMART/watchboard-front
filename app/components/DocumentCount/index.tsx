'use client';
import { useDocumentList } from '@/states/document';
import styles from './documentCount.module.css';
import { Suspense } from 'react';

export default function DocumentCount() {
  const { documentList } = useDocumentList();
  const length = documentList.length;
  return <p className={styles.count}>{length > 0 ? length : '...'}</p>;
}
