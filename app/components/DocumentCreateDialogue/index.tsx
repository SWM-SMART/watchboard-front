'use client';
import styles from './documentCreateDialogue.module.css';
import Dialogue from '@/components/Dialogue';
import FileInput from '@/components/Dialogue/Input/FileInput';
import TextInput from '@/components/Dialogue/Input/TextInput';
import { useToast } from '@/states/toast';
import { createDocument, uploadFile } from '@/utils/api';
import { throwError } from '@/utils/ui';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DocumentCreateDialogueProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export default function DocumentCreateDialogue({
  onCancel,
  onSuccess,
}: DocumentCreateDialogueProps) {
  const router = useRouter();
  const [load, setLoad] = useState<boolean>(false);
  const pushToast = useToast((state) => state.pushToast);

  return (
    <div className={styles.container} style={load ? { pointerEvents: 'none' } : undefined}>
      <Dialogue
        enabled={!load}
        title={'학습 생성'}
        onCancel={onCancel}
        onSubmit={(e) => {
          e.preventDefault();
          setLoad(true);
          // checkTitle
          const titleInput = (e.target as any).title as HTMLInputElement;
          const fileInput = (e.target as any).file as HTMLInputElement;

          // check file
          if (fileInput.files === null || fileInput.files.length === 0) {
            throwError('요약할 파일을 입력해 주세요');
            return setLoad(false);
          }

          // check title
          if (titleInput.value.length === 0) {
            // throwError('문서의 제목을 입력해 주세요');
            // return setLoad(false);

            // set to filename if left blank
            titleInput.value = fileInput.files[0].name;
          }

          (async () => {
            // create new Document
            const newDocument = await createDocument(titleInput.value);

            // upload file (if exists)
            await uploadFile(newDocument.documentId, fileInput.files![0]);

            pushToast({
              id: new Date().getTime(),
              duraton: 3000,
              msg: `문서 "${newDocument.documentName}" (이)가 생성되었습니다!`,
            });

            router.push(`/document/${newDocument.documentId}`);
            onSuccess();
          })();
        }}
      >
        <TextInput label="제목" name="title" />
        <FileInput
          name="file"
          types={['application/pdf', 'audio/mpeg']}
          typeNames={['pdf', 'mp3']}
          onError={(msg) => pushToast({ id: new Date().getTime(), duraton: 3000, msg: msg })}
        />
      </Dialogue>
    </div>
  );
}
