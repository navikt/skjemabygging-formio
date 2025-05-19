const introPage = [
  'introPage.guidePanel.bodyText',
  'introPage.beforeYouApplySection.header',
  'introPage.beforeYouApplySection.ingress',
  'introPage.hereYouMaySection.headerAlt1',
] as const;

const keys = { introPage } as const;
type IntroPageKey = (typeof introPage)[number];
type Tkey = IntroPageKey;

export { keys };
export type { Tkey };
