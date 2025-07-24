import { create } from "zustand";

export type FooterButtonConfig = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "Button" | "Icon" | 'Link';
  iconName?: string;
};

type FooterConfig = {
  visible: boolean;
  pageName: string;
  leftButtons: FooterButtonConfig[];
  rightButtons: FooterButtonConfig[];
};

type FooterStore = {
  config: FooterConfig;
  setFooter: (config: Partial<FooterConfig>) => void;
  resetFooter: () => void;
};

const initialState: FooterConfig = {
  visible: false,
  pageName: '',
  leftButtons: [],
  rightButtons: [],
};

export const useFooterStore = create<FooterStore>((set) => ({
  config: initialState,
  setFooter: (config) =>
    set((state) => ({ config: { ...state.config, ...config } })),
  resetFooter: () => set({ config: initialState }),
}));