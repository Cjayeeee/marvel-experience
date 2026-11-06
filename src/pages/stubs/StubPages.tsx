import { MilestoneStub } from './MilestoneStub'

/* Each later milestone replaces one of these with a real page module. */

export function TeamBuilderStub() {
  return (
    <MilestoneStub
      file="Operations · War table"
      lead="Assemble"
      accent="Your team"
      milestone={8}
      summary="Pick up to six characters, choose a leader, assign roles, save the squad and generate a poster."
    />
  )
}

export function ArenaStub() {
  return (
    <MilestoneStub
      file="Simulation · Combat assessment"
      lead="Battle"
      accent="Arena"
      milestone={8}
      summary="Put two characters side by side and compare six attributes. All ratings are labelled editorial estimates."
    />
  )
}

export function ProfileStub() {
  return (
    <MilestoneStub
      file="Agent file · Personal"
      lead="Agent"
      accent="File"
      milestone={7}
      summary="Your favourites, watchlist, saved teams and collections, stored in your account."
    />
  )
}

export function LoginStub() {
  return (
    <MilestoneStub
      file="Access · Clearance required"
      lead="Sign"
      accent="In"
      milestone={6}
      summary="Accounts arrive with the Supabase backend: sign up, sign in, password reset and saved sessions."
    />
  )
}

export function SignupStub() {
  return (
    <MilestoneStub
      file="Access · New agent"
      lead="Create"
      accent="Account"
      milestone={6}
      summary="Accounts arrive with the Supabase backend: sign up, sign in, password reset and saved sessions."
    />
  )
}

export function ResetPasswordStub() {
  return (
    <MilestoneStub
      file="Access · Recovery"
      lead="Reset"
      accent="Password"
      milestone={6}
      summary="Password recovery arrives with the Supabase backend."
    />
  )
}
