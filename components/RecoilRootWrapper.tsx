'use client';
import { RecoilRoot } from 'recoil';

interface Props {
  children: React.ReactNode;
}

export default function RecoilRootWrapper({ children }: Props) {
  return <RecoilRoot>{children}</RecoilRoot>;
}
