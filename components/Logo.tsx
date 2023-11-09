import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width: number;
  height: number;
}

export default function Logo({ width, height }: LogoProps) {
  return (
    <Link href="/">
      <Image src="/logo.svg" width={width} height={height} alt={'logo'} />
    </Link>
  );
}
