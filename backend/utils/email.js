const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For production, use a real SMTP service (e.g., SendGrid, Gmail, AWS SES)
    // For testing/demo, we use Ethereal or a dummy logger if no env vars present
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER || 'ethereal_user',
            pass: process.env.SMTP_PASS || 'ethereal_pass'
        }
    });

    const mailOptions = {
        from: `${process.env.FROM_NAME || 'Amazon Clone'} <${process.env.FROM_EMAIL || 'noreply@amazonclone.com'}>`,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.log('Email send failed (simulated):', error.message);
        // In a real app we might throw, but for this clone we don't want to break the order flow
        // if email fails due to missing credentials
    }
};

module.exports = sendEmail;
