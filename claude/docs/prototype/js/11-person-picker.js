/* Cue — person picker dialog */
'use strict';

function openPicker(id){
  const t = byId(id);
  if (!t) return;
  const el = $('#picker');
  const done = (entryOf(id) || {}).status === 'watched';
  el.innerHTML = '<div class="palette pickercard">' +
    '<div class="palette-head"><span class="mono">Watched ' + esc(t.name) + ' with</span>' +
      '<span class="spacer"></span><button class="kbd-btn" data-act="close-picker">ESC</button></div>' +
    '<div class="pickerbody">' +
      (S.people.length
        ? '<div class="chiprow">' + S.people.map(p =>
            '<button class="pill" data-act="pick-person" data-person="' + esc(p) + '" data-id="' + id + '">' +
            esc(p) + '</button>').join('') + '</div>'
        : '<p class="sec-note">No people yet. Add the first one below.</p>') +
      '<form class="inline-form" data-act="picker-new" data-id="' + id + '">' +
        '<input name="name" placeholder="Someone new" aria-label="Person name" />' +
        '<button class="btn" type="submit">Add</button></form>' +
      '<p class="sec-note">Goes to your shared list as “' + (done ? 'watched together' : 'want to watch together') +
      '”. Your own progress stays untouched.</p>' +
    '</div></div>';
  el.hidden = false;
}
const closePicker = () => { $('#picker').hidden = true; };
function attachPerson(person, id){
  const done = (entryOf(id) || {}).status === 'watched';
  sharedSet(person, id, done ? 'watched' : 'want');
  toast(byId(id).name + ' added to your list with ' + person);
  closePicker();
  rerender();
}

/* ───────── hover card ───────── */
