// Recherche instantanee (window.RECHERCHE, ecrit par generer.py) et filtres des tableaux. Fonctionne aussi sans serveur (fichiers locaux).
(function () {
  function norm(s) {
    return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  var input = document.getElementById('q');
  var box = document.getElementById('results');
  if (input && box && window.RECHERCHE) {
    var up = input.getAttribute('data-up') || '';
    var data = window.RECHERCHE.map(function (e) { return { t: e.t, c: e.c, u: e.u, n: norm(e.t) }; });
    var current = -1;

    function render() {
      var q = norm(input.value.trim());
      box.innerHTML = '';
      current = -1;
      if (!q) { box.hidden = true; return; }
      var words = q.split(/\s+/);
      var hits = data.filter(function (e) { return words.every(function (w) { return e.n.indexOf(w) !== -1; }); });
      hits.sort(function (a, b) { return (a.n.indexOf(q) === 0 ? 0 : 1) - (b.n.indexOf(q) === 0 ? 0 : 1) || a.t.localeCompare(b.t, 'fr'); });
      if (!hits.length) {
        var p = document.createElement('p');
        p.textContent = 'Aucun résultat pour « ' + input.value.trim() + ' ».';
        box.appendChild(p);
      }
      hits.slice(0, 20).forEach(function (e) {
        var a = document.createElement('a');
        a.href = up + e.u;
        var t = document.createElement('span');
        t.textContent = e.t;
        var c = document.createElement('small');
        c.textContent = e.c;
        a.appendChild(t);
        a.appendChild(c);
        box.appendChild(a);
      });
      box.hidden = false;
    }

    function move(d) {
      var links = box.querySelectorAll('a');
      if (!links.length) return;
      if (current >= 0) links[current].classList.remove('on');
      current = (current + d + links.length) % links.length;
      links[current].classList.add('on');
      links[current].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', render);
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'ArrowDown') { ev.preventDefault(); move(1); }
      else if (ev.key === 'ArrowUp') { ev.preventDefault(); move(-1); }
      else if (ev.key === 'Enter') {
        var links = box.querySelectorAll('a');
        var target = links[current >= 0 ? current : 0];
        if (target) location.href = target.href;
      } else if (ev.key === 'Escape') { box.hidden = true; }
    });
    document.addEventListener('click', function (ev) {
      if (!box.contains(ev.target) && ev.target !== input) box.hidden = true;
    });
  }

  // Filtres des tableaux (bestiaire, ressources)
  Array.prototype.forEach.call(document.querySelectorAll('input.filter'), function (f) {
    var t = document.querySelector('table.' + f.getAttribute('data-table'));
    if (!t) return;
    f.addEventListener('input', function () {
      var q = norm(f.value.trim());
      Array.prototype.forEach.call(t.tBodies[0].rows, function (row) {
        row.hidden = q && norm(row.textContent).indexOf(q) === -1;
      });
    });
  });
})();
