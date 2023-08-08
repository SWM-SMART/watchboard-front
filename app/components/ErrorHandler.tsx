'use client';
import { useToast } from '@/states/toast';
import { throwError, useError } from '@/utils/ui';

export default function ErrorHandler() {
  const pushToast = useToast((state) => state.pushToast);
  useError((msg: string) => {
    console.log(msg);
    pushToast({
      id: new Date().getTime(),
      msg: msg,
      duraton: 10000,
    });
  });
  return null;
}
