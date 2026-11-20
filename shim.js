// Remplace l'environnement de l'artefact : réponses stockées dans ce navigateur (localStorage).
(function () {
  var KEY = 'atelier-smd-reponses';
  var mem = {};
  function load() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { return mem; } }
  function store(obj) { mem = obj; try { localStorage.setItem(KEY, JSON.stringify(obj)); } catch (e) {} }
  var draws = {}, listeners = [];
  function rows() { var o = load(); return Object.keys(o).map(function (k) { return Object.assign({ id: k }, o[k]); }); }
  function rerun() {
    listeners.forEach(function (fn) { try { fn(); } catch (e) { console.error(e); } });
    Object.keys(draws).forEach(function (n) {
      document.querySelectorAll('[data-draw="' + n + '"]').forEach(function (el) { try { draws[n](el); } catch (e) { console.error(e); } });
    });
  }
  window.dash = {
    data: function () { var r = rows(); r.columns = []; return { status: 'ok', data: r }; },
    onData: function (fn) { listeners.push(fn); },
    draw: function (name, fn) { draws[name] = fn; },
    _start: rerun
  };
  window.claude = {
    use: function (name) {
      if (name === 'user') return Promise.resolve({ id: function () { return Promise.resolve('local'); } });
      if (name === 'db') return Promise.resolve({
        doc: function (path) {
          var id = path.split('/').pop();
          return { set: function (row) { var o = load(); o[id] = row; store(o); setTimeout(rerun, 0); return Promise.resolve(); } };
        }
      });
      return Promise.reject(new Error('indisponible'));
    }
  };
  window.addEventListener('storage', function (e) { if (e.key === KEY) rerun(); });
})();
