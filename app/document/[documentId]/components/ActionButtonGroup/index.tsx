'use client';
import { throwError } from '@/utils/ui';
import ActionButton from '../ActionButton';
import styles from './actionButtonGroup.module.css';
import { Dispatch, ReactNode, SetStateAction } from 'react';
import GenerateDialouge from '../GenerateDialogue';

interface ActionButtonGroupProps {
  setOverlay: Dispatch<SetStateAction<ReactNode | null>>;
}

export default function ActionButtonGroup({ setOverlay }: ActionButtonGroupProps) {
  return (
    <div className={styles.container}>
      <ActionButton
        label={'생성'}
        icon={'auto_awesome'}
        onClick={() => setOverlay(<GenerateDialouge onCancel={() => setOverlay(null)} />)}
      />
      <ActionButton
        label={'내보내기'}
        icon={'publish'}
        onClick={() => throwError('준비중인 기능입니다.')}
      />
      <ActionButton
        label={'가져오기'}
        icon={'exit_to_app'}
        onClick={() => throwError('준비중인 기능입니다.')}
      />
      <ActionButton
        label={'공유'}
        icon={'share'}
        onClick={() => throwError('준비중인 기능입니다.')}
      />
    </div>
  );
}
