'use client';
import { Canvas } from '@react-three/fiber';
import MouseHandler from './MouseHandler';
import { CSSProperties } from 'react';

interface WhiteBoardCanvasProps {
  children: React.ReactNode;
  style: CSSProperties;
}

// everything in whiteboard is rendered inside this canvas
export default function WhiteBoardCanvas({ children, style }: WhiteBoardCanvasProps) {
  return (
    <Canvas
      frameloop="demand"
      style={style}
      camera={{ position: [0, 0, 100], zoom: 1 }}
      orthographic
    >
      <ambientLight />
      {children}
      <MouseHandler />
    </Canvas>
  );
}
