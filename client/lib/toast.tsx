// lib/toast.tsx  ← renamed to .tsx
import { toast } from "react-toastify";

type ToastType = "success" | "error" | "warning" | "info";

const icons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "!",
  info: "i",
};

const iconColors: Record<ToastType, string> = {
  success: "#4CAF50", // 👈 green
  error: "#F44336",   // 👈 red
  warning: "#FFC107", // 👈 yellow
  info: "#FFC107",    // 👈 yellow
};

export const showToast = (message: string, type: ToastType = "success") => {
  toast[type](
    <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center" }}>
      <span style={{ color: iconColors[type], fontWeight: "700" }}>{icons[type]}</span>
      <span>{message}</span>
    </div>,
    {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      closeButton: false,
      icon: false,
      style: {
        background: "#2D2D2D",
        color: "#ffffff",
        borderRadius: "12px",
        fontSize: "14px",
        fontWeight: "500",
        width: "auto",
        minWidth: "unset",
        display: "inline-flex",
        padding: "10px 16px",
      },
    }
  );
};