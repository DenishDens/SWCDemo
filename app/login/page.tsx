import type { Metadata } from "next"
import LoginPageClient from "./login-page-client"

export const metadata: Metadata = {
  title: "Login | Carbonly.ai",
  description: "Login to your Carbonly.ai account",
}

export default function LoginPage() {
  return <LoginPageClient />
}

