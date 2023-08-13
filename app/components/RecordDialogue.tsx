'use client';

import { throwError } from '@/utils/ui';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RecordDialogue() {
  const router = useRouter();
  useEffect(() => {
    throwError('준비중인 기능입니다');
    router.back();
  }, [router]);
  return null;
}
