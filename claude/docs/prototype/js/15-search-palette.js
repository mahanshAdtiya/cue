/* Cue — command palette search */
'use strict';

function recents(){
  try { return JSON.parse(localStorage.getItem(RECENTS_KEY) || '[]'); } catch(e){ return []; }
}
function saveRecents(l){ try { localStorage.setItem(RECENTS_KEY, JSON.stringify(l.slice(0,5))); } catch(e){} }
function pushRecent(q){
  const v = (q || '').trim();
  if (!v) return;
  saveRecents([v].concat(recents().filter(x => x.toLowerCase() !== v.toLowerCase())));
}
let remote = { q:'', items:[] }, searchT;
function hits(){
  const q = ui.q.trim().toLowerCase();
  if (!q) return [];
  const local = CATALOG.concat(Object.keys(S.cache).map(k => S.cache[k]))
    .filter((t, i, arr) => arr.findIndex(x => x.id === t.id) === i)
    .filter(t => t.name.toLowerCase().includes(q) || t.type.toLowerCase().includes(q) || (t.genres || '').toLowerCase().includes(q));
  if (remote.q === ui.q.trim() && remote.items.length){
    const seen = local.map(t => t.name.toLowerCase());
    return local.concat(remote.items.filter(t => seen.indexOf(t.name.toLowerCase()) < 0));
  }
  return local;
}
function openPalette(person){
  ui.palette = person ? { person } : {};
  ui.q = ''; ui.sel = 0;
  $('#palette').hidden = false;
  renderPalette();
  setTimeout(() => $('#q').focus(), 10);
}
function closePalette(){
  ui.palette = null;
  $('#palette').hidden = true;
}
function renderPalette(){
  const res = hits(), q = ui.q.trim();
  ui.sel = Math.max(0, Math.min(ui.sel, res.length - 1));
  const listEl = $('#palette-list'), prev = $('#palette-preview');
  const person = ui.palette && ui.palette.person;
  $('#q').placeholder = person ? 'Add a title to your list with ' + person : 'Search movies, shows and anime';

  if (!q){
    const r = recents();
    listEl.innerHTML = '<div class="divider"><span class="mono">Recent</span><span class="line"></span>' +
      (r.length ? '<button class="mono" data-act="clear-recents">Clear</button>' : '') + '</div>' +
      (r.length ? r.map(x =>
        '<button class="hit" data-act="use-recent" data-q="' + esc(x) + '"><span style="color:#5E5A53">↺</span>' +
        '<span class="body"><b style="color:var(--fg-2)">' + esc(x) + '</b></span>' +
        '<span class="drop" data-act="drop-recent" data-q="' + esc(x) + '">✕</span></button>').join('')
        : '<p class="sec-note" style="padding:0 18px">No searches yet.</p>');
    prev.innerHTML = '<h3>Start typing</h3><p class="sec-note" style="margin-top:10px;line-height:1.55">' +
      'Search once, track forever. Your last five searches stay on this device.</p>';
    $('#palette-count').textContent = '';
    return;
  }
  if (!res.length){
    listEl.innerHTML = '<div class="empty" style="padding:24px 18px"><h3>Nothing here yet</h3>' +
      '<p>No title matches that. Check the spelling.</p></div>';
    prev.innerHTML = '';
    $('#palette-count').textContent = '0 results';
    return;
  }
  const mark = name => {
    const i = name.toLowerCase().indexOf(q.toLowerCase());
    return i < 0 ? esc(name) : esc(name.slice(0,i)) + '<em>' + esc(name.slice(i, i + q.length)) + '</em>' + esc(name.slice(i + q.length));
  };
  listEl.innerHTML = '<div class="divider"><span class="mono">Titles</span><span class="line"></span><span class="mono">' + res.length + '</span></div>' +
    res.map((t, i) => {
      const en = entryOf(t.id);
      return '<button class="hit ' + (i === ui.sel ? 'on' : '') + '" data-act="hit" data-i="' + i + '" data-id="' + t.id + '">' +
        posterHTML(t) + '<span class="body"><b>' + mark(t.name) + '</b><span>' + t.type + ' · ' + t.year + '</span></span>' +
        '<span style="color:' + (en && en.status === 'watching' ? 'var(--gold-2)' : '#7E7970') + '">' +
        (en ? STATUSES[en.status] : 'Not tracked') + '</span></button>';
    }).join('');

  const t = res[ui.sel];
  if (t){
    const en = entryOf(t.id);
    prev.innerHTML = '<span class="preview-poster">' + posterHTML(t) + '</span>' +
      '<p class="kicker" style="margin:16px 0 8px">' + t.type + '</p>' +
      '<h3 style="font-size:26px">' + esc(t.name) + '</h3>' +
      '<p class="mono" style="margin:8px 0 16px">' + t.year + ' · ' + stars((en && en.rating) || 0) + '</p>' +
      (person
        ? '<button class="btn" style="width:100%" data-act="shared-add" data-person="' + esc(person) + '" data-id="' + t.id + '">Add to list with ' + esc(person) + '</button>'
        : '<div class="seg">' + Object.keys(STATUSES).map(k =>
            '<button data-act="status-here" data-id="' + t.id + '" data-status="' + k + '" class="' + (en && en.status === k ? 'on' : '') + '">' +
            (k === 'want' ? 'Want' : k === 'watching' ? 'Watching' : 'Watched') + '</button>').join('') + '</div>');
  }
  $('#palette-count').textContent = res.length + (res.length === 1 ? ' result' : ' results');
}

/* ───────── events ───────── */
