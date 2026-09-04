/* Cue — first run, landing and auth views */
'use strict';

function viewFirstRun(){
  const steps = [
    ['01','Find it','Search movies, shows and anime with ⌘K. Everything starts here.'],
    ['02','Track it','Want to watch, currently watching, watched — with the season and episode you are on.'],
    ['03','Remember it','Rate it, favorite it, and note who you watched it with.']
  ];
  return '<section class="firstrun">' +
    '<span class="kicker">Your library is empty</span>' +
    '<h1>Start with one title</h1>' +
    '<p class="overview">Add the thing you watched last night. Cue fills in from there — no setup, no import, nothing to configure.</p>' +
    '<div class="rowbtns"><button class="btn" data-act="open-palette">Search titles</button>' +
    '<button class="btn ghost" data-act="load-demo">Load a demo library</button></div>' +
    '<div class="steps">' + steps.map(s =>
      '<div class="step"><span class="mono">' + s[0] + '</span><b>' + s[1] + '</b><p>' + s[2] + '</p></div>').join('') +
    '</div></section>';
}

function viewLanding(){
  const wall = CATALOG.slice(0, 14);
  const points = [
    ['Find it','Movies, shows and anime in one search. Wherever you actually watch them.'],
    ['Track it','Three states and an episode count. Want to watch, watching, watched.'],
    ['Remember it','Ratings, favorites, and a shared history with the people you watch with.']
  ];
  return '<section class="billboard landing" style="--h:265">' +
      '<span class="bb-art"></span>' +
      '<div class="bb-body">' +
        '<span class="kicker">Cue is not where you watch</span>' +
        '<h1>Keep track of everything you watch</h1>' +
        '<p class="overview">One place for what you want to watch, what you are in the middle of, and what you finished — across every service, with the people you watch with.</p>' +
        '<div class="rowbtns"><a class="btn" href="#/signup">Create an account</a>' +
        '<a class="btn ghost" href="#/signin">Sign in</a></div>' +
      '</div></section>' +
    '<section class="steps">' + points.map(p =>
      '<div class="step"><b>' + p[0] + '</b><p>' + p[1] + '</p></div>').join('') + '</section>' +
    '<section class="sec"><div class="sec-head"><h2>Everything in one shelf</h2>' +
      '<span class="sec-note">movies, shows and anime, side by side</span></div>' +
      '<div class="rail wall">' + wall.map(t => '<div class="tile">' + posterHTML(t) + '</div>').join('') + '</div></section>' +
    '<section class="card cta"><h2>Find it → Track it → Watch it → Remember it</h2>' +
      '<a class="btn" href="#/signup">Start tracking</a></section>';
}

function viewAuth(mode){
  const up = mode === 'up';
  return '<section class="authwrap"><div class="authcard card">' +
    '<span class="kicker">' + (up ? 'Create your account' : 'Welcome back') + '</span>' +
    '<h1>' + (up ? 'Start your library' : 'Sign in to Cue') + '</h1>' +
    '<form class="authform" data-act="auth" data-mode="' + mode + '">' +
      (up ? '<label>Name<input name="name" required placeholder="Mahansh" /></label>' : '') +
      '<label>Email<input name="email" type="email" required placeholder="you@example.com" /></label>' +
      '<label>Password<input name="password" type="password" required minlength="6" placeholder="••••••••" /></label>' +
      '<button class="btn" type="submit">' + (up ? 'Create account' : 'Sign in') + '</button>' +
    '</form>' +
    '<p class="sec-note">' + (up
      ? 'Already have an account? <a href="#/signin">Sign in</a>.'
      : 'New here? <a href="#/signup">Create an account</a>.') + '</p>' +
    '<p class="sec-note">Prototype only — credentials are never sent anywhere, and your library lives in this browser.</p>' +
    '</div></section>';
}

/* ───────── person picker ───────── */
