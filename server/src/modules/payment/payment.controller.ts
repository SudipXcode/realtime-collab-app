import { Request, Response, RequestHandler } from "express";
import crypto from "crypto";
import axios from "axios";
import { asyncHandler } from "../../core/middlewares/asyncHandler.middleware";
import { Errors } from "../../core/errors/customeError.errors";
import { paymentConfig } from "../../config/payment.config";
import * as paymentService from "./payment.service";

const { esewa, premiumAmount, backendUrl, frontendUrl } = paymentConfig;

/* ================= SIGNATURE ================= */
const generateSignature = (
  totalAmount: string,
  transactionUuid: string
): string => {
  const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${esewa.merchantCode}`;

  return crypto
    .createHmac("sha256", esewa.secret)
    .update(message)
    .digest("base64");
};

/* ================= INITIATE ================= */
export const initiatePayment: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.auth) {
      throw Errors.UNAUTHORIZED({
        code: "UNAUTHORIZED",
        message: "Authentication required",
      });
    }

    const transactionUuid = `txn_${Date.now()}`;
    const totalAmount = premiumAmount.toFixed(2);
    const userId = req.auth.id;

    console.log("🚀 INIT PAYMENT:", { userId, transactionUuid });

    await paymentService.initiatePaymentService(
      userId,
      premiumAmount,
      transactionUuid
    );

    const signature = generateSignature(totalAmount, transactionUuid);

    return res.json({
      success: true,
      data: {
        url: esewa.url,
        fields: {
          amount: totalAmount,
          tax_amount: "0",
          total_amount: totalAmount,
          transaction_uuid: transactionUuid,
          product_code: esewa.merchantCode,
          product_service_charge: "0",
          product_delivery_charge: "0",
          success_url: `${backendUrl}/api/payment/callback`,
          failure_url: `${backendUrl}/api/payment/callback`,
          signed_field_names:
            "total_amount,transaction_uuid,product_code",
          signature,
        },
      },
    });
  }
);

/* ================= VERIFY ================= */
export const verifyPayment: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    console.log("📩 CALLBACK HIT:", req.query);

    const encoded = req.query.data as string;

    if (!encoded) {
      return res.redirect(`${frontendUrl}/payment?status=no_data`);
    }

    let decoded: any;

    try {
      decoded = JSON.parse(
        Buffer.from(encoded, "base64").toString("utf-8")
      );
    } catch {
      throw Errors.BAD_REQUEST({
        code: "INVALID_PAYMENT_DATA",
        message: "Decode failed",
      });
    }

    const { transaction_uuid, total_amount, status } = decoded;

    if (!transaction_uuid || !total_amount) {
      throw Errors.BAD_REQUEST({
        code: "INVALID_FIELDS",
        message: "Missing payment fields",
      });
    }

    console.log("💳 PAYMENT DATA:", decoded);

    /* ================= MOCK MODE ================= */
    if (process.env.MOCK_PAYMENT === "true") {
      console.log("🧪 MOCK MODE ENABLED");

      await paymentService.verifyPaymentService(transaction_uuid);

      return res.redirect(
        `${frontendUrl}/payment?status=success&txn=${transaction_uuid}`
      );
    }

    /* ================= FAILURE ================= */
    if (status !== "COMPLETE") {
      await paymentService.failPaymentService(transaction_uuid);

      return res.redirect(
        `${frontendUrl}/payment?status=failed&txn=${transaction_uuid}`
      );
    }

    /* ================= VERIFY WITH ESEWA ================= */
    let verifyRes;

    try {
      verifyRes = await axios.get(esewa.verifyUrl, {
        params: {
          product_code: esewa.merchantCode,
          total_amount,
          transaction_uuid,
        },
      });
    } catch {
      throw Errors.INTERNAL({
        code: "VERIFY_FAILED",
        message: "eSewa verify failed",
      });
    }

    if (verifyRes.data?.status !== "COMPLETE") {
      await paymentService.failPaymentService(transaction_uuid);

      return res.redirect(
        `${frontendUrl}/payment?status=verify_failed&txn=${transaction_uuid}`
      );
    }

    await paymentService.verifyPaymentService(transaction_uuid);

    return res.redirect(
      `${frontendUrl}/payment?status=success&txn=${transaction_uuid}`
    );
  }
);

/* ================= MOCK SUCCESS ================= */
export const mockSuccess: RequestHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const txn = req.query.txn as string;

    if (!txn) {
      return res.send("❌ Provide txn id");
    }

    console.log("🧪 MOCK SUCCESS HIT:", txn);

    await paymentService.verifyPaymentService(txn);

    return res.send("✅ Payment marked SUCCESS + Subscription updated");
  }
);