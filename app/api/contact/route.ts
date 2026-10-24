import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, brand, service, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son requeridos" },
        { status: 400 }
      );
    }

    if (resend) {
      await resend.emails.send({
        from: "MediaKit Yisus <onboarding@resend.dev>",
        to: "jesusoneiver@gmail.com",
        subject: `Nueva propuesta de ${name}`,
        html: `
          <h2>Nueva solicitud de contacto</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Marca:</strong> ${brand || "No especificada"}</p>
          <p><strong>Servicio:</strong> ${service || "No especificado"}</p>
          <p><strong>Mensaje:</strong></p>
          <p>${message.replace(/\n/g, "<br>")}</p>
        `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact error:", error);
    return NextResponse.json(
      { error: "Error al enviar el mensaje" },
      { status: 500 }
    );
  }
}
