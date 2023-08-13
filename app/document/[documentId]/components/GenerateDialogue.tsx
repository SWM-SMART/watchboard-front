'use client';

import Dialogue from '@/components/Dialogue';
import TextInput from '@/components/Dialogue/Input/TextInput';
import { useToast } from '@/states/toast';
import { generateGraph } from '@/utils/api';
import { useState } from 'react';

interface GenerateDialogueProps {
  onCancel: () => void;
}

export default function GenerateDialouge({ onCancel }: GenerateDialogueProps) {
  const [text, setText] = useState<string>('');
  const [load, setLoad] = useState<boolean>(false);
  const pushToast = useToast((state) => state.pushToast);

  const onSubmit = () => {
    setLoad(true);
    // request generation
    (async () => {
      const res = await generateGraph({ text });
      if (res === undefined) {
        pushToast({
          id: new Date().getTime(),
          duraton: 3000,
          msg: '작업을 실패했습니다.',
        });
        return setLoad(false);
      }

      // TODO: get and render actual response
      pushToast({
        id: new Date().getTime(),
        duraton: 3000,
        msg: '그래프 생성이 완료되었습니다!',
      });
      onCancel();
    })();
  };

  return (
    <div style={{ width: '100%', maxWidth: '600px' }}>
      <Dialogue enabled={!load} title={'그래프 생성'} onCancel={onCancel} onSubmit={onSubmit}>
        {load ? (
          <div
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
          >
            <p>잠시만 기다려 주세요</p>
            <div className="loading-bar"></div>
          </div>
        ) : (
          <TextInput
            text={text}
            onChange={(e) => setText(e.target.value)}
            label={'생성에 사용될 글'}
            multiline={true}
          />
        )}
      </Dialogue>
    </div>
  );
}
