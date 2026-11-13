// Page behaviour for the Body Therapy homepage. Everything works as plain HTML without this file:
// all request panels are listed, every price group is open, the menu is a native popover.

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
const wide = window.matchMedia("(min-width: 60rem)");

/* ---------- "З чим ви прийшли?" tabs (effect 2) ---------- */
function initTabs(root: HTMLElement): void {
  const tablist = root.querySelector<HTMLElement>('[role="tablist"]');
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls") ?? ""));
  if (!tablist || tabs.length === 0) return;

  const setOrientation = () => tablist.setAttribute("aria-orientation", wide.matches ? "vertical" : "horizontal");
  setOrientation();
  wide.addEventListener("change", setOrientation);

  let current = 0;
  panels.forEach((p, i) => { if (p) p.hidden = i !== current; });

  const select = (next: number, focus: boolean) => {
    if (next === current) { if (focus) tabs[next]?.focus(); return; }
    const prevPanel = panels[current];
    const nextPanel = panels[next];
    tabs.forEach((t, i) => {
      t.setAttribute("aria-selected", i === next ? "true" : "false");
      t.tabIndex = i === next ? 0 : -1;
    });
    if (focus) tabs[next]?.focus();
    if (!wide.matches) tabs[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduce.matches ? "auto" : "smooth" });
    current = next;
    const show = () => {
      if (prevPanel) { prevPanel.hidden = true; prevPanel.classList.remove("is-leaving"); }
      if (!nextPanel) return;
      nextPanel.hidden = false;
      if (!reduce.matches) {
        nextPanel.classList.remove("is-entering");
        void nextPanel.offsetWidth;
        nextPanel.classList.add("is-entering");
      }
    };
    if (reduce.matches || !prevPanel) { show(); return; }
    prevPanel.classList.add("is-leaving");
    window.setTimeout(show, 220);
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => select(i, false));
    tab.addEventListener("keydown", (e) => {
      const last = tabs.length - 1;
      let next = -1;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = i === last ? 0 : i + 1;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = i === 0 ? last : i - 1;
      else if (e.key === "Home") next = 0;
      else if (e.key === "End") next = last;
      if (next >= 0) { e.preventDefault(); select(next, true); }
    });
  });
  panels.forEach((p) => p?.addEventListener("animationend", () => p.classList.remove("is-entering")));
}
document.querySelectorAll<HTMLElement>("[data-tabs]").forEach(initTabs);

/* ---------- price groups: accordion on phones, open table on wide screens ---------- */
const priceGroups = Array.from(document.querySelectorAll<HTMLDetailsElement>("[data-prices] details"));
const syncPrices = () => {
  priceGroups.forEach((d, i) => { d.open = wide.matches ? true : i === 0; });
};
syncPrices();
wide.addEventListener("change", syncPrices);
priceGroups.forEach((d) => {
  d.querySelector("summary")?.addEventListener("click", (e) => { if (wide.matches) e.preventDefault(); });
});

/* ---------- menu sheet: close on choosing a section ---------- */
const sheet = document.getElementById("menu");
sheet?.querySelectorAll<HTMLAnchorElement>("a[href^='#']").forEach((a) => {
  a.addEventListener("click", () => {
    try { sheet.hidePopover(); } catch { /* already closed */ }
  });
});

/* ---------- bottom call bar after the hero (effect 5) ---------- */
const bar = document.querySelector<HTMLElement>("[data-callbar]");
const hero = document.getElementById("holovna");
if (bar && hero && "IntersectionObserver" in window) {
  const setShown = (shown: boolean) => {
    bar.classList.toggle("is-shown", shown);
    bar.inert = !shown;
  };
  setShown(false);
  new IntersectionObserver(([entry]) => { if (entry) setShown(!entry.isIntersecting); }, { threshold: 0, rootMargin: "-96px 0px 0px 0px" }).observe(hero);
} else if (bar) {
  bar.classList.add("is-shown");
}

/* ---------- active section in the header ---------- */
const links = Array.from(document.querySelectorAll<HTMLAnchorElement>(".nav__link"));
const byId = new Map(links.map((a) => [a.hash.slice(1), a]));
if (links.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const link = byId.get(e.target.id);
      if (!link) continue;
      if (e.isIntersecting) {
        links.forEach((l) => { l.classList.remove("is-active"); l.removeAttribute("aria-current"); });
        link.classList.add("is-active");
        link.setAttribute("aria-current", "location");
      }
    }
  }, { rootMargin: "-45% 0px -50% 0px" });
  byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}
export {};
