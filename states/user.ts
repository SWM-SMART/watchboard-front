import { getUserData, refreshToken } from '@/utils/api';
import { create } from 'zustand';

interface UserState {
  userData: UserData | null;
  fetchUserData: () => void;
  accessToken: string;
}

export const useUser = create<UserState>()((set) => ({
  userData: null,
  fetchUserData: async () => {
    const newUserData = await getUserData();
    set(() => ({
      userData: newUserData ?? null,
    }));
  },
  accessToken: '',
}));
