const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000);
  
  const groups = await page.$$eval('.adaa-marquee-group', els => 
    els.map(el => {
      const rect = el.getBoundingClientRect();
      const computedStyle = window.getComputedStyle(el);
      return { 
        x: rect.x, 
        y: rect.y, 
        width: rect.width, 
        transform: computedStyle.transform,
        animationDirection: computedStyle.animationDirection
      };
    })
  );
  
  console.log("Marquee groups:", groups);
  await browser.close();
})();
