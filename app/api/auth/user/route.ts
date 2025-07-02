import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase"

// GET /api/auth/user - Get current user
export async function GET(request: NextRequest) {
  const supabase = createServerClient()

  const authHeader = request.headers.get("authorization")
  if (!authHeader) {
    return NextResponse.json({ error: "No authorization header" }, { status: 401 })
  }

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token)

  if (error || !user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 })
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase.from("users").select("*").eq("id", user.id).single()

  if (profileError) {
    return NextResponse.json({ error: "User profile not found" }, { status: 404 })
  }

  return NextResponse.json({ user: profile })
}
