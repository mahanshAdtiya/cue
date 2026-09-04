/* Cue — tile hover card */
'use strict';

let hcId = null, hcT;
const canHover = () => window.matchMedia('(hover:hover) and (pointer:fine)').matches;

function renderHover(id){
  const t = byId(id);
  if (!t) return '';
  const en = entryOf(id) || {}, p = progress(t), n = plays(id);
  const rnd = (act, status, glyph, label, on) =>
    '<button class="rnd' + (on ? ' on' : '') + '" data-act="' + act + '" data-id="' + id + '"' +
    (status ? ' data-status="' + status + '"' : '') + ' title="' + label + '" aria-label="' + label + '">' + glyph + '</button>';

  let acts = '';
  if (!en.status) acts += rnd('status', 'want', '＋', 'Want to watch');
  else if (en.status === 'want') acts += rnd('status', 'watching', '▶', 'Start watching');
  else if (en.status === 'watching'){
    if (isShow(t)) acts += rnd('bump', '', '＋', 'Watched next episode');
    acts += rnd('status', 'watched', '✓', 'Mark as watched');
  } else acts += rnd('status', 'watching', '↺', 'Watch it again');
  acts += rnd('fav', '', en.fav ? '★' : '☆', 'Favorite', en.fav);
  acts += '<a class="rnd open" href="#/title/' + id + '" title="Open" aria-label="Open">⟶</a>';

  const meta = [t.type, t.year || '', isShow(t) && t.seasons ? t.seasons + (t.seasons > 1 ? ' seasons' : ' season') : '']
    .filter(Boolean).join(' · ');
  const state = en.status
    ? STATUSES[en.status] +
      (en.status === 'watching' && isShow(t) ? ' · S' + String(p.s).padStart(2,'0') + ' E' + String(p.e).padStart(2,'0') : '') +
      (n > 1 ? ' · watched ×' + n : n === 1 && en.status === 'watching' ? ' · rewatch' : '')
    : 'Not tracked yet';
  const tail = t.genres ? esc(t.genres)
    : t.overview ? esc(t.overview.length > 96 ? t.overview.slice(0,96) + '…' : t.overview) : '';

  return '<div class="hc-art" style="--h:' + t.hue + (t.backdrop ? ';background-image:url(' + esc(t.backdrop) + ')' : '') + '">' +
      '<b>' + esc(t.name) + '</b></div>' +
    '<div class="hc-body">' +
      '<div class="hc-acts">' + acts + '</div>' +
      (isShow(t) && en.status === 'watching' ? '<span class="bar"><i style="width:' + p.pct + '%"></i></span>' : '') +
      '<span class="hc-meta">' + meta + '</span>' +
      '<span class="hc-state">' + state + (en.rating ? ' · <span class="starstr">' + stars(en.rating) + '</span>' : '') + '</span>' +
      (tail ? '<span class="hc-tail">' + tail + '</span>' : '') +
    '</div>';
}
function showHover(el){
  const hc = $('#hovercard'), id = el.dataset.tile;
  if (!byId(id)) return;
  hcId = id;
  hc.innerHTML = renderHover(id);
  hc.hidden = false;
  const r = el.getBoundingClientRect(), w = hc.offsetWidth, hgt = hc.offsetHeight;
  const left = Math.min(Math.max(10, r.left + r.width / 2 - w / 2), window.innerWidth - w - 10);
  let top = r.bottom + 10;
  if (top + hgt > window.innerHeight - 10) top = Math.max(10, r.top - hgt - 10);
  hc.style.left = left + 'px';
  hc.style.top = top + 'px';
}
function hideHover(now){
  clearTimeout(hcT);
  const go = () => { $('#hovercard').hidden = true; hcId = null; };
  now ? go() : (hcT = setTimeout(go, 160));
}
document.addEventListener('mouseover', ev => {
  if (!canHover()) return;
  if (ev.target.closest('#hovercard')){ clearTimeout(hcT); return; }
  const el = ev.target.closest('[data-tile]');
  if (el){ clearTimeout(hcT); if (el.dataset.tile !== hcId) showHover(el); }
  else if (hcId) hideHover();
});
document.addEventListener('mouseout', ev => {
  if (ev.target.closest('[data-tile]') || ev.target.closest('#hovercard')) hideHover();
});
window.addEventListener('scroll', () => { if (hcId) hideHover(true); }, true);

/* ───────── discovery + async hydration ───────── */
