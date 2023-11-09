'use client';
import OverlayWrapper from '@/components/OverlayWrapper';
import { useOverlay } from '@/states/overlay';

export default function OverlayViewer() {
  const overlay = useOverlay((state) => state.overlay);
  return <OverlayWrapper>{overlay}</OverlayWrapper>;
}
