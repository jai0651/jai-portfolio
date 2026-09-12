import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface GeoData {
  country: string | null;
  city: string | null;
  region: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const headersList = await headers();
    const body = await req.json().catch(() => ({}));

    const forwarded = headersList.get("x-forwarded-for");
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : headersList.get("x-real-ip") || "unknown";

    const userAgent = headersList.get("user-agent") || "unknown";
    const referer = headersList.get("referer") || null;

    let geoData: GeoData = {
      country: null,
      city: null,
      region: null,
    };

    if (ip && ip !== "unknown" && ip !== "::1" && ip !== "127.0.0.1") {
      try {
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        if (geoResponse.ok) {
          const geo = await geoResponse.json();
          if (geo.status === "success") {
            geoData = {
              country: geo.country,
              city: geo.city,
              region: geo.regionName,
            };
          }
        }
      } catch {
        // Geo lookup failed silently
      }
    }

    /*
     * Every public path is recorded, not just "/", so the admin side can answer
     * which pages people actually read. Normalised to keep the cardinality of
     * the column bounded: query strings and trailing slashes collapse, admin is
     * never recorded, and anything absurd is rejected rather than stored.
     */
    const raw = typeof body.path === "string" ? body.path : "/";
    const path = raw.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
    if (!path.startsWith("/") || path.length > 180 || path.startsWith("/admin")) {
      return NextResponse.json({ success: false, message: "Not tracked" }, { status: 400 });
    }

    const visitor = await prisma.visitor.create({
      data: {
        ip,
        country: geoData.country,
        city: geoData.city,
        region: geoData.region,
        userAgent,
        path,
        referer,
      },
    });

    return NextResponse.json({ success: true, id: visitor.id });
  } catch (error) {
    console.error("Visitor tracking error:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

