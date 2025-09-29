import { EmailService } from "./EmailService";

export const sendPasswordResetEmail = async (
  email: string,
  resetLink: string,
  expiryNumber: number
) => {
  const emailHTML = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>SiLaporRT - Reset Kata Sandi</title>
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
                        width="40"
                        height="40"
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
                  Permintaan Reset Kata Sandi
                </h2>

                <p
                  style="color:#475569; font-size:16px; line-height:1.6; margin:0 0 20px 0;"
                >
                  Kami menerima permintaan untuk mereset kata sandi akun Anda di
                  SiLaporRT. Klik tombol di bawah untuk membuat kata sandi baru.
                </p>

                <!-- Button -->
                <table
                  role="presentation"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="margin:40px auto; text-align:center;"
                >
                  <tr>
                    <td
                      align="center"
                      bgcolor="#1d4ed8"
                      style="border-radius:12px;"
                    >
                      <a
                        href="${resetLink}"
                        style="display:inline-block; padding:16px 32px; font-size:16px; font-weight:600; color:#ffffff; text-decoration:none; font-family:Arial, sans-serif;"
                      >
                        Reset Kata Sandi
                      </a>
                    </td>
                  </tr>
                </table>

                <p
                  style="color:#475569; font-size:16px; line-height:1.6; margin:0 0 20px 0;"
                >
                  Tautan ini akan kadaluarsa dalam
                  <strong>${expiryNumber} menit</strong> demi alasan keamanan.
                </p>

                <p
                  style="color:#475569; font-size:16px; line-height:1.6; margin:0 0 20px 0;"
                >
                  Jika Anda tidak meminta reset kata sandi, abaikan email ini.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                align="center"
                style="padding:30px; background-color:#f1f5f9; border-top:1px solid #e2e8f0;"
              >
                <p style="color:#64748b; font-size:14px; margin:0;">
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
</html>

  `;

  try {
    const transporter = await EmailService.transporter();
    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject: "Reset Kata Sandi SiLaporRT",
      html: emailHTML,
    });

    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
};
