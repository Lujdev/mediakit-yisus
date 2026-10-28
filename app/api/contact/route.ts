import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const body = await req.json();
    const { name, email, brand, service, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nombre, email y mensaje son requeridos" },
        { status: 400 }
      );
    }

    // Save to database
    await db.execute({
      sql: `INSERT INTO contact_submissions (name, email, brand, service_type, message) VALUES (?, ?, ?, ?, ?)`,
      args: [name, email, brand || null, service || null, message],
    });

    // Send email notification
    if (resend) {
      try {
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
      } catch (emailErr) {
        console.error("Email error:", emailErr);
        // Don't fail the request if email fails
      }
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

export async function GET(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const result = await db.execute(
      "SELECT * FROM contact_submissions ORDER BY created_at DESC"
    );
    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("GET contacts error:", error);
    return NextResponse.json({ error: "Error al obtener contactos" }, { status: 500 });
  }
}
