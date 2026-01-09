import { createRoot } from "react-dom/client";
import { ChatWidget } from "./ui/ChatWidget";
import { initSocket } from "./socket/socket";
import { useChatStore } from "./store/chat.store";

(function () {
  const script = document.currentScript as HTMLScriptElement | null;

  if (!script) {
    console.error("[ChatSDKV2] Cannot find current script tag");
    return;
  }

  let apiKey = script.dataset.apiKey || "";
  let position = (script.dataset.position as any) || "bottom-right";

  if (!apiKey) {
    console.error("[ChatSDKV2] data-api-key is required");
    return;
  }

  if (position !== "bottom-right" && position !== "bottom-left") {
    console.error("[ChatSDKV2] data-position must be 'bottom-right' or 'bottom-left'");
    return;
  }

  useChatStore.getState().setScriptTagConfig({
    apiKey, 
    position,
  });
  
  initSocket();

  const container = document.createElement("div");
  container.id = "chat-sdk-root";
  container.style.position = "fixed";
  container.style.zIndex = "1050";
  container.style.width = "300px";
  container.style.height = "500px";

  if (position === "bottom-right") {
    container.style.right = "20px";
    container.style.bottom = "20px";
  } else {
    container.style.left = "20px";
    container.style.bottom = "20px";
  }

  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ChatWidget />);
})();