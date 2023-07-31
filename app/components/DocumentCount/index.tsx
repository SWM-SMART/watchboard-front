'use client';
import styles from './documentCount.module.css';
import { useRecoilValue } from 'recoil';
import { documentListState } from '../../../states/document';

export default function DocumentCount() {
  const { length } = useRecoilValue(documentListState);
  return <p className={styles.count}>{length > 0 ? length : '...'}</p>;
}
