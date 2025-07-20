import nodemailer from 'nodemailer'
import { env } from '~/config/environment'

export const sendAppointmentConfirmationEmail = async (to, appointmentInfo) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: `"Spa Pet" <${env.EMAIL_USER}>`,
    to,
    subject: 'Xác nhận lịch hẹn spa thú cưng 🐾',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #f8f8f8; padding: 20px;">
        <div style="max-width: 700px; margin: auto; background-color: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <h2 style="color: #f97316;">🐾 Spa Pet - Xác nhận lịch hẹn</h2>

          <p>Chào <strong>${appointmentInfo.customerName}</strong>,</p>
          <p>Bạn đã đặt lịch hẹn spa thành công với thông tin chi tiết như sau:</p>

          <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;">
            <div style="flex: 1; min-width: 200px; border: 1px solid #eee; border-radius: 10px; padding: 16px;">
              <h3 style="color: #f97316;">📋 Dịch vụ</h3>
              <p><strong>Dịch vụ:</strong> ${appointmentInfo.service}</p>
              <p><strong>Ngày:</strong> ${appointmentInfo.date}</p>
              <p><strong>Giờ:</strong> ${appointmentInfo.time}</p>
            </div>

            <div style="flex: 1; min-width: 200px; border: 1px solid #eee; border-radius: 10px; padding: 16px;">
              <h3 style="color: #f97316;">🙋 Người đặt</h3>
              <p><strong>Tên:</strong> ${appointmentInfo.customerName}</p>
              <p><strong>Email:</strong> ${to}</p>
              <p><strong>Điện thoại:</strong> ${appointmentInfo.phone || '(chưa cung cấp)'}</p>
            </div>

            <div style="flex: 1; min-width: 200px; border: 1px solid #eee; border-radius: 10px; padding: 16px;">
              <h3 style="color: #f97316;">🐶 Thú cưng</h3>
              <p><strong>Tên:</strong> ${appointmentInfo.petName}</p>
              <p><strong>Loại:</strong> ${appointmentInfo.petType || '---'}</p>
              <p><strong>Tuổi:</strong> ${appointmentInfo.petAge || '---'}</p>
              <p><strong>Cân nặng:</strong> ${appointmentInfo.petWeight || '---'}</p>
            </div>
          </div>

          ${appointmentInfo.note
        ? `
          <div style="margin-top: 20px; border: 1px solid #eee; border-radius: 10px; padding: 16px;">
            <h3 style="color: #f97316;">📝 Ghi chú</h3>
            <p>${appointmentInfo.note}</p>
          </div>`
        : ''
      }

          <p style="margin-top: 30px;">Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ của <strong>Spa Pet</strong>! Chúng tôi rất mong được phục vụ bạn và thú cưng của bạn. ❤️</p>

          <p style="margin-top: 10px; font-style: italic; color: gray;">— Đội ngũ Spa Pet</p>
        </div>
      </div>
    `
  }

  await transporter.sendMail(mailOptions);
}


export const sendResetPasswordEmail = async (to, name, link) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.EMAIL_USER,
      pass: env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from: `"Spa Pet" <${env.EMAIL_USER}>`,
    to,
    subject: 'Yêu cầu đặt lại mật khẩu 🔐',
    html: `
      <h2>Chào ${name || 'bạn'},</h2>
      <p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để thực hiện:</p>
      <a href="${link}" style="
        background-color: orange;
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        display: inline-block;
        margin: 20px 0;
      ">Đặt lại mật khẩu</a>
      <p>Nếu bạn không yêu cầu, hãy bỏ qua email này.</p>
    `
  }

  await transporter.sendMail(mailOptions)
}
