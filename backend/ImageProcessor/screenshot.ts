import * as puppeteer from 'puppeteer';

export const screenshot = async (url: string): Promise<unknown> => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url);

  await page.waitForSelector('.activitybar');

  await page.waitForTimeout(2000);

  await page.keyboard.down('Control');
  await page.keyboard.press('KeyO');
  await page.keyboard.up('Control');

  await page.waitForSelector('.ibwrapper input');

  await page.waitForTimeout(2000);

  await page.type('.ibwrapper input', 'superApp.js');

  await page.waitForTimeout(1000);

  await page.keyboard.press('Tab');

  await page.keyboard.press('Enter');

  await page.waitForTimeout(2000);

  const screenshot = await page.screenshot({ path: `theme.png` });

  await browser.close();

  return screenshot;
}