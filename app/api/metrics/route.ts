import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await initDb();
    const result = await db.execute(
      "SELECT platform, metric_type, value, label FROM metrics ORDER BY id"
    );
    
    // Transform to structured object
    const metrics: Record<string, Record<string, { value: string; label: string }>> = {};
    
    for (const row of result.rows) {
      const platform = row.platform as string;
      const metricType = row.metric_type as string;
      
      if (!metrics[platform]) metrics[platform] = {};
      metrics[platform][metricType] = {
        value: String(row.value),
        label: String(row.label),
      };
    }
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error("GET metrics error:", error);
    return NextResponse.json({ error: "Error al obtener métricas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const body = await req.json();
    
    if (!body.platform || !body.metric_type || !body.value) {
      return NextResponse.json(
        { error: "platform, metric_type y value son requeridos" },
        { status: 400 }
      );
    }
    
    // Update or insert
    await db.execute({
      sql: `INSERT INTO metrics (platform, metric_type, value, label) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(platform, metric_type) DO UPDATE SET
            value = excluded.value,
            label = excluded.label,
            updated_at = CURRENT_TIMESTAMP`,
      args: [body.platform, body.metric_type, body.value, body.label || body.metric_type],
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("POST metrics error:", error);
    return NextResponse.json({ error: "Error al guardar métrica" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  try {
    await initDb();
    const body = await req.json();
    
    // Update multiple metrics at once
    for (const [platform, metrics] of Object.entries(body)) {
      for (const [metricType, data] of Object.entries(metrics as Record<string, { value: string; label?: string }>)) {
        await db.execute({
          sql: `INSERT INTO metrics (platform, metric_type, value, label) 
                VALUES (?, ?, ?, ?)
                ON CONFLICT(platform, metric_type) DO UPDATE SET
                value = excluded.value,
                label = COALESCE(excluded.label, metrics.label),
                updated_at = CURRENT_TIMESTAMP`,
          args: [platform, metricType, data.value, data.label || metricType],
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PUT metrics error:", error);
    return NextResponse.json({ error: "Error al actualizar métricas" }, { status: 500 });
  }
}
