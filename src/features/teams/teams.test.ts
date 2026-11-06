import { describe, expect, it } from 'vitest'
import { suggestRole } from './roles'
import { fromShareParams, toShareParams } from './shareLink'

const known = new Set(['thor', 'loki', 'hulk', 'storm', 'groot', 'rocket', 'vision', 'galactus'])

describe('share links', () => {
  it('round-trip a team', () => {
    const team = { name: 'Asgard', members: ['thor', 'loki'], leader: 'thor', roles: { thor: 'powerhouse' as const } }
    const params = toShareParams(team)
    expect(params.toString()).toBe('n=Asgard&m=thor.powerhouse%2Cloki&l=thor')
    expect(fromShareParams(new URLSearchParams(params.toString()), known)).toEqual(team)
  })

  it('drop unknown, duplicate and extra members and bad roles', () => {
    const t = fromShareParams(
      new URLSearchParams('m=thor.chef,batman,thor,loki,hulk,storm,groot,rocket,vision&l=batman'),
      known,
    )
    expect(t?.members).toEqual(['thor', 'loki', 'hulk', 'storm', 'groot', 'rocket'])
    expect(t?.roles).toEqual({})
    expect(t?.leader).toBeNull()
  })

  it('return null without a team', () => {
    expect(fromShareParams(new URLSearchParams(''), known)).toBeNull()
    expect(fromShareParams(new URLSearchParams('m=batman'), known)).toBeNull()
  })
})

describe('suggestRole', () => {
  it('picks the strongest rating', () => {
    expect(suggestRole('hulk')).toBe('powerhouse')
    expect(suggestRole('wolverine')).toBe('brawler')
    expect(suggestRole('professor-x')).toBe('tactician')
    expect(suggestRole('loki')).toBe('blaster')
    expect(suggestRole('falcon')).toBe('brawler')
    expect(suggestRole('nobody')).toBe('wildcard')
  })
})
