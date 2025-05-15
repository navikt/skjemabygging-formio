export const introside = [
  'introPage.guidePanel.bodyText',
  'introPage.beforeYouApplySection.header',
  'introPage.beforeYouApplySection.ingress',
  'introPage.hereYouMaySection.headerAlt1',
] as const;
type IntroSideTkey = (typeof introside)[number];

type Tkey = IntroSideTkey;
const keys = { introside } as const;

export { keys };
export type { IntroSideTkey, Tkey };
