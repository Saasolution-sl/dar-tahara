import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { clientIpFromHeaders, rateLimit } from "@/lib/mailing-list";
import { dashboardForRoles, safeNextPath, type AppRole } from "@/lib/portal-auth";
import { isSameOrigin } from "@/lib/request-security";

export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({error:"invalid_request"},{status:403});
  const limit=rateLimit(`login:${clientIpFromHeaders(req.headers)}`); if(!limit.allowed)return NextResponse.json({error:"invalid_credentials"},{status:429});
  const body=await req.json().catch(()=>({})) as Record<string,unknown>; const email=typeof body.email==="string"?body.email.trim().toLowerCase():""; const password=typeof body.password==="string"?body.password:"";
  if(!email||password.length<8)return NextResponse.json({error:"invalid_credentials"},{status:400});
  const supabase=await createClient(); const {data,error}=await supabase.auth.signInWithPassword({email,password});
  if(error||!data.user)return NextResponse.json({error:"invalid_credentials"},{status:400});
  const [{data:roles},{data:customer},{data:staff}]=await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id",data.user.id),
    supabase.from("customers").select("status").eq("auth_user_id",data.user.id).maybeSingle(),
    supabase.from("staff_members").select("active").eq("auth_user_id",data.user.id).maybeSingle(),
  ]);
  if(customer?.status==="suspended"||staff?.active===false){
    await supabase.auth.signOut();
    return NextResponse.json({error:"account_suspended"},{status:403});
  }
  const roleValues=(roles||[]).map(r=>r.role as AppRole); const requested=safeNextPath(typeof body.next==="string"?body.next:null);
  const allowed=requested.startsWith("/admin")
    ? roleValues.some(r=>r==="administrator"||r==="staff")
    : requested.startsWith("/regional-manager")
      ? roleValues.some(r=>r==="administrator"||r==="regional_manager")
      : requested.startsWith("/manager")
        ? roleValues.some(r=>r==="administrator"||r==="manager")
        : requested.startsWith("/assessment")
          ? roleValues.some(r=>r==="administrator"||r==="assessment")
          : requested.startsWith("/account")
            ? roleValues.some(r=>r==="applicant"||r==="customer"||r==="customer_company")
            : true;
  return NextResponse.json({destination:allowed&&requested!=="/account"?requested:dashboardForRoles(roleValues)});
}
