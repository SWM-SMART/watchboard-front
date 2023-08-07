'use client';
import styles from './DocumentCreateDialogue.module.css';
import Dialogue from '@/components/Dialogue';
import TextInput from '@/components/Dialogue/Input/TextInput';
import { createDocument } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DocumentCreateDialogue() {
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);

  return (
    <div className={styles.container}>
      <Dialogue
        enabled={!load}
        title={'문서 생성'}
        onCancel={() => router.back()}
        onSubmit={() => {
          setLoad(true);
          (async () => {
            // create and open new document
            const newDocument = await createDocument(title);
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
