// app/library/PaymentHandler.tsx

"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { showToast } from "@/lib/toast";

export default function PaymentHandler() {
  const params = useSearchParams();
  const router = useRouter();
  const payment = params.get("payment");

  useEffect(() => {
    if (!payment) return;

    if (payment === "success") {
      showToast("🎉 Payment successful! You are now Premium.", "success");
    }

    if (payment === "failure") {
      showToast("❌ Payment failed. Try again.", "error");
    }

    // ✅ remove query param after showing toast
    router.replace("/library");
  }, [payment, router]);

  return null;
}