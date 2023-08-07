'use client';
import Button from '@/components/Button';
import { useUser } from '@/states/user';
import { useEffect } from 'react';

export default function LoginButton() {
  const { userData, fetchUserData } = useUser();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // loading
  if (userData === null) {
    return <></>;
  }

  // not logged in
  if (userData.userId === 0) {
    return <Button text={'로그인'} href={'/login'} icon="login" />;
  }

  return <Button text={'로그아웃'} href={'/logout'} icon="logout" />;
}
