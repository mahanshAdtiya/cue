/* Cue — Home view */
'use strict';

function viewHome(){
  if (!tracked().length) return viewFirstRun();
  const watching = list('watching'), want = list('want'), recent = history().slice(0, 4);
  const hero = watching[0];
  let h = '';
  if (hero){
    const p = progress(hero);
    h += '<section class="billboard" style="--h:' + hero.hue + '">' +
      '<span class="bb-art"' + (hero.backdrop ? ' style="background-image:url(' + esc(hero.backdrop) + ')"' : '') + '></span>' +
      (hero.backdrop ? '' : '<span class="bb-cap">Backdrop 16:9 — ' + esc(hero.name) + '</span>') +
      '<div class="bb-body">' +
        '<span class="kicker">Pick up where you left off</span>' +
        '<h1><a href="#/title/' + hero.id + '" style="color:inherit">' + esc(hero.name) + '</a></h1>' +
        '<span class="se">' + (isShow(hero) ? 'S' + String(p.s).padStart(2,'0') + ' E' + String(p.e).padStart(2,'0') : 'Movie') +
          ' &nbsp;·&nbsp; ' + p.left + ' ep left</span>' +
        '<span class="bar"><i style="width:' + p.pct + '%"></i></span>' +
        '<div class="rowbtns">' +
          (isShow(hero) ? '<button class="btn" data-act="bump" data-id="' + hero.id + '">＋ Watched E' + (p.e + 1) + '</button>' : '') +
          '<button class="btn ghost" data-act="status" data-id="' + hero.id + '" data-status="watched">Mark as watched</button>' +
        '</div>' +
      '</div></section>';
  } else {
    h += '<section class="card" style="padding:clamp(20px,3vw,28px);display:flex;flex-direction:column;gap:12px">' +
      '<span class="kicker">Nothing in progress</span>' +
      '<h2>Start something tonight</h2>' +
      '<p class="sec-note" style="max-width:52ch">You have ' + want.length + ' titles waiting and ' + history().length +
      ' behind you. Move one to Currently watching and it lands here.</p>' +
      '<div class="rowbtns"><button class="btn" data-act="open-palette">Search titles</button>' +
      '<a class="btn ghost" href="#/library">Open my library</a></div></section>';
  }
  h += '<section class="sec"><div class="sec-head"><h2>Currently watching</h2>' +
    '<span class="sec-note">' + watching.length + ' on the go. No judgement.</span></div>' +
    railOrEmpty(watching, { plus:true, bar:true }, 'Nothing in progress yet.') + '</section>';
  h += '<section class="sec"><div class="sec-head"><h2>Want to watch</h2>' +
    '<span class="sec-note">' + want.length + ' deep</span>' +
    '<span class="spacer"></span><a href="#/library" class="mono">SEE ALL</a></div>' +
    railOrEmpty(want, { menu:true }, 'Your list is empty. Go add something.') + '</section>';
  h += '<section class="sec"><div class="sec-head"><h2>Recently watched</h2></div>' +
    (recent.length ? '<div class="rows">' + recent.map(t =>
      '<div class="row">' + posterHTML(t) +
      '<a class="body" href="#/title/' + t.id + '" style="color:inherit"><b>' + esc(t.name) + '</b><span>' + t.type + ' · ' + t.year + '</span></a>' +
      '<span class="starstr">' + stars((entryOf(t.id) || {}).rating || 0) + '</span></div>').join('') + '</div>'
      : '<p class="sec-note">Nothing finished yet.</p>') + '</section>';

  if (TMDB.enabled()){
    h += '<section class="sec" id="disc-next"></section>';
    h += '<section class="sec" id="disc-trending"><div class="sec-head"><h2>Trending this week</h2>' +
      '<span class="sec-note">what everyone is watching, via TMDB</span></div><p class="sec-note">Loading…</p></section>';
    h += '<section class="sec" id="disc-theatres"><div class="sec-head"><h2>In theatres now</h2>' +
      '<span class="sec-note">worth a note for later</span></div><p class="sec-note">Loading…</p></section>';
    h += '<section class="sec" id="disc-top"><div class="sec-head"><h2>Great by consensus</h2>' +
      '<span class="sec-note">highest rated on TMDB, all time</span></div><p class="sec-note">Loading…</p></section>';
  }
  return h;
}
