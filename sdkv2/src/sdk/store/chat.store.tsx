import { create } from "zustand";
import { fetchRoomMessages } from "../api/chat.api";
import { joinRoom } from "../socket/socket";

export type ChatStep = 1 | 2 | 3;

type ChatState = {
  scriptTagConfig: any | null;
  step: ChatStep;
  user: any | null;
  roomId: string | null;
  rooms: any[];
  unread: number;
  messages: any[];
  connectionStatus: "connecting" | "online" | "offline";
  isOpen: boolean;

  setScriptTagConfig: (scriptTagConfig: any) => void;
  setStep: (step: ChatStep) => void;
  setUser: (user: any) => void;
  setRoom: (roomId: string) => Promise<void>;
  setRooms: (rooms: any[]) => void;
  incUnread: () => void;
  resetUnread: () => void;
  addMessage: (m: any) => void;
  clearMessages: () => void;
  setConnectionStatus: (s: ChatState["connectionStatus"]) => void;
  open: () => void;
  close: () => void;
  toggleOpen: () => void;
};

export const useChatStore = create<ChatState>((set, get) => ({
  scriptTagConfig: null,
  step: 1,
  user: null,
  roomId: null,
  rooms: [],
  unread: 0,
  messages: [],
  connectionStatus: "connecting",
  isOpen: true,

  setScriptTagConfig: (scriptTagConfig) => set({ scriptTagConfig }),
  setStep: (step) => set({ step }),
  setUser: (user) => set({ user }),
  setRooms: (rooms) => set({ rooms }),
  incUnread: () => set((s) => ({ unread: s.unread + 1 })),
  resetUnread: () => set({ unread: 0 }),
  addMessage: (m) => set((s) => ({ messages: [...s.messages, m] })),
  clearMessages: () => set({ messages: [] }),
  setConnectionStatus: (status) => set({ connectionStatus: status }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggleOpen: () => set((s) => ({ isOpen: !s.isOpen })),

  setRoom: async (roomId: string) => {
    const currentRoomId = get().roomId;
    if (currentRoomId === roomId) return;

    joinRoom(roomId);
    const messages = await fetchRoomMessages(roomId);

    set({
      roomId,
      messages,
      step: 3,
      unread: 0,
    });
  },
}));