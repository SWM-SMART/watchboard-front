'use client';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useUser } from '@/states/user';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginButton() {
  const { userData, fetchUserData } = useUser();
  const router = useRouter();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // loading
  if (userData === null) {
    return <ClickableBackgroundButton color="grey" text={'확인중'} icon="cached" />;
  }

  // not logged in
  if (userData.userId === 0) {
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
      onClick={() => router.push('/logout')}
      icon="logout"
    />
  );
}
