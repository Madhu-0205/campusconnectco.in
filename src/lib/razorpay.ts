import Razorpay from "razorpay";

let razorpayInstance: Razorpay | null = null;

export const getRazorpay = () => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("Razorpay keys are missing. Payments will not work correctly.");
    }

    if (process.env.NODE_ENV === "production" && keyId.startsWith("rzp_test_")) {
        throw new Error("SERVER CONFIGURATION ERROR: Cannot use Razorpay test credentials in production.");
    }
    
    if (!razorpayInstance) {
        razorpayInstance = new Razorpay({
            key_id: keyId,
            key_secret: keySecret,
        });
    }
    
    return razorpayInstance;
};
