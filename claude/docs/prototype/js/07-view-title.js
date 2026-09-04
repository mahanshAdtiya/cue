/* Cue — Media page */
'use strict';

function viewTitle(id){
  const t = byId(id);
  if (!t) return '<div class="empty"><h2>Not found</h2><p>That title is not in the catalog.</p></div>';
  const en = entryOf(id), p = progress(t), people = watchedWith(id);
  const n = plays(id);
  let h = '<span class="backdrop" style="--h:' + t.hue + '"></span><span class="backdrop-fade"></span>';
  h += '<div class="title-wrap">';
  h += '<div class="col poster-col">' + posterHTML(t) +
    '<button class="btn ghost" data-act="fav" data-id="' + id + '">' +
      (en && en.fav ? '★ Favorite' : '☆ Add to favorites') + '</button></div>';

  h += '<div class="col">' +
    '<div class="title-head"><h1>' + esc(t.name) + '</h1>' +
    (en && en.status === 'watching' && n > 0 ? '<span class="badge">Rewatch · ' + ordinal(n + 1) + ' time</span>' : '') +
    '<p class="mono" style="margin:10px 0 0">' + t.type + (isShow(t) ? ' · ' + t.seasons + ' seasons' : '') + ' · ' + t.year + ' · ' + esc(t.genres) + '</p></div>' +
    '<p class="overview">' + esc(t.overview) + '</p>';

  h += '<div class="panel"><span class="mono">Your tracking</span>' +
    '<div class="seg">' + Object.keys(STATUSES).map(k =>
      '<button data-act="status" data-id="' + id + '" data-status="' + k + '" class="' + (en && en.status === k ? 'on' : '') + '">' +
      STATUSES[k] + '</button>').join('') + '</div>' +
    '<div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;padding-top:4px">' + starsHTML(id) +
      '<span class="sec-note">' + (en && en.rating ? 'You gave it ' + en.rating + '. Tap a star to change your mind.' : 'Not rated yet.') + '</span>' +
    '</div>' +
    (n ? '<p class="mono" style="margin:0">Finished ' + n + (n === 1 ? ' time' : ' times') +
      ' · last on ' + dateStr((en.finishes || [])[n - 1]) + '</p>' : '') +
    '</div>';

  if (isShow(t) && en && en.status !== 'want'){
    h += '<div class="panel gold">' +
      '<div class="sec-head"><h3>Season ' + p.s + ' · Episode ' + p.e + '</h3><span class="spacer"></span>' +
      '<span class="mono" style="color:var(--gold)">' + p.pct + '% of series</span></div>' +
      '<span class="bar" style="height:5px"><i style="width:' + p.pct + '%"></i></span>' +
      '<div class="rowbtns"><button class="btn" data-act="bump" data-id="' + id + '">＋ Watched E' + (p.e + 1) + '</button>' +
      '<button class="btn ghost sm" data-act="unbump" data-id="' + id + '">－</button>' +
      '<span class="sec-note" style="max-width:240px">' + p.left + ' episodes left.</span></div></div>';
  }

  h += '<div class="sec"><span class="mono">Watched with</span><div class="tags">' +
    people.map(n2 => {
      const st = sharedStatus(n2, id);
      const label = st === 'watching' ? 'watching together' : st === 'watched' ? 'watched together' : 'on your shared list';
      return '<a class="tag" href="#/person/' + encodeURIComponent(n2) + '"><i>' + esc(n2[0]) + '</i>' + esc(n2) +
        '<em>' + label + '</em></a>';
    }).join('') +
    '<button class="tag add" data-act="attach" data-id="' + id + '">＋ Add a person</button></div>' +
    (people.length ? '<p class="sec-note">Shared tracking is separate — rewatching this with someone will not touch your own progress.</p>' : '') +
    '</div>';
  h += '</div>';

  if (isShow(t)){
    const ps = perSeason(t), n = Math.min(t.seasons, 12);
    h += '<div class="col"><span class="mono">Seasons</span>';
    for (let i = 1; i <= n; i++){
      const doneS = en && (i < p.s || en.status === 'watched');
      const on = en && en.status === 'watching' && i === p.s;
      h += '<button class="season ' + (on ? 'on' : '') + '" data-act="season" data-id="' + id + '" data-s="' + i + '">' +
        '<span><b>Season ' + i + '</b><span>' + (doneS ? 'All ' + ps + ' watched' : on ? p.e + ' of ' + ps + ' watched' : ps + ' episodes') + '</span></span>' +
        '<span style="color:' + (doneS ? 'var(--mut)' : 'var(--gold-2)') + '">' + (doneS ? '✓' : on ? '▸' : '') + '</span></button>';
    }
    h += '</div>';
  }
  return h + '</div>';
}
