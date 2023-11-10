import { create } from 'zustand';

interface ContextMenuState {
  menu: ContextMenu | null;
  setMenu: (menus: ContextMenu | null) => void;
}

export interface ContextMenu {
  items: ContextMenuItem[];
  position: Coord;
}

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
}

export const useContextMenu = create<ContextMenuState>()((set) => ({
  menu: null,
  setMenu: (menu) => set({ menu: menu }),
}));
