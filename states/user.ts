import { getUserData, refreshToken } from '@/utils/api';
import { create } from 'zustand';

interface UserState {
  userData: UserData | null | undefined;
  fetchUserData: () => void;
  accessToken: string;
  reset: () => void;
}

export const useUser = create<UserState>()((set) => ({
  userData: undefined,
  fetchUserData: async () => {
    const newUserData = await getUserData();
    set(() => ({
      userData: newUserData ?? null,
    }));
  },
  accessToken: '',
  reset: () => {
    set({ userData: null, accessToken: '' });
  },
}));
