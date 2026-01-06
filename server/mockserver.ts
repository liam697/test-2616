import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";
import { nanoid } from "nanoid";

type Gender = "Male" | "Female" | "Other";

type User = {
  id: string;
  name: string;
  email: string;
  dob: string;
  gender: Gender;
  createdAt: number;
};

type Room = {
  id: string;
  name: string;
  startDate: string;
  maxUsers: number;
  createdAt: number;
  createdByUserId: string;
};

type Message = {
  id: string;
  roomId: string;
  senderUserId: string;
  senderName: string;
  text: string;
  createdAt: number;
};

type CreateUserPayload = {
  apiKey: string;
  name: string;
  email: string;
  dob: string;
  gender?: Gender;
  agreedToTerms: boolean;
};

type CreateRoomPayload = {
  apiKey: string;
  userId: string;
  roomName: string;
  startDate: string;
  maxUsers?: number;
};

type JoinRoomPayload = {
  apiKey: string;
  userId: string;
  roomId: string;
};

type SendMessagePayload = {
  apiKey: string;
  userId: string;
  roomId: string;
  text: string;
};

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);
const API_KEYS = (process.env.API_KEYS || "demo-key")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes("*")) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
  })
);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (ALLOWED_ORIGINS.includes("*")) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin not allowed: ${origin}`));
    },
    credentials: true,
  },
});

const users = new Map<string, User>();
const rooms = new Map<string, Room>();
const roomMembers = new Map<string, Set<string>>();
const messagesByRoom = new Map<string, Message[]>();

function seedRooms() {
  const now = Date.now();
  const r1: Room = {
    id: "room_001",
    name: "Support Room",
    startDate: new Date().toISOString().slice(0, 10),
    maxUsers: 10,
    createdAt: now,
    createdByUserId: "system",
  };
  const r2: Room = {
    id: "room_002",
    name: "Sales Room",
    startDate: new Date().toISOString().slice(0, 10),
    maxUsers: 5,
    createdAt: now,
    createdByUserId: "system",
  };
  rooms.set(r1.id, r1);
  rooms.set(r2.id, r2);
  roomMembers.set(r1.id, new Set());
  roomMembers.set(r2.id, new Set());
  messagesByRoom.set(r1.id, []);
  messagesByRoom.set(r2.id, []);
}
seedRooms();

function isValidApiKey(apiKey: string) {
  return API_KEYS.includes(apiKey);
}

function err(code: string, message: string) {
  return { ok: false as const, error: { code, message } };
}
function ok<T>(data: T) {
  return { ok: true as const, data };
}

function isAtLeast18(dob: string) {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const years = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (years > 18) return true;
  if (years < 18) return false;
  if (m > 0) return true;
  if (m < 0) return false;
  return now.getDate() >= d.getDate();
}

function isStartDateNotPast(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return d.getTime() >= today.getTime();
}

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/api/rooms", (_req, res) => {
  const list = Array.from(rooms.values()).map((r) => ({
    id: r.id,
    name: r.name,
    startDate: r.startDate,
    maxUsers: r.maxUsers,
    members: roomMembers.get(r.id)?.size ?? 0,
  }));
  res.json(ok(list));
});

app.get("/api/rooms/:roomId/messages", (req, res) => {
  const { roomId } = req.params;
  if (!rooms.has(roomId))
    return res.status(404).json(err("ROOM_NOT_FOUND", "Room not found"));
  res.json(ok(messagesByRoom.get(roomId) ?? []));
});

io.on("connection", (socket) => {
  socket.emit("sdk:status", ok({ status: "online" as const }));

  socket.on("disconnect", () => {});

  socket.on(
    "sdk:room:list",
    (payload: { apiKey: string }, ack?: (v: any) => void) => {
      try {
        if (!isValidApiKey(payload?.apiKey))
          return ack?.(err("UNAUTHORIZED", "Invalid apiKey"));
        const list = Array.from(rooms.values()).map((r) => ({
          id: r.id,
          name: r.name,
          startDate: r.startDate,
          maxUsers: r.maxUsers,
          members: roomMembers.get(r.id)?.size ?? 0,
        }));
        ack?.(ok(list));
      } catch (e: any) {
        ack?.(err("INTERNAL", e?.message || "Unknown error"));
      }
    }
  );

  socket.on(
    "sdk:user:create",
    (payload: CreateUserPayload, ack?: (v: any) => void) => {
      try {
        if (!payload) return ack?.(err("BAD_REQUEST", "Payload required"));
        if (!isValidApiKey(payload.apiKey))
          return ack?.(err("UNAUTHORIZED", "Invalid apiKey"));
        if (!payload.agreedToTerms)
          return ack?.(err("TERMS_REQUIRED", "Must agree to terms"));
        if (!payload.name || payload.name.length > 30)
          return ack?.(err("INVALID_NAME", "Invalid name"));
        if (!/^[A-Za-z\s]+$/.test(payload.name))
          return ack?.(err("INVALID_NAME", "Name must be letters only"));
        if (!payload.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email))
          return ack?.(err("INVALID_EMAIL", "Invalid email"));
        if (!payload.dob || !isAtLeast18(payload.dob))
          return ack?.(err("INVALID_DOB", "Must be at least 18"));
        const gender: Gender = payload.gender || "Male";

        const id = `u_${nanoid(10)}`;
        const user: User = {
          id,
          name: payload.name.trim(),
          email: payload.email.trim().toLowerCase(),
          dob: new Date(payload.dob).toISOString(),
          gender,
          createdAt: Date.now(),
        };
        users.set(id, user);

        ack?.(ok({ user }));
      } catch (e: any) {
        ack?.(err("INTERNAL", e?.message || "Unknown error"));
      }
    }
  );

  socket.on(
    "sdk:room:create",
    (payload: CreateRoomPayload, ack?: (v: any) => void) => {
      try {
        if (!payload) return ack?.(err("BAD_REQUEST", "Payload required"));
        if (!isValidApiKey(payload.apiKey))
          return ack?.(err("UNAUTHORIZED", "Invalid apiKey"));
        if (!users.has(payload.userId))
          return ack?.(err("USER_NOT_FOUND", "User not found"));

        const roomName = (payload.roomName || "").trim();
        if (!roomName)
          return ack?.(err("INVALID_ROOM_NAME", "Room name required"));
        if (roomName.length > 50)
          return ack?.(err("INVALID_ROOM_NAME", "Max 50 chars"));

        const startDate =
          payload.startDate || new Date().toISOString().slice(0, 10);
        if (!isStartDateNotPast(startDate))
          return ack?.(
            err("INVALID_START_DATE", "Start date cannot be in the past")
          );

        const maxUsers = Math.max(2, Math.min(10, payload.maxUsers ?? 2));

        const id = `room_${nanoid(8)}`;
        const room: Room = {
          id,
          name: roomName,
          startDate: new Date(startDate).toISOString().slice(0, 10),
          maxUsers,
          createdAt: Date.now(),
          createdByUserId: payload.userId,
        };

        rooms.set(id, room);
        roomMembers.set(id, new Set());
        messagesByRoom.set(id, []);

        roomMembers.get(id)!.add(payload.userId);
        socket.join(id);

        ack?.(ok({ room }));
        io.emit("sdk:room:created", ok({ room }));
      } catch (e: any) {
        ack?.(err("INTERNAL", e?.message || "Unknown error"));
      }
    }
  );

  socket.on(
    "sdk:room:join",
    (payload: JoinRoomPayload, ack?: (v: any) => void) => {
      try {
        if (!payload) return ack?.(err("BAD_REQUEST", "Payload required"));
        if (!isValidApiKey(payload.apiKey))
          return ack?.(err("UNAUTHORIZED", "Invalid apiKey"));
        if (!users.has(payload.userId))
          return ack?.(err("USER_NOT_FOUND", "User not found"));

        const room = rooms.get(payload.roomId);
        if (!room) return ack?.(err("ROOM_NOT_FOUND", "Room not found"));

        const members = roomMembers.get(room.id) ?? new Set<string>();
        if (members.size >= room.maxUsers && !members.has(payload.userId)) {
          return ack?.(err("ROOM_FULL", "Room is full"));
        }

        members.add(payload.userId);
        roomMembers.set(room.id, members);

        socket.join(room.id);

        const recentMessages = (messagesByRoom.get(room.id) ?? []).slice(-50);

        ack?.(ok({ room, recentMessages }));
        socket
          .to(room.id)
          .emit(
            "sdk:presence:joined",
            ok({ userId: payload.userId, roomId: room.id })
          );
      } catch (e: any) {
        ack?.(err("INTERNAL", e?.message || "Unknown error"));
      }
    }
  );

  socket.on(
    "sdk:message:send",
    (payload: SendMessagePayload, ack?: (v: any) => void) => {
      try {
        if (!payload) return ack?.(err("BAD_REQUEST", "Payload required"));
        if (!isValidApiKey(payload.apiKey))
          return ack?.(err("UNAUTHORIZED", "Invalid apiKey"));

        const user = users.get(payload.userId);
        if (!user) return ack?.(err("USER_NOT_FOUND", "User not found"));

        const room = rooms.get(payload.roomId);
        if (!room) return ack?.(err("ROOM_NOT_FOUND", "Room not found"));

        const members = roomMembers.get(room.id);
        if (!members?.has(user.id))
          return ack?.(err("FORBIDDEN", "User is not in the room"));

        const text = (payload.text || "").trim();
        if (!text)
          return ack?.(err("EMPTY_MESSAGE", "Message cannot be empty"));
        if (text.length > 2000)
          return ack?.(err("MESSAGE_TOO_LONG", "Max 2000 chars"));

        const msg: Message = {
          id: `m_${nanoid(12)}`,
          roomId: room.id,
          senderUserId: user.id,
          senderName: user.name,
          text,
          createdAt: Date.now(),
        };

        const list = messagesByRoom.get(room.id) ?? [];
        list.push(msg);
        messagesByRoom.set(room.id, list);

        io.to(room.id).emit("sdk:message:new", ok({ message: msg }));

        ack?.(ok({ message: msg }));
      } catch (e: any) {
        ack?.(err("INTERNAL", e?.message || "Unknown error"));
      }
    }
  );
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`[mockserver] http://localhost:${PORT}`);
  console.log(`[mockserver] Socket.IO ws://localhost:${PORT}`);
  console.log(`[mockserver] Allowed origins: ${ALLOWED_ORIGINS.join(", ")}`);
  console.log(`[mockserver] API keys: ${API_KEYS.join(", ")}`);
});
