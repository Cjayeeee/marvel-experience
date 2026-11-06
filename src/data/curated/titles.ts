import type { Title } from '@/types/title'

/**
 * Curated Marvel Studios catalogue: feature films and live-action series,
 * plus What If…? for its central place in the multiverse. Shorts, one-shots,
 * specials and other animated series are not included.
 *
 * - releaseDate: US release / premiere date.
 * - chronoIndex + placement 'official': position in Disney+'s "Timeline order"
 *   (Marvel Studios' official sequence), filtered to the titles listed here.
 * - placement 'fan': titles absent from the Disney+ timeline (Sony-distributed
 *   Spider-Man films), placed where fan consensus puts them. Labelled in the UI.
 * - Netflix series were added to the Disney+ timeline by Marvel in 2024; they
 *   have no phase.
 * - imdbId null → OMDb is queried by title and year instead.
 */
export const titles: Title[] = [
  // ─── Phase 1 ───
  { id: 'iron-man', title: 'Iron Man', kind: 'film', releaseDate: '2008-05-02', phase: 1, chronoIndex: 3, placement: 'official', imdbId: 'tt0371746' },
  { id: 'the-incredible-hulk', title: 'The Incredible Hulk', kind: 'film', releaseDate: '2008-06-13', phase: 1, chronoIndex: 5, placement: 'official', imdbId: 'tt0800080' },
  { id: 'iron-man-2', title: 'Iron Man 2', kind: 'film', releaseDate: '2010-05-07', phase: 1, chronoIndex: 4, placement: 'official', imdbId: 'tt1228705' },
  { id: 'thor', title: 'Thor', kind: 'film', releaseDate: '2011-05-06', phase: 1, chronoIndex: 6, placement: 'official', imdbId: 'tt0800369' },
  { id: 'captain-america-the-first-avenger', title: 'Captain America: The First Avenger', kind: 'film', releaseDate: '2011-07-22', phase: 1, chronoIndex: 1, placement: 'official', imdbId: 'tt0458339' },
  { id: 'the-avengers', title: 'The Avengers', kind: 'film', releaseDate: '2012-05-04', phase: 1, chronoIndex: 7, placement: 'official', imdbId: 'tt0848228' },

  // ─── Phase 2 ───
  { id: 'iron-man-3', title: 'Iron Man 3', kind: 'film', releaseDate: '2013-05-03', phase: 2, chronoIndex: 9, placement: 'official', imdbId: 'tt1300854' },
  { id: 'thor-the-dark-world', title: 'Thor: The Dark World', kind: 'film', releaseDate: '2013-11-08', phase: 2, chronoIndex: 8, placement: 'official', imdbId: 'tt1981115' },
  { id: 'captain-america-the-winter-soldier', title: 'Captain America: The Winter Soldier', kind: 'film', releaseDate: '2014-04-04', phase: 2, chronoIndex: 10, placement: 'official', imdbId: 'tt1843866' },
  { id: 'guardians-of-the-galaxy', title: 'Guardians of the Galaxy', kind: 'film', releaseDate: '2014-08-01', phase: 2, chronoIndex: 11, placement: 'official', imdbId: 'tt2015381' },
  { id: 'avengers-age-of-ultron', title: 'Avengers: Age of Ultron', kind: 'film', releaseDate: '2015-05-01', phase: 2, chronoIndex: 15, placement: 'official', imdbId: 'tt2395427' },
  { id: 'ant-man', title: 'Ant-Man', kind: 'film', releaseDate: '2015-07-17', phase: 2, chronoIndex: 16, placement: 'official', imdbId: 'tt0478970' },

  // ─── Marvel Television (Netflix) ───
  { id: 'daredevil', title: 'Daredevil', kind: 'series', releaseDate: '2015-04-10', phase: null, chronoIndex: 13, placement: 'official', imdbId: 'tt3322312', note: 'Marvel Television (Netflix). Added to the Disney+ timeline in 2024.' },
  { id: 'jessica-jones', title: 'Jessica Jones', kind: 'series', releaseDate: '2015-11-20', phase: null, chronoIndex: 14, placement: 'official', imdbId: 'tt2357547', note: 'Marvel Television (Netflix). Added to the Disney+ timeline in 2024.' },
  { id: 'luke-cage', title: 'Luke Cage', kind: 'series', releaseDate: '2016-09-30', phase: null, chronoIndex: 17, placement: 'official', imdbId: 'tt3322314', note: 'Marvel Television (Netflix). Added to the Disney+ timeline in 2024.' },
  { id: 'the-punisher', title: 'The Punisher', kind: 'series', releaseDate: '2017-11-17', phase: null, chronoIndex: 21, placement: 'official', imdbId: 'tt5675620', note: 'Marvel Television (Netflix). Added to the Disney+ timeline in 2024.' },

  // ─── Phase 3 ───
  { id: 'captain-america-civil-war', title: 'Captain America: Civil War', kind: 'film', releaseDate: '2016-05-06', phase: 3, chronoIndex: 18, placement: 'official', imdbId: 'tt3498820' },
  { id: 'doctor-strange', title: 'Doctor Strange', kind: 'film', releaseDate: '2016-11-04', phase: 3, chronoIndex: 23, placement: 'official', imdbId: 'tt1211837' },
  { id: 'guardians-of-the-galaxy-vol-2', title: 'Guardians of the Galaxy Vol. 2', kind: 'film', releaseDate: '2017-05-05', phase: 3, chronoIndex: 12, placement: 'official', imdbId: 'tt3896198' },
  { id: 'spider-man-homecoming', title: 'Spider-Man: Homecoming', kind: 'film', releaseDate: '2017-07-07', phase: 3, chronoIndex: 22, placement: 'official', imdbId: 'tt2250912' },
  { id: 'thor-ragnarok', title: 'Thor: Ragnarok', kind: 'film', releaseDate: '2017-11-03', phase: 3, chronoIndex: 24, placement: 'official', imdbId: 'tt3501632' },
  { id: 'black-panther', title: 'Black Panther', kind: 'film', releaseDate: '2018-02-16', phase: 3, chronoIndex: 20, placement: 'official', imdbId: 'tt1825683' },
  { id: 'avengers-infinity-war', title: 'Avengers: Infinity War', kind: 'film', releaseDate: '2018-04-27', phase: 3, chronoIndex: 26, placement: 'official', imdbId: 'tt4154756' },
  { id: 'ant-man-and-the-wasp', title: 'Ant-Man and the Wasp', kind: 'film', releaseDate: '2018-07-06', phase: 3, chronoIndex: 25, placement: 'official', imdbId: 'tt5095030' },
  { id: 'captain-marvel', title: 'Captain Marvel', kind: 'film', releaseDate: '2019-03-08', phase: 3, chronoIndex: 2, placement: 'official', imdbId: 'tt4154664' },
  { id: 'avengers-endgame', title: 'Avengers: Endgame', kind: 'film', releaseDate: '2019-04-26', phase: 3, chronoIndex: 27, placement: 'official', imdbId: 'tt4154796' },
  { id: 'spider-man-far-from-home', title: 'Spider-Man: Far From Home', kind: 'film', releaseDate: '2019-07-02', phase: 3, chronoIndex: 32, placement: 'official', imdbId: 'tt6320628' },

  // ─── Phase 4 ───
  { id: 'wandavision', title: 'WandaVision', kind: 'series', releaseDate: '2021-01-15', phase: 4, chronoIndex: 30, placement: 'official', imdbId: 'tt9140560' },
  { id: 'the-falcon-and-the-winter-soldier', title: 'The Falcon and the Winter Soldier', kind: 'series', releaseDate: '2021-03-19', phase: 4, chronoIndex: 31, placement: 'official', imdbId: 'tt9208876' },
  { id: 'loki', title: 'Loki', kind: 'series', releaseDate: '2021-06-09', phase: 4, chronoIndex: 28, placement: 'official', imdbId: 'tt9140554' },
  { id: 'black-widow', title: 'Black Widow', kind: 'film', releaseDate: '2021-07-09', phase: 4, chronoIndex: 19, placement: 'official', imdbId: 'tt3480822' },
  { id: 'what-if', title: 'What If…?', kind: 'series', releaseDate: '2021-08-11', phase: 4, chronoIndex: 29, placement: 'official', imdbId: 'tt10168312', note: 'Animated anthology set across the multiverse.' },
  { id: 'shang-chi-and-the-legend-of-the-ten-rings', title: 'Shang-Chi and the Legend of the Ten Rings', kind: 'film', releaseDate: '2021-09-03', phase: 4, chronoIndex: 34, placement: 'official', imdbId: 'tt9376612' },
  { id: 'eternals', title: 'Eternals', kind: 'film', releaseDate: '2021-11-05', phase: 4, chronoIndex: 35, placement: 'official', imdbId: 'tt9032400' },
  { id: 'hawkeye', title: 'Hawkeye', kind: 'series', releaseDate: '2021-11-24', phase: 4, chronoIndex: 37, placement: 'official', imdbId: 'tt10160804' },
  { id: 'spider-man-no-way-home', title: 'Spider-Man: No Way Home', kind: 'film', releaseDate: '2021-12-17', phase: 4, chronoIndex: 33, placement: 'fan', imdbId: 'tt10872600', note: 'Not in the Disney+ timeline (Sony release). Fans place it straight after Far From Home.' },
  { id: 'moon-knight', title: 'Moon Knight', kind: 'series', releaseDate: '2022-03-30', phase: 4, chronoIndex: 38, placement: 'official', imdbId: 'tt10234724' },
  { id: 'doctor-strange-multiverse-of-madness', title: 'Doctor Strange in the Multiverse of Madness', kind: 'film', releaseDate: '2022-05-06', phase: 4, chronoIndex: 36, placement: 'official', imdbId: 'tt9419884' },
  { id: 'ms-marvel', title: 'Ms. Marvel', kind: 'series', releaseDate: '2022-06-08', phase: 4, chronoIndex: 42, placement: 'official', imdbId: 'tt10857164' },
  { id: 'thor-love-and-thunder', title: 'Thor: Love and Thunder', kind: 'film', releaseDate: '2022-07-08', phase: 4, chronoIndex: 43, placement: 'official', imdbId: 'tt10648342' },
  { id: 'she-hulk-attorney-at-law', title: 'She-Hulk: Attorney at Law', kind: 'series', releaseDate: '2022-08-18', phase: 4, chronoIndex: 41, placement: 'official', imdbId: 'tt10857160' },
  { id: 'black-panther-wakanda-forever', title: 'Black Panther: Wakanda Forever', kind: 'film', releaseDate: '2022-11-11', phase: 4, chronoIndex: 39, placement: 'official', imdbId: 'tt9114286' },

  // ─── Phase 5 ───
  { id: 'ant-man-and-the-wasp-quantumania', title: 'Ant-Man and the Wasp: Quantumania', kind: 'film', releaseDate: '2023-02-17', phase: 5, chronoIndex: 45, placement: 'official', imdbId: 'tt10954600' },
  { id: 'guardians-of-the-galaxy-vol-3', title: 'Guardians of the Galaxy Vol. 3', kind: 'film', releaseDate: '2023-05-05', phase: 5, chronoIndex: 46, placement: 'official', imdbId: 'tt6791350' },
  { id: 'secret-invasion', title: 'Secret Invasion', kind: 'series', releaseDate: '2023-06-21', phase: 5, chronoIndex: 47, placement: 'official', imdbId: 'tt13157618' },
  { id: 'the-marvels', title: 'The Marvels', kind: 'film', releaseDate: '2023-11-10', phase: 5, chronoIndex: 48, placement: 'official', imdbId: 'tt10676048' },
  { id: 'echo', title: 'Echo', kind: 'series', releaseDate: '2024-01-09', phase: 5, chronoIndex: 40, placement: 'official', imdbId: 'tt13966962' },
  { id: 'deadpool-and-wolverine', title: 'Deadpool & Wolverine', kind: 'film', releaseDate: '2024-07-26', phase: 5, chronoIndex: 49, placement: 'official', imdbId: 'tt6263850' },
  { id: 'agatha-all-along', title: 'Agatha All Along', kind: 'series', releaseDate: '2024-09-18', phase: 5, chronoIndex: 50, placement: 'official', imdbId: 'tt15571732' },
  { id: 'captain-america-brave-new-world', title: 'Captain America: Brave New World', kind: 'film', releaseDate: '2025-02-14', phase: 5, chronoIndex: 52, placement: 'official', imdbId: 'tt14513804' },
  { id: 'daredevil-born-again', title: 'Daredevil: Born Again', kind: 'series', releaseDate: '2025-03-04', phase: 5, chronoIndex: 51, placement: 'official', imdbId: 'tt18923754' },
  { id: 'thunderbolts', title: 'Thunderbolts*', kind: 'film', releaseDate: '2025-05-02', phase: 5, chronoIndex: 53, placement: 'official', imdbId: 'tt20969586' },
  { id: 'ironheart', title: 'Ironheart', kind: 'series', releaseDate: '2025-06-24', phase: 5, chronoIndex: 44, placement: 'official', imdbId: 'tt13623126' },

  // ─── Phase 6 ───
  { id: 'the-fantastic-four-first-steps', title: 'The Fantastic Four: First Steps', kind: 'film', releaseDate: '2025-07-25', phase: 6, chronoIndex: 54, placement: 'official', imdbId: 'tt10676052', note: 'Set on Earth-828, a separate reality.' },
  { id: 'wonder-man', title: 'Wonder Man', kind: 'series', releaseDate: '2026-01-27', phase: 6, chronoIndex: 55, placement: 'official', imdbId: null },
  { id: 'spider-man-brand-new-day', title: 'Spider-Man: Brand New Day', kind: 'film', releaseDate: '2026-07-31', phase: 6, chronoIndex: 56, placement: 'fan', imdbId: null, note: 'Not in the Disney+ timeline (Sony release). Placed after the latest Disney+ entries, ahead of Avengers: Doomsday.' },
  { id: 'avengers-doomsday', title: 'Avengers: Doomsday', kind: 'film', releaseDate: '2026-12-18', scheduled: true, phase: 6, chronoIndex: null, placement: null, imdbId: null, note: 'Scheduled release date; subject to change.' },
]
