import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: any,
  expiry: any
) => {
  const emailHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SiLaporRT - Password Reset</title>
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
            <h2 style="color: #1e293b; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                We received a request to reset your password for your SiLaporRT account. 
                Click the button below to create a new password.
            </p>
            
            <!-- Button -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="${resetLink}" 
                   style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); 
                          color: white; 
                          text-decoration: none; 
                          padding: 16px 32px; 
                          border-radius: 12px; 
                          font-size: 16px; 
                          font-weight: 600; 
                          display: inline-block;
                          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);">
                    Reset Password
                </a>
            </div>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                This link will expire in ${expiry.getMinutes()} minutes for security purposes.
            </p>
            
            <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                If you didn't request this, you can safely ignore this email.
            </p>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="color: #64748b; font-size: 14px; margin: 0;">
                © 2025 SiLaporRT. All rights reserved.
            </p>
        </div>
        
    </div>
</body>
</html>
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Reset Your SiLaporRT Password",
      html: emailHTML,
    });

    if (error) {
      console.error("Email error:", error);
      return false;
    }

    console.log("Email sent successfully:", data);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
