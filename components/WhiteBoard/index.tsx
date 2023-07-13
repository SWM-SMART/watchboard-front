'use client';
import { CSSProperties } from 'react';
import { useRecoilValue } from 'recoil';
import { objTreeState } from '@/states/whiteboard';
import { Canvas } from '@react-three/fiber';
import NodeRenderer from './NodeRenderer';
import MouseHandler from './MouseHandler';

interface WhiteBoardProps {
  style?: CSSProperties;
}

export default function Whiteboard({ style }: WhiteBoardProps) {
  const objTree = useRecoilValue(objTreeState);
  return (
    <Canvas
      frameloop="demand"
      style={style}
      camera={{ position: [0, 0, 100], zoom: 1 }}
      orthographic
    >
      <ambientLight />
      <NodeRenderer node={objTree} />
      <MouseHandler />
    </Canvas>
  );
}
