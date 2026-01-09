import { create } from "zustand";

export type ChatStep = 1 | 2 | 3;

type ChatState = {
  scriptTagConfig: any | null;
  step: ChatStep;
  user: any | null;
  roomId: string | null;
  rooms: any[];
  unread: number;
  messages: any[];

  setScriptTagConfig: (scriptTagConfig: any) => void;
  setStep: (step: ChatStep) => void;
  setUser: (user: any) => void;
  setRoom: (roomId: string) => void;
  setRooms: (rooms: any[]) => void;
  incUnread: () => void;
  resetUnread: () => void;
  addMessage: (m: any) => void;
  clearMessages: () => void;
};

export const useChatStore = create<ChatState>((set) => ({
  scriptTagConfig: null,
  step: 1,
  user: null,
  roomId: null,
  rooms: [],
  unread: 0,
  messages: [],

  setScriptTagConfig: (scriptTagConfig) => set({ scriptTagConfig }),
  setStep: (step) => set({ step }),
  setUser: (user) => set({ user }),
  setRoom: (roomId) => set({ roomId }),
  setRooms: (rooms) => set({ rooms }),
  incUnread: () => set((s) => ({ unread: s.unread + 1 })),
  resetUnread: () => set({ unread: 0 }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearMessages: () => set({ messages: [] }),
}));