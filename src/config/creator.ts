/**
 * Who made the site. Shown in the footer and the homepage "About" section.
 * Change it here and every mention updates.
 */
export const creator = {
  name: 'Jayant',
  portfolio: 'https://jayantchaudhari.com/',
  /** Kept in two parts so the full address never appears in the built files (fewer spam scrapers). */
  emailUser: 'info',
  emailDomain: 'jayantchaudhari.com',
  /** Shows the "Open to freelance work" badge. Set to false to hide it. */
  openToWork: true,
}

export const creatorEmail = () => `${creator.emailUser}@${creator.emailDomain}`
