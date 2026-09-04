/* Cue — Profile view */
'use strict';

function viewProfile(){
  const favs = favorites(), done = history(), watching = list('watching');
  const u = S.user || { name:'You', email:'' };
  let h = '<div class="profile-wrap">';
  h += '<div class="col" style="display:flex;flex-direction:column;gap:26px">' +
    '<div style="display:flex;align-items:center;gap:18px"><span class="avatar" style="width:76px;height:76px;font-family:var(--serif);font-size:34px;font-weight:400">' +
    esc((u.name || 'C')[0].toUpperCase()) + '</span>' +
    '<span><h1 style="font-size:32px">' + esc(u.name) + '</h1><p class="mono" style="margin:7px 0 0">' +
    esc(u.email || '') + '</p></span></div>' +
    '<div class="stats">' +
      stat(done.length, 'Titles finished') + stat(watching.length, 'In progress') +
      stat(favs.length, 'Favorites') + stat(S.people.length, 'People') +
    '</div>' +
    '<div class="settings">' +
      settingRow('Account', esc(u.email || '—')) +
      settingRow('People I watch with', String(S.people.length)) +
      '<div class="row"><span class="body"><b>Sign out</b></span>' +
      '<button class="pill" data-act="signout">Sign out</button></div>' +
    '</div></div>';

  h += '<div class="col" style="display:flex;flex-direction:column;gap:34px">' +
    '<section class="sec"><div class="sec-head"><h2>Favorites</h2><span class="sec-note">the ones you would rewatch tonight</span></div>' +
    (favs.length ? '<div class="grid">' + favs.map(t => tile(t, { favMark:true })).join('') + '</div>' : '<p class="sec-note">No favorites yet.</p>') + '</section>' +
    '<section class="sec"><div class="sec-head"><h2>Watch history</h2><span class="mono">' + done.length + ' titles</span></div>' +
    (done.length ? '<div class="rows">' + done.slice(0, 8).map(t =>
      '<div class="row">' + posterHTML(t) + '<a class="body" href="#/title/' + t.id + '" style="color:inherit"><b>' + esc(t.name) + '</b><span>' + t.type + ' · ' + t.year + '</span></a>' +
      '<span class="starstr">' + stars((entryOf(t.id) || {}).rating || 0) + '</span></div>').join('') + '</div>' : '<p class="sec-note">Nothing yet.</p>') +
    '</section></div></div>';
  return h;
}
const stat = (n, label) => '<div class="stat card"><b>' + n + '</b><span>' + label + '</span></div>';
const settingRow = (label, value) => '<div class="row"><span class="body"><b>' + label + '</b></span><span class="sec-note">' + esc(value) + '</span></div>';

/* ───────── first run, landing, auth ───────── */
