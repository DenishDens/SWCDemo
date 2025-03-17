import type { Metadata } from "next"
import ForgotPasswordClient from "./forgot-password-client"

export const metadata: Metadata = {
  title: "Forgot Password | Carbonly.ai",
  description: "Reset your Carbonly.ai account password",
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />
}

