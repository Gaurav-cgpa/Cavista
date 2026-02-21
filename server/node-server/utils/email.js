import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(); 
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

export const sendAlertEmail = async (userEmail, userName, alerts) => {
  try {

    const emergencyAlerts = alerts.filter(alert => 
      alert.alerts.some(a => a.severity === 'emergency')
    );

    if (emergencyAlerts.length === 0) {
      return { success: true, message: 'No emergency alerts to send' };
    }


    const emailContent = buildAlertEmailHTML(userName, emergencyAlerts);

    const mailOptions = {
      from: `"Health Monitor Alert" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '🚨 URGENT: Critical Health Alert',
      html: emailContent,
      priority: 'high'
    };

    const info = await transporter.sendMail(mailOptions);

    console.log('Alert email sent:', info.messageId);
    return { 
      success: true, 
      messageId: info.messageId,
      alertCount: emergencyAlerts.length 
    };

  } catch (error) {
    console.error('Error sending alert email:', error);
    throw error;
  }
};

const buildAlertEmailHTML = (userName, alerts) => {
  const alertRows = alerts.map(alert => {
    const alertDetails = alert.alerts
      .filter(a => a.severity === 'emergency')
      .map(a => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <strong>${a.type}</strong>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            ${a.value}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #d32f2f;">
            ${a.message}
          </td>
        </tr>
      `).join('');

    return `
      <div style="margin-bottom: 20px;">
        <p style="font-weight: bold; color: #555;">
          Time: ${new Date(alert.timestamp).toLocaleString()}
        </p>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f5f5f5;">
              <th style="padding: 10px; text-align: left;">Vital</th>
              <th style="padding: 10px; text-align: left;">Value</th>
              <th style="padding: 10px; text-align: left;">Alert</th>
            </tr>
          </thead>
          <tbody>
            ${alertDetails}
          </tbody>
        </table>
      </div>
    `;
  }).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
        <div style="background-color: #d32f2f; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 Critical Health Alert</h1>
        </div>
        
        <div style="padding: 20px; background-color: #fff; border: 1px solid #ddd; border-top: none;">
          <p>Dear <strong>${userName}</strong>,</p>
          
          <p style="color: #d32f2f; font-weight: bold;">
            We have detected critical abnormalities in your vital signs that require immediate attention.
          </p>
          
          <div style="background-color: #fff3e0; padding: 15px; border-left: 4px solid #ff9800; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold;">⚠️ URGENT ACTION REQUIRED</p>
            <p style="margin: 5px 0 0 0;">Please consult with a healthcare professional immediately.</p>
          </div>

          <h2 style="color: #d32f2f; border-bottom: 2px solid #d32f2f; padding-bottom: 10px;">
            Alert Details:
          </h2>
          
          ${alertRows}

          <div style="margin-top: 30px; padding: 15px; background-color: #f5f5f5; border-radius: 5px;">
            <h3 style="margin-top: 0; color: #555;">Recommended Actions:</h3>
            <ul style="margin: 10px 0;">
              <li>Contact your healthcare provider immediately</li>
              <li>If experiencing severe symptoms, call emergency services (911)</li>
              <li>Do not ignore these warnings</li>
              <li>Keep monitoring your vitals regularly</li>
            </ul>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #777;">
            This is an automated alert from your Health Monitoring System. 
            Generated at: ${new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};