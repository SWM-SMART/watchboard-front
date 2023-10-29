'use client';
import { CSSProperties, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGraph } from '@/states/graph';
import dynamic from 'next/dynamic';
import { useViewer } from '@/states/viewer';
const GraphRenderer = dynamic(() => import('./GraphRenderer'), { ssr: false });

interface GraphCanvasProps {
  style?: CSSProperties;
}

export default function GraphCanvas({ style }: GraphCanvasProps) {
  const mindMapData = useViewer((state) => state.mindMapData);

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
