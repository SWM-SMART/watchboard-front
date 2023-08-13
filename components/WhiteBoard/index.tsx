'use client';
import { CSSProperties } from 'react';
import { Canvas } from '@react-three/fiber';
import NodeRenderer from './NodeRenderer';
import MouseHandler from './MouseHandler';
import { useWhiteBoard } from '@/states/whiteboard';
import { Line, OrbitControls, Segment, Segments } from '@react-three/drei';

interface WhiteBoardProps {
  style?: CSSProperties;
}

export default function WhiteBoard({ style }: WhiteBoardProps) {
  const objTree = useWhiteBoard((state) => state.objTree);
  return (
    <Canvas
      flat
      frameloop="demand"
      style={style}
      camera={{ position: [0, 0, 100], zoom: 1 }}
      orthographic
    >
      <Line
        points={[
          [0, 0, 1],
          [200, 0, 1],
        ]}
        lineWidth={30}
        color={'red'}
        worldUnits={true}
        precision={'highp'}
        depthWrite={false}
      />

      <ambientLight />
      <NodeRenderer node={objTree} />
      <MouseHandler />
    </Canvas>
  );
}
