// E2E checks of the key homepage scenarios (ux/demo-home.md S1, S2, S7) with the studio Playwright
// (~/.veon/tools, nothing is installed). Usage: node tests/e2e/home.e2e.mjs [url]  (default http://localhost:4321/)
import path from "node:path";
import os from "node:os";
import { pathToFileURL } from "node:url";

const studio = process.env.VEON_WEB_STUDIO || path.join(os.homedir(), "Desktop", "VEON WEB-STUDIO");
const { loadPlaywright, launchBrowser } = await import(pathToFileURL(path.join(studio, "quality", "scripts", "veon_pw.mjs")).href);
const url = process.argv[2] || "http://localhost:4321/";
const { chromium } = loadPlaywright();
const browser = await launchBrowser(chromium);
const results = [];
const check = (name, ok, detail = "") => { results.push({ name, ok, detail }); };

async function page(width, height, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height }, reducedMotion: opts.reduce ? "reduce" : "no-preference", javaScriptEnabled: opts.js !== false });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load" });
  return { p, ctx };
}

for (const w of [320, 375, 390, 768, 1024, 1440]) {
  const { p, ctx } = await page(w, 800);
  const over = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  check(`${w}px: no horizontal scroll`, over <= 0, `overflow ${over}px`);
  const outside = await p.evaluate(() => {
    const bad = [];
    for (const el of document.querySelectorAll("header a, header button, .hero a, .callbar a")) {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      if (st.display === "none" || r.width === 0) continue;
      if (r.left < -0.5 || r.right > window.innerWidth + 0.5) bad.push(el.textContent.trim().slice(0, 30));
    }
    return bad;
  });
  check(`${w}px: header, hero and call bar controls inside the screen`, outside.length === 0, outside.join(", "));
  const call = await p.locator('#holovna a[href="tel:+380680796731"]').first().boundingBox();
  check(`${w}px: hero call visible on the first screen`, !!call && call.y + call.height <= 800, call ? `bottom ${Math.round(call.y + call.height)}` : "missing");
  await ctx.close();
}

{ // S1 on a phone: pick a request, the answer changes, call from it
  const { p, ctx } = await page(390, 844);
  await p.locator("#holovna .hero__pick").click();
  await p.waitForTimeout(600);
  await p.locator('[role="tab"]', { hasText: "Дитина або вагітність" }).click();
  await p.waitForTimeout(700);
  const visible = await p.locator("#panel-dity").isVisible();
  const hiddenFirst = await p.locator("#panel-spyna").isHidden();
  check("S1: request tab shows its own procedures", visible && hiddenFirst);
  const tel = await p.locator('#panel-dity a[href^="tel:"]').count();
  check("S1: every procedure has a call", tel === 2, `${tel} calls`);
  const barShown = await p.locator("[data-callbar]").evaluate((el) => el.classList.contains("is-shown") && !el.inert);
  check("S7: bottom call bar shows after the hero", barShown);
  const headerBg = await p.locator("header .header-call").evaluate((el) => getComputedStyle(el).backgroundColor);
  check("390: header call turns quiet while the bar shows", headerBg === "rgba(0, 0, 0, 0)", headerBg);
  const tabsFit = await p.locator('[role="tab"]').evaluateAll((ts) => ts.every((t) => { const r = t.getBoundingClientRect(); return r.left >= 16 && r.right <= window.innerWidth - 16; }));
  check("390: all request chips visible, 16px or more from the edge", tabsFit);
  // keyboard on tabs
  await p.locator('[role="tab"][aria-selected="true"]').focus();
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(600);
  const sel = await p.locator('[role="tab"][aria-selected="true"]').textContent();
  check("Tabs: arrow keys move the selection", (sel || "").includes("Вдома"), sel || "");
  await ctx.close();
}

{ // S2 on a phone: menu -> Реабілітація -> call
  const { p, ctx } = await page(390, 844);
  await p.locator('header .burger[popovertarget="menu"]').first().click();
  const open = await p.locator("#menu").evaluate((el) => el.matches(":popover-open"));
  check("Menu: the sheet opens", open);
  await p.locator("#menu a", { hasText: "Реабілітація" }).click();
  await p.waitForTimeout(900);
  const closed = await p.locator("#menu").evaluate((el) => !el.matches(":popover-open"));
  const top = await p.locator("#reabilitatsiia").evaluate((el) => Math.round(el.getBoundingClientRect().top));
  check("S2: menu closes and the anchor lands under the header", closed && top >= 0 && top < 120, `top ${top}`);
  const cta = await p.locator('#reabilitatsiia a[href^="tel:"]').count();
  check("S2: rehabilitation has its own call", cta >= 1);
  await p.locator('header .burger[popovertarget="menu"]').first().click();
  await p.keyboard.press("Escape");
  const esc = await p.locator("#menu").evaluate((el) => !el.matches(":popover-open"));
  check("Menu: Esc closes", esc);
  await ctx.close();
}

{ // desktop: header call, FutureLink note, price groups open, no links to the old site
  const { p, ctx } = await page(1440, 900);
  const headerCall = await p.locator('header .header-call[href="tel:+380680796731"]').isVisible();
  check("S7: call in the desktop header", headerCall);
  const fl = p.locator("header .future-link").first();
  await fl.focus();
  await p.waitForTimeout(300);
  const noteOpacity = await fl.locator(".future-link__note").evaluate((el) => getComputedStyle(el).opacity);
  check("FutureLink: note shows on focus", Number(noteOpacity) > 0.9, `opacity ${noteOpacity}`);
  const open = await p.locator("[data-prices] details").evaluateAll((d) => d.every((x) => x.open));
  check("Prices: all groups open on desktop", open);
  const hrefs = await p.evaluate(() => Array.from(document.querySelectorAll("a[href]"), (a) => a.getAttribute("href") || ""));
  const allowed = (h) => h.startsWith("#") || h === "tel:+380680796731" || h === "mailto:info@body-therapy.com.ua" || h === "https://www.instagram.com/body_therapy_kremen/" || h.startsWith("https://www.google.com/maps/");
  const bad = hrefs.filter((h) => !allowed(h));
  check("Links: only anchors, tel, mailto, Instagram and the map", bad.length === 0, bad.join(", "));
  const old = (await p.content()).includes("body-therapy.com.ua/") ;
  check("No link to the current site", !old);
  const h1 = await p.locator("main h1").textContent();
  check("H1 matches the concept", (h1 || "").replace(/\s+/g, " ").trim() === "Масаж і реабілітація в Кременчуці — студія Body Therapy", h1 || "");
  const ids = await p.locator("main > section").evaluateAll((s) => s.map((x) => x.id).join(","));
  check("Sections in concept order", ids === "holovna,pidbir,reabilitatsiia,studiia,tsiny,sertyfikaty,kursy,kontakty", ids);
  await ctx.close();
}

{ // reduced motion and no script: content stays in place
  const { p, ctx } = await page(1440, 900, { reduce: true });
  await p.locator("#reabilitatsiia").scrollIntoViewIfNeeded();
  const t = await p.locator(".seg__bar").first().evaluate((el) => getComputedStyle(el).transform);
  check("Reduced motion: course line drawn at once", t === "none" || t === "matrix(1, 0, 0, 1, 0, 0)", t);
  await ctx.close();
  const nj = await page(390, 844, { js: false });
  const panels = await nj.p.locator(".panel:visible").count();
  check("No JS: every request answer is listed", panels === 8, `${panels} panels`);
  await nj.ctx.close();
}

await browser.close();
let failed = 0;
for (const r of results) { if (!r.ok) failed++; console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.name}${r.detail ? `  (${r.detail})` : ""}`); }
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
