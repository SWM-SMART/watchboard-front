'use client';
import Dialogue from '@/components/Dialogue';
import { useDocument } from '@/states/document';
import { useToast } from '@/states/toast';
import { useWhiteBoard } from '@/states/whiteboard';
import { saveDocument } from '@/utils/api';
import { useEffect } from 'react';

interface SaveDialogueProps {
  onDone: () => void;
  documentId: number;
}

export default function SaveDialogue({ onDone, documentId }: SaveDialogueProps) {
  const documentData = useWhiteBoard((state) => state.objMap);
  const pushToast = useToast((state) => state.pushToast);
  useEffect(() => {
    (async () => {
      await saveDocument(documentId, documentData);
      //TODO: catch error
      pushToast({
        id: new Date().getTime(),
        duraton: 3000,
        msg: '저장이 완료되었습니다!',
      });
      onDone();
    })();
  }, [documentData, documentId, onDone, pushToast]);
  return (
    <Dialogue enabled={false} title={'문서 저장'}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <p>문서 업로드중</p>
        <div className="loading-bar"></div>
      </div>
    </Dialogue>
  );
}
