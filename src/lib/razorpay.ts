import Razorpay from "razorpay";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.warn("Razorpay keys are missing. Payments will not work correctly.");
}

export const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "mock_key_id",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "mock_key_secret",
});
