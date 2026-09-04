/* Cue — People and shared lists */
'use strict';

function viewPeople(){
  let h = '<div class="sec-head"><h1>People I watch with</h1><span class="sec-note">They do not need a Cue account.</span></div>';
  if (!S.people.length)
    return h + '<div class="empty"><h2>No one yet</h2>' +
      '<p>Add the people you actually watch things with. Each one gets a shared list — what you want to watch together, what you are in the middle of, and what you finished.</p></div>' +
      '<form class="inline-form" data-act="add-person"><input name="name" placeholder="e.g. Rahul" aria-label="Person name" />' +
      '<button class="btn" type="submit">Add the first person</button></form>';
  h += '<div class="people">' + S.people.map(n => {
    const w = sharedList(n, 'watching'), want = sharedList(n, 'want'), done = sharedList(n, 'watched');
    const line = done.length + ' watched together' + (w.length ? ' · now: ' + w[0].name : want.length ? ' · ' + want.length + ' on the list' : '');
    return '<a class="person card" href="#/person/' + encodeURIComponent(n) + '"><i>' + esc(n[0]) + '</i>' +
      '<span class="body"><b>' + esc(n) + '</b><span>' + esc(line) + '</span></span><span style="color:var(--mut-2)">›</span></a>';
  }).join('') + '</div>';
  h += '<form class="inline-form" data-act="add-person"><input name="name" placeholder="Add a person — e.g. Rahul" aria-label="Person name" />' +
    '<button class="btn" type="submit">Add person</button></form>';
  return h;
}

function viewPerson(name){
  if (!S.people.includes(name)) return '<div class="empty"><h2>Unknown person</h2><p><a href="#/people">Back to people</a></p></div>';
  const groups = [
    { key:'want', label:'Want to watch together' },
    { key:'watching', label:'Currently watching together' },
    { key:'watched', label:'Watched together' }
  ];
  let h = '<div class="sec-head"><h1>Me × ' + esc(name) + '</h1><span class="spacer"></span>' +
    '<button class="btn sm" data-act="open-palette" data-person="' + esc(name) + '">＋ Add a title</button></div>' +
    '<p class="sec-note">Shared tracking is separate from your own library. Rating and progress here stay yours.</p>';
  groups.forEach(g => {
    const items = sharedList(name, g.key);
    h += '<section class="sec"><div class="sec-head"><h2>' + g.label + '</h2><span class="mono">' + items.length + '</span></div>';
    h += items.length ? '<div class="rows">' + items.map(t =>
      '<div class="row">' + posterHTML(t) +
      '<a class="body" href="#/title/' + t.id + '" style="color:inherit"><b>' + esc(t.name) + '</b><span>' + t.type + ' · ' + t.year + '</span></a>' +
      '<div class="chiprow">' + groups.filter(x => x.key !== g.key).map(x =>
        '<button class="pill" data-act="shared" data-person="' + esc(name) + '" data-id="' + t.id + '" data-status="' + x.key + '">' +
        (x.key === 'want' ? 'To watch' : x.key === 'watching' ? 'Watching' : 'Watched') + '</button>').join('') +
        '<button class="pill" data-act="shared-remove" data-person="' + esc(name) + '" data-id="' + t.id + '">✕</button>' +
      '</div></div>').join('') + '</div>'
      : '<p class="sec-note">Nothing here yet.</p>';
    h += '</section>';
  });
  return h;
}
