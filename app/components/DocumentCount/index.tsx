'use client';
import { useDocument } from '@/states/document';
import styles from './documentCount.module.css';
import { useUser } from '@/states/user';

export default function DocumentCount() {
  const documentList = useDocument((state) => state.documentList);
  const userData = useUser((state) => state.userData);
  const length = documentList?.length;
  return <p className={styles.count}>{userData === null ? '...' : length}</p>;
}
