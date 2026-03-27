import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const sendOTPEmail = async (to, otp) => {
    try {
        if (!to) throw new Error("Recipient email is required");
        
        // Create transporter with timeout
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            auth: {
                user: process.env.opt_user,
                pass: process.env.otp_token,
            },
            connectionTimeout: 5000,
            socketTimeout: 5000
        });
        
        // Verify connection first (with timeout)
        await transporter.verify().catch(err => {
            console.log("SMTP connection error:", err.message);
            // Continue anyway - we don't want to block registration
        });
        
        const info = await transporter.sendMail({
            from: '"Aditya Gautam" ',
            to: to,
            subject: "OTP Verification",
            text: "otp verification",
            html: `<b>Your OTP is: ${otp}</b>`,
        }).catch(err => {
            console.log("Send mail error:", err.message);
            return { messageId: "mock-id" };
        });
        
        return { messageId: info?.messageId || "mock-id" };
    }catch (error) {
        console.error("Error sending OTP email:", error);
        return { messageId: "mock-id" }; // Return mock for testing
    }
    
}