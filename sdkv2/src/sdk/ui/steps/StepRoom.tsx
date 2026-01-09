import { Button, List } from "antd";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { fetchRooms } from "../../socket/socket";
import { CreateRoomModal } from "./CreateRoomModal";

export function StepRoom() {
  const { rooms, setStep, setRoom, roomId } = useChatStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const joinRoom = (roomId: string) => {
    setRoom(roomId);
    setStep(3);
  };

  return (
    <>
      <Button block type="dashed" onClick={() => setOpen(true)}>
        + Create New Room
      </Button>

      <List
        style={{
          height: 95,
          overflow: "auto",
          margin: "5px 0",
        }}
        dataSource={rooms}
        renderItem={(room: any) => {
          const isActive = room.id === roomId;

          return (
            <List.Item
              onClick={() => joinRoom(room.id)}
              style={{
                cursor: "pointer",
                marginBottom: 6,
                padding: "8px 10px",
                borderRadius: 8,
                backgroundColor: isActive ? "#e6f4ff" : "#fff",
                border: isActive
                  ? "1px solid #1677ff"
                  : "1px solid #e5e5e5",
                boxShadow: isActive
                  ? "0 3px 8px rgba(22,119,255,0.25)"
                  : "0 1px 3px rgba(0,0,0,0.06)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (isActive) return;
                e.currentTarget.style.backgroundColor = "#fafafa";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={(e) => {
                if (isActive) return;
                e.currentTarget.style.backgroundColor = "#fff";
                e.currentTarget.style.boxShadow =
                  "0 1px 3px rgba(0,0,0,0.06)";
              }}
            >
              <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
								<div>
									<div style={{ fontWeight: isActive ? 600 : 500 }}>
										{room.name}
									</div>
									<div style={{ fontSize: 12, color: "#666" }}>
										{room.members}/{room.maxUsers} members
									</div>
								</div>

								{room.unread > 0 && (
									<div
										style={{
											minWidth: 20,
											height: 20,
											borderRadius: 10,
											background: "#ff4d4f",
											color: "#fff",
											fontSize: 12,
											fontWeight: 600,
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											padding: "0 6px",
										}}
									>
										{room.unread}
									</div>
								)}
							</div>
            </List.Item>
          );
        }}
      />

      <CreateRoomModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}