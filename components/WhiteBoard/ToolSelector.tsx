'use client';

import { currentToolState } from '@/states/whiteboard';
import { useRecoilState } from 'recoil';

export default function ToolSelector() {
  const [tool, setTool] = useRecoilState(currentToolState);
  return (
    <div>
      <p>{tool}</p>
      <button onClick={() => setTool('HAND')}>HAND</button>
      <button onClick={() => setTool('SELECT')}>SELECT</button>
      <button onClick={() => setTool('RECT')}>RECT</button>
      <button onClick={() => setTool('TEXT')}>TEXT</button>
    </div>
  );
}
