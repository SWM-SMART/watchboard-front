'use client';
import { CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import NodeRenderer from './NodeRenderer';
import MouseHandler from './MouseHandler';
import { useWhiteBoard } from '@/states/whiteboard';

interface WhiteBoardProps {
  style?: CSSProperties;
}

export default function WhiteBoard({ style }: WhiteBoardProps) {
  const objTree = useWhiteBoard((state) => state.objTree);
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
