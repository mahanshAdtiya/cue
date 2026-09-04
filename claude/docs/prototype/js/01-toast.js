'use strict';

const Toast = (function(){
  const KINDS = {
    success: { icon:'\u2713', label:'Done' },
    error:   { icon:'\u2715', label:'Problem' },
    info:    { icon:'\u2139', label:'Heads up' }
  };
  const MAX = 4;
  let root = null;

  function mount(){
    if (root && document.body.contains(root)) return root;
    root = document.createElement('div');
    root.className = 'tstack';
    root.setAttribute('role', 'region');
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-label', 'Notifications');
    document.body.appendChild(root);
    return root;
  }

  function dismiss(el){
    if (!el || el.dataset.out) return;
    el.dataset.out = '1';
    el.classList.add('tst-out');
    setTimeout(() => el.remove(), 220);
  }

  function show(o){
    o = typeof o === 'string' ? { message:o } : (o || {});
    const kind = KINDS[o.kind] ? o.kind : 'success';
    const k = KINDS[kind];
    const duration = o.duration === 0 ? 0 : (o.duration || 4200);
    const stack = mount();

    while (stack.children.length >= MAX) dismiss(stack.firstElementChild);

    const el = document.createElement('div');
    el.className = 'tst tst-' + kind;
    el.innerHTML =
      '<span class="tst-icon" aria-hidden="true">' + k.icon + '</span>' +
      '<div class="tst-body">' +
        '<span class="tst-label">' + esc(o.label || k.label) + '</span>' +
        '<p class="tst-msg">' + esc(o.message || '') + '</p>' +
      '</div>' +
      '<button class="tst-x" type="button" aria-label="Dismiss">\u00d7</button>' +
      (duration ? '<span class="tst-timer" style="animation-duration:' + duration + 'ms"></span>' : '');

    if (o.action && o.action.label){
      const a = document.createElement(o.action.href ? 'a' : 'button');
      a.className = 'tst-act';
      a.textContent = o.action.label;
      if (o.action.href) a.href = o.action.href;
      else { a.type = 'button'; a.addEventListener('click', () => { o.action.onClick && o.action.onClick(); dismiss(el); }); }
      el.querySelector('.tst-body').appendChild(a);
    }

    el.querySelector('.tst-x').addEventListener('click', () => dismiss(el));
    const timer = el.querySelector('.tst-timer');
    if (timer) timer.addEventListener('animationend', () => dismiss(el));
    stack.appendChild(el);
    return el;
  }

  function esc(s){
    return String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  return {
    show,
    ok:   (message, o) => show(Object.assign({ kind:'success', message }, o)),
    err:  (message, o) => show(Object.assign({ kind:'error',   message }, o)),
    info: (message, o) => show(Object.assign({ kind:'info',    message }, o)),
    clear: () => { if (root) Array.from(root.children).forEach(dismiss); }
  };
})();

if (typeof window !== 'undefined') window.Toast = Toast;
if (typeof module !== 'undefined' && module.exports) module.exports = Toast;
