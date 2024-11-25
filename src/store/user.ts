import create from "zustand";
import { persist } from "zustand/middleware";

export interface IUser {
  id: string;
  name: string;
  isSuperAdmin: boolean;
}

interface IUserState {
  user: IUser | null;
  setUser: (user: IUser) => void;
  logout: () => void;
}

const useUserStore = create<IUserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "user",
      getStorage: () => localStorage,
    }
  )
);

export default useUserStore;
