'use client';
import { CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import dynamic from 'next/dynamic';
const GraphRenderer = dynamic(() => import('./GraphRenderer'), { ssr: false });

interface GraphCanvasProps {
  style?: CSSProperties;
  mindMapData: Map<number, GraphData>;
}

export default function GraphCanvas({ style, mindMapData }: GraphCanvasProps) {
  if (mindMapData === null) return <></>;

  return (
    <Canvas
      flat
      frameloop="demand"
      style={style}
      camera={{ position: [0, 0, 1000], zoom: 1, far: 1000000, near: 0 }}
      orthographic
    >
      <ambientLight />
      <GraphRenderer data={mindMapData} />
    </Canvas>
  );
}
