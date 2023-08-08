'use client';

import { useError } from '@/utils/ui';

export default function ErrorHandler() {
  useError((msg: string) => {
    // TODO: handle error messages
    console.log(msg);
  });
  return null;
}
