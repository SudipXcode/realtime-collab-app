import { prisma } from "../../core/lib/prisma";
import { PaymentStatus, SubscriptionPlan } from "@prisma/client";
import { Errors } from "../../core/errors/customeError.errors";

/* ================= INITIATE ================= */
export const initiatePaymentService = async (
  userId: string,
  amount: number,
  transactionUuid: string
): Promise<void> => {
  await prisma.$transaction(async (tx) => {
    let subscription = await tx.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      subscription = await tx.subscription.create({
        data: {
          userId,
          plan: SubscriptionPlan.FREE,
        },
      });
    }

    console.log("📦 SUBSCRIPTION:", subscription.id);

    // cancel old pending
    await tx.payment.updateMany({
      where: {
        subscriptionId: subscription.id,
        status: PaymentStatus.PENDING,
      },
      data: { status: PaymentStatus.FAILED },
    });

    // create new payment
    await tx.payment.create({
      data: {
        subscriptionId: subscription.id,
        amount,
        currency: "NPR",
        transactionId: transactionUuid,
        status: PaymentStatus.PENDING,
      },
    });

    console.log("✅ PAYMENT CREATED:", transactionUuid);
  });
};

/* ================= VERIFY ================= */
export const verifyPaymentService = async (
  transactionUuid: string
): Promise<void> => {
  console.log("🔍 VERIFY:", transactionUuid);

  const payment = await prisma.payment.findUnique({
    where: { transactionId: transactionUuid },
    include: { subscription: true },
  });

  if (!payment) {
    throw Errors.NOT_FOUND({
      code: "PAYMENT_NOT_FOUND",
      message: "Payment not found",
      details: { transactionUuid },
    });
  }

  const now = new Date();

  const baseDate =
    payment.subscription.endDate &&
    payment.subscription.endDate > now
      ? payment.subscription.endDate
      : now;

  const nextMonth = new Date(baseDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.$transaction(async (tx) => {
    // idempotent update
    if (payment.status !== PaymentStatus.SUCCESS) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.SUCCESS },
      });
    }

    await tx.subscription.update({
      where: { id: payment.subscriptionId },
      data: {
        plan: SubscriptionPlan.PRO,
        startDate: now,
        endDate: nextMonth,
      },
    });
  });

  console.log("🎉 SUBSCRIPTION UPDATED TO PRO");
};

/* ================= FAIL ================= */
export const failPaymentService = async (
  transactionUuid: string
): Promise<void> => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: transactionUuid },
  });

  if (!payment) return;

  if (payment.status !== PaymentStatus.PENDING) return;

  await prisma.payment.update({
    where: { id: payment.id },
    data: { status: PaymentStatus.FAILED },
  });

  console.log("❌ PAYMENT FAILED:", transactionUuid);
};