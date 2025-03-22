import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    // Email options
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: options.email,
        subject: options.subject,
        html: options.message
    };

    // Send email
    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ', info.messageId);
        return info;
    } catch (error) {
        console.error('Email error: ', error);
        throw new Error('Email could not be sent');
    }
};

export default sendEmail;