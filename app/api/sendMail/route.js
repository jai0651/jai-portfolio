import { mailOptions, transporter } from "./nodemailer";

export async function POST(req) {
  try {
    const body = await req.json(); // Parse JSON request body
    const { firstname, lastname, email, service, message } = body;

    // Validate required fields
    if (!firstname || !lastname || !email || !service || !message) {
      return new Response(
        JSON.stringify({ message: "All fields are required" }),
        { status: 400 }
      );
    }

    // Send email using transporter
    await transporter.sendMail({
      ...mailOptions,
      subject: `New Contact Form Submission from ${firstname} ${lastname}`,
      text: `
        Name: ${firstname} ${lastname}
        Email: ${email}
        Service: ${service}
        Message: ${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${firstname} ${lastname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Service:</strong> ${service}</p>
        <p><strong>Message:</strong><br>${message}</p>
      `,
    });

    // Return success response
    return new Response(JSON.stringify({ message: "Email sent successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ message: "Failed to send email", error: error.message }),
      { status: 500 }
    );
  }
}
