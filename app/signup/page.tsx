import { Metadata } from "next"
import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { SignUpForm } from "@/components/auth/signup-form"

export const metadata: Metadata = {
  title: "Sign Up - ScopeRival",
  description: "Create a ScopeRival account",
}

export default function SignUpPage() {
  return (
    <div className="container relative flex min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-primary-foreground" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <BarChart3 className="mr-2 h-6 w-6" />
          ScopeRival
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "ScopeRival gives us the competitive edge by providing deep insights into our market position."
            </p>
            <footer className="text-sm">Alex Johnson, Strategy Lead</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <SignUpForm />
          <p className="px-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}