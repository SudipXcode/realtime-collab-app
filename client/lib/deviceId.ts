export function getDeviceId() {
  if (typeof window === "undefined") return "server"; // fallback for SSR

  let deviceId = localStorage.getItem("device-id");
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem("device-id", deviceId);
  }
  return deviceId;
}
