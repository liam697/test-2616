import { Input, Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { getSocket, joinRoom, sendMessage } from "../../socket/socket";

export function StepChat() {
  const { user, roomId, messages, addMessage, resetUnread } = useChatStore();
  const [text, setText] = useState("");

  useEffect(() => {
    if (!roomId) return;
    joinRoom(roomId);
    resetUnread();
  }, [roomId]);

	const startSendMessage = () => {
		if (!text) return;
		sendMessage(roomId, text);
		setText("");
		console.log(messages);
	};

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto border p-2 rounded">
        {messages.map((m: any, i) => (
          <div key={i} className={m.senderUserId == user.id ? "text-right" : ""}>
            <strong>{m.senderUserId == user.id ? "You" : m.senderName}:</strong> {m.text}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-2">
        <Input
					value={text}
					onChange={(e) => setText(e.target.value)}
					onPressEnter={startSendMessage}
        />
        <Button type="primary" onClick={startSendMessage}>
          Send
        </Button>
      </div>
    </div>
  );
}