import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/chat.store";
import { getSDKConfig } from "../config";
import { informConfigError } from "../common";

let socket: Socket;

export function initSocket() {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  socket = io(config.apiUrl, {
    transports: ["websocket"],
    auth: { apiKey: config.apiKey },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("sdk:message:new", (msg) => {
    const { roomId } = useChatStore.getState();
    if (msg.data.message.roomId !== roomId) {
      useChatStore.getState().incUnread();
    }
    useChatStore.getState().addMessage(msg.data.message);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function fetchRooms() {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  const socket = getSocket();

  socket.emit(
    "sdk:room:list",
    { 
      apiKey: config.apiKey 
    },
    (res: any) => {
      if (!res.ok) {
        console.error("[ChatSDK] Failed to fetch rooms", res);
        return;
      }

      useChatStore.getState().setRooms(res.data);
    }
  );
}

export function joinRoom(roomId: string) {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  const socket = getSocket();
  const { user } = useChatStore.getState();

  if (!user) {
    console.error("[ChatSDKV2] User not created");
    return;
  }

  socket.emit(
    "sdk:room:join",
    {
      apiKey: config.apiKey,
      userId: user.id,
      roomId,
    },
    (res: any) => {
      if (!res?.ok) {
        console.error("[ChatSDKV2] joinRoom failed:", res?.error);
        return;
      }

      useChatStore.setState({
        roomId,
        step: 3,
      });
    }
  );
}

export function createUser(values: any) {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  const socket = getSocket();

  socket.emit(
    "sdk:user:create",
    {
      apiKey: config.apiKey,
      name: values.name,
      email: values.email,
      dob: values.dob.format("YYYY-MM-DD"),
      gender: values.gender,
      agreedToTerms: values.agree,
    },
    (res: any) => {
      if (!res.ok) {
        console.error(res.error.message);
        return;
      }

      useChatStore.getState().setUser(res.data.user);
      useChatStore.getState().setStep(2);
    }
  );
}

export function sendMessage(roomId: any, text: string) {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  const socket = getSocket();
  const { user } = useChatStore.getState();

  if (!user) {
    console.error("[ChatSDKV2] User not created");
    return;
  }

  socket.emit(
    "sdk:message:send", 
    {
      apiKey: config.apiKey,
      userId: user.id,
      roomId,
      text,
    }
  );
}

export function createRoom(values: any) {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  const socket = getSocket();
  const { user } = useChatStore.getState();

  if (!user) {
    console.error("[ChatSDKV2] User not created");
    return;
  }

  socket.emit(
    "sdk:room:create", 
    {
      apiKey: config.apiKey,
      userId: user.id,
      roomName: values.roomName,
      maxUsers: values.maxUsers,
      startDate: values.startDate,
    }, 
    (res: any) => {
      if (!res.ok) {
        alert(res.error?.message || "Failed to create room");
        return;
      }

      useChatStore.getState().setRoom(res.data.room.id);
      useChatStore.getState().setStep(3);
    }
  );
}