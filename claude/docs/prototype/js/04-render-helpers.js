/* Cue — shared render helpers */
'use strict';

const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);
const plays = id => ((entryOf(id) || {}).finishes || []).length;
const ordinal = n => { const s = ['th','st','nd','rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); };
const dateStr = ts => ts ? new Date(ts).toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' }) : '';
const $ = sel => document.querySelector(sel);
function toast(msg, opts){
  if (window.Toast) return Toast.show(Object.assign({ message: msg }, opts || {}));
  console.log('[toast]', msg);
}
function subLine(t){
  const en = entryOf(t.id);
  if (!en) return t.year + ' · ' + t.type;
  const again = plays(t.id) > 0;
  if (en.status === 'watching')
    return (isShow(t) ? 'S' + progress(t).s + ' · E' + progress(t).e : 'Started') + (again ? ' · rewatch' : '');
  if (en.status === 'watched')
    return (en.rating ? stars(en.rating) : t.year + ' · ' + t.type) + (plays(t.id) > 1 ? ' · ×' + plays(t.id) : '');
  return t.year + ' · ' + t.type + (again ? ' · rewatch' : '');
}
function posterHTML(t, extra){
  if (t.poster)
    return '<span class="poster art" style="--h:' + t.hue + '">' +
      '<img src="' + esc(t.poster) + '" alt="" loading="lazy" />' + (extra || '') + '</span>';
  return '<span class="poster" style="--h:' + t.hue + '">' +
    '<span class="cap">Poster<br />' + esc(t.name) + '</span>' + (extra || '') + '</span>';
}

/* ───────── view fragments ───────── */
function tile(t, opts){
  opts = opts || {};
  const en = entryOf(t.id), p = progress(t);
  const extra = (en && en.fav && opts.favMark) ? '<span class="fav">★</span>' : '';
  return '<div class="tile" data-tile="' + t.id + '">' +
    '<a href="#/title/' + t.id + '">' + posterHTML(t, extra) + '</a>' +
    (opts.bar && en && en.status === 'watching' ? '<span class="bar"><i style="width:' + p.pct + '%"></i></span>' : '') +
    '<a class="name" href="#/title/' + t.id + '">' + esc(t.name) + '</a>' +
    '<span class="sub">' + esc(subLine(t)) + '</span>' +
    '</div>';
}
function menuHTML(t){
  const en = entryOf(t.id) || {};
  return '<div class="menu">' +
    Object.keys(STATUSES).map(k =>
      '<button data-act="status" data-id="' + t.id + '" data-status="' + k + '" class="' + (en.status === k ? 'on' : '') + '">' + STATUSES[k] + '</button>').join('') +
    '<button data-act="fav" data-id="' + t.id + '">' + (en.fav ? 'Remove favorite' : 'Add to favorites') + '</button>' +
    '</div>';
}
function starsHTML(id){
  const en = entryOf(id) || {};
  let h = '<div class="stars">';
  for (let n = 1; n <= 5; n++)
    h += '<button data-act="rate" data-id="' + id + '" data-n="' + n + '" class="' + ((en.rating || 0) >= n ? 'on' : '') + '" aria-label="Rate ' + n + '">★</button>';
  return h + '</div>';
}
function railOrEmpty(items, opts, emptyText){
  if (!items.length) return '<p class="sec-note">' + esc(emptyText) + '</p>';
  return '<div class="rail">' + items.map(t => tile(t, opts)).join('') + '</div>';
}

/* ───────── views ───────── */
