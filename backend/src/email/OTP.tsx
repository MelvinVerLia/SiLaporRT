import { transporter } from "./mailer";

export const sendOTPEmail = async (
  email: string,
  otp: string,
  expiryMinutes: number
) => {
  const emailHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>SiLaporRT - Kode Verifikasi</title>
  </head>
  <body
    style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f8fafc;"
  >
    <table
      role="presentation"
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="background-color:#f8fafc;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            border="0"
            cellpadding="0"
            cellspacing="0"
            width="600"
            style="background-color:#ffffff;"
          >
            <!-- Header -->
            <tr>
              <td
                align="center"
                bgcolor="#1d4ed8"
                style="padding:30px; color:#ffffff;"
              >
                <table border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td
                      bgcolor="#ffffff"
                      style="border-radius:12px; padding:10px;"
                    >
                      <img
                        src="https://res.cloudinary.com/dgnedkivd/image/upload/v1757562088/silaporrt/dev/logo/logo_lnenhb.png"
                        width="50"
                        height="50"
                        alt="SiLaporRT Logo"
                        style="display:block;"
                      />
                    </td>
                    <td style="padding-left:12px; font-size:28px; font-weight:bold; color:#ffffff; font-family:Arial, sans-serif;">
                      SiLaporRT
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding:40px;">
                <h2
                  style="color:#1e293b; font-size:24px; text-align:center; margin:0 0 20px 0;"
                >
                  Kode Verifikasi
                </h2>

                <p
                  style="color:#475569; font-size:16px; text-align:center; line-height:1.6; margin:0 0 30px 0;"
                >
                  Gunakan kode verifikasi di bawah ini untuk menyelesaikan proses
                  verifikasi akun Anda di SiLaporRT.
                </p>

                <!-- OTP Box -->
                <table
                  align="center"
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  style="margin:40px auto; border:2px solid #3b82f6; border-radius:16px; background-color:#f1f5f9;"
                >
                  <tr>
                    <td
                      align="center"
                      style="padding:20px 30px; font-family:Courier, monospace; font-size:32px; font-weight:bold; color:#3b82f6; letter-spacing:8px;"
                    >
                      ${otp}
                    </td>
                  </tr>
                </table>

                <!-- Expiry -->
                <table
                  role="presentation"
                  width="100%"
                  style="margin:30px 0; background-color:#fef3c7; border:1px solid #f59e0b; border-radius:12px;"
                >
                  <tr>
                    <td
                      align="center"
                      style="padding:20px; color:#92400e; font-size:14px;"
                    >
                      ⚠️ Kode ini akan kadaluarsa dalam
                      <strong>${expiryMinutes} menit</strong>
                    </td>
                  </tr>
                </table>

                <p
                  style="color:#475569; font-size:16px; line-height:1.6; margin:0 0 20px 0;"
                >
                  Masukkan kode ini pada halaman verifikasi SiLaporRT untuk
                  menyelesaikan pendaftaran akun Anda.
                </p>

                <p
                  style="color:#475569; font-size:16px; line-height:1.6; margin:0 0 20px 0;"
                >
                  Jika Anda tidak meminta kode ini, abaikan email ini atau hubungi
                  tim dukungan kami.
                </p>

                <!-- Security Reminder -->
                <table
                  role="presentation"
                  width="100%"
                  style="margin-top:30px; background-color:#f1f5f9; border-left:4px solid #3b82f6;"
                >
                  <tr>
                    <td
                      style="padding:20px; color:#475569; font-size:14px; font-family:Arial, sans-serif;"
                    >
                      <strong>Pengingat Keamanan:</strong> Jangan pernah bagikan
                      kode ini kepada siapa pun. Tim SiLaporRT tidak akan pernah
                      meminta kode verifikasi Anda.
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="padding:30px; background-color:#f1f5f9; border-top:1px solid #e2e8f0;"
              >
                <p style="color:#64748b; font-size:14px; margin:0 0 10px 0;">
                  © 2025 SiLaporRT. Semua hak dilindungi.
                </p>
                <p style="color:#94a3b8; font-size:12px; margin:0;">
                  Ini adalah pesan otomatis, harap jangan membalas email ini.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  `;
  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Verifikasi Akun SiLaporRT",
      html: emailHTML,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
