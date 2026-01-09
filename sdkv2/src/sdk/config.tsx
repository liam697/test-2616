import { useChatStore } from "./store/chat.store";

export function getSDKConfig() {
  return {
    apiUrl: "http://localhost:4000",
    apiKey: useChatStore?.getState()?.scriptTagConfig?.apiKey,
    position: useChatStore?.getState()?.scriptTagConfig?.position,
  };
}