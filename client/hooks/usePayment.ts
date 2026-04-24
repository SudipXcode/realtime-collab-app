
"use client";

import { useApi } from "@/hooks/useApi";
import { useState, useCallback } from "react";

type PaymentResponse = {
  success: boolean;
  data: {
    url: string;
    fields: Record<string, string>;
  };
};

export const usePayment = () => {
  const { loading, callApi } = useApi<PaymentResponse>("/api/payment");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pay = useCallback(async () => {
    try {
      setIsSubmitting(true);

      const result = await callApi({
        method: "POST", // POST /api/payment
      });

      console.log("🔥 Payment API result:", result);

      // ❌ API failed (MOST IMPORTANT CASE)
      if (!result) {
        console.error("❌ API returned undefined → check auth / network");
        setIsSubmitting(false);
        return false;
      }

      if (!result.data) {
        console.error("❌ Invalid response shape:", result);
        setIsSubmitting(false);
        return false;
      }

      const { url, fields } = result.data;

      // ✅ build form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = url;

      Object.entries(fields).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

      return true;
    } catch (error) {
      console.error("❌ Payment error:", error);
      setIsSubmitting(false);
      return false;
    }
  }, [callApi]);

  return {
    pay,
    loading: loading || isSubmitting,
  };
};