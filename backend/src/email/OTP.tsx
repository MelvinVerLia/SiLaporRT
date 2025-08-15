import { Resend } from "resend";
import { transporter } from "./mailer";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOTPEmail = async (
  email: string,
  otp: string,
  expiryMinutes: number
) => {
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SiLaporRT - Verification Code</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc;">
    
    <div style="max-width: 600px; margin: 0 auto; background-color: white;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; text-align: center;">
            <div style="width: 60px; height: 60px; background-color: white; border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 15px; font-size: 24px; font-weight: bold; color: #3b82f6;">
                SL
            </div>
            <h1 style="color: white; font-size: 28px; margin: 0;">SiLaporRT</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px;">
            <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px; text-align: center;">Verification Code</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                Please use the verification code below to complete your account verification on SiLaporRT.
            </p>
            
            <!-- OTP Code Box -->
            <div style="text-align: center; margin: 40px 0;">
                <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); 
                           border: 2px solid #3b82f6; 
                           border-radius: 16px; 
                           padding: 30px; 
                           display: inline-block;
                           box-shadow: 0 4px 12px rgba(59, 130, 246, 0.1);">
                    <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                        Your Verification Code
                    </p>
                    <div style="font-size: 36px; 
                               font-weight: bold; 
                               color: #3b82f6; 
                               letter-spacing: 8px; 
                               margin: 0;
                               font-family: 'Courier New', monospace;">
                        ${otp}
                    </div>
                </div>
            </div>
            
            <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 12px; padding: 20px; margin: 30px 0;">
                <p style="color: #92400e; font-size: 14px; margin: 0; text-align: center;">
                    ⚠️ This code will expire in <strong>${expiryMinutes} minutes</strong>
                </p>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                Enter this code on the SiLaporRT verification page to complete your account setup.
            </p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                If you didn't request this verification code, please ignore this email or contact our support team.
            </p>
            
            <!-- Security Notice -->
            <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 20px; margin-top: 30px;">
                <p style="color: #475569; font-size: 14px; margin: 0;">
                    <strong>Security Reminder:</strong> Never share this verification code with anyone. SiLaporRT staff will never ask for your verification code.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">
                © 2025 SiLaporRT. All rights reserved.
            </p>
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                This is an automated message, please do not reply to this email.
            </p>
        </div>
        
    </div>
</body>
</html>
  `;
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "OTP Verification",
      html: emailHTML,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
