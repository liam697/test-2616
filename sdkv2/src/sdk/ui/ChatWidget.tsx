import { Button, Badge, Card } from "antd";
import { useChatStore } from "../store/chat.store";
import { StepCreateUser } from "./steps/StepCreateUser";
import { StepRoom } from "./steps/StepRoom";
import { StepChat } from "./steps/StepChat";

export function ChatWidget() {
  const {
    step,
    unread,
    isOpen,
    toggleOpen,
    connectionStatus,
    scriptTagConfig,
  } = useChatStore();

  const position = scriptTagConfig?.position || "bottom-right";

  const wrapperStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 30,
    zIndex: 1050,
    ...(position === "bottom-right" ? { right: 20 } : { left: 20 }),
  };

  const cardStyle: React.CSSProperties =
    position === "bottom-right"
      ? {
          position: "absolute",
          bottom: 60,
          right: 0,
					paddingTop: 32,
        }
      : {
          position: "absolute",
          bottom: 60,
          left: 0,
					paddingTop: 32,
        };

  return (
    <div style={wrapperStyle}>
      {isOpen && (
        <Card
          style={cardStyle}
          className="w-[320px] h-[500px] relative"
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 12,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {connectionStatus === "connecting" && (
              <span style={{ color: "orange" }}>Connecting...</span>
            )}
            {connectionStatus === "online" && (
              <span style={{ color: "green" }}>Online</span>
            )}
            {connectionStatus === "offline" && (
              <span style={{ color: "red" }}>Offline</span>
            )}
          </div>

          {step === 1 && <StepCreateUser />}
          {step === 2 && <StepRoom />}
          {step === 3 && <><StepRoom /><StepChat /></>}
        </Card>
      )}

      <Badge count={unread} showZero={false} offset={[-2, 2]}>
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={toggleOpen}
        >
          {isOpen ? "✕" : "💬"}
        </Button>
      </Badge>
    </div>
  );
}