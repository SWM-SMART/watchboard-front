'use client';
export default function LoadMsw() {
  if (process.env.NEXT_PUBLIC_API_MOCKING === 'enabled') {
    require('@/mocks');
  }
  return null;
}
