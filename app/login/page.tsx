import { Metadata } from "next"
import LoginPageClient from "./login-page-client"

export const metadata: Metadata = {
  title: "Login - Carbonly",
  description: "Login to your account.",
}

export default function LoginPage() {
  return <LoginPageClient />
}
