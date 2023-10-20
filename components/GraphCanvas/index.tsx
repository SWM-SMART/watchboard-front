'use client';
import { CSSProperties, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useWhiteBoard } from '@/states/whiteboard';
import { useGraph } from '@/states/graph';
import dynamic from 'next/dynamic';
const GraphRenderer = dynamic(() => import('./GraphRenderer'), { ssr: false });

interface GraphCanvasProps {
  style?: CSSProperties;
}

export default function GraphCanvas({ style }: GraphCanvasProps) {
  const graphData = useWhiteBoard((state) => state.graphData);
  const selected = useGraph((state) => state.selected);
  useEffect(() => {
    console.log(selected);
  }, [selected]);

  if (graphData === null) return <></>;

  return (
    <Canvas
      flat
      frameloop="demand"
      style={style}
      camera={{ position: [0, 0, 1000], zoom: 1, far: 1000000, near: 0 }}
      orthographic
    >
      <ambientLight />
      <GraphRenderer data={graphData} />
    </Canvas>
  );
}
