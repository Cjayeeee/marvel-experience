/**
 * EDITORIAL ESTIMATES, NOT OFFICIAL DATA.
 *
 * Six attributes on a 1–7 scale, modelled on the "power grid" format of
 * Marvel's Official Handbooks. Each number is this project's own judgement of
 * a character's typical, mainstream portrayal. Comics vary wildly from writer
 * to writer, so treat these as a talking point, not a canon ruling. The UI
 * labels them as estimates wherever they appear.
 *
 * Scale, roughly: 1 below average · 2 normal human peak · 3 enhanced ·
 * 4 superhuman · 5 far beyond · 6 world-class among heroes · 7 cosmic.
 * Order: intelligence, strength, speed, durability, energy, fighting.
 */
import type { PowerRatings } from '@/types/character'

type Row = [intelligence: number, strength: number, speed: number, durability: number, energy: number, fighting: number]

const rows: Record<string, Row> = {
  'iron-man': [6, 6, 5, 6, 6, 4],
  'captain-america': [3, 3, 2, 3, 1, 6],
  thor: [2, 7, 7, 6, 6, 4],
  hulk: [2, 7, 3, 7, 1, 4],
  'black-widow': [3, 3, 2, 3, 3, 6],
  hawkeye: [3, 2, 2, 2, 1, 6],
  'spider-man': [4, 4, 3, 3, 1, 4],
  'scarlet-witch': [3, 2, 2, 2, 6, 3],
  'captain-marvel': [3, 6, 5, 6, 6, 4],
  'ms-marvel': [3, 4, 2, 4, 1, 3],
  vision: [4, 5, 4, 6, 5, 3],
  'ant-man': [4, 3, 2, 3, 1, 3],
  'black-panther': [5, 3, 2, 3, 3, 6],
  falcon: [3, 2, 3, 2, 1, 4],
  'doctor-strange': [4, 2, 7, 2, 6, 4],
  'shang-chi': [3, 3, 3, 3, 2, 7],
  'moon-knight': [3, 3, 2, 3, 1, 5],
  daredevil: [3, 3, 2, 2, 1, 5],
  'jessica-jones': [3, 4, 3, 4, 1, 2],
  'luke-cage': [2, 4, 2, 6, 1, 4],
  'iron-fist': [3, 3, 2, 3, 3, 6],
  wolverine: [2, 4, 2, 4, 1, 7],
  storm: [2, 2, 3, 2, 5, 4],
  cyclops: [3, 2, 2, 2, 5, 4],
  'jean-grey': [3, 3, 5, 3, 6, 3],
  'professor-x': [5, 2, 1, 2, 2, 3],
  'mister-fantastic': [6, 3, 2, 5, 1, 3],
  'invisible-woman': [3, 2, 3, 3, 5, 3],
  'human-torch': [2, 2, 5, 2, 6, 3],
  'the-thing': [3, 6, 2, 6, 1, 4],
  'star-lord': [3, 2, 3, 2, 3, 4],
  gamora: [3, 4, 3, 4, 1, 7],
  rocket: [5, 2, 2, 2, 3, 4],
  groot: [2, 5, 2, 6, 1, 3],
  'silver-surfer': [3, 7, 7, 6, 7, 2],
  deadpool: [2, 4, 2, 4, 1, 6],
  punisher: [3, 2, 2, 2, 1, 6],
  venom: [2, 5, 3, 5, 1, 4],
  'yelena-belova': [3, 3, 2, 3, 1, 6],
  bucky: [3, 4, 2, 3, 1, 6],
  'us-agent': [2, 4, 2, 4, 1, 5],
  'doctor-doom': [6, 4, 5, 6, 6, 4],
  thanos: [6, 7, 7, 6, 6, 4],
  loki: [5, 4, 7, 4, 6, 3],
  kang: [6, 3, 3, 5, 5, 4],
  magneto: [4, 2, 3, 4, 6, 4],
  hela: [3, 6, 3, 6, 6, 4],
  'red-skull': [4, 2, 2, 2, 1, 4],
  killmonger: [4, 3, 2, 3, 3, 6],
  ultron: [6, 6, 5, 7, 6, 4],
  'green-goblin': [4, 4, 3, 4, 3, 4],
  mysterio: [4, 2, 2, 2, 3, 3],
  dormammu: [4, 7, 7, 7, 7, 4],
  galactus: [7, 7, 7, 7, 7, 1],
  apocalypse: [6, 7, 3, 7, 6, 5],
  'spider-man-miles-morales': [3, 4, 3, 3, 3, 4],
  'ghost-spider': [3, 4, 3, 3, 1, 4],
  'spider-man-2099': [5, 4, 3, 3, 1, 4],
  'captain-carter': [3, 3, 2, 3, 1, 6],
  'old-man-logan': [2, 4, 2, 4, 1, 7],
}

export const ratings: Record<string, PowerRatings> = Object.fromEntries(
  Object.entries(rows).map(([slug, [intelligence, strength, speed, durability, energy, fighting]]) => [
    slug,
    { intelligence, strength, speed, durability, energy, fighting },
  ]),
)
