/* Cue — My Library view */
'use strict';

function viewLibrary(){
  const views = [
    { key:'watching', label:'Currently watching', items:list('watching'), note:list('watching').length + ' in flight. Nudge one forward.' },
    { key:'want', label:'Want to watch', items:list('want'), note:list('want').length + ' waiting. Ambitious.' },
    { key:'watched', label:'Watched', items:history(), note:'Your history, newest first.' },
    { key:'favorites', label:'Favorites', items:favorites(), note:'The rewatch shelf.' }
  ];
  const v = views.find(x => x.key === ui.libView) || views[0];
  let h = '<div class="sec-head"><h1>My library</h1><span class="spacer"></span>' +
    '<div class="seg" style="flex:0 0 auto">' +
      '<button data-act="libmode" data-mode="grid" class="' + (ui.libMode === 'grid' ? 'on' : '') + '">Grid</button>' +
      '<button data-act="libmode" data-mode="board" class="' + (ui.libMode === 'board' ? 'on' : '') + '">Board</button>' +
    '</div></div>';

  if (ui.libMode === 'grid'){
    h += '<div class="chiprow">' + views.map(x =>
      '<button class="pill ' + (x.key === ui.libView ? 'on' : '') + '" data-act="libview" data-view="' + x.key + '">' +
      x.label + ' ' + x.items.length + '</button>').join('') + '</div>';
    h += '<p class="sec-note">' + esc(v.note) + '</p>';
    h += v.items.length
      ? '<div class="grid wide">' + v.items.map(t => tile(t, { menu:true, plus:true, bar:true, favMark:true })).join('') + '</div>'
      : '<div class="empty"><h2>Nothing here</h2><p>Add titles with ⌘K, or move something over from another list.</p></div>';
  } else {
    h += '<p class="sec-note">Drag a title into another column to change its status. Same thing the menus do, just faster.</p>';
    h += '<div class="board">' + Object.keys(STATUSES).map(k => {
      const items = k === 'watched' ? history() : list(k);
      return '<div class="col-drop" data-drop="' + k + '">' +
        '<div class="sec-head"><h3>' + STATUSES[k] + '</h3><span class="spacer"></span><span class="mono">' + items.length + '</span></div>' +
        '<div class="chits">' + items.map(t =>
          '<div class="chit" draggable="true" data-drag="' + t.id + '">' + posterHTML(t) +
          '<div class="body"><b>' + esc(t.name) + '</b><span>' + esc(subLine(t)) + '</span></div></div>').join('') +
        '</div></div>';
    }).join('') + '</div>';
  }
  return h;
}
