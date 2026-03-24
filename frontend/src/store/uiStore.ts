import { create } from 'zustand';

interface UIStore {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  activeModal: string | null;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  activeModal: null,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMobileSidebar: () => set((s) => ({ mobileSidebarOpen: !s.mobileSidebarOpen })),
  closeMobileSidebar: () => set({ mobileSidebarOpen: false }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),
}));
