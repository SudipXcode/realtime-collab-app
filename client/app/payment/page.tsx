"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PaymentPage() {
  const params = useSearchParams();
  const router = useRouter();

  const status = params.get("status");


  useEffect(() => {
    if (!status) return;

    if (status === "success") {
      // ✅ redirect after 1.5s
      setTimeout(() => {
        router.replace("/library");
      }, 1500);
    }
  }, [status, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      {status === "success" && (
        <div>
          <h1>✅ Payment Successful</h1>
          <p>Redirecting to your library...</p>
        </div>
      )}

      {status === "failed" && (
        <div>
          <h1>❌ Payment Failed</h1>
          <p>Please try again.</p>
        </div>
      )}

      {status === "verify_failed" && (
        <div>
          <h1>⚠️ Verification Failed</h1>
          <p>Contact support.</p>
        </div>
      )}

      {!status && <p>Processing payment...</p>}
    </div>
  );
}