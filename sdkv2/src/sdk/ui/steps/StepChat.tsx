import { Input, Button } from "antd";
import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { getSocket, joinRoom, sendMessage } from "../../socket/socket";

export function StepChat() {
  const { user, roomId, messages, addMessage, resetUnread, resetRoomUnread } = useChatStore();
  const [text, setText] = useState("");
	const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!roomId) return;
    joinRoom(roomId);
		resetRoomUnread(roomId);
  }, [roomId]);

	useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages.length]);

	const startSendMessage = () => {
		if (!text) return;
		sendMessage(roomId, text);
		setText("");
	};

	const timestampToDateTime = (timestamp: Number) => {
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

  return (
    <div className="flex flex-col h-full">
      <div 
				ref={containerRef}
				style={{ 
					height: 250, 
					minHeight: 250, 
					maxHeight: 250,
					overflow: 'auto', 
					marginBottom: 5, 
					padding: 5, 
					border: '1px solid #d9d9d9',
					borderRadius: 8, 
				}}
			>
        {messages.map((m: any, i) => (
          <div
						key={i}
						style={{
							display: "flex",
							justifyContent: m.senderUserId === user.id ? "flex-end" : "flex-start",
							marginBottom: 8,
						}}
					>
						<div
							style={{
								maxWidth: "80%",
								padding: "8px 12px",
								borderRadius: 12,
								backgroundColor: m.senderUserId === user.id ? "#1677ff" : "#f5f5f5",
								color: m.senderUserId === user.id ? "#fff" : "#222",
								fontSize: 13,
								lineHeight: 1.4,
								borderBottomRightRadius: m.senderUserId === user.id ? 2 : 12,
								borderBottomLeftRadius: m.senderUserId === user.id ? 12 : 2,
								wordBreak: "break-word",
								boxShadow: "0 1px 2px rgba(0,0,0,0.08)",
							}}
						>
							{m.senderUserId !== user.id && (
								<div
									style={{
										fontSize: 11,
										color: "#666",
										marginBottom: 2,
									}}
								>
									{m.senderName}
								</div>
							)}

							<div>{m.text}</div>

							<div
								style={{
									fontSize: 10,
									marginTop: 4,
									textAlign: "right",
									opacity: 0.65,
								}}
							>
								{timestampToDateTime(m.createdAt)}
							</div>
						</div>
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