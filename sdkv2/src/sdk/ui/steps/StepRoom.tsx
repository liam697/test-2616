import { Button, List, Modal, Form, Input, InputNumber, DatePicker } from "antd";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/chat.store";
import { fetchRooms } from "../../socket/socket";
import { CreateRoomModal } from "./CreateRoomModal";

export function StepRoom() {
  const { rooms, setStep, setRoom } = useChatStore();
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
        className="mt-2"
        bordered
        dataSource={rooms}
        renderItem={(room: any) => (
          <List.Item onClick={() => joinRoom(room.id)} className="cursor-pointer">
            {room.name} ({room.members}/{room.maxUsers})
          </List.Item>
        )}
      />

      <CreateRoomModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}