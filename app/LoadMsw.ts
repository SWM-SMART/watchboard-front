'use client';

export default function LoadMsw() {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled' && typeof window === 'object') {
    require('@/mocks/browserInit');
  }
  return null;
}
