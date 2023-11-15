import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
  width: number;
  height: number;
  large?: boolean;
}

export default function Logo({ width, height, large = false }: LogoProps) {
  return (
    <Link href="/">
      <Image
        src={large ? '/logo_large.svg' : '/logo.svg'}
        width={width}
        height={height}
        alt={'logo'}
      />
    </Link>
  );
}
