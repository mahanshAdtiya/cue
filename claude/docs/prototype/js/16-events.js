/* Cue — delegated event handlers */
'use strict';

document.addEventListener('click', ev => {
  const el = ev.target.closest('[data-act]');
  const inPalette = !!ev.target.closest('.palette');
  if (!el){
    if (ev.target.id === 'picker') closePicker();
    if (ev.target.id === 'drawer') closeDrawer();
    if (ui.menu){ ui.menu = null; rerender(); }
    if (ui.palette && !inPalette && ev.target.closest('.scrim')) closePalette();
    return;
  }
  const a = el.dataset.act, id = el.dataset.id;
  const stop = () => { ev.preventDefault(); ev.stopPropagation(); };

  switch (a){
    case 'open-palette': stop(); openPalette(el.dataset.person); return;
    case 'toggle-menu': stop(); toggleDrawer(); return;
    case 'close-palette': stop(); closePalette(); return;
    case 'menu': stop(); ui.menu = ui.menu === id ? null : id; rerender(); return;
    case 'status': stop(); setStatus(id, el.dataset.status); ui.menu = null; rerender(); return;
    case 'bump': stop(); bump(id, 1); rerender(); return;
    case 'unbump': stop(); bump(id, -1); rerender(); return;
    case 'rate': stop(); rate(id, +el.dataset.n); rerender(); return;
    case 'fav': stop(); toggleFav(id); ui.menu = null; rerender(); return;
    case 'season': {
      stop();
      const t = byId(id), s = +el.dataset.s;
      ensure(id).status = 'watching';
      S.entries[id].done = Math.min(t.eps, (s - 1) * perSeason(t) + 1);
      S.entries[id].updatedAt = Date.now();
      save(); rerender(); return;
    }
    case 'libview': stop(); ui.libView = el.dataset.view; rerender(); return;
    case 'libmode': stop(); ui.libMode = el.dataset.mode; rerender(); return;
    case 'attach': stop(); openPicker(id); return;
    case 'close-picker': stop(); closePicker(); return;
    case 'pick-person': stop(); attachPerson(el.dataset.person, id); return;
    case 'load-demo': {
      stop();
      const u = S.user;
      S = seed();
      S.user = u;
      save();
      toast('Demo library loaded');
      rerender();
      return;
    }
    case 'signout':
      stop();
      S.user = null;
      save();
      hideHover(true);
      location.replace('#/landing');
      route();
      return;
    case 'shared': stop(); sharedSet(el.dataset.person, id, el.dataset.status); rerender(); return;
    case 'shared-remove': stop(); sharedSet(el.dataset.person, id, null); rerender(); return;
    case 'shared-add':
      stop();
      sharedSet(el.dataset.person, id, 'want');
      pushRecent(ui.q);
      toast(byId(id).name + ' added to your list with ' + el.dataset.person);
      closePalette(); rerender(); return;
    case 'status-here': stop(); setStatus(id, el.dataset.status); renderPalette(); return;
    case 'hit':
      stop();
      if (ui.sel !== +el.dataset.i){ ui.sel = +el.dataset.i; renderPalette(); return; }
      pushRecent(ui.q); closePalette(); location.hash = '#/title/' + id; return;
    case 'use-recent': stop(); ui.q = el.dataset.q; $('#q').value = ui.q; ui.sel = 0; renderPalette(); return;
    case 'drop-recent': stop(); saveRecents(recents().filter(x => x !== el.dataset.q)); renderPalette(); return;
    case 'clear-recents': stop(); saveRecents([]); renderPalette(); return;
    case 'reset':
      stop();
      if (confirm('Reset your library back to the demo data?')){
        S = seed(); save(); saveRecents([]); toast('Library reset'); rerender();
      }
      return;
  }
});

document.addEventListener('submit', ev => {
  const af = ev.target.closest('[data-act="auth"]');
  if (af){
    ev.preventDefault();
    const d = new FormData(af);
    const email = String(d.get('email') || '').trim();
    const name = String(d.get('name') || '').trim() || email.split('@')[0] || 'You';
    if (af.dataset.mode === 'up'){
      S.user = { name, email };
      S.entries = {}; S.people = []; S.shared = {}; S.cache = {};
      save();
      toast('Welcome to Cue, ' + name);
    } else {
      S.user = { name: (S.user && S.user.name) || name, email };
      save();
      toast('Signed in');
    }
    location.replace('#/home');
    route();
    return;
  }
  const pf = ev.target.closest('[data-act="picker-new"]');
  if (pf){
    ev.preventDefault();
    const input = pf.querySelector('input');
    const name = input.value.trim();
    if (!name){ toast('Give them a name.'); return; }
    addPerson(name);
    attachPerson(name, pf.dataset.id);
    return;
  }
  const kf = ev.target.closest('[data-act="tmdb-key"]');
  if (kf){
    ev.preventDefault();
    const v = kf.querySelector('input').value;
    TMDB.setKey(v);
    disc = { trending:null, top:null, theatres:null };
    remote = { q:'', items:[] };
    toast(TMDB.enabled() ? 'TMDB key saved' : 'TMDB key removed — back to the demo catalog');
    rerender();
    return;
  }
  const f = ev.target.closest('[data-act="add-person"]');
  if (!f) return;
  ev.preventDefault();
  const input = f.querySelector('input');
  if (addPerson(input.value)){ toast(input.value.trim() + ' added'); input.value = ''; rerender(); }
  else toast('Give them a name Cue does not already know.');
});

document.addEventListener('input', ev => {
  if (ev.target.id !== 'q') return;
  ui.q = ev.target.value;
  ui.sel = 0;
  renderPalette();
  if (window.TMDB && TMDB.enabled()){
    clearTimeout(searchT);
    const q = ui.q.trim();
    if (q.length > 1) searchT = setTimeout(async () => {
      try {
        const items = await TMDB.search(q);
        if (ui.q.trim() === q){ remote = { q, items }; renderPalette(); }
      } catch(e){}
    }, 260);
  }
});

document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape' && !$('#picker').hidden){ closePicker(); return; }
  const k = ev.key.toLowerCase();
  if ((ev.metaKey || ev.ctrlKey) && k === 'k'){ ev.preventDefault(); ui.palette ? closePalette() : openPalette(); return; }
  if (!ui.palette){
    if (k === '/' && !/input|textarea/i.test(document.activeElement.tagName)){ ev.preventDefault(); openPalette(); }
    return;
  }
  const res = hits();
  if (ev.key === 'Escape'){ ev.preventDefault(); ui.q ? (ui.q = '', $('#q').value = '', renderPalette()) : closePalette(); }
  if (ev.key === 'ArrowDown'){ ev.preventDefault(); ui.sel = Math.min(res.length - 1, ui.sel + 1); renderPalette(); }
  if (ev.key === 'ArrowUp'){ ev.preventDefault(); ui.sel = Math.max(0, ui.sel - 1); renderPalette(); }
  if (ev.key === 'Enter' && res.length){
    ev.preventDefault();
    const t = res[ui.sel];
    if (ui.palette.person){
      sharedSet(ui.palette.person, t.id, 'want');
      toast(t.name + ' added to your list with ' + ui.palette.person);
    } else location.hash = '#/title/' + t.id;
    pushRecent(ui.q);
    closePalette(); rerender();
  }
});

document.addEventListener('dragstart', ev => {
  const c = ev.target.closest('[data-drag]');
  if (!c) return;
  ui.drag = c.dataset.drag;
  ev.dataTransfer.effectAllowed = 'move';
  try { ev.dataTransfer.setData('text/plain', ui.drag); } catch(e){}
});
document.addEventListener('dragover', ev => {
  const col = ev.target.closest('[data-drop]');
  if (!col || !ui.drag) return;
  ev.preventDefault();
  document.querySelectorAll('.col-drop.over').forEach(c => c.classList.remove('over'));
  col.classList.add('over');
});
document.addEventListener('drop', ev => {
  const col = ev.target.closest('[data-drop]');
  if (!col || !ui.drag) return;
  ev.preventDefault();
  setStatus(ui.drag, col.dataset.drop);
  ui.drag = null;
  rerender();
});
document.addEventListener('dragend', () => {
  ui.drag = null;
  document.querySelectorAll('.col-drop.over').forEach(c => c.classList.remove('over'));
});
