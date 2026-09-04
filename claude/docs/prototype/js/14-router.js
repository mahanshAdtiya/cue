/* Cue — hash router */
'use strict';

function route(){
  const hash = location.hash.replace(/^#\/?/, '') || 'home';
  const [head, arg] = hash.split('/');
  const view = $('#view');
  const anon = !S.user;
  document.body.classList.toggle('anon', anon);
  if (anon && ['home','library','title','people','person','profile'].indexOf(head) > -1){
    location.replace('#/landing');
    return;
  }
  if (!anon && ['landing','signin','signup'].indexOf(head) > -1){
    location.replace('#/home');
    return;
  }
  view.style.position = 'relative';
  if (head === 'landing') view.innerHTML = viewLanding();
  else if (head === 'signin') view.innerHTML = viewAuth('in');
  else if (head === 'signup') view.innerHTML = viewAuth('up');
  else if (head === 'library') view.innerHTML = viewLibrary();
  else if (head === 'title') view.innerHTML = viewTitle(arg);
  else if (head === 'people') view.innerHTML = viewPeople();
  else if (head === 'person') view.innerHTML = viewPerson(decodeURIComponent(arg || ''));
  else if (head === 'profile') view.innerHTML = viewProfile();
  else view.innerHTML = viewHome();
  const av = document.querySelector('.avatar');
  if (av && S.user) av.textContent = (S.user.name || 'C')[0].toUpperCase();
  document.querySelectorAll('.nav a, .avatar').forEach(a =>
    a.classList.toggle('on', a.dataset.route === head || (head === 'title' && a.dataset.route === 'library') || (head === 'person' && a.dataset.route === 'people')));
  closeDrawer();
  if (head === 'title') hydrateTitle(arg);
  if ((head === 'home' || !head) && window.TMDB && TMDB.enabled()) hydrateHome();
  window.scrollTo(0, 0);
}
const rerender = () => {
  route();
  const hc = $('#hovercard');
  if (hcId && hc && !hc.hidden) hc.innerHTML = renderHover(hcId);
};

/* ───────── palette ───────── */
