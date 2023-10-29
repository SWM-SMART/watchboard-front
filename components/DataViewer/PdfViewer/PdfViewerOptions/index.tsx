import SmallIconButton from '@/components/Button/SmallIconButton';
import styles from './pdfViewerOptions.module.css';
import { Dispatch, SetStateAction } from 'react';

const SCALE_MAX = 10;
const SCALE_MIN = 1;

interface PdfViewerOptionsProps {
  scale: number;
  setScale: Dispatch<SetStateAction<number>>;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  numPages: number;
}

export default function PdfViewerOptions({
  scale,
  setScale,
  page,
  setPage,
  numPages,
}: PdfViewerOptionsProps) {
  return (
    <div className={styles.documentControls}>
      <SmallIconButton
        icon="zoom_out"
        selected={false}
        onClick={() => {
          setScale((scale) => Math.max(scale - 0.1, SCALE_MIN));
        }}
      />
      <p style={{ width: '50px' }}>{`${Math.round(scale * 100)}%`}</p>
      <SmallIconButton
        icon="zoom_in"
        selected={false}
        onClick={() => {
          setScale((scale) => Math.min(scale + 0.1, SCALE_MAX));
        }}
      />
      <p>|</p>
      <SmallIconButton
        icon="navigate_before"
        selected={false}
        onClick={() => {
          setPage((page) => {
            const newPage = page - 1;
            if (newPage < 0) return 0;
            return newPage;
          });
        }}
      />
      <p style={{ width: '50px' }}>{page + 1}</p>
      <SmallIconButton
        icon="navigate_next"
        selected={false}
        onClick={() => {
          setPage((page) => {
            const newPage = page + 1;
            if (newPage >= numPages) return numPages - 1;
            return newPage;
          });
        }}
      />
    </div>
  );
}
