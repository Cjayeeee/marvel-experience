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
