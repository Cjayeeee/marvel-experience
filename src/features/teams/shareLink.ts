import { TEAM_ROLES, TEAM_SIZE, type TeamRole } from '@/types/library'

export type TeamSnapshot = {
  name: string
  members: string[]
  leader: string | null
  roles: Partial<Record<string, TeamRole>>
}

/**
 * Teams travel in the URL, so a link rebuilds the squad for anyone:
 * ?n=Asgard&m=thor.powerhouse,loki.tactician&l=thor
 */
export function toShareParams(team: TeamSnapshot): URLSearchParams {
  const params = new URLSearchParams()
  if (team.name.trim()) params.set('n', team.name.trim())
  params.set('m', team.members.map((slug) => (team.roles[slug] ? `${slug}.${team.roles[slug]}` : slug)).join(','))
  if (team.leader) params.set('l', team.leader)
  return params
}

/** Read a shared team. Unknown slugs and roles are dropped; null when there's no team in the URL. */
export function fromShareParams(params: URLSearchParams, known: ReadonlySet<string>): TeamSnapshot | null {
  const raw = params.get('m')
  if (!raw) return null
  const members: string[] = []
  const roles: Partial<Record<string, TeamRole>> = {}
  for (const part of raw.split(',')) {
    const [slug = '', role] = part.split('.')
    if (!known.has(slug) || members.includes(slug) || members.length >= TEAM_SIZE) continue
    members.push(slug)
    if (role && TEAM_ROLES.includes(role as TeamRole)) roles[slug] = role as TeamRole
  }
  if (!members.length) return null
  const leader = params.get('l')
  return {
    name: (params.get('n') ?? '').slice(0, 60),
    members,
    leader: leader && members.includes(leader) ? leader : null,
    roles,
  }
}
