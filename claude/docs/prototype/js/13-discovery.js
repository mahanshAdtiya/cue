/* Cue — TMDB discovery rows, async hydration, drawer */
'use strict';

let disc = { trending:null, top:null, theatres:null };
async function hydrateHome(){
  const fill = (id, items) => {
    const el = document.getElementById(id);
    if (!el) return;
    const p = el.querySelector('p'); if (p) p.remove();
    if (!el.querySelector('.rail'))
      el.insertAdjacentHTML('beforeend', '<div class="rail">' + items.map(t => tile(t, { menu:true })).join('') + '</div>');
  };
  try {
    if (!disc.trending) disc.trending = await TMDB.trending();
    fill('disc-trending', disc.trending);

    const shows = list('watching').filter(t => t.tmdb && t.tmdb.media === 'tv');
    const next = shows.length ? await TMDB.nextEpisodes(shows) : [];
    const el = document.getElementById('disc-next');
    if (el && next.length)
      el.innerHTML = '<div class="sec-head"><h2>New episodes coming</h2>' +
        '<span class="sec-note">for shows you are in the middle of</span></div><div class="rows">' +
        next.map(x => '<div class="row">' + posterHTML(x.t) +
          '<a class="body" href="#/title/' + x.t.id + '" style="color:inherit"><b>' + esc(x.t.name) + '</b>' +
          '<span>S' + String(x.ep.season_number).padStart(2,'0') + ' E' + String(x.ep.episode_number).padStart(2,'0') +
          (x.ep.name ? ' · ' + esc(x.ep.name) : '') + '</span></a>' +
          '<span class="mono">' + esc(x.ep.air_date || 'TBA') + '</span></div>').join('') + '</div>';

    if (!disc.theatres) disc.theatres = await TMDB.nowPlaying();
    fill('disc-theatres', disc.theatres);
    if (!disc.top) disc.top = await TMDB.topRated();
    fill('disc-top', disc.top);
  } catch(e){
    const el = document.getElementById('disc-trending');
    if (el) el.innerHTML = '<div class="sec-head"><h2>Trending this week</h2></div>' +
      '<p class="sec-note">TMDB request failed (' + esc(e.message) + '). Check the key in <a href="#/profile">Profile</a>.</p>';
    ['disc-theatres','disc-top','disc-next'].forEach(id => {
      const x = document.getElementById(id);
      if (x) x.remove();
    });
  }
}
async function hydrateTitle(id){
  const t = byId(id);
  if (!t || !t.tmdb || t.detailed) return;
  try {
    const d = await TMDB.details(t);
    if (S.cache[id]){ S.cache[id] = d; save(); }
    if (location.hash.indexOf(id) > -1) route();
  } catch(e){}
}
function toggleDrawer(){
  const d = $('#drawer'), b = document.querySelector('.menubtn');
  d.hidden = !d.hidden;
  if (b) b.setAttribute('aria-expanded', String(!d.hidden));
}
function closeDrawer(){
  const d = $('#drawer'), b = document.querySelector('.menubtn');
  if (d && !d.hidden){ d.hidden = true; if (b) b.setAttribute('aria-expanded','false'); }
}

/* ───────── router ───────── */
