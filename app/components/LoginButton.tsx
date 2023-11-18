'use client';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useToast } from '@/states/toast';
import { useUser } from '@/states/user';
import { logout } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginButton() {
  const { userData, fetchUserData, reset } = useUser();
  const router = useRouter();
  const pushToast = useToast((state) => state.pushToast);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // loading
  if (userData === undefined) {
    return <ClickableBackgroundButton color="grey" text={'확인중'} icon="cached" />;
  }

  // not logged in
  if (userData === null) {
    return (
      <ClickableBackgroundButton
        text={'로그인'}
        onClick={() => router.push('/login')}
        icon="login"
      />
    );
  }

  return (
    <ClickableBackgroundButton
      color="grey"
      invert={true}
      text={'로그아웃'}
      onClick={() => {
        (async () => {
          if (!(await logout())) {
            return pushToast({
              id: new Date().getTime(),
              duraton: 3000,
              msg: '로그아웃 실패',
            });
          }
          reset();
          router.push('/');
        })();
      }}
      icon="logout"
    />
  );
}
