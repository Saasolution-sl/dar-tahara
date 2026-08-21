import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIpFromHeaders } from "@/lib/client-ip";
import { rateLimitShared } from "@/lib/rate-limit";
import { isSameOrigin } from "@/lib/request-security";

export async function POST(req:NextRequest){if(!isSameOrigin(req))return NextResponse.json({ok:true});const limit=await rateLimitShared(`password-reset:${clientIpFromHeaders(req.headers)}`);if(!limit.allowed)return NextResponse.json({ok:true});const body=await req.json().catch(()=>({})) as {email?:unknown};if(typeof body.email==="string"){const supabase=await createClient();await supabase.auth.resetPasswordForEmail(body.email.trim().toLowerCase(),{redirectTo:`${req.nextUrl.origin}/auth/callback?next=/reset-password`});}return NextResponse.json({ok:true})}
