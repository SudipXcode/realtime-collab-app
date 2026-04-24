export const paymentConfig = {
  esewa: {
    secret: process.env.ESEWA_SECRET!,
    url: process.env.ESEWA_URL!,
    verifyUrl: process.env.ESEWA_VERIFY_URL!,
    merchantCode: process.env.ESEWA_MERCHANT_CODE!,
  },
  premiumAmount: Number(process.env.PREMIUM_AMOUNT || 149),
  backendUrl: process.env.BACKEND_URL!,
  frontendUrl: process.env.FRONTEND_URL!,
};