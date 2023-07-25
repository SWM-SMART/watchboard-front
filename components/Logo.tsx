import Image from 'next/image';

interface LogoProps {
  width: number;
  height: number;
}

export default function Logo({ width, height }: LogoProps) {
  return <Image src="/logo.svg" width={width} height={height} alt={'logo'} />;
}
