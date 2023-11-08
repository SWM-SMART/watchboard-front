import { Ref, forwardRef } from 'react';
import styles from './audioViewerOptions.module.css';

interface AudioViewerOptionsProps {
  url: string;
}

const AudioViewerOptions = forwardRef(function AudioViewerOptions(
  { url }: AudioViewerOptionsProps,
  ref: Ref<HTMLAudioElement>,
) {
  return (
    <div className={styles.container}>
      <audio ref={ref} className={styles.audioControls} controls src={url} />
    </div>
  );
});

export default AudioViewerOptions;
