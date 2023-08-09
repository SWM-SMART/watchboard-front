import { SELECT_DEPTH, SELECT_HIGHLIGHT, SELECT_HIGHLIGHT_OPACITY } from '@/utils/whiteboardHelper';

interface SelectionRendererProps {
  dimensions: ObjDimensions;
}

export default function SelectionRenderer({ dimensions }: SelectionRendererProps) {
  if (dimensions.h === 0 || dimensions.w === 0) return null;
  return (
    <mesh
      position={[dimensions.x + dimensions.w / 2, dimensions.y + dimensions.h / 2, SELECT_DEPTH]}
    >
      <planeGeometry attach={'geometry'} args={[dimensions.w, dimensions.h]} />
      <meshStandardMaterial
        transparent={true}
        opacity={SELECT_HIGHLIGHT_OPACITY}
        color={SELECT_HIGHLIGHT}
        depthWrite={true}
        depthTest={true}
      />
    </mesh>
  );
}
