const puppeteer = require('puppeteer');

export const screenshot = async (themeId: string, lang: string): Promise<boolean> => {

  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 768 });
  await page.goto('http://127.0.0.1:8080/');

  await page.waitForSelector('.activitybar');

  await page.waitForTimeout(2000);

  await page.keyboard.down('Control');
  await page.keyboard.press('KeyO');
  await page.keyboard.up('Control');

  await page.waitForSelector('.ibwrapper input');

  await page.waitForTimeout(2000);

  await page.type('.ibwrapper input', `sample.${lang}`);

  await page.waitForTimeout(1000);

  await page.keyboard.press('Tab');

  await page.keyboard.press('Enter');

  await page.waitForTimeout(10000);

  const screenshot = await page.screenshot({ path: `/images/${themeId}.${lang}.png`, fullPage: true });

  await browser.close();

  return true;
};

export default screenshot;