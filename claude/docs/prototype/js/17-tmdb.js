'use strict';

const TMDB = (function(){
  const KEY = 'cue.tmdbKey';
  const IMG = 'https://image.tmdb.org/t/p/';
  const mem = {};

  const key = () => { try { return localStorage.getItem(KEY) || ''; } catch(e){ return ''; } };
  const enabled = () => !!key();
  function setKey(v){
    try { v && v.trim() ? localStorage.setItem(KEY, v.trim()) : localStorage.removeItem(KEY); } catch(e){}
  }

  async function api(path, params){
    const u = new URL('https://api.themoviedb.org/3' + path);
    u.searchParams.set('api_key', key());
    Object.keys(params || {}).forEach(k => u.searchParams.set(k, params[k]));
    const r = await fetch(u.toString());
    if (!r.ok) throw new Error('TMDB ' + r.status);
    return r.json();
  }

  function hueOf(s){
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
    return h;
  }

  function map(r){
    const media = r.media_type || (r.title ? 'movie' : 'tv');
    if (media !== 'movie' && media !== 'tv') return null;
    const date = r.release_date || r.first_air_date || '';
    const anime = (r.genre_ids || []).indexOf(16) > -1 && r.original_language === 'ja';
    const id = 'tmdb-' + media + '-' + r.id;
    const t = {
      id, tmdb:{ media, ref:r.id }, name: r.title || r.name || 'Untitled',
      type: media === 'movie' ? 'Movie' : (anime ? 'Anime' : 'TV Show'),
      year: date ? Number(date.slice(0,4)) : '',
      hue: hueOf(id),
      seasons: media === 'movie' ? 0 : 1,
      eps: media === 'movie' ? 1 : 0,
      genres: '', overview: r.overview || '',
      poster: r.poster_path ? IMG + 'w342' + r.poster_path : '',
      backdrop: r.backdrop_path ? IMG + 'w1280' + r.backdrop_path : '',
      vote: r.vote_average || 0
    };
    mem[id] = t;
    return t;
  }
  const listOf = j => (j.results || []).map(map).filter(Boolean);

  return {
    key, enabled, setKey,
    mem: id => mem[id] || null,
    search: async q => listOf(await api('/search/multi', { query:q, include_adult:'false' })),
    trending: async () => listOf(await api('/trending/all/week', {})).slice(0, 14),
    topRated: async () => {
      const r = await Promise.all([api('/movie/top_rated', {}), api('/tv/top_rated', {})]);
      return listOf(r[0]).concat(listOf(r[1])).sort((a,b) => b.vote - a.vote).slice(0, 14);
    },
    nowPlaying: async () => listOf(await api('/movie/now_playing', {})).slice(0, 14),
    nextEpisodes: async titles => {
      const out = [];
      for (const t of titles.slice(0, 6)){
        try {
          const j = await api('/tv/' + t.tmdb.ref, {});
          if (j.next_episode_to_air) out.push({ t, ep: j.next_episode_to_air });
        } catch(e){}
      }
      return out.sort((a,b) => String(a.ep.air_date).localeCompare(String(b.ep.air_date)));
    },
    details: async t => {
      const j = await api('/' + t.tmdb.media + '/' + t.tmdb.ref, {});
      const d = Object.assign({}, t, {
        genres: (j.genres || []).map(g => g.name).join(' · '),
        overview: j.overview || t.overview,
        seasons: t.tmdb.media === 'tv' ? (j.number_of_seasons || 1) : 0,
        eps: t.tmdb.media === 'tv' ? (j.number_of_episodes || 1) : 1,
        backdrop: j.backdrop_path ? IMG + 'w1280' + j.backdrop_path : t.backdrop,
        detailed: true
      });
      mem[d.id] = d;
      return d;
    }
  };
})();
