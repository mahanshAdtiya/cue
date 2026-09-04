/* Cue — state, persistence and selectors */
'use strict';

const byId = id => CATALOG.find(t => t.id === id) || (S && S.cache && S.cache[id]) || (window.TMDB ? TMDB.mem(id) : null) || null;
const perSeason = t => Math.max(1, Math.round((t.eps || 1) / Math.max(1, t.seasons || 1)));
const isShow = t => t.type !== 'Movie';

let S = load();
let ui = { libView:'watching', libMode:'grid', menu:null, palette:null, q:'', sel:0, drag:null };

function load(){
  let s = null;
  try { s = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch(e){ s = null; }
  if (s && s.entries){
    const st = Object.assign({ cache:{} }, s);
    if (!('user' in st)) st.user = { name:'Mahansh', email:'mahansh@example.com' };
    Object.keys(st.entries).forEach(id => {
      const en = st.entries[id];
      if (en.status === 'watched' && !en.finishes) en.finishes = [en.watchedAt || Date.now()];
    });
    return st;
  }
  return seed();
}
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

function seed(){
  const now = Date.now();
  const e = (status, done, extra) => Object.assign({ status, done, rating:0, fav:false, updatedAt:now }, extra || {});
  return {
    cache: {},
    user: { name:'Mahansh', email:'mahansh@example.com' },
    entries: {
      dark:        e('watched', 26, { rating:5, fav:true, watchedAt: now - 6e8 }),
      severance:   e('watching', 6),
      vinland:     e('watching', 19),
      onepiece:    e('watching', 390),
      breakingbad: e('watching', 11),
      interstellar:e('want', 0),
      frieren:     e('want', 0),
      pastlives:   e('want', 0),
      chernobyl:   e('want', 0),
      shogun:      e('want', 0),
      monster:     e('want', 0),
      arcane:      e('watched', 18, { rating:5, fav:true, watchedAt: now - 12e8 }),
      steinsgate:  e('watched', 24, { rating:5, fav:true, watchedAt: now - 20e8 }),
      fleabag:     e('watched', 12, { rating:5, fav:true, watchedAt: now - 26e8 }),
      whiplash:    e('watched', 1,  { rating:5, fav:true, watchedAt: now - 30e8 }),
      succession:  e('watched', 39, { rating:4, watchedAt: now - 34e8 }),
      zone:        e('watched', 1,  { rating:4, watchedAt: now - 40e8 }),
      spirited:    e('watched', 1,  { rating:5, watchedAt: now - 46e8 })
    },
    people: ['Rahul','Priya','Ankit'],
    shared: {
      Rahul: { interstellar:{status:'want'}, severance:{status:'want'}, vinland:{status:'want'},
               breakingbad:{status:'watching'}, dark:{status:'watched'}, arcane:{status:'watched'} },
      Priya: { fleabag:{status:'watched'}, pastlives:{status:'want'} },
      Ankit: { steinsgate:{status:'watched'}, vinland:{status:'watching'} }
    }
  };
}

function entryOf(id){
  return S.entries[id] || null;
}
function ensure(id){
  if (!S.entries[id]) S.entries[id] = { status:'want', done:0, rating:0, fav:false, updatedAt:Date.now() };
  const t = byId(id);
  if (t && t.tmdb) S.cache[id] = t;
  return S.entries[id];
}
function progress(t){
  const en = entryOf(t.id);
  const done = en ? en.done : 0;
  const ps = perSeason(t), eps = t.eps || 1;
  return {
    done, pct: Math.min(100, Math.round((done / eps) * 100)),
    s: Math.min(t.seasons || 1, Math.max(1, Math.floor(Math.max(0, done - 1) / ps) + 1)),
    e: done ? ((done - 1) % ps) + 1 : 0,
    left: Math.max(0, eps - done)
  };
}
function setStatus(id, status){
  const t = byId(id), en = ensure(id);
  const wasWatched = en.status === 'watched';
  en.status = status;
  en.updatedAt = Date.now();
  if (status === 'watched'){
    en.done = t.eps || 1;
    en.watchedAt = Date.now();
    en.finishes = (en.finishes || []).concat(Date.now());
  }
  if (status === 'want'){ en.done = 0; }
  if (status === 'watching' && wasWatched) en.done = 0;
  else if (status === 'watching' && en.done >= (t.eps || 1)) en.done = Math.max(1, Math.floor((t.eps || 1) / 2));
  save();
  toast(wasWatched && status === 'watching'
    ? 'Rewatching ' + t.name + ' — your history is kept'
    : t.name + ' → ' + STATUSES[status]);
}
function bump(id, d){
  const t = byId(id), en = ensure(id);
  en.done = Math.min(t.eps || 1, Math.max(0, en.done + d));
  en.updatedAt = Date.now();
  if (en.done >= (t.eps || 1)){
    en.status = 'watched';
    en.watchedAt = Date.now();
    en.finishes = (en.finishes || []).concat(Date.now());
    toast(t.name + ' finished' + (en.finishes.length > 1 ? ' again — ' + ordinal(en.finishes.length) + ' time' : '. Rate it?'));
  }
  else if (en.done > 0) en.status = 'watching';
  else en.status = 'want';
  save();
}
function rate(id, n){
  const en = ensure(id);
  en.rating = en.rating === n ? 0 : n;
  en.updatedAt = Date.now();
  save();
}
function toggleFav(id){
  const en = ensure(id);
  en.fav = !en.fav;
  save();
  toast(byId(id).name + (en.fav ? ' added to favorites' : ' removed from favorites'));
}
function addPerson(name){
  const n = name.trim();
  if (!n || S.people.some(p => p.toLowerCase() === n.toLowerCase())) return false;
  S.people.push(n);
  S.shared[n] = {};
  save();
  return true;
}
function sharedSet(person, id, status){
  if (!S.shared[person]) S.shared[person] = {};
  if (status === null) delete S.shared[person][id];
  else S.shared[person][id] = { status, updatedAt: Date.now() };
  save();
}
function sharedList(person, status){
  const m = S.shared[person] || {};
  return Object.keys(m).filter(id => m[id].status === status).map(byId).filter(Boolean);
}
function sharedStatus(person, id){
  const m = S.shared[person] || {};
  return m[id] ? m[id].status : null;
}
function watchedWith(id){
  return S.people.filter(p => (S.shared[p] || {})[id]);
}

/* ───────── selectors ───────── */
const tracked = () => Object.keys(S.entries).map(byId).filter(Boolean);
const list = status => tracked().filter(t => entryOf(t.id).status === status)
  .sort((a,b) => entryOf(b.id).updatedAt - entryOf(a.id).updatedAt);
const favorites = () => tracked().filter(t => entryOf(t.id).fav);
const history = () => tracked().filter(t => entryOf(t.id).status === 'watched')
  .sort((a,b) => (entryOf(b.id).watchedAt || 0) - (entryOf(a.id).watchedAt || 0));

/* ───────── tiny helpers ───────── */
