import { io } from "socket.io-client";

let socket: any = null;
let currentUser: any | null = null;
let currentRoomId: string | null = null;
let unreadCount = 0;
let isChatOpen = true;

const SDK_CONFIG = {
  apiUrl: "http://localhost:4000",
  apiKey: "",
  position: "bottom-right" as
    | "bottom-right"
    | "bottom-left"
    | "top-right"
    | "top-left",
};

type Room = {
  id: string;
  name: string;
  startDate: Date;
  maxUsers: number;
  members: number;
};

(function () {
  const script = document.currentScript as HTMLScriptElement | null;

  if (!script) {
    console.error("[ChatSDK] Cannot find current script tag");
    return;
  }

  SDK_CONFIG.apiKey = script.dataset.apiKey || "";
  SDK_CONFIG.position = (script.dataset.position as any) || "bottom-right";

  if (!SDK_CONFIG.apiKey) {
    console.error("[ChatSDK] data-api-key is required");
    return;
  }

  if (SDK_CONFIG.position !== "bottom-right" && SDK_CONFIG.position !== "bottom-left") {
    console.error("[ChatSDK] data-position must be 'bottom-right' or 'bottom-left'");
    return;
  }

  // ===== SDK ROOT =====
  const root = document.createElement("div");
  root.id = "chat-sdk-root";

  const roomListEl = document.createElement("div");
  roomListEl.id = "sdk-room-list";

  const messagesEl = document.createElement("div");
  messagesEl.id = "sdk-chat";

  const formContainer = document.createElement("div");
  formContainer.id = "sdk-form";

  const statusEl = document.createElement("div");
  statusEl.id = "sdk-status";
  statusEl.style.fontWeight = "bold";
  
  updateSocketStatus("Connecting…", "connecting");

  root.appendChild(statusEl);
  root.appendChild(roomListEl);
  root.appendChild(messagesEl);
  root.appendChild(formContainer);

  root.style.position = "fixed";
  root.style.bottom = "86px";
  root.style.zIndex = "999999";
  root.style.width = "300px";
  root.style.height = "500px";
  root.style.background = "#111";
  root.style.color = "#fff";
  root.style.borderRadius = "8px";
  root.style.padding = "12px";
  root.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

  if (SDK_CONFIG.position === "bottom-right") {
    root.style.right = "20px";
  } else {
    root.style.left = "20px";
  }

  document.body.appendChild(root);

  console.log("[ChatSDK] Initialized", { apiKey: SDK_CONFIG.apiKey, position: SDK_CONFIG.position });

  // ===== FLOATING BUTTON =====
  const floatingBtn = document.createElement("div");
  floatingBtn.id = "sdk-floating-btn";

  floatingBtn.style.position = "fixed";
  floatingBtn.style.bottom = "20px";
  floatingBtn.style.width = "56px";
  floatingBtn.style.height = "56px";
  floatingBtn.style.borderRadius = "50%";
  floatingBtn.style.background = "#2563eb";
  floatingBtn.style.cursor = "pointer";
  floatingBtn.style.zIndex = "1000000";
  floatingBtn.style.display = "flex";
  floatingBtn.style.alignItems = "center";
  floatingBtn.style.justifyContent = "center";
  floatingBtn.innerText = "💬";

  if (SDK_CONFIG.position === "bottom-right") {
    floatingBtn.style.right = "20px";
  } else {
    floatingBtn.style.left = "20px";
  }

  // ===== BADGE =====
  const badge = document.createElement("div");
  badge.id = "sdk-unread";
  badge.style.position = "absolute";
  badge.style.top = "-4px";
  badge.style.right = "-4px";
  badge.style.background = "red";
  badge.style.color = "white";
  badge.style.borderRadius = "50%";
  badge.style.fontSize = "12px";
  badge.style.padding = "2px 6px";
  badge.style.display = "none";

  floatingBtn.appendChild(badge);
  document.body.appendChild(floatingBtn);

  // toggle chat
  floatingBtn.onclick = () => {
    if (isChatOpen) {
      closeChat();
      root.style.display = "none";
    } else {
      openChat();
      root.style.display = "block";
    }
  };

  // mặc định chat mở
  root.style.display = "block";

  // ===== SOCKET CONNECT =====
  socket = io(SDK_CONFIG.apiUrl, {
    transports: ["websocket"],
    auth: { apiKey: SDK_CONFIG.apiKey },
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("[ChatSDK] Socket connected:", socket.id);
    createUserAfterReconnecting();
    updateSocketStatus("Online", "online");
    renderFormCreateUser(formContainer);
  });

  socket.on("disconnect", () => {
    console.warn("[ChatSDK] Socket disconnected");
    updateSocketStatus("Offline", "offline");
  });

  socket.on("connect_error", (err: Error) => {
    console.error("[ChatSDK] Connection error:", err.message);
    updateSocketStatus("Connecting…", "connecting");
  });

  socket.on("sdk:message:new", (msg: any) => {
    handleIncomingMessage(msg);
  });
})();

function renderFormCreateUser(root: HTMLElement) {
  if (document.getElementById("sdk-create-user-name-inbox")) return;

  const title = document.createElement("h3");
  title.id = "sdk-create-user-name-inbox";
  title.innerText = "Create User";
  title.style.marginTop = "8px";
  title.style.marginBottom = "8px";

  const nameInput = document.createElement("input");
  nameInput.placeholder = "Name";
  nameInput.value = "Annonymous";

  const emailInput = document.createElement("input");
  emailInput.placeholder = "Email";
  emailInput.value = "annonymous@email.com";

  const dobInput = document.createElement("input");
  dobInput.type = "date";
  dobInput.value = "1990-12-31";

  const genderSelect = document.createElement("select");
  ["Male", "Female", "Other"].forEach((g) => {
    const opt = document.createElement("option");
    opt.value = g;
    opt.innerText = g;
    genderSelect.appendChild(opt);
  });

  const agreeLabel = document.createElement("label");
  const agreeCheckbox = document.createElement("input");
  agreeCheckbox.type = "checkbox";
  agreeLabel.append(agreeCheckbox, " I agree to terms");

  const submitBtn = document.createElement("button");
  submitBtn.innerText = "Continue";

  submitBtn.onclick = () => {
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const dob = dobInput.value;
    const gender = genderSelect.value;

    // Name validation
    if (!name) return alert("Name required");
    if (name.length > 30) return alert("Name cannot exceed 30 characters");
    if (!/^[A-Za-z]+$/.test(name)) return alert("Name must only contain letters");

    // Email validation
    if (!email) return alert("Email required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Invalid email");

    // DOB validation (>=18 tuổi)
    if (!dob) return alert("Date of birth required");
    const dobDate = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    const dayDiff = today.getDate() - dobDate.getDate();
    if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
      return alert("You must be at least 18 years old");
    }

    // Agree
    if (!agreeCheckbox.checked) return alert("You must agree to terms");

    createUser({ name, email, dob, gender: gender as any });
  };

  [nameInput, emailInput, dobInput, agreeLabel].forEach((el) => {
    el.style.display = "block";
    el.style.width = "calc(100% - 12px - 3px)";
    el.style.marginBottom = "8px";
    el.style.padding = "6px";
  });

  [submitBtn, genderSelect].forEach((el) => {
    el.style.display = "block";
    el.style.width = "100%";
    el.style.marginBottom = "8px";
    el.style.padding = "6px";
  });

  root.appendChild(title);
  root.appendChild(nameInput);
  root.appendChild(emailInput);
  root.appendChild(dobInput);
  root.appendChild(genderSelect);
  root.appendChild(agreeLabel);
  root.appendChild(submitBtn);
}

function createUserAfterReconnecting() {
  if (currentUser) {
    const data = {
      name: currentUser.name,
      email: currentUser.email,
      dob: currentUser.dob,
      gender: currentUser.gender,
    };

    socket.emit(
      "sdk:user:create",
      {
        apiKey: SDK_CONFIG.apiKey,
        agreedToTerms: true,
        ...data,
      },
      (res: any) => {
        if (!res.ok) {
          alert(res.error.message);
          return;
        }

        currentUser = res.data.user;

        const formContainer = document.getElementById("sdk-form");
        if (formContainer) formContainer.remove();

        console.log("[ChatSDK] User re-created", res.data.user);

        if (currentRoomId) {
          joinRoom(currentRoomId);
        }
      }
    );
  }
}

function createUser(data: {
  name: string;
  email: string;
  dob: string;
  gender: "Male" | "Female" | "Other";
}) {
  socket.emit(
    "sdk:user:create",
    {
      apiKey: SDK_CONFIG.apiKey,
      agreedToTerms: true,
      ...data,
    },
    (res: any) => {
      if (!res.ok) {
        alert(res.error.message);
        return;
      }

      currentUser = res.data.user;

      const formContainer = document.getElementById("sdk-form");
      if (formContainer) formContainer.remove();

      console.log("[ChatSDK] User created", res.data.user);

      fetchRooms();
    }
  );
}

function fetchRooms() {
  if (!socket) return;

  socket.emit(
    "sdk:room:list",
    { apiKey: SDK_CONFIG.apiKey },
    (res: any) => {
      if (!res.ok) {
        console.error("[ChatSDK] Failed to fetch rooms", res);
        return;
      }

      renderRoomList(res.data);
    }
  );
}

function renderRoomList(rooms: Room[]) {
  const container = document.getElementById("sdk-room-list");
  if (!container) return;

  container.innerHTML = "";

  // ===== HEADER =====
  const header = document.createElement("div");
  header.id = "sdk-room-header";
  header.innerText = "+ CREATE NEW ROOM";
  header.style.cursor = "pointer";
  header.style.padding = "8px";
  header.style.fontWeight = "bold";

  header.onclick = () => {
    document.getElementById("sdk-chat")?.remove();
    renderCreateRoomForm();
  };

  // ===== ROOM LIST (SCROLL) =====
  const list = document.createElement("div");
  list.id = "sdk-room-items";
  list.style.height = "85px";
  list.style.overflowY = "auto";
  list.style.marginBottom = "6px";
  list.style.border = "1px solid #333";
  list.style.borderRadius = "4px";
  list.style.padding = "6px";

  rooms.forEach((room) => {
    const item = document.createElement("div");
    item.id = `room-item-${room.id}`;
    item.className = `room-item`;
    item.innerText = `${room.name} (${room.members}/${room.maxUsers})`;
    item.style.cursor = "pointer";
    item.style.padding = "4px 0";

    item.onclick = () => joinRoom(room.id);

    if (room.id === currentRoomId) {
      item.style.fontStyle = "italic";
      item.innerText = `* ${item.innerText}`;
    }

    list.appendChild(item);
  });

  container.appendChild(header);
  container.appendChild(list);
}

function renderCreateRoomForm() {
  const container = document.getElementById("sdk-room-list");
  if (!container) return;

  if (document.getElementById("sdk-form-create-room")) return;

  const form = document.createElement("div");
  form.id = "sdk-form-create-room";
  form.style.marginTop = "8px";

  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const todayStr = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;

  form.innerHTML = `
    <input id="sdk-room-name" placeholder="Room name" />
    <input id="sdk-room-max" type="number" placeholder="Max users" min="2" max="10" value='2' style="width: 111px;"/>
    <input id="sdk-room-startdate" type="date" placeholder="Start date" value="${todayStr}" style="margin-top: 6px; width: 295px;"/>
    <button id="sdk-room-create-btn" style="margin-top: 5px;">Create</button>
    <button id="sdk-room-cancel-btn" style="margin-top: 5px;">Cancel</button>
  `;

  container.appendChild(form);

  const btn = document.getElementById("sdk-room-create-btn")!;
  btn.onclick = () => {
    const roomName = (document.getElementById("sdk-room-name") as HTMLInputElement).value.trim();
    const maxUsers = Number((document.getElementById("sdk-room-max") as HTMLInputElement).value);
    const startDateStr = (document.getElementById("sdk-room-startdate") as HTMLInputElement).value;

    if (!roomName) return alert("Room name required");
    if (roomName.length > 50) return alert("Room name cannot exceed 50 characters");

    if (!startDateStr) return alert("Start date required");
    const startDate = new Date(startDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (startDate < today) return alert("Start date cannot be in the past");

    if (!maxUsers || maxUsers < 2 || maxUsers > 10) return alert("Max users must be 2-10");

    createRoom(roomName, maxUsers, startDateStr);
  };

  const btnCancel = document.getElementById("sdk-room-cancel-btn")!;
  btnCancel.onclick = () => {
    if (currentRoomId) {
      joinRoom(currentRoomId);
    } else {
      document.getElementById("sdk-form-create-room")?.remove();
    }
  };
}

function createRoom(roomName: string, maxUsers: number, startDate: any) {
  if (!socket || !currentUser.id) return;

  const payload: any = {
    apiKey: SDK_CONFIG.apiKey,
    userId: currentUser.id,
    roomName,
    maxUsers,
    startDate: startDate,
  };

  socket.emit("sdk:room:create", payload, (res: any) => {
    if (!res.ok) {
      alert(res.error?.message || "Failed to create room");
      return;
    }

    const roomId = res.data.room.id;

    joinRoom(roomId);

    fetchRooms();
  });
}

function joinRoom(roomId: string) {
  if (!socket) return;

  document.getElementById("sdk-form-create-room")?.remove();

  socket.emit(
    "sdk:room:join",
    {
      apiKey: SDK_CONFIG.apiKey,
      userId: currentUser.id,
      roomId,
    },
    (res: any) => {
      if (!res.ok) {
        alert(res.error.message);
        return;
      }

      console.log("[ChatSDK] Joined room", roomId);
      enterRoom(roomId);
    }
  );
}

function renderChatUI(roomId: string) {
  let container = document.getElementById("sdk-chat");
  if (!container) {
    const sdkChat = document.createElement("div");
    sdkChat.id = "sdk-chat";

    let root = document.getElementById("chat-sdk-root");
    if (root) {
      root.appendChild(sdkChat);
      container = sdkChat;
    } else {
      return;
    }
  }

  container.innerHTML = `
    <div id="sdk-messages" style="height:305px; overflow:auto; border: 1px solid #333; border-radius: 4px; margin-bottom: 6px; padding: 6px;"></div>
    <input id="sdk-input" style="width: calc(100% - 60px);" placeholder="Type message..." />
    <button id="sdk-send">Send</button>
  `;

  const input = document.getElementById("sdk-input") as HTMLInputElement;
  const sendBtn = document.getElementById("sdk-send")!;

  const sendMessage = () => {
    if (!input.value) return;

    socket.emit("sdk:message:send", {
      apiKey: SDK_CONFIG.apiKey,
      userId: currentUser.id,
      roomId,
      text: input.value,
    });

    input.value = "";
  };

  sendBtn.onclick = sendMessage;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

function updateSocketStatus(status: string, code: string) {
  const statusEl = document.getElementById("sdk-status");
  if (statusEl) {
    statusEl.innerText = status;
    if (code === 'online') statusEl.style.color = "green";
    else if (code === 'offline') statusEl.style.color = "red";
    else statusEl.style.color = "orange";
  }
}

function handleIncomingMessage(msg: any) {
  // tăng unread nếu là room đang không mở
  if (msg.data.message.senderUserId !== currentUser.id && (msg.data.message.roomId !== currentRoomId || !isChatOpen)) {
    unreadCount++;
    updateUnreadBadge();
  }

  // render mes nếu là room hiện tại
  appendMessage(msg.data.message.senderUserId, msg.data.message.senderName, msg.data.message.text, msg.data.message.createdAt);
}

async function enterRoom(roomId: string) {
  currentRoomId = roomId;
  unreadCount = 0;
  updateUnreadBadge();

  renderChatUI(roomId);

  // reset style các room cũ
  const allItems = document.querySelectorAll<HTMLElement>(".room-item");
  allItems.forEach(item => {
    item.style.fontStyle = "normal";
    item.innerText = item.innerText.replace(/^\*\s*/, "");
  });

  // đánh dấu room đang vào
  const item = document.getElementById(`room-item-${roomId}`);
  if (item) {
    item.style.fontStyle = "italic";
    item.innerText = `* ${item.innerText}`;
  }

  // ===== fetch toàn bộ chat từ API =====
  try {
    const res = await fetch(`${SDK_CONFIG.apiUrl}/api/rooms/${roomId}/messages`);
    if (!res.ok) throw new Error("Failed to fetch messages");

    const data = await res.json();
    const messages: any[] = data.data || [];

    messages.forEach(msg => {
      appendMessage(msg.senderUserId, msg.senderName, msg.text, msg.createdAt);
    });
  } catch (err: any) {
    console.error("Failed to load room messages:", err.message);
  }
}

function updateUnreadBadge() {
  const badge = document.getElementById("sdk-unread");
  if (!badge) return;

  if (unreadCount > 0) {
    badge.innerText = String(unreadCount);
    badge.style.display = "block";
  } else {
    badge.style.display = "none";
  }
}

function appendMessage(senderUserId: string, senderName: string, text: string, createdAt: Number) {
  const messagesEl = document.getElementById("sdk-messages");
  if (!messagesEl) return;

  const msgEl = document.createElement("div");
  msgEl.style.marginBottom = "15px";

  if (senderUserId === currentUser.id) msgEl.style.textAlign = "right";

  msgEl.innerHTML = `
    <strong>${senderUserId !== currentUser.id ? senderName : 'You'}:</strong>
    <span>${text}</span>
    <br>
    <span style='font-size: 80%;'>${timestampToDateTime(createdAt)}</span>
  `;

  messagesEl.appendChild(msgEl);

  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function openChat() {
  isChatOpen = true;
  unreadCount = 0;
  updateUnreadBadge();
}

function closeChat() {
  isChatOpen = false;
}

function timestampToDateTime(timestamp: Number) {
  const d = new Date(Number(timestamp));

  const pad = (n: any) => String(n).padStart(2, "0");

  return (
    d.getFullYear() + "-" +
    pad(d.getMonth() + 1) + "-" +
    pad(d.getDate()) + " " +
    pad(d.getHours()) + ":" +
    pad(d.getMinutes()) + ":" +
    pad(d.getSeconds())
  );
}