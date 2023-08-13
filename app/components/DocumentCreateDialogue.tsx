'use client';
import Dialogue from '@/components/Dialogue';
import TextInput from '@/components/Dialogue/Input/TextInput';
import { useToast } from '@/states/toast';
import { createDocument } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DocumentCreateDialogue() {
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);
  const pushToast = useToast((state) => state.pushToast);

  return (
    <div style={{ maxWidth: '500px', width: '100%' }}>
      <Dialogue
        enabled={!load}
        title={'문서 생성'}
        onCancel={() => router.back()}
        onSubmit={() => {
          setLoad(true);
          (async () => {
            // create and open new document
            const newDocument = await createDocument(title);
            pushToast({
              id: new Date().getTime(),
              duraton: 3000,
              msg: `문서 "${newDocument.documentName}" (이)가 생성되었습니다!`,
            });
            router.replace(`/document/${newDocument.documentId}`);
          })();
        }}
      >
        {load ? (
          <p>...</p>
        ) : (
          <TextInput label={'제목'} onChange={(e) => setTitle(e.target.value)} />
        )}
      </Dialogue>
    </div>
  );
}
