'use client';
import ActionButton from '../ActionButton';
import styles from './actionButtonGroup.module.css';
export default function ActionButtonGroup() {
  return (
    <div className={styles.container}>
      <ActionButton label={'녹음 추가'} icon={'auto_detect_voice'} onClick={() => {}} />
      <ActionButton label={'내보내기'} icon={'exit_to_app'} onClick={() => {}} />
      <ActionButton label={'가져오기'} icon={'publish'} onClick={() => {}} />
      <ActionButton label={'공유'} icon={'share'} onClick={() => {}} />
    </div>
  );
}
