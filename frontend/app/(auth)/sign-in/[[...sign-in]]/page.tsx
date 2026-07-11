import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Daemon</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Sign in to your account
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  )
}
