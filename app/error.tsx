'use client';
import Logo from '@/components/Logo';
import Link from 'next/link';
export default function Error() {
  return (
    <div className="error-container">
      <Logo width={200} height={200} large={true} />
      <Link className="link" href="/login">
        로그인
      </Link>
    </div>
  );
}
