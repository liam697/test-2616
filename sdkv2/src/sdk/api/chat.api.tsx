import { getSDKConfig } from "../config";
import { informConfigError } from "../common";

export async function fetchRoomMessages(roomId: string) {
	const config = getSDKConfig();
	if (!config) {
		informConfigError();
		return;
	}

	try {
    const res = await fetch(`${config.apiUrl}/api/rooms/${roomId}/messages`);
    if (!res.ok) throw new Error("Failed to fetch messages");

    const data = await res.json();
    return data.data || [];
  } catch (err: any) {
    console.error("Failed to load room messages:", err.message);
		return [];
  }
}