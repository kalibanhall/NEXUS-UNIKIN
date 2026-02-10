import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { SESSION_COOKIE_NAME } from '@/lib/auth/jwt'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  
  return NextResponse.json({ success: true })
}

export async function GET() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
  
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  return NextResponse.redirect(new URL('/auth/login', appUrl || undefined))
}
