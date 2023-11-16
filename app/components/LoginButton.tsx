'use client';
import ClickableBackgroundButton from '@/components/BackgroundButton/ClickableBackgroundButton';
import { useUser } from '@/states/user';
import { API_BASE_URL } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginButton() {
  const { userData, fetchUserData, reset } = useUser();
  const router = useRouter();

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
        reset();
        router.push(`${API_BASE_URL}/users/logout`);
      }}
      icon="logout"
    />
  );
}
