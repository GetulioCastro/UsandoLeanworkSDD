/* Wireframe SPEC-UI-001 - seletor de estado por query string.
   Uso: ui-02-painel.html?estado=vazio
   Esconde tudo que tem data-estado diferente do estado ativo. */
(function () {
  var params = new URLSearchParams(window.location.search);
  var ativo = params.get('estado') || 'default';
  var tela = document.body.getAttribute('data-tela') || '?';
  var nome = document.body.getAttribute('data-tela-nome') || '';

  var blocos = document.querySelectorAll('[data-estado]');
  blocos.forEach(function (bloco) {
    bloco.hidden = bloco.getAttribute('data-estado') !== ativo;
  });

  var disponiveis = [];
  blocos.forEach(function (bloco) {
    var e = bloco.getAttribute('data-estado');
    if (disponiveis.indexOf(e) === -1) disponiveis.push(e);
  });
  disponiveis.sort();

  var barra = document.createElement('div');
  barra.className = 'barra-estados';

  var label = document.createElement('strong');
  label.textContent = 'Estado';
  barra.appendChild(label);

  var selo = document.createElement('span');
  selo.className = 'selo-tela';
  selo.textContent = tela + ' — ' + nome;
  barra.appendChild(selo);

  if (disponiveis.indexOf(ativo) === -1) disponiveis.unshift(ativo);

  disponiveis.forEach(function (estado) {
    var a = document.createElement('a');
    a.href = '?estado=' + encodeURIComponent(estado);
    a.textContent = estado;
    if (estado === ativo) a.setAttribute('aria-current', 'true');
    barra.appendChild(a);
  });

  document.body.appendChild(barra);
})();
