import { Button, Badge, Card } from "antd";
import { useChatStore } from "../store/chat.store";
import { StepCreateUser } from "./steps/StepCreateUser";
import { StepRoom } from "./steps/StepRoom";
import { StepChat } from "./steps/StepChat";

export function ChatWidget() {
  const { step, unread } = useChatStore();

  return (
    <div className="fixed">
      <Badge count={unread}>
        <Button type="primary" shape="circle">
          💬
        </Button>
      </Badge>

      <Card className="mt-2 w-[320px] h-[500px]">
        {step === 1 && <StepCreateUser />}
        {step === 2 && <StepRoom />}
        {step === 3 && <StepChat />}
      </Card>
    </div>
  );
}