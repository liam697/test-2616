import { Modal, Form, Input, InputNumber, DatePicker, Button } from "antd";
import dayjs from "dayjs";
import { getSocket, createRoom } from "../../socket/socket";
import { useChatStore } from "../../store/chat.store";

export function CreateRoomModal({ open, onClose }: any) {
  const setRoom = useChatStore((s) => s.setRoom);
  const setStep = useChatStore((s) => s.setStep);

  const onFinish = (values: any) => {
    createRoom(values);
    onClose();
  };

  return (
    <Modal open={open} onCancel={onClose} footer={null} title="Create Room">
      <Form layout="vertical" onFinish={onFinish} initialValues={{
        maxUsers: 2,
        startDate: dayjs()
      }}>
        <Form.Item name="roomName" label="Room Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="startDate" label="Start Date" rules={[{ required: true }]}>
          <DatePicker className="w-full" />
        </Form.Item>

        <Form.Item name="maxUsers" label="Max Users">
          <InputNumber min={2} max={10} className="w-full" />
        </Form.Item>

        <Button htmlType="submit" type="primary" block>
          Create
        </Button>
      </Form>
    </Modal>
  );
}