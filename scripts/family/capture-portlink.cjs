// Usage: node capture-portlink.cjs <URL serving the Portlink platform explorer>
// Requires playwright-core and Chrome. Only the selected scene is painted.
const { chromium } = require('playwright-core');
const path = require('node:path');
const fs = require('node:fs/promises');

async function capture() {
  if (!process.argv[2]) throw Error('Supply the platform explorer URL');
  const out = process.argv[3] || path.resolve(__dirname, '../../public/product-family/media');
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, reducedMotion: 'reduce',
    });
    await page.goto(process.argv[2]);
    const reject = page.getByRole('button', {name:'Reject all', exact:true});
    if (await reject.isVisible()) await reject.click();
    const captures = new Map();
    for (const id of ['calls','review','finance','messages']) {
      await page.locator('#platform-tab-'+id).click();
      const scene = page.locator('#platform-panel-'+id+' .scene-wide');
      await page.evaluate(() => document.fonts.ready);
      if (await scene.locator('dialog:visible, [role="dialog"]:visible, [aria-modal="true"]:visible').count())
        throw Error('Dialog inside the selected scene: '+id);
      const bytes = await scene.screenshot({style:
        'body * {visibility:hidden!important} #platform-panel-'+id+' .scene-wide, #platform-panel-'+id+' .scene-wide * {visibility:visible!important}'});
      captures.set(id, bytes);
    }
    for (const [id, bytes] of captures) await fs.writeFile(path.join(out,'portlink-'+id+'.png'),bytes);
  } finally { await browser.close(); }
}
capture().catch(error=>{console.error(error);process.exitCode=1});
