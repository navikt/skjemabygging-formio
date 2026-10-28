import type { Page } from '@playwright/test';

// The decorator is disabled in tests, so dispatch the message its language menu sends.
const selectDecoratorLanguage = async (page: Page, locale: string) => {
  await page.evaluate((locale) => {
    const data = { source: 'decorator', event: 'languageSelect', payload: { locale, handleInApp: true } };
    window.dispatchEvent(new MessageEvent('message', { data, origin: window.location.origin, source: window }));
  }, locale);
};

export { selectDecoratorLanguage };
