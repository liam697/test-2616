import { io, Socket } from "socket.io-client";
import { useChatStore } from "../store/chat.store";
import { getSDKConfig } from "../config";
import { informConfigError } from "../common";
import { message } from "antd";
import dayjs from "dayjs";

let socket: Socket;

export function initSocket() {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  const { setConnectionStatus } = useChatStore.getState();

  socket = io(config.apiUrl, {
    transports: ["websocket"],
    auth: { apiKey: config.apiKey },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    setConnectionStatus("online");
    createUserAfterReconnecting();
  });

  socket.on("disconnect", () => {
    setConnectionStatus("offline");
  });

  socket.on("connect_error", () => {
    setConnectionStatus("connecting");
  });

  socket.on("sdk:message:new", (msg: any) => {
    const {
      user,
      roomId,
      isOpen,
      addMessage,
      incUnread,
    } = useChatStore.getState();

    const message = msg.data.message;

    addMessage(message);

    if (
      message.senderUserId !== user?.id &&
      (message.roomId !== roomId || !isOpen)
    ) {
      incUnread();
    }
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

      const rooms = Array.isArray(res.data)
        ? [...res.data].reverse()
        : [];

      useChatStore.getState().setRooms(rooms);

      // useChatStore.getState().setRooms(res.data);
    }
  );
}

export function joinRoom(roomId: string) {
  const config = getSDKConfig();
  if (!config) {
    informConfigError();
    return;
  }

  fetchRooms();

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
        message.error((res?.error?.message ? res?.error?.message : 'Unknown Reason'));
        useChatStore.setState({
          roomId: null,
          messages: [],
          step: 2,
        });
        return;
      }

      useChatStore.setState({
        roomId,
        step: 3,
      });

      fetchRooms();
    }
  );
}

export function createUser(values: any, createUserConfig: any = {}) {
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
      
      if (createUserConfig?.reconnect) {
        fetchRooms();

        let roomId = useChatStore?.getState()?.roomId;
        
        if (roomId) {
          joinRoom(roomId);
        } else {
          useChatStore.getState().setStep(2);
        }
      } else {
        useChatStore.getState().setStep(2);
      }
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

      fetchRooms();

      useChatStore.getState().setRoom(res.data.room.id);
      useChatStore.getState().setStep(3);
    }
  );
}

export function createUserAfterReconnecting() {
  const { user } = useChatStore.getState();
  if (!user) return;

  createUser({
    ...user,
    dob: user.dob ? dayjs(user.dob) : null,
    agree: true,
  }, {
    reconnect: true,
  });
}