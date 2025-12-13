import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, phone, service, message } = body;

    if (!firstname || !lastname || !email || !service || !message) {
      return NextResponse.json(
        { message: "All required fields must be filled" },
        { status: 400 }
      );
    }

    await prisma.contactMessage.create({
      data: {
        firstname,
        lastname,
        email,
        service,
        message,
      },
    });

    try {
      await transporter.sendMail({
        from: `"${firstname} ${lastname}" <${email}>`,
        replyTo: email,
        to: process.env.EMAIL,
        subject: `Portfolio Contact: ${service} - from ${firstname} ${lastname}`,
        text: `
Name: ${firstname} ${lastname}
Email: ${email}
Phone: ${phone || "Not provided"}
Service: ${service}

Message:
${message}
        `,
        html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #00ff99 0%, #00cc7a 100%); padding: 30px; border-radius: 12px 12px 0 0; }
    .header h1 { color: #1c1c22; margin: 0; font-size: 24px; }
    .content { background: #27272c; padding: 30px; border-radius: 0 0 12px 12px; }
    .field { margin-bottom: 20px; }
    .label { color: #00ff99; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
    .value { color: #ffffff; font-size: 16px; }
    .message-box { background: #1c1c22; padding: 20px; border-radius: 8px; border-left: 4px solid #00ff99; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📬 New Contact Form Submission</h1>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">From</div>
        <div class="value">${firstname} ${lastname}</div>
      </div>
      <div class="field">
        <div class="label">Email</div>
        <div class="value"><a href="mailto:${email}" style="color: #00ff99;">${email}</a></div>
      </div>
      ${phone ? `<div class="field"><div class="label">Phone</div><div class="value">${phone}</div></div>` : ""}
      <div class="field">
        <div class="label">Service Interested In</div>
        <div class="value">${service}</div>
      </div>
      <div class="field">
        <div class="label">Message</div>
        <div class="message-box">
          <div class="value">${message.replace(/\n/g, "<br>")}</div>
        </div>
      </div>
    </div>
    <div class="footer">
      Sent from your portfolio contact form
    </div>
  </div>
</body>
</html>
        `,
      });
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
    }

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}

