// Versión 3: navegación más cómoda.
// 1) Menú lateral retráctil (solo íconos).
// 2) Desde el inicio, lo que se puede ver sin salir se abre en una ventana (modal).
// 3) Si hay que cambiar de página desde el inicio, "volver" siempre te deja en el inicio.

// ───────────────────────── 1. menú retráctil ─────────────────────────
ICONOS.menu = "M4 6h16 M4 12h16 M4 18h16";
function aplicarMenu() { document.body.classList.toggle("menu-chico", !!S.menuChico); }
function toggleMenu() { S.menuChico = !S.menuChico; guardar(); aplicarMenu(); }
const _renderMenu4 = renderMenu;
renderMenu = function (sec) {
  _renderMenu4(sec);
  // Con el menú achicado, el nombre de cada sección queda como ayuda al pasar el mouse.
  document.querySelectorAll("#menu .item[onclick]").forEach((el) => { el.title = el.textContent.replace(/\d+$/, "").trim(); });
};

// ───────────────────────── 2. ventanas desde el inicio ─────────────────────────
let pila = []; // rutas abiertas en la ventana (permite volver entre ventanas)
const esAula = () => S.rol === "alumno" || S.rol === "docente";
function partes(h) { return h.replace(/^#\/?/, "").split("/"); }
// Qué rutas se pueden mostrar en una ventana sin salir del inicio.
function rutaEnModal(h) {
  const [s, a, b] = partes(h);
  if (s === "comunicados") return /^\d+$/.test(a || "");
  if (s === "mensajes") return !a || (a === "recibidos" && !b) || a === "ver";
  if (s === "tareas") return esAula();
  if (s === "calificaciones") return !a && (S.rol === "familia" || S.rol === "alumno");
  if (s === "cuotas") return S.rol === "familia";
  if (s === "calendario") return true;
  if (s === "materias") return esAula() && (/^\d+$/.test(b || "") || b === "contenido");
  return false;
}
function modalMensaje(id) {
  const m = S.mensajes.find((x) => x.id === id);
  if (!m) return "<p>Mensaje no encontrado.</p>";
  if (noLeido(m)) { m.leidoPor.push(yo()); guardar(); }
  return `<h2 style="margin-top:0">${esc(m.asunto)}</h2>
    <p>${av(m.de)}<b>${esc(nombre(m.de))}</b> <span class="muted">— ${esc(rolDe(m.de))}</span><br><span class="small muted">Para: ${m.para.map((p) => esc(nombre(p))).join(", ")} · ${fFechaHora(m.fecha)}</span></p>
    <div class="msg-cuerpo">${esc(m.cuerpo)}</div>
    ${m.adj.length ? `<div style="margin-top:12px">${m.adj.map((a) => `<span class="adjunto">{{clip}} ${esc(a.n)} <span class="small muted">${a.t}</span></span>`).join("")}</div>` : ""}
    <div class="toolbar" style="margin-top:16px"><button class="primario" onclick="responder(${id},false)">{{responder}} Responder</button><button onclick="responder(${id},true)">{{respondertodos}} Responder a todos</button><button onclick="reenviar(${id})">{{reenviar}} Reenviar</button><span class="sep"></span><button onclick="irPagina('#/mensajes/ver/${id}')">Ver en la bandeja</button></div>`;
}
function contenidoRuta(h) {
  const [s, a, b, c] = partes(h);
  if (s === "comunicados") return { t: "Comunicado", html: vComunicado(+a).replace(`<div class="toolbar"><button onclick="location.hash='#/comunicados'">← Comunicados</button></div>`, "") };
  if (s === "mensajes" && a === "ver") return { t: "Mensaje", html: modalMensaje(+b) };
  if (s === "mensajes") return { t: "Mensajes sin leer", html: listaMensajes(noLeidos()) + `<div class="toolbar" style="margin-top:12px"><span class="sep"></span><button onclick="irPagina('#/mensajes')">Abrir la bandeja completa</button></div>` };
  if (s === "tareas") return a ? { t: "Tarea", html: vAulaTarea(+a) } : { t: S.rol === "docente" ? "Entregas por corregir" : "Mis pendientes", html: vTareas() };
  if (s === "calificaciones") return { t: "Calificaciones", html: vCalificaciones() };
  if (s === "cuotas") return { t: "Cuotas y pagos", html: vCuotas() };
  if (s === "calendario") return { t: "Próximas fechas", html: listaEventos(proximosEventos(90)) + `<div class="toolbar" style="margin-top:12px"><span class="sep"></span><button onclick="irPagina('#/calendario')">Abrir el calendario</button></div>` };
  if (s === "materias") return { t: "Contenido", html: vAulaContenido(a, +(b === "contenido" ? c : b)) };
  return null;
}
function pintarModalRuta() {
  const r = contenidoRuta(pila[pila.length - 1]);
  if (!r) return;
  const guardada = pila.slice();
  modal(r.t, r.html); // modal() cierra la ventana anterior y vacía la pila: se restaura
  pila = guardada;
  const ventana = $("#modal .modal");
  ventana.classList.add("ancho");
  if (pila.length > 1) {
    const b = document.createElement("button");
    b.className = "modal-atras"; b.title = "Volver"; b.textContent = "←";
    b.onclick = () => { pila.pop(); pintarModalRuta(); };
    ventana.querySelector("header").prepend(b);
  }
}
function abrirRuta(h, apilar) {
  if (!apilar) pila = [];
  pila.push(h);
  pintarModalRuta();
  _render4(); // actualiza contadores (por ejemplo, mensajes leídos) sin cerrar la ventana
}
const _cerrarModal4 = cerrarModal;
cerrarModal = function () { pila = []; _cerrarModal4(); };

// Clic en el fondo oscuro cierra la ventana. Solo si el clic empezó y terminó en el fondo,
// para no cerrarla al seleccionar texto dentro y soltar el mouse afuera.
const _modal4 = modal;
modal = function (titulo, html) {
  _modal4(titulo, html);
  const fondo = $("#modal");
  let desdeFondo = false;
  fondo.addEventListener("mousedown", (e) => { desdeFondo = e.target === fondo; });
  fondo.addEventListener("click", (e) => { if (desdeFondo && e.target === fondo) cerrarModal(); });
};
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#modal")) cerrarModal(); });

// ───────────────────────── 3. volver al inicio ─────────────────────────
// Cada entrada del historial dentro del recorrido guarda cuántos pasos la separan del inicio.
let flujoInicio = false, pasos = 0, reemplazando = false;
function iniciarFlujo() { history.replaceState({ n: 0 }, ""); pasos = 0; flujoInicio = true; }
function irPagina(h) { iniciarFlujo(); location.hash = h; }
function volverAlInicio() { const n = pasos; flujoInicio = false; if (n > 0) history.go(-n); else location.hash = "#/inicio"; }
window.addEventListener("hashchange", () => {
  const st = history.state;
  if (st && typeof st.n === "number") { pasos = st.n; flujoInicio = pasos > 0; }
  else if (flujoInicio) { if (!reemplazando) pasos++; history.replaceState({ n: pasos }, ""); }
  reemplazando = false;
  if (ruta()[0] === "inicio") flujoInicio = false;
}, true);

// Interceptor de clics: los enlaces de la maqueta son onclick="...location.hash='#/...'".
document.addEventListener("click", (e) => {
  const el = e.target.closest("[onclick]");
  if (!el) return;
  const code = el.getAttribute("onclick");
  const m = code.match(/location\.hash\s*=\s*'(#\/[^']*)'/);
  if (!m) return;
  if (el.closest("#menu, #tabbar, #topbar, .panel-flotante")) { flujoInicio = false; return; } // el menú siempre navega normal
  const destino = m[1];
  const enModal = !!el.closest("#modal") && pila.length > 0;
  const enInicio = ruta()[0] === "inicio" && !!el.closest("#main");
  const previo = code.slice(0, m.index);
  const correrPrevio = () => { if (previo.trim()) new Function("event", previo)(e); };
  if (enInicio || enModal) {
    e.preventDefault(); e.stopPropagation(); correrPrevio();
    if (rutaEnModal(destino)) abrirRuta(destino, enModal);
    else irPagina(destino);
    return;
  }
  // Dentro de un recorrido que salió del inicio: se reemplaza la entrada del historial,
  // así "atrás" vuelve directo al inicio.
  if (flujoInicio && el.closest("#main")) {
    e.preventDefault(); e.stopPropagation(); correrPrevio();
    reemplazando = true; location.replace(destino);
  }
}, true);

// ───────────────────────── render ─────────────────────────
const _render4 = render;
render = function () {
  _render4();
  aplicarMenu();
  if (flujoInicio && ruta()[0] !== "inicio") {
    $("#main").insertAdjacentHTML("afterbegin", `<div class="volver-inicio no-print"><button class="primario" onclick="volverAlInicio()">← Volver al inicio</button></div>`);
  }
  if (pila.length && $("#modal")) pintarModalRuta();
};
$("#btn-menu").innerHTML = ic("menu");
render();
