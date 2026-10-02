// Maqueta navegable del Campus. Sin servidor: el estado vive en memoria y se
// guarda en localStorage para que la demo recuerde lo que se hizo.
const CLAVE_STORAGE = "campus-maqueta-v1";

function estadoInicial() {
  return JSON.parse(JSON.stringify({
    rol: "familia",
    hijo: "a1",
    logueado: true,
    mensajes: MENSAJES_INICIALES.map((m) => ({ ...m, papelera: {} })),
    comunicados: COMUNICADOS_INICIALES,
    contenidos: CONTENIDOS_INICIALES,
    tareas: TAREAS_INICIALES,
    notas: NOTAS_INICIALES,
    publicado: { 0: true, 1: true }, // períodos publicados a las familias
    eventos: EVENTOS_INICIALES,
    prefs: { avisoMensajes: true, avisoComunicados: true, avisoNotas: true, avisoEntregas: false },
    calMes: HOY.slice(0, 7),
    calVista: "mensual",
  }));
}

let S;
try { S = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || estadoInicial(); } catch (e) { S = estadoInicial(); }
function guardar() { try { localStorage.setItem(CLAVE_STORAGE, JSON.stringify(S)); } catch (e) { /* sin storage: la demo sigue en memoria */ } }
function reiniciar() { try { localStorage.removeItem(CLAVE_STORAGE); } catch (e) {} S = estadoInicial(); location.hash = "#/inicio"; render(); toast("Datos de la demo reiniciados"); }

// ───────────────────────── helpers ─────────────────────────
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const yo = () => ROLES[S.rol].id;
const nombre = (id) => (PERSONAS[id] ? PERSONAS[id].nombre : id);
const rolDe = (id) => (PERSONAS[id] ? PERSONAS[id].rol : "");
const materia = (id) => MATERIAS.find((m) => m.id === id);
const curso = (id) => CURSOS.find((c) => c.id === id);
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
function fFecha(iso) { const [y, m, d] = iso.slice(0, 10).split("-"); return `${d}/${m}/${y.slice(2)}`; }
function fFechaHora(iso) { return iso.length > 10 ? `${fFecha(iso)} · ${iso.slice(11, 16)} hs.` : fFecha(iso); }
function diasHasta(iso) { return Math.round((new Date(iso.slice(0, 10)) - new Date(HOY)) / 86400000); }
function cuandoTexto(iso) {
  const d = -diasHasta(iso);
  if (d === 0) return "Hoy"; if (d === 1) return "Ayer"; if (d > 1) return `Hace ${d} días`;
  if (d === -1) return "Mañana"; return `En ${-d} días`;
}
function toast(t, accion) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div");
  el.className = "toast";
  el.append(t);
  if (accion) {
    const b = document.createElement("button");
    b.textContent = accion.t;
    b.onclick = () => { el.remove(); accion.f(); };
    el.append(b);
  }
  document.body.appendChild(el); setTimeout(() => el.remove(), accion ? 6000 : 2600);
}
// Avatar con iniciales si la opción lo define (opción 2); si no, nada.
function av(id) { return typeof avatar === "function" ? avatar(id) : ""; }
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const DIAS_LARGO = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
function fDia(iso) { const d = new Date(iso.slice(0, 10) + "T12:00"); return `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`; }
function primerNombre(id) { return esc(nombre(id).split(" ")[0]); }
function notaMaqueta(t) { return `<div class="nota-maqueta no-print">{{info}} Maqueta: ${t}</div>`; }

// Alumno "en foco": el propio alumno, o el hijo elegido por la familia.
function alumnoFoco() { return S.rol === "alumno" ? yo() : S.rol === "familia" ? S.hijo : null; }
function cursoDeAlumno(a) { return Object.keys(ALUMNOS_CURSO).find((c) => ALUMNOS_CURSO[c].includes(a)); }
function materiasDeCurso(c) { return c === "7B" ? MATERIAS : MATERIAS.filter((m) => m.tipo === "troncal"); }
function cursosVisibles() {
  if (S.rol === "familia") return ROLES.familia.hijos.map(cursoDeAlumno);
  if (S.rol === "alumno") return [ROLES.alumno.curso];
  if (S.rol === "docente") return ROLES.docente.cursos;
  return CURSOS.map((c) => c.id);
}

// ───────────────────────── mensajería: consultas ─────────────────────────
function bandeja(carpeta, uid = yo()) {
  return S.mensajes.filter((m) => {
    if (carpeta === "papelera") return m.papelera[uid];
    if (m.papelera[uid]) return false;
    return carpeta === "recibidos" ? m.para.includes(uid) : m.de === uid;
  }).sort((a, b) => b.fecha.localeCompare(a.fecha));
}
const noLeido = (m, uid = yo()) => m.para.includes(uid) && !m.leidoPor.includes(uid);
const noLeidos = () => bandeja("recibidos").filter((m) => noLeido(m));

// ───────────────────────── menú por rol ─────────────────────────
const SECCIONES = {
  inicio: { t: "Inicio", i: "{{inicio}}" },
  mensajes: { t: "Mensajería", i: "{{sobre}}" },
  comunicados: { t: "Comunicados", i: "{{megafono}}" },
  materias: { t: "Materias y contenidos", i: "{{libro}}" },
  tareas: { t: "Tareas y entregas", i: "{{tarea}}" },
  calificaciones: { t: "Calificaciones", i: "{{grafico}}" },
  calendario: { t: "Calendario", i: "{{calendario}}" },
  cuotas: { t: "Cuotas y pagos", i: "{{tarjeta}}" },
  perfil: { t: "Perfil y preferencias", i: "{{usuario}}" },
};
const MENU = {
  familia: ["inicio", "mensajes", "comunicados", "materias", "tareas", "calificaciones", "calendario", "cuotas"],
  alumno: ["inicio", "mensajes", "comunicados", "materias", "tareas", "calificaciones", "calendario"],
  docente: ["inicio", "mensajes", "comunicados", "materias", "tareas", "calificaciones", "calendario"],
  secretaria: ["inicio", "mensajes", "comunicados", "calificaciones", "calendario"],
};

// ───────────────────────── render general ─────────────────────────
function ruta() { return (location.hash.replace(/^#\/?/, "") || "inicio").split("/"); }

function render() {
  $("#rol-select").value = S.rol;
  if (!S.logueado) { renderLogin(); return; }
  $("#app").style.display = "";
  $("#login").style.display = "none";
  const [sec, ...args] = ruta();
  renderTop(sec);
  renderMenu(sec);
  const vistas = { inicio: vInicio, mensajes: vMensajes, comunicados: vComunicados, materias: vMaterias, tareas: vTareas, calificaciones: vCalificaciones, boletin: vBoletin, calendario: vCalendario, cuotas: vCuotas, perfil: vPerfil };
  const permitido = MENU[S.rol].includes(sec) || ["perfil", "boletin"].includes(sec);
  $("#main").innerHTML = iconizar((S.rol === "familia" && TABS_HIJOS.includes(sec) ? tabsHijos(sec) : "") + (permitido && vistas[sec] ? vistas[sec](...args) : `<div class="panel">Esta sección no está disponible para el rol ${ROLES[S.rol].etiqueta}.</div>`));
  window.scrollTo(0, 0);
}

function renderTop(sec) {
  const p = PERSONAS[yo()];
  const n = noLeidos().length;
  const titulo = SECCIONES[sec] ? SECCIONES[sec].t : sec === "boletin" ? "Boletín" : "";
  const contexto = S.rol === "familia" ? (TABS_HIJOS.includes(sec) ? `${nombre(S.hijo)} · ${curso(cursoDeAlumno(S.hijo)).nombre}` : `Familia de ${ROLES.familia.hijos.map(primerNombre).join(" y ")}`)
    : S.rol === "alumno" ? `${curso("7B").nombre} Nivel Primario` : S.rol === "docente" ? `${curso("7B").nombre} · Ciclo Lectivo ${COLEGIO.ciclo}` : `Ciclo Lectivo ${COLEGIO.ciclo}`;
  $("#breadcrumb").innerHTML = `${esc(contexto)} › <b>${esc(titulo)}</b>`;
  $("#top-sobre").innerHTML = iconizar(`{{sobre}} ${n ? `<span class="badge">${n}</span>` : ""}`);
  $("#top-usuario").innerHTML = `<span>${esc(p.nombre)}</span> ▾`;
}
function renderMenu(sec) {
  let html = MENU[S.rol].map((k) => {
    const badge = k === "mensajes" && noLeidos().length ? `<span class="badge">${noLeidos().length}</span>`
      : k === "comunicados" && comunicadosPendientes().length ? `<span class="badge">${comunicadosPendientes().length}</span>` : "";
    const opcional = k === "tareas" ? ' <span class="chip warn" title="No incluido en la propuesta económica">opcional</span>' : "";
    return `<div class="item ${sec === k || (sec === "boletin" && k === "calificaciones") ? "activo" : ""}" onclick="location.hash='#/${k}'"><span>${SECCIONES[k].i}</span>${SECCIONES[k].t}${opcional}${badge}</div>`;
  }).join("");
  html += `<div class="item" style="margin-top:12px"><input placeholder="Buscar en mensajes" style="width:100%" onkeydown="if(event.key==='Enter'){location.hash='#/mensajes/recibidos/'+encodeURIComponent(this.value)}"></div>`;
  $("#menu").innerHTML = iconizar(html);
}
// Secciones que dependen del hijo elegido: muestran pestañas con los hijos arriba.
const TABS_HIJOS = ["materias", "tareas", "calificaciones", "cuotas"];
function tabsHijos(sec) {
  return `<div class="hijos-tabs no-print">${ROLES.familia.hijos.map((h) => `<button class="${h === S.hijo ? "activo" : ""}" onclick="elegirHijo('${h}','${sec}')">${av(h)}<b>${primerNombre(h)}</b> <span class="small muted">${esc(curso(cursoDeAlumno(h)).nombre)}</span></button>`).join("")}</div>`;
}
function elegirHijo(h, destino) { S.hijo = h; guardar(); if (location.hash === "#/" + destino) render(); else location.hash = "#/" + destino; }
function renderLogin() {
  $("#app").style.display = "none";
  $("#login").style.display = "";
}
function ingresar() { S.logueado = true; guardar(); location.hash = "#/inicio"; render(); }
function salir() { S.logueado = false; guardar(); render(); }

function togglePanel(id, html) {
  const viejo = document.querySelector(".panel-flotante");
  if (viejo) { viejo.remove(); if (viejo.dataset.id === id) return; }
  const el = document.createElement("div");
  el.className = "panel-flotante"; el.dataset.id = id; el.innerHTML = iconizar(html);
  $("#" + id).appendChild(el);
}
function panelNoLeidos() {
  const l = noLeidos();
  togglePanel("top-sobre", l.length ? l.slice(0, 6).map((m) => `<div class="item" onclick="location.hash='#/mensajes/ver/${m.id}'"><b>${esc(m.asunto)}</b><div class="small muted">${esc(nombre(m.de))} · ${fFechaHora(m.fecha)}</div></div>`).join("") : `<div class="item muted">No tenés mensajes sin leer.</div>`);
}
function panelUsuario() {
  const p = PERSONAS[yo()];
  togglePanel("top-usuario", `<div class="item" style="cursor:default"><b>${esc(p.nombre)}</b><div class="small muted">${esc(p.rol)}</div></div><div class="item" onclick="location.hash='#/perfil'">Perfil y preferencias</div><div class="item" onclick="location.hash='#/perfil';setTimeout(()=>document.getElementById('sesiones')?.scrollIntoView(),50)">Cerrar otras sesiones activas</div><div class="item" onclick="abrirRedactar({para:['s1'],asunto:'Consulta al administrador'})">Contactar al administrador</div><div class="item" onclick="salir()">Salir</div>`);
}
document.addEventListener("click", (e) => { if (!e.target.closest(".top-accion")) document.querySelector(".panel-flotante")?.remove(); });

// ───────────────────────── INICIO ─────────────────────────
function proximosEventos(dias = 21) {
  return eventosVisibles().filter((e) => diasHasta(e.fecha) >= 0 && diasHasta(e.fecha) <= dias).sort((a, b) => a.fecha.localeCompare(b.fecha));
}
function listaEventos(evs, max) {
  if (!evs.length) return `<p class="muted">No hay fechas próximas.</p>`;
  const l = max ? evs.slice(0, max) : evs;
  return `<table>${l.map((e) => { const d = diasHasta(e.fecha); return `<tr class="fila" onclick="verEvento('${e.id}')"><td style="width:80px;white-space:nowrap">${fDia(e.fecha)}</td><td>${esc(e.titulo)}<div><span class="chip et-${e.etiqueta}">${e.etiqueta}</span>${d === 0 ? '<span class="chip warn">Hoy</span>' : d === 1 ? '<span class="chip warn">Mañana</span>' : ""}</div></td></tr>`; }).join("")}</table>${max && evs.length > max ? `<a onclick="location.hash='#/calendario'">Ver las ${evs.length} fechas en el calendario →</a>` : ""}`;
}
function verEvento(id) {
  const e = eventosVisibles().find((x) => String(x.id) === String(id));
  if (!e) return;
  const d = new Date(e.fecha + "T12:00");
  const para = e.curso === "todos" ? "Todo el colegio" : e.curso.startsWith("personal:") ? "Solo yo (Mi calendario)" : curso(e.curso).nombre;
  modal(e.titulo, `<p><span class="chip et-${e.etiqueta}">${e.etiqueta}</span></p>
    <p><b>${DIAS_LARGO[d.getDay()][0].toUpperCase() + DIAS_LARGO[d.getDay()].slice(1)} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}</b> · todo el día</p>
    <p class="muted">Para: ${esc(para)}${e.autor ? ` · Cargado por ${esc(nombre(e.autor))}` : ""}</p>
    <div class="toolbar"><span class="sep"></span>${e.auto && MENU[S.rol].includes("tareas") ? `<button onclick="location.hash='#/tareas/${String(e.id).slice(1)}'">Ver la tarea</button>` : ""}<button class="primario" onclick="cerrarModal()">Cerrar</button></div>`);
}
function listaMensajes(ms) {
  return ms.length ? `<table>${ms.slice(0, 5).map((m) => `<tr class="fila ${noLeido(m) ? "no-leido" : ""}" onclick="location.hash='#/mensajes/ver/${m.id}'"><td>${noLeido(m) ? '<span class="punto"></span>' : ""}${esc(m.asunto)} ${m.adj.length ? "{{clip}}" : ""}<div class="small muted">${esc(nombre(m.de))} — ${esc(rolDe(m.de))}</div></td><td class="small muted" style="white-space:nowrap">${fDia(m.fecha)}</td></tr>`).join("")}</table>` : `<p class="muted">No tenés mensajes sin leer.</p>`;
}
function vInicio() {
  const r = S.rol;
  const sin = window.INICIO_SIN || []; // tarjetas que otra versión reemplaza por su propio resumen
  let h = `<h1 class="titulo-pagina">Hola, ${primerNombre(yo())}</h1><div class="grid inicio">`;
  if (r === "familia" || r === "alumno") {
    // La familia ve a todos sus hijos juntos en el inicio.
    const hijos = r === "familia" ? ROLES.familia.hijos : [yo()];
    const varios = hijos.length > 1;
    const pend = comunicadosPendientes();
    if (pend.length && !sin.includes("pendientes")) h += `<div class="panel" style="border-left:4px solid var(--rojo)"><h3>{{megafono}} Comunicados que requieren tu confirmación</h3>${pend.map((c) => `<p><a onclick="location.hash='#/comunicados/${c.id}'">${esc(c.titulo)}</a> <span class="small muted">${fFecha(c.fecha)}</span></p>`).join("")}</div>`;
    if (!sin.includes("mensajes")) h += `<div class="panel"><h3>{{sobre}} Mensajes sin leer (${noLeidos().length})</h3>${listaMensajes(noLeidos())}<a onclick="location.hash='#/mensajes'">Ir a la bandeja →</a></div>`;
    if (!sin.includes("entregas")) {
      const tp = hijos.flatMap((a) => tareasDeAlumno(a).filter((t) => estadoTarea(t, a).clave === "pendiente").map((t) => ({ t, a }))).sort((x, y) => x.t.entrega.localeCompare(y.t.entrega));
      h += `<div class="panel"><h3>{{tarea}} Próximas entregas</h3>${tp.length ? `<table>${tp.map(({ t, a }) => `<tr class="fila" onclick="S.hijo='${r === "familia" ? a : S.hijo}';guardar();location.hash='#/tareas/${t.id}'"><td style="width:80px;white-space:nowrap">${fDia(t.entrega)}</td><td>${esc(t.titulo)}<div class="small muted">${esc(materia(t.materia).nombre)}${varios ? " · " + primerNombre(a) : ""}</div></td></tr>`).join("")}</table>` : `<p class="muted">Nada pendiente.</p>`}</div>`;
    }
    h += `<div class="panel"><h3>{{calendario}} Próximas fechas</h3>${listaEventos(proximosEventos(), 6)}</div>`;
    if (r === "alumno") {
      const sig = S.contenidos.find((c) => c.obligatorio && !c.vistoPor.includes(yo()));
      h += `<div class="panel"><h3>{{play}} Retomar</h3>${sig ? `<p>Siguiente contenido pendiente:</p><p><a onclick="location.hash='#/materias/${sig.materia}/${sig.id}'"><b>${esc(sig.titulo)}</b></a><br><span class="small muted">${esc(materia(sig.materia).nombre)} · ${esc(sig.unidad)}</span></p>` : "<p>Estás al día con todos los contenidos.</p>"}</div>`;
    }
    const ult = REGIMEN.periodos.map((_, i) => i).filter((i) => S.publicado[i]).pop();
    hijos.forEach((a) => { h += `<div class="panel"><h3>{{grafico}} Calificaciones${varios ? " de " + primerNombre(a) : ""} — ${REGIMEN.periodos[ult]}</h3>${tablaMini(a, ult)}<a onclick="${r === "familia" ? `S.hijo='${a}';guardar();` : ""}location.hash='#/calificaciones'">Ver todas →</a></div>`; });
    if (r === "familia") h += `<div class="panel"><h3>{{tarjeta}} Cuotas</h3><p><span class="chip ok">Al día</span> Próximo vencimiento: 10/10/26</p><p class="small muted">Módulo existente de Búho Escuela (extranet de padres + MercadoPago).</p><a onclick="location.hash='#/cuotas'">Ver cuotas →</a></div>`;
  }
  if (r === "docente") {
    h += `<div class="panel"><h3>{{sobre}} Mensajes sin leer (${noLeidos().length})</h3>${listaMensajes(noLeidos())}<a onclick="location.hash='#/mensajes'">Ir a la bandeja →</a></div>`;
    const porCorregir = S.tareas.filter((t) => ROLES.docente.materias.includes(t.materia)).flatMap((t) => Object.entries(t.entregas).filter(([, e]) => e.nota == null).map(([al]) => ({ t, al })));
    h += `<div class="panel"><h3>{{tarea}} Entregas por corregir (${porCorregir.length})</h3>${porCorregir.length ? `<table>${porCorregir.map(({ t, al }) => `<tr class="fila" onclick="location.hash='#/tareas/${t.id}'"><td>${esc(nombre(al))}</td><td>${esc(t.titulo)}</td></tr>`).join("")}</table>` : "<p class='muted'>No hay entregas pendientes de corrección.</p>"}</div>`;
    h += `<div class="panel"><h3>{{grafico}} Carga de notas — ${REGIMEN.periodos[REGIMEN.periodoActual]}</h3><table>${ROLES.docente.materias.map((m) => { const p = progresoCarga("7B", m, REGIMEN.periodoActual); return `<tr class="fila" onclick="location.hash='#/calificaciones/${m}'"><td>${esc(materia(m).nombre)}</td><td style="width:45%"><div class="barra"><div style="width:${p}%"></div></div></td><td class="small">${p}%</td></tr>`; }).join("")}</table></div>`;
    h += `<div class="panel"><h3>{{calendario}} Próximas fechas</h3>${listaEventos(proximosEventos(), 6)}</div>`;
  }
  if (r === "secretaria") {
    h += `<div class="panel"><h3>{{megafono}} Confirmación de comunicados</h3><table>${S.comunicados.filter((c) => c.requiereConfirmacion).map((c) => { const t = familiasDeAlcance(c.alcance).length; return `<tr class="fila" onclick="location.hash='#/comunicados/${c.id}'"><td>${esc(c.titulo)}</td><td style="white-space:nowrap">${c.confirmados.length} / ${t}</td></tr>`; }).join("")}</table><button class="primario" onclick="location.hash='#/comunicados/nuevo'">{{mas}} Nuevo comunicado</button></div>`;
    h += `<div class="panel"><h3>{{sobre}} Mensajes sin leer (${noLeidos().length})</h3>${listaMensajes(noLeidos())}</div>`;
    h += `<div class="panel"><h3>{{grafico}} Carga de notas — ${REGIMEN.periodos[REGIMEN.periodoActual]}</h3><table>${CURSOS.map((c) => { const ms = materiasDeCurso(c.id); const p = Math.round(ms.reduce((s, m) => s + progresoCarga(c.id, m.id, REGIMEN.periodoActual), 0) / ms.length); return `<tr class="fila" onclick="location.hash='#/calificaciones'"><td>${esc(c.nombre)}</td><td style="width:45%"><div class="barra"><div style="width:${p}%"></div></div></td><td class="small">${p}%</td></tr>`; }).join("")}</table></div>`;
    h += `<div class="panel"><h3>{{calendario}} Agenda institucional</h3>${listaEventos(proximosEventos(30), 6)}</div>`;
  }
  return h + "</div>";
}
// ───────────────────────── MENSAJERÍA ─────────────────────────
function vMensajes(carpeta = "recibidos", arg) {
  if (carpeta === "ver") return vMensaje(+arg);
  const q = decodeURIComponent(arg || "");
  const criterio = S.criterio || "todo";
  const etq = S.filtroEtq || "";
  let lista = bandeja(carpeta);
  if (q) {
    const t = q.toLowerCase();
    lista = lista.filter((m) => {
      const de = (carpeta === "enviados" ? m.para.map(nombre).join(" ") : nombre(m.de)).toLowerCase();
      return criterio === "de" ? de.includes(t) : criterio === "asunto" ? m.asunto.toLowerCase().includes(t) : (m.asunto + " " + m.cuerpo + " " + de).toLowerCase().includes(t);
    });
  }
  if (etq) lista = lista.filter((m) => (m.etiquetas[yo()] || []).includes(etq));
  const nNo = noLeidos().length;
  return `
  <div class="toolbar">
    <button class="primario" onclick="abrirRedactar()">{{lapiz}} Redactar</button>
    <select onchange="S.filtroEtq=this.value;render()"><option value="">Etiquetas: Todas</option>${ETIQUETAS_MAIL.map((e) => `<option value="${e.id}" ${etq === e.id ? "selected" : ""}>${e.nombre}</option>`).join("")}</select>
    <span class="sep"></span>
    <input id="q" placeholder="Buscar" value="${esc(q)}" onkeydown="if(event.key==='Enter')location.hash='#/mensajes/${carpeta}/'+encodeURIComponent(this.value)">
    <select onchange="S.criterio=this.value"><option value="todo">Asunto + contenido</option><option value="de" ${criterio === "de" ? "selected" : ""}>${carpeta === "enviados" ? "Para" : "De"}</option><option value="asunto" ${criterio === "asunto" ? "selected" : ""}>Asunto</option></select>
    <button onclick="location.hash='#/mensajes/${carpeta}/'+encodeURIComponent(document.getElementById('q').value)">{{buscar}}</button>
  </div>
  <div class="tabs">
    ${[["recibidos", `Recibidos${nNo ? ` (${nNo})` : ""}`], ["enviados", "Enviados"], ["papelera", "Papelera"]].map(([k, t]) => `<button class="${carpeta === k ? "activo" : ""}" onclick="location.hash='#/mensajes/${k}'">${t}</button>`).join("")}
  </div>
  <div class="panel">
    <div class="toolbar"><label><input type="checkbox" onchange="document.querySelectorAll('.selm').forEach(c=>c.checked=this.checked)"> Seleccionar todos</label>
      <button class="peligro" onclick="accionMasiva('${carpeta === "papelera" ? "restaurar" : "eliminar"}')">${carpeta === "papelera" ? "Restaurar" : "{{papelera}} Eliminar"}</button>
      ${carpeta === "recibidos" ? `<button onclick="accionMasiva('noleido')">Marcar como no leído</button>` : ""}
      <span class="sep"></span><span class="small muted">${lista.length} mensajes</span></div>
    <table>${lista.map((m) => `<tr class="fila ${noLeido(m) ? "no-leido" : ""}">
      <td style="width:28px"><input type="checkbox" class="selm" value="${m.id}" onclick="event.stopPropagation()"></td>
      <td onclick="location.hash='#/mensajes/ver/${m.id}'" style="width:30%">${noLeido(m) ? '<span class="punto"></span>' : ""}${carpeta === "enviados" ? "Para: " + esc(resumenPara(m.para)) : esc(nombre(m.de)) + ` <span class="small muted">— ${esc(rolDe(m.de))}</span>`}</td>
      <td onclick="location.hash='#/mensajes/ver/${m.id}'">${(m.etiquetas[yo()] || []).map((e) => `<span class="chip" style="background:${ETIQUETAS_MAIL.find((x) => x.id === e).color}">${ETIQUETAS_MAIL.find((x) => x.id === e).nombre}</span>`).join("")}${esc(m.asunto)}</td>
      <td onclick="location.hash='#/mensajes/ver/${m.id}'" class="small muted" style="white-space:nowrap">${m.adj.length ? "{{clip}} " + m.adj[0].t : ""}</td>
      <td onclick="location.hash='#/mensajes/ver/${m.id}'" class="small" style="white-space:nowrap">${fFechaHora(m.fecha)}</td></tr>`).join("") || `<tr><td class="muted">No hay mensajes.</td></tr>`}</table>
  </div>`;
}
function resumenPara(ids) { return ids.length > 3 ? `${ids.slice(0, 2).map(nombre).join(", ")} y ${ids.length - 2} más` : ids.map(nombre).join(", "); }
function accionMasiva(acc) {
  const ids = [...document.querySelectorAll(".selm:checked")].map((c) => +c.value);
  if (!ids.length) return toast("Seleccioná al menos un mensaje");
  S.mensajes.forEach((m) => {
    if (!ids.includes(m.id)) return;
    if (acc === "eliminar") m.papelera[yo()] = true;
    if (acc === "restaurar") delete m.papelera[yo()];
    if (acc === "noleido") m.leidoPor = m.leidoPor.filter((u) => u !== yo());
  });
  guardar(); render();
  if (acc === "eliminar") toast(`${ids.length} mensaje(s) movido(s) a la papelera`, { t: "Deshacer", f: () => deshacerEliminar(ids) });
}
function eliminarMensaje(id) {
  S.mensajes.find((x) => x.id === id).papelera[yo()] = true;
  guardar(); location.hash = "#/mensajes";
  toast("Mensaje movido a la papelera", { t: "Deshacer", f: () => deshacerEliminar([id]) });
}
function deshacerEliminar(ids) {
  S.mensajes.forEach((m) => { if (ids.includes(m.id)) delete m.papelera[yo()]; });
  guardar(); render(); toast("Mensaje restaurado");
}
function filtrarDest(q) {
  q = q.trim().toLowerCase();
  document.querySelectorAll(".destinatarios label.persona").forEach((l) => { l.style.display = l.textContent.toLowerCase().includes(q) ? "" : "none"; });
}
function pintarSeleccion() {
  const sel = [...document.querySelectorAll(".dest:checked")];
  $("#r-sel").innerHTML = sel.length ? sel.slice(0, 8).map((c) => `<span class="chip">${esc(nombre(c.value))} <a onclick="document.querySelector('.dest[value=${c.value}]').checked=false;pintarSeleccion()">✕</a></span>`).join("") + (sel.length > 8 ? `<span class="chip">+${sel.length - 8} más</span>` : "") : `<span class="small muted">Todavía no elegiste destinatarios.</span>`;
}
function vMensaje(id) {
  const m = S.mensajes.find((x) => x.id === id);
  if (!m) return `<div class="panel">Mensaje no encontrado.</div>`;
  if (noLeido(m)) { m.leidoPor.push(yo()); guardar(); setTimeout(() => { renderTop("mensajes"); renderMenu("mensajes"); }); }
  const lista = bandeja(m.de === yo() ? "enviados" : "recibidos");
  const i = lista.findIndex((x) => x.id === id);
  const mis = m.etiquetas[yo()] || [];
  return `
  <div class="toolbar">
    <button onclick="history.back()">← Volver</button>
    <button class="primario" onclick="responder(${id},false)">{{responder}} Responder</button>
    <button onclick="responder(${id},true)">{{respondertodos}} Responder a todos</button>
    <button onclick="reenviar(${id})">{{reenviar}} Reenviar</button>
    <button class="peligro" onclick="eliminarMensaje(${id})">{{papelera}} Eliminar</button>
    <select onchange="etiquetar(${id},this.value)"><option value="">Etiquetar…</option>${ETIQUETAS_MAIL.map((e) => `<option value="${e.id}">${mis.includes(e.id) ? "✓ " : ""}${e.nombre}</option>`).join("")}</select>
    <span class="sep"></span>
    ${i > 0 ? `<button onclick="location.hash='#/mensajes/ver/${lista[i - 1].id}'">‹ Anterior</button>` : ""}
    <span class="small muted">${i + 1} de ${lista.length}</span>
    ${i < lista.length - 1 ? `<button onclick="location.hash='#/mensajes/ver/${lista[i + 1].id}'">Siguiente ›</button>` : ""}
  </div>
  <div class="panel">
    <div class="msg-head">
      <h2>${esc(m.asunto)}</h2>
      <div><b>De:</b> ${esc(nombre(m.de))} <span class="muted">— ${esc(rolDe(m.de))}</span></div>
      <div><b>Para:</b> ${m.para.map((p) => esc(nombre(p))).join(", ")}</div>
      <div class="small muted">${fFechaHora(m.fecha)}</div>
    </div>
    <div class="msg-cuerpo">${esc(m.cuerpo)}</div>
    ${m.adj.length ? `<div style="margin-top:16px">${m.adj.map((a) => `<span class="adjunto">{{clip}} ${esc(a.n)} <span class="small muted">${a.t}</span> <a onclick="toast('En la maqueta no se descargan archivos')">Descargar</a></span>`).join("")}</div>` : ""}
    ${S.rol !== "familia" && S.rol !== "alumno" && m.de === yo() ? `<p class="small muted" style="margin-top:16px">Leído por ${m.leidoPor.filter((u) => m.para.includes(u)).length} de ${m.para.length} destinatarios.</p>` : ""}
  </div>`;
}
function etiquetar(id, e) {
  if (!e) return;
  const m = S.mensajes.find((x) => x.id === id);
  const l = (m.etiquetas[yo()] = m.etiquetas[yo()] || []);
  l.includes(e) ? l.splice(l.indexOf(e), 1) : l.push(e);
  guardar(); render();
}
function responder(id, todos) {
  const m = S.mensajes.find((x) => x.id === id);
  const para = todos ? [...new Set([m.de, ...m.para])].filter((u) => u !== yo()) : [m.de === yo() ? m.para[0] : m.de];
  abrirRedactar({ para, asunto: m.asunto.startsWith("RE:") ? m.asunto : "RE: " + m.asunto, cuerpo: `\n\n--- El ${fFechaHora(m.fecha)}, ${nombre(m.de)} escribió:\n${m.cuerpo}` });
}
function reenviar(id) {
  const m = S.mensajes.find((x) => x.id === id);
  abrirRedactar({ para: [], asunto: "RV: " + m.asunto, cuerpo: `\n\n--- Mensaje reenviado de ${nombre(m.de)} (${fFechaHora(m.fecha)}):\n${m.cuerpo}`, adj: m.adj });
}

// Destinatarios disponibles por grupo según el rol.
function destinatariosPorGrupo() {
  const out = {};
  const cursoAlumnos = S.rol === "familia" ? cursoDeAlumno(S.hijo) : "7B";
  for (const g of GRUPOS_DESTINO[S.rol]) {
    let ids = Object.keys(PERSONAS).filter((id) => PERSONAS[id].grupo === g && id !== yo());
    if (g === "Alumnos") ids = ALUMNOS_CURSO[cursoAlumnos].filter((id) => id !== yo());
    out[g] = ids;
  }
  return out;
}
let borrador = null;
function abrirRedactar(pre = {}) {
  borrador = { para: pre.para || [], asunto: pre.asunto || "", cuerpo: pre.cuerpo || "", adj: pre.adj ? [...pre.adj] : [] };
  const grupos = destinatariosPorGrupo();
  const etiquetaGrupo = (g) => (g === "Alumnos" && S.rol === "alumno" ? "Compañeros" : g === "Alumnos" ? `Alumnos de ${curso("7B").nombre}` : g === "Familias" ? (S.rol === "docente" ? `Familias de ${curso("7B").nombre}` : "Familias") : g);
  modal("Enviar mensaje", `
    <div class="campo"><label>Para</label>
      <div id="r-sel" class="sel-chips"></div><input type="text" placeholder="Buscar persona…" oninput="filtrarDest(this.value)" style="width:100%;margin-bottom:6px"><div class="destinatarios" onchange="pintarSeleccion()">${Object.entries(grupos).map(([g, ids]) => `
        <div class="grupo"><label style="padding:0"><input type="checkbox" onchange="this.closest('.grupo').nextElementSibling.querySelectorAll('input').forEach(c=>c.checked=this.checked)"> ${etiquetaGrupo(g)} (${ids.length})</label></div>
        <div>${ids.map((id) => `<label class="persona"><input type="checkbox" class="dest" value="${id}" ${borrador.para.includes(id) ? "checked" : ""}> ${esc(nombre(id))} <span class="small muted">— ${esc(rolDe(id))}</span></label>`).join("")}</div>`).join("")}
      </div>
    </div>
    <div class="campo"><label>Asunto</label><input type="text" id="r-asunto" value="${esc(borrador.asunto)}"></div>
    <div class="campo"><label>Mensaje</label><div class="small muted" style="margin-bottom:4px">𝐁 𝐼 U̲ · color · listas · enlaces · imágenes (editor enriquecido en el producto final)</div><textarea id="r-cuerpo">${esc(borrador.cuerpo)}</textarea></div>
    <div class="campo"><label>Adjuntos</label>
      <div class="dropzone" ondragover="event.preventDefault()" ondrop="event.preventDefault();agregarAdjuntos(event.dataTransfer.files)">Arrastrá archivos acá o <a onclick="document.getElementById('r-file').click()">buscalos</a><input type="file" id="r-file" multiple hidden onchange="agregarAdjuntos(this.files)"></div>
      <div id="r-adj"></div>
    </div>
    ${S.rol === "secretaria" || S.rol === "docente" ? `<label class="small"><input type="checkbox" id="r-mail" checked> Avisar también por email a los destinatarios</label>` : ""}
    <div class="toolbar" style="margin-top:16px"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="enviarMensaje()">Enviar mensaje</button></div>`);
  pintarAdjuntos(); pintarSeleccion();
}
function agregarAdjuntos(files) {
  for (const f of files) borrador.adj.push({ n: f.name, t: (f.size / 1024).toFixed(1) + " KB" });
  pintarAdjuntos();
}
function pintarAdjuntos() {
  $("#r-adj").innerHTML = iconizar(borrador.adj.map((a, i) => `<span class="adjunto">{{clip}} ${esc(a.n)} <span class="small muted">${a.t}</span> <a onclick="borrador.adj.splice(${i},1);pintarAdjuntos()">✕</a></span>`).join(""));
}
function enviarMensaje() {
  const para = [...new Set([...document.querySelectorAll(".dest:checked")].map((c) => c.value))];
  const asunto = $("#r-asunto").value.trim();
  if (!para.length) return toast("Elegí al menos un destinatario");
  if (!asunto) return toast("Escribí un asunto");
  const id = Math.max(0, ...S.mensajes.map((m) => m.id)) + 1;
  const ahora = new Date();
  S.mensajes.push({ id, de: yo(), para, asunto, fecha: `${HOY}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`, adj: borrador.adj, cuerpo: $("#r-cuerpo").value, leidoPor: [], etiquetas: {}, papelera: {} });
  guardar(); cerrarModal(); toast(`Mensaje enviado a ${para.length} destinatario(s)`);
  location.hash = "#/mensajes/enviados"; render();
}

// ───────────────────────── modal ─────────────────────────
function modal(titulo, html) {
  cerrarModal();
  const f = document.createElement("div");
  f.className = "modal-fondo"; f.id = "modal";
  f.innerHTML = iconizar(`<div class="modal"><header><b>${esc(titulo)}</b><button onclick="cerrarModal()">✕</button></header><div class="cuerpo">${html}</div></div>`);
  document.body.appendChild(f);
}
function cerrarModal() { $("#modal")?.remove(); }

// ───────────────────────── COMUNICADOS ─────────────────────────
function familiasDeAlcance(alcance) {
  // En el producto real se resuelve con Inscripción + Grupo Familia de Búho.
  if (alcance.includes('4° Grado "A"')) return ["f1"];
  if (alcance.includes('7° Grado "B"')) return ["f1", "f2", "f3"];
  return ["f1", "f2", "f3"];
}
function comunicadoVisible(c) {
  if (S.rol === "secretaria" || S.rol === "docente") return true;
  const cs = cursosVisibles().map((id) => curso(id).nombre);
  return !c.alcance.includes("Grado") || cs.some((n) => c.alcance.includes(n));
}
function comunicadosPendientes() {
  if (S.rol !== "familia") return [];
  return S.comunicados.filter((c) => comunicadoVisible(c) && c.requiereConfirmacion && !c.confirmados.includes(yo()));
}
function vComunicados(id) {
  if (id === "nuevo") return vNuevoComunicado();
  if (id) return vComunicado(+id);
  const lista = S.comunicados.filter(comunicadoVisible).sort((a, b) => b.fecha.localeCompare(a.fecha));
  return `<h1 class="titulo-pagina">Comunicados</h1>
  ${S.rol === "secretaria" ? `<div class="toolbar"><button class="primario" onclick="location.hash='#/comunicados/nuevo'">{{mas}} Nuevo comunicado</button></div>` : ""}
  ${notaMaqueta("Comunicados = módulo Novedades de Búho (hoy sin desarrollar). Se publican por nivel o curso y pueden pedir confirmación de lectura (ej. autorizaciones).")}
  ${lista.map((c) => `<div class="panel fila" style="cursor:pointer" onclick="location.hash='#/comunicados/${c.id}'">
    <div class="toolbar" style="margin:0"><h3 style="margin:0">${esc(c.titulo)}</h3><span class="sep"></span>
    ${c.requiereConfirmacion ? (S.rol === "familia" ? (c.confirmados.includes(yo()) ? `<span class="chip ok">✓ Confirmado</span>` : `<span class="chip bad">Requiere confirmación</span>`) : `<span class="chip warn">Confirmados ${c.confirmados.length}/${familiasDeAlcance(c.alcance).length}</span>`) : ""}
    <span class="small muted">${fFecha(c.fecha)}</span></div>
    <p class="small muted">${esc(nombre(c.de))} · Para: ${esc(c.alcance)}</p><p>${esc(c.cuerpo.slice(0, 160))}${c.cuerpo.length > 160 ? "…" : ""}</p></div>`).join("")}`;
}
function vComunicado(id) {
  const c = S.comunicados.find((x) => x.id === id);
  if (!c) return `<div class="panel">Comunicado no encontrado.</div>`;
  const fams = familiasDeAlcance(c.alcance);
  return `<div class="toolbar"><button onclick="location.hash='#/comunicados'">← Comunicados</button></div>
  <div class="panel"><h2>${esc(c.titulo)}</h2><p class="small muted">${esc(nombre(c.de))} — ${esc(rolDe(c.de))} · ${fFecha(c.fecha)} · Para: ${esc(c.alcance)}</p>
  <div class="msg-cuerpo">${esc(c.cuerpo)}</div>
  ${c.requiereConfirmacion && S.rol === "familia" ? (c.confirmados.includes(yo()) ? `<p><span class="chip ok">✓ Confirmaste la lectura</span></p>` : `<p><button class="primario" onclick="confirmarComunicado(${c.id})">✓ Confirmo que leí este comunicado</button></p>`) : ""}
  </div>
  ${(S.rol === "secretaria" || S.rol === "docente") && c.requiereConfirmacion ? `<div class="panel"><h3>Seguimiento de lectura</h3><table>${fams.map((f) => `<tr><td>${esc(nombre(f))}</td><td class="small muted">${esc(rolDe(f))}</td><td>${c.confirmados.includes(f) ? '<span class="chip ok">Confirmó</span>' : '<span class="chip bad">Pendiente</span>'}</td></tr>`).join("")}</table><button onclick="toast('Recordatorio enviado a las familias pendientes')">Enviar recordatorio a pendientes</button></div>` : ""}`;
}
function confirmarComunicado(id) { S.comunicados.find((c) => c.id === id).confirmados.push(yo()); guardar(); render(); toast("Lectura confirmada"); }
function vNuevoComunicado() {
  return `<div class="toolbar"><button onclick="location.hash='#/comunicados'">← Comunicados</button></div>
  <div class="panel"><h2>Nuevo comunicado</h2>
  <div class="campo"><label>Título</label><input type="text" id="c-tit"></div>
  <div class="campo"><label>Destinatarios</label><select id="c-alc"><option>Todo el colegio</option><option>Nivel Primario</option><option>Nivel Secundario</option>${CURSOS.map((c) => `<option>${esc(c.nombre)}</option>`).join("")}</select></div>
  <div class="campo"><label>Texto</label><textarea id="c-cue"></textarea></div>
  <div class="campo"><label>Adjuntos</label><div class="dropzone">Arrastrá archivos acá (PDF, imágenes)</div></div>
  <p><label><input type="checkbox" id="c-conf"> Pedir confirmación de lectura a las familias</label><br>
  <label><input type="checkbox" checked> Avisar también por email</label><br>
  <label><input type="checkbox"> Agregar al calendario el día <input type="date" value="${HOY}"></label></p>
  <div class="toolbar"><span class="sep"></span><button onclick="location.hash='#/comunicados'">Cancelar</button><button class="primario" onclick="publicarComunicado()">Publicar</button></div></div>`;
}
function publicarComunicado() {
  const titulo = $("#c-tit").value.trim();
  if (!titulo) return toast("Falta el título");
  const id = Math.max(0, ...S.comunicados.map((c) => c.id)) + 1;
  S.comunicados.push({ id, de: yo(), titulo, fecha: HOY, alcance: $("#c-alc").value, cuerpo: $("#c-cue").value, requiereConfirmacion: $("#c-conf").checked, confirmados: [] });
  guardar(); toast("Comunicado publicado"); location.hash = `#/comunicados/${id}`;
}

// ───────────────────────── MATERIAS Y CONTENIDOS ─────────────────────────
function avance(alumno, mat) {
  const obl = S.contenidos.filter((c) => c.materia === mat && c.obligatorio);
  if (!obl.length) return null;
  return Math.round((obl.filter((c) => c.vistoPor.includes(alumno)).length / obl.length) * 100);
}
function materiasDelUsuario() {
  if (S.rol === "docente") return MATERIAS.filter((m) => ROLES.docente.materias.includes(m.id));
  return materiasDeCurso(cursoDeAlumno(alumnoFoco()));
}
function vMaterias(mat, cont) {
  if (mat && cont) return vContenido(mat, +cont);
  if (mat) return vMateria(mat);
  const a = alumnoFoco();
  const card = (m) => {
    const p = a ? avance(a, m.id) : null;
    const n = S.contenidos.filter((c) => c.materia === m.id).length;
    return `<div class="panel materia-card" onclick="location.hash='#/materias/${m.id}'"><h3>${esc(m.nombre)}</h3><p class="small muted">${esc(nombre(m.docente))} · ${n} contenido(s)</p>${p == null ? (a ? '<p class="small muted">Sin contenidos obligatorios</p>' : "") : `<div class="barra"><div style="width:${p}%"></div></div><p class="small">${p}% completado</p>`}</div>`;
  };
  const ms = materiasDelUsuario();
  const troncales = ms.filter((m) => m.tipo === "troncal"), especiales = ms.filter((m) => m.tipo === "especial");
  return `<h1 class="titulo-pagina">Materias y contenidos${S.rol === "familia" ? " — " + esc(nombre(a)) : ""}</h1>
  ${S.rol === "familia" ? notaMaqueta("La familia ve el material y el avance de su hijo/a en modo lectura.") : ""}
  <h3>Materias troncales</h3><div class="grid">${troncales.map(card).join("")}</div>
  ${especiales.length ? `<h3>Materias especiales</h3><div class="grid">${especiales.map(card).join("")}</div>` : ""}`;
}
function vMateria(mat) {
  const m = materia(mat);
  const a = alumnoFoco();
  const filtro = S.filtroObl || "todos";
  const cs = S.contenidos.filter((c) => c.materia === mat && (filtro === "todos" || (filtro === "obl") === c.obligatorio));
  const unidades = [...new Set(cs.map((c) => c.unidad))];
  const icono = { texto: "{{archivo}}", archivo: "{{clip}}", video: "{{video}}", enlace: "{{enlace}}" };
  const total = ALUMNOS_CURSO["7B"].length;
  return `<div class="toolbar"><button onclick="location.hash='#/materias'">← Materias</button><h2 style="margin:0 12px">${esc(m.nombre)}</h2><span class="sep"></span>
    <select onchange="S.filtroObl=this.value;render()"><option value="todos">Todos</option><option value="obl" ${filtro === "obl" ? "selected" : ""}>Obligatorios</option><option value="opc" ${filtro === "opc" ? "selected" : ""}>Opcionales</option></select>
    ${S.rol === "docente" ? `<button class="primario" onclick="nuevoContenido('${mat}')">{{mas}} Agregar contenido</button>` : ""}</div>
  ${a && avance(a, mat) != null ? `<div class="panel"><div class="barra"><div style="width:${avance(a, mat)}%"></div></div><p class="small">${avance(a, mat)}% de los contenidos obligatorios vistos</p></div>` : ""}
  ${unidades.map((u) => `<div class="panel"><h3>${esc(u)}</h3><table>${cs.filter((c) => c.unidad === u).map((c) => `<tr class="fila" onclick="location.hash='#/materias/${mat}/${c.id}'">
    <td style="width:28px">${a ? (c.vistoPor.includes(a) ? "{{hecho}}" : "{{circulo}}") : icono[c.tipo]}</td>
    <td>${a ? icono[c.tipo] + " " : ""}${esc(c.titulo)} <span class="chip ${c.obligatorio ? "" : "ok"}">${c.obligatorio ? "Obligatorio" : "Opcional"}</span></td>
    <td class="small muted" style="white-space:nowrap">${fFecha(c.fecha)}</td>
    ${S.rol === "docente" ? `<td class="small" style="white-space:nowrap">Visto por ${c.vistoPor.length}/${total}</td>` : ""}</tr>`).join("")}</table></div>`).join("") || `<div class="panel muted">Todavía no hay contenidos en esta materia.</div>`}`;
}
function vContenido(mat, id) {
  const c = S.contenidos.find((x) => x.id === id);
  if (!c) return `<div class="panel">Contenido no encontrado.</div>`;
  if (S.rol === "alumno" && !c.vistoPor.includes(yo())) { c.vistoPor.push(yo()); guardar(); }
  const sig = S.contenidos.find((x) => x.materia === mat && x.id > id);
  let cuerpo = "";
  if (c.tipo === "texto") cuerpo = `<div class="msg-cuerpo">${esc(c.cuerpo)}</div><div class="nota-maqueta" style="margin-top:16px">{{info}} Idea clave: en el producto final el docente arma el contenido con editor enriquecido (cuadros destacados, imágenes, videos embebidos).</div>`;
  if (c.tipo === "video") cuerpo = `<div style="background:#222;color:#fff;aspect-ratio:16/9;max-width:640px;display:grid;place-items:center">{{play}} Video embebido</div><p>${esc(c.cuerpo)}</p>`;
  if (c.tipo === "archivo") cuerpo = `<span class="adjunto">{{clip}} ${esc(c.archivo)} <a onclick="toast('En la maqueta no se descargan archivos')">Descargar</a></span>`;
  if (c.tipo === "enlace") cuerpo = `<p>{{enlace}} <a>${esc(c.url)}</a></p>`;
  return `<div class="toolbar"><button onclick="location.hash='#/materias/${mat}'">← ${esc(materia(mat).nombre)}</button><span class="sep"></span>${sig ? `<button class="primario" onclick="location.hash='#/materias/${mat}/${sig.id}'">Siguiente ›</button>` : ""}</div>
  <div class="panel"><p class="small muted">${esc(materia(mat).nombre)} › ${esc(c.unidad)}</p><h2>${esc(c.titulo)}</h2>${cuerpo}
  ${S.rol === "alumno" ? `<p class="small" style="margin-top:16px"><span class="chip ok">✓ Marcado como visto</span></p>` : ""}</div>`;
}
function nuevoContenido(mat) {
  const unidades = [...new Set(S.contenidos.filter((c) => c.materia === mat).map((c) => c.unidad))];
  modal("Agregar contenido — " + materia(mat).nombre, `
    <div class="campo"><label>Unidad / tema</label><input type="text" id="n-uni" list="unis" value="${esc(unidades[0] || "Unidad 1")}"><datalist id="unis">${unidades.map((u) => `<option>${esc(u)}</option>`).join("")}</datalist></div>
    <div class="campo"><label>Título</label><input type="text" id="n-tit"></div>
    <div class="campo"><label>Tipo</label><select id="n-tipo"><option value="texto">Texto / clase</option><option value="archivo">Archivo</option><option value="video">Video</option><option value="enlace">Enlace</option></select></div>
    <div class="campo"><label>Contenido</label><textarea id="n-cue"></textarea></div>
    <div class="campo"><label>Archivo (si corresponde)</label><div class="dropzone">Arrastrá el archivo acá</div></div>
    <p><label><input type="checkbox" id="n-obl" checked> Obligatorio (cuenta para el avance)</label><br><label><input type="checkbox" checked> Avisar a alumnos y familias por mensaje</label></p>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarContenido('${mat}')">Publicar</button></div>`);
}
function guardarContenido(mat) {
  const titulo = $("#n-tit").value.trim();
  if (!titulo) return toast("Falta el título");
  const tipo = $("#n-tipo").value;
  S.contenidos.push({ id: Math.max(0, ...S.contenidos.map((c) => c.id)) + 1, materia: mat, unidad: $("#n-uni").value, titulo, tipo, obligatorio: $("#n-obl").checked, fecha: HOY, cuerpo: $("#n-cue").value, archivo: "archivo.pdf", url: "https://", vistoPor: [] });
  guardar(); cerrarModal(); render(); toast("Contenido publicado");
}

// ───────────────────────── TAREAS (opcional) ─────────────────────────
function tareasDeAlumno(a) { const ms = materiasDeCurso(cursoDeAlumno(a)).map((m) => m.id); return S.tareas.filter((t) => ms.includes(t.materia) && cursoDeAlumno(a) === "7B"); }
function estadoTarea(t, a) {
  const e = t.entregas[a];
  if (e && e.nota != null) return { clave: "corregida", html: `<span class="chip ok">Corregida · ${e.nota}</span>` };
  if (e) return { clave: "entregada", html: `<span class="chip ok">Entregada${e.fecha > t.entrega ? " con retraso" : ""}</span>` };
  if (diasHasta(t.entrega) < 0) return { clave: "atrasada", html: `<span class="chip bad">Sin entregar (vencida)</span>` };
  return { clave: "pendiente", html: `<span class="chip warn">Pendiente</span>` };
}
function vTareas(id) {
  const aviso = notaMaqueta("Tareas con entrega privada: recomendación del relevamiento (hoy los alumnos suben trabajos a Archivos y los ven todos). <b>No está incluida en la propuesta económica</b>; se muestra como opcional.");
  if (S.rol === "docente") return id ? vTareaDocente(+id) : vTareasDocente(aviso);
  const a = alumnoFoco();
  if (id) return vTareaAlumno(+id, a);
  const filtro = S.filtroTarea || "todas";
  const lista = tareasDeAlumno(a).filter((t) => filtro === "todas" || estadoTarea(t, a).clave === filtro).sort((x, y) => x.entrega.localeCompare(y.entrega));
  return `<h1 class="titulo-pagina">Tareas y entregas${S.rol === "familia" ? " — " + esc(nombre(a)) : ""}</h1>${aviso}
  <div class="tabs">${[["todas", "Todas"], ["pendiente", "Pendientes"], ["atrasada", "Vencidas"], ["entregada", "Entregadas"], ["corregida", "Corregidas"]].map(([k, t]) => `<button class="${filtro === k ? "activo" : ""}" onclick="S.filtroTarea='${k}';render()">${t}</button>`).join("")}</div>
  <div class="panel"><table><tr><th>Tarea</th><th>Materia</th><th>Entrega</th><th>Estado</th></tr>${lista.map((t) => `<tr class="fila" onclick="location.hash='#/tareas/${t.id}'"><td>${esc(t.titulo)}</td><td>${esc(materia(t.materia).nombre)}</td><td style="white-space:nowrap">${fFecha(t.entrega)} <div class="small muted">${cuandoTexto(t.entrega)}</div></td><td>${estadoTarea(t, a).html}</td></tr>`).join("") || `<tr><td class="muted">${cursoDeAlumno(a) === "7B" ? "No hay tareas en este filtro." : "Sin tareas cargadas para este curso."}</td></tr>`}</table></div>`;
}
function vTareaAlumno(id, a) {
  const t = S.tareas.find((x) => x.id === id);
  const e = t.entregas[a];
  return `<div class="toolbar"><button onclick="location.hash='#/tareas'">← Tareas</button></div>
  <div class="panel"><p class="small muted">${esc(materia(t.materia).nombre)} · ${esc(nombre(materia(t.materia).docente))}</p><h2>${esc(t.titulo)}</h2>
  <p><b>Fecha de entrega:</b> ${fFecha(t.entrega)} (${cuandoTexto(t.entrega)}) ${estadoTarea(t, a).html}</p><div class="msg-cuerpo">${esc(t.consigna)}</div></div>
  <div class="panel"><h3>Mi entrega</h3><p class="small muted">{{candado}} Solo la ve el docente.</p>
  ${e ? `<span class="adjunto">{{clip}} ${esc(e.archivo)}</span><p class="small muted">Entregado el ${fFecha(e.fecha)}</p>${e.nota != null ? `<p><b>Nota:</b> ${e.nota}</p><p><b>Devolución:</b> ${esc(e.devolucion || "")}</p>` : ""}`
    : S.rol === "alumno" ? `<div class="dropzone">Arrastrá tu archivo o una foto de la carpeta, o <a onclick="document.getElementById('t-file').click()">buscalo</a><input type="file" id="t-file" hidden onchange="entregarTarea(${t.id},this.files[0])"></div>` : `<p class="muted">Todavía no entregó.</p>`}</div>`;
}
function entregarTarea(id, f) {
  if (!f) return;
  S.tareas.find((t) => t.id === id).entregas[yo()] = { fecha: HOY, archivo: f.name, nota: null };
  guardar(); render(); toast("Tarea entregada");
}
function vTareasDocente(aviso) {
  const lista = S.tareas.filter((t) => ROLES.docente.materias.includes(t.materia));
  const total = ALUMNOS_CURSO["7B"].length;
  return `<h1 class="titulo-pagina">Tareas y entregas</h1>${aviso}
  <div class="toolbar"><button class="primario" onclick="nuevaTarea()">{{mas}} Nueva tarea</button></div>
  <div class="panel"><table><tr><th>Tarea</th><th>Materia</th><th>Entrega</th><th>Entregaron</th><th>Por corregir</th></tr>${lista.map((t) => { const es = Object.values(t.entregas); return `<tr class="fila" onclick="location.hash='#/tareas/${t.id}'"><td>${esc(t.titulo)}</td><td>${esc(materia(t.materia).nombre)}</td><td>${fFecha(t.entrega)}</td><td>${es.length}/${total}</td><td>${es.filter((e) => e.nota == null).length}</td></tr>`; }).join("")}</table></div>`;
}
function vTareaDocente(id) {
  const t = S.tareas.find((x) => x.id === id);
  return `<div class="toolbar"><button onclick="location.hash='#/tareas'">← Tareas</button></div>
  <div class="panel"><p class="small muted">${esc(materia(t.materia).nombre)} · Entrega ${fFecha(t.entrega)}</p><h2>${esc(t.titulo)}</h2><p>${esc(t.consigna)}</p></div>
  <div class="panel"><h3>Entregas</h3><table><tr><th>Alumno</th><th>Estado</th><th>Archivo</th><th class="num">Nota</th><th>Devolución</th></tr>
  ${ALUMNOS_CURSO["7B"].map((a) => { const e = t.entregas[a]; return `<tr><td>${esc(nombre(a))}</td><td>${estadoTarea(t, a).html}</td><td>${e ? "{{clip}} " + esc(e.archivo) : "—"}</td>
    <td class="num">${e ? `<input type="number" min="1" max="10" style="width:60px" value="${e.nota ?? ""}" onchange="S.tareas.find(x=>x.id===${id}).entregas['${a}'].nota=this.value?+this.value:null;guardar()">` : ""}</td>
    <td>${e ? `<input style="width:100%" value="${esc(e.devolucion || "")}" onchange="S.tareas.find(x=>x.id===${id}).entregas['${a}'].devolucion=this.value;guardar()">` : ""}</td></tr>`; }).join("")}</table>
  <div class="toolbar" style="margin-top:12px"><span class="sep"></span><button class="primario" onclick="render();toast('Correcciones guardadas y devueltas a los alumnos')">Guardar y devolver</button></div></div>`;
}
function nuevaTarea() {
  modal("Nueva tarea", `
    <div class="campo"><label>Materia</label><select id="t-mat">${ROLES.docente.materias.map((m) => `<option value="${m}">${esc(materia(m).nombre)}</option>`).join("")}</select></div>
    <div class="campo"><label>Título</label><input type="text" id="t-tit"></div>
    <div class="campo"><label>Consigna</label><textarea id="t-con"></textarea></div>
    <div class="campo"><label>Fecha de entrega (obligatoria)</label><input type="date" id="t-fec" value="${HOY}"></div>
    <p class="small muted">La fecha aparece sola en el calendario del curso y en "Próximas entregas" de alumnos y familias.</p>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarTarea()">Publicar</button></div>`);
}
function guardarTarea() {
  const titulo = $("#t-tit").value.trim();
  if (!titulo || !$("#t-fec").value) return toast("Completá título y fecha de entrega");
  S.tareas.push({ id: Math.max(0, ...S.tareas.map((t) => t.id)) + 1, materia: $("#t-mat").value, titulo, consigna: $("#t-con").value, entrega: $("#t-fec").value, entregas: {} });
  guardar(); cerrarModal(); render(); toast("Tarea publicada");
}

// ───────────────────────── CALIFICACIONES ─────────────────────────
function nota(a, m, p) { return ((S.notas[a] || {})[m] || [])[p] ?? null; }
function progresoCarga(c, m, p) { const al = ALUMNOS_CURSO[c]; return Math.round((al.filter((a) => nota(a, m, p) != null).length / al.length) * 100); }
function promedio(vals) { const v = vals.filter((x) => x != null); return v.length ? (v.reduce((s, x) => s + x, 0) / v.length).toFixed(1) : "—"; }
function celdaNota(n, rotulo) { return `<td class="num ${n != null && n < REGIMEN.aprobacion ? "desaprobado" : ""}"${typeof rotulo === "string" ? ` data-label="${rotulo}"` : ""}>${n ?? "—"}</td>`; }
function tablaMini(a, p) {
  const ms = materiasDeCurso(cursoDeAlumno(a)).filter((m) => nota(a, m.id, p) != null);
  return ms.length ? `<table>${ms.slice(0, 6).map((m) => `<tr><td>${esc(m.nombre)}</td>${celdaNota(nota(a, m.id, p))}</tr>`).join("")}</table>` : "<p class='muted'>Sin notas publicadas.</p>";
}
function vCalificaciones(arg) {
  if (S.rol === "docente") return vCargaNotas(arg);
  if (S.rol === "secretaria") return vNotasSecretaria();
  const a = alumnoFoco();
  const ms = materiasDeCurso(cursoDeAlumno(a));
  const vis = (p) => S.publicado[p];
  return `<h1 class="titulo-pagina">Calificaciones — ${esc(nombre(a))}</h1>
  ${notaMaqueta(`Régimen a definir con la escuela. Se muestra: ${REGIMEN.escala}, por bimestre. Solo se ven los períodos que la escuela publicó.`)}
  <div class="toolbar"><span class="sep"></span><button class="primario" onclick="location.hash='#/boletin/${a}'">{{archivo}} Ver / descargar boletín</button></div>
  <div class="panel"><table class="tabla-notas"><tr><th>Materia</th>${REGIMEN.periodos.map((p) => `<th class="num">${p}</th>`).join("")}<th class="num">Promedio</th></tr>
  ${ms.map((m) => { const ns = REGIMEN.periodos.map((_, i) => (vis(i) ? nota(a, m.id, i) : null)); return `<tr><td>${esc(m.nombre)}<div class="small muted">${esc(nombre(m.docente))}</div></td>${ns.map((n, i) => celdaNota(n, REGIMEN.periodos[i])).join("")}<td class="num" data-label="Promedio"><b>${promedio(ns)}</b></td></tr>`; }).join("")}</table>
  <p class="small muted">Las notas en rojo están por debajo de ${REGIMEN.aprobacion}.</p></div>`;
}
function vCargaNotas(mat) {
  mat = mat || ROLES.docente.materias[0];
  const p = S.periodoCarga ?? REGIMEN.periodoActual;
  const al = ALUMNOS_CURSO["7B"];
  return `<h1 class="titulo-pagina">Carga de calificaciones</h1>
  <div class="toolbar">
    <select onchange="location.hash='#/calificaciones/'+this.value">${ROLES.docente.materias.map((m) => `<option value="${m}" ${m === mat ? "selected" : ""}>${esc(materia(m).nombre)}</option>`).join("")}</select>
    <select><option>${esc(curso("7B").nombre)}</option></select>
    <select onchange="S.periodoCarga=+this.value;render()">${REGIMEN.periodos.map((x, i) => `<option value="${i}" ${i === p ? "selected" : ""}>${x}</option>`).join("")}</select>
    <span class="sep"></span>${S.publicado[p] ? '<span class="chip ok">Publicado a las familias</span>' : '<span class="chip warn">Borrador — no visible a familias</span>'}
  </div>
  <div class="panel"><p class="small muted">La lista de alumnos sale de la inscripción en Búho. Escala: ${REGIMEN.escala}.</p>
  <table><tr><th>Alumno</th>${REGIMEN.periodos.map((x, i) => `<th class="num">${x}</th>`).join("")}<th>Observación</th></tr>
  ${al.map((a) => `<tr><td>${esc(nombre(a))}</td>${REGIMEN.periodos.map((_, i) => i === p ? `<td class="num"><input type="number" min="1" max="10" class="nota-in" style="width:64px" value="${nota(a, mat, i) ?? ""}" onfocus="this.select()" onkeydown="siguienteNota(event,this)" onchange="setNota('${a}','${mat}',${i},this.value)"></td>` : celdaNota(nota(a, mat, i))).join("")}<td><input style="width:100%" placeholder="Opcional"></td></tr>`).join("")}</table>
  <div class="toolbar" style="margin-top:12px"><span class="small muted" id="estado-carga">${progresoCarga("7B", mat, p)}% cargado · los cambios se guardan solos · Enter pasa al alumno siguiente</span><span class="sep"></span><button class="primario" onclick="S.publicado[${p}]=true;guardar();render();toast('Notas publicadas: alumnos y familias ya las ven')">Publicar ${REGIMEN.periodos[p]}</button></div></div>`;
}
function setNota(a, m, p, v) {
  S.notas[a] = S.notas[a] || {}; S.notas[a][m] = S.notas[a][m] || [null, null, null, null];
  const n = v === "" ? null : Math.max(1, Math.min(10, +v));
  S.notas[a][m][p] = n; guardar();
  const el = $("#estado-carga");
  if (el) el.innerHTML = `${progresoCarga("7B", m, p)}% cargado · <b>guardado ✓</b>`;
}
// Enter en una nota pasa al alumno siguiente.
function siguienteNota(e, input) {
  if (e.key !== "Enter") return;
  e.preventDefault();
  const l = [...document.querySelectorAll(".nota-in")];
  input.blur(); (l[l.indexOf(input) + 1] || input).focus();
}
function vNotasSecretaria() {
  const c = S.cursoSec || "7B";
  const p = REGIMEN.periodoActual;
  return `<h1 class="titulo-pagina">Calificaciones y boletines</h1>
  <div class="toolbar"><select onchange="S.cursoSec=this.value;render()">${CURSOS.map((x) => `<option value="${x.id}" ${x.id === c ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select><span class="sep"></span><button onclick="toast('En el producto: genera un PDF con todos los boletines del curso')">{{archivo}} Boletines del curso (PDF)</button></div>
  <div class="panel"><h3>Estado de carga — ${REGIMEN.periodos[p]}</h3><table>${materiasDeCurso(c).map((m) => { const x = progresoCarga(c, m.id, p); return `<tr><td>${esc(m.nombre)}</td><td class="small muted">${esc(nombre(m.docente))}</td><td style="width:35%"><div class="barra"><div style="width:${x}%"></div></div></td><td>${x}%</td><td>${x < 100 ? `<a onclick="abrirRedactar({para:['${m.docente}'],asunto:'Carga de notas ${REGIMEN.periodos[p]} — ${m.nombre}'})">Recordar</a>` : "✓"}</td></tr>`; }).join("")}</table></div>
  <div class="panel"><h3>Alumnos</h3><table><tr><th>Alumno</th><th class="num">Promedio general</th><th></th></tr>${ALUMNOS_CURSO[c].map((a) => { const ns = materiasDeCurso(c).flatMap((m) => [0, 1, 2, 3].map((i) => nota(a, m.id, i))); return `<tr><td>${esc(nombre(a))}</td><td class="num">${promedio(ns)}</td><td><a onclick="location.hash='#/boletin/${a}'">Ver boletín</a></td></tr>`; }).join("")}</table></div>`;
}
function vBoletin(a) {
  const c = cursoDeAlumno(a);
  const ms = materiasDeCurso(c);
  const vis = (p) => S.rol === "secretaria" || S.rol === "docente" || S.publicado[p];
  return `<div class="toolbar no-print"><button onclick="history.back()">← Volver</button><span class="sep"></span><button class="primario" onclick="window.print()">{{imprimir}} Imprimir / guardar PDF</button></div>
  ${notaMaqueta("Formato genérico. Se reemplaza por el modelo de boletín que usa la escuela.")}
  <div class="boletin"><div style="display:flex;align-items:center;gap:12px;justify-content:center"><div class="logo">${COLEGIO.sigla}</div><div><h1>${esc(COLEGIO.nombre)}</h1><div style="text-align:center" class="small">Boletín de calificaciones · Ciclo lectivo ${COLEGIO.ciclo}</div></div></div>
  <div class="enc"><div><b>Alumno/a:</b> ${esc(nombre(a))}</div><div><b>Curso:</b> ${esc(curso(c).nombre)} — Nivel ${esc(curso(c).nivel)}</div></div>
  <table><tr><th>Espacio curricular</th>${REGIMEN.periodos.map((p) => `<th class="num">${p}</th>`).join("")}<th class="num">Promedio</th></tr>
  ${ms.map((m) => { const ns = REGIMEN.periodos.map((_, i) => (vis(i) ? nota(a, m.id, i) : null)); return `<tr><td>${esc(m.nombre)}</td>${ns.map(celdaNota).join("")}<td class="num"><b>${promedio(ns)}</b></td></tr>`; }).join("")}</table>
  <p class="small">Escala: ${REGIMEN.escala}.</p>
  <div style="display:flex;justify-content:space-around;margin-top:60px" class="small"><div>_____________________<br>Firma docente</div><div>_____________________<br>Firma dirección</div><div>_____________________<br>Firma tutor/a</div></div></div>`;
}

// ───────────────────────── CALENDARIO ─────────────────────────
function eventosVisibles() {
  const cs = cursosVisibles();
  const evs = S.eventos.filter((e) => e.curso === "todos" || cs.includes(e.curso) || e.curso === "personal:" + yo());
  // Las fechas de entrega de las tareas aparecen solas (lección de Classroom).
  const tareas = S.tareas.filter(() => cs.includes("7B")).map((t) => ({ id: "t" + t.id, titulo: `Entrega: ${t.titulo} (${materia(t.materia).nombre})`, fecha: t.entrega, etiqueta: "Entrega", curso: "7B", auto: true }));
  return [...evs, ...tareas];
}
function vCalendario() {
  const [y, m] = S.calMes.split("-").map(Number);
  const evs = eventosVisibles();
  // En pantallas angostas la grilla mensual no se lee: se abre en lista salvo que el usuario elija otra.
  const vista = S.calVistaElegida ? S.calVista : window.innerWidth <= 800 ? "lista" : S.calVista;
  const head = `<div class="toolbar">
    <button class="primario" onclick="nuevoEvento()">{{mas}} Agregar</button>
    <button onclick="exportarIcal()">{{descargar}} Exportar iCal</button>
    <button onclick="moverMes(-1)">{{izq}}</button><button onclick="moverMes(1)">{{der}}</button><button onclick="S.calMes=HOY.slice(0,7);guardar();render()">Hoy</button>
    <span class="sep"></span>
    <select onchange="S.calVista=this.value;S.calVistaElegida=true;guardar();render()"><option value="mensual">Vista: Mensual</option><option value="lista" ${vista === "lista" ? "selected" : ""}>Vista: Lista</option></select></div>`;
  const leyenda = `<p class="small">${["Examen", "Entrega", "Importante", "Reunión", "Feriado"].map((e) => `<span class="chip et-${e}">${e}</span>`).join("")}</p>`;
  if (vista === "lista") {
    const desde = `${S.calMes}-01`;
    const l = evs.filter((e) => e.fecha >= desde).sort((a, b) => a.fecha.localeCompare(b.fecha));
    return head + `<div class="panel"><h3>Desde el 1 de ${MESES[m - 1]} ${y}</h3>${listaEventos(l)}</div>`;
  }
  const primero = new Date(y, m - 1, 1).getDay();
  const dias = new Date(y, m, 0).getDate();
  let celdas = DIAS_LARGO.map((d) => `<div class="dow">${d}</div>`).join("");
  for (let i = 0; i < primero; i++) celdas += `<div class="fuera"></div>`;
  for (let d = 1; d <= dias; d++) {
    const f = `${S.calMes}-${String(d).padStart(2, "0")}`;
    celdas += `<div class="${f === HOY ? "hoy" : ""}"><div class="dia">${d}</div>${evs.filter((e) => e.fecha === f).map((e) => `<span class="ev et-${e.etiqueta}" title="${esc(e.titulo)}" onclick="verEvento('${e.id}')">${esc(e.titulo)}</span>`).join("")}</div>`;
  }
  for (let i = 0; i < (7 - ((primero + dias) % 7)) % 7; i++) celdas += `<div class="fuera"></div>`;
  return head + `<div class="panel"><h3>${MESES[m - 1][0].toUpperCase() + MESES[m - 1].slice(1)} ${y}</h3><div class="cal">${celdas}</div>${leyenda}<p class="small muted">Tocá un evento para ver el detalle.</p></div>`;
}
function moverMes(d) { const [y, m] = S.calMes.split("-").map(Number); const n = new Date(y, m - 1 + d, 1); S.calMes = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; guardar(); render(); }
function nuevoEvento() {
  const destinos = S.rol === "secretaria" ? [["todos", "Todo el colegio"], ...CURSOS.map((c) => [c.id, c.nombre])] : S.rol === "docente" ? ROLES.docente.cursos.map((c) => [c, curso(c).nombre]) : [];
  modal("Agregar evento", `
    <div class="campo"><label>Asunto</label><input type="text" id="e-tit"></div>
    <div class="campo"><label>Fecha</label><input type="date" id="e-fec" value="${HOY}"> <label style="display:inline"><input type="checkbox" checked> Todo el día</label></div>
    <div class="campo"><label>Etiqueta</label><select id="e-etq">${["Examen", "Entrega", "Tarea", "Importante", "Reunión", "Feriado", "Clase", "Cumpleaños"].map((x) => `<option>${x}</option>`).join("")}</select></div>
    <div class="campo"><label>Visible para</label><select id="e-dest">${destinos.map(([v, t]) => `<option value="${v}">${esc(t)}</option>`).join("")}<option value="personal:${yo()}">Solo yo (Mi calendario)</option></select></div>
    <div class="campo"><label>Repetición</label><select><option>Sin repetición</option><option>Semanal</option><option>Mensual</option><option>Anual</option></select></div>
    <div class="campo"><label>Descripción</label><textarea style="min-height:80px"></textarea></div>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarEvento()">Guardar</button></div>`);
}
function guardarEvento() {
  const titulo = $("#e-tit").value.trim();
  if (!titulo) return toast("Falta el asunto");
  S.eventos.push({ id: Date.now(), titulo, fecha: $("#e-fec").value, etiqueta: $("#e-etq").value, curso: $("#e-dest").value, autor: yo() });
  S.calMes = $("#e-fec").value.slice(0, 7);
  guardar(); cerrarModal(); render(); toast("Evento agregado");
}
function exportarIcal() {
  const lineas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Campus//Maqueta//ES"];
  eventosVisibles().forEach((e) => { const f = e.fecha.replace(/-/g, ""); lineas.push("BEGIN:VEVENT", `UID:${e.id}@campus`, `DTSTART;VALUE=DATE:${f}`, `SUMMARY:${e.titulo}`, `CATEGORIES:${e.etiqueta}`, "END:VEVENT"); });
  lineas.push("END:VCALENDAR");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([lineas.join("\r\n")], { type: "text/calendar" }));
  a.download = "calendario-campus.ics"; a.click();
}

// ───────────────────────── CUOTAS (Búho existente) ─────────────────────────
function vCuotas() {
  return `<h1 class="titulo-pagina">Cuotas y pagos</h1>${notaMaqueta("Esta sección ya existe en Búho Escuela (extranet de padres + MercadoPago). Se muestra para indicar que la familia entra a un solo lugar.")}
  <div class="panel"><table><tr><th>Período</th><th>Concepto</th><th>Vencimiento</th><th>Importe</th><th>Estado</th></tr>
  <tr><td>Octubre 2026</td><td>Cuota mensual — ${esc(nombre(S.hijo))}</td><td>10/10/26</td><td>$ ———</td><td><button class="primario">Pagar con QR</button></td></tr>
  <tr><td>Septiembre 2026</td><td>Cuota mensual — ${esc(nombre(S.hijo))}</td><td>10/09/26</td><td>$ ———</td><td><span class="chip ok">Pagada</span></td></tr>
  <tr><td>Agosto 2026</td><td>Cuota mensual — ${esc(nombre(S.hijo))}</td><td>10/08/26</td><td>$ ———</td><td><span class="chip ok">Pagada</span></td></tr></table></div>`;
}

// ───────────────────────── PERFIL ─────────────────────────
function vPerfil() {
  const p = PERSONAS[yo()];
  const tog = (k, t) => `<label style="display:block;margin:6px 0"><input type="checkbox" ${S.prefs[k] ? "checked" : ""} onchange="S.prefs['${k}']=this.checked;guardar()"> ${t}</label>`;
  return `<h1 class="titulo-pagina">Perfil y preferencias</h1><div class="grid">
  <div class="panel"><h3>Datos principales</h3>
    <div class="campo"><label>Nombre y apellido</label><input type="text" value="${esc(p.nombre)}" disabled></div>
    <div class="campo"><label>Email</label><input type="text" value="usuario@ejemplo.com"></div>
    <div class="campo"><label>Teléfono móvil</label><input type="text" value="+54 9 388 000-0000"></div>
    <p class="small muted">Nombre, documento y vínculo familiar vienen de Búho y los modifica Secretaría.</p>
    <button class="primario" onclick="toast('Datos guardados')">Guardar</button></div>
  <div class="panel"><h3>Cambiar clave</h3>
    <div class="campo"><label>Clave actual</label><input type="password"></div>
    <div class="campo"><label>Nueva clave</label><input type="password"></div>
    <p class="small muted">Mínimo 8 caracteres, con mayúscula, minúscula, número y símbolo.</p>
    <label><input type="checkbox"> Activar verificación en 2 pasos</label><br><br>
    <button class="primario" onclick="toast('Clave actualizada')">Guardar</button></div>
  <div class="panel"><h3>Avisos por email</h3>
    ${tog("avisoMensajes", "Cuando recibo un mensaje nuevo")}${tog("avisoComunicados", "Cuando se publica un comunicado")}${tog("avisoNotas", "Cuando se publican calificaciones")}${tog("avisoEntregas", "Recordatorio un día antes de cada entrega")}</div>
  <div class="panel" id="sesiones"><h3>Sesiones activas</h3>
    ${notaMaqueta("A definir: Educativa permite una sola sesión por usuario. Para familias que entran desde el celular y la computadora conviene permitir varias y poder cerrarlas desde acá.")}
    <table><tr><td>{{laptop}} Chrome · Windows</td><td class="small muted">Esta sesión</td></tr><tr><td>{{celular}} Celular · Android</td><td><button onclick="this.closest('tr').remove();toast('Sesión cerrada')">Cerrar</button></td></tr></table></div>
  </div>`;
}

// ───────────────────────── arranque ─────────────────────────
function cambiarRol(r) {
  S.rol = r; S.logueado = true; S.filtroEtq = ""; guardar();
  location.hash = "#/inicio"; render();
}
window.addEventListener("hashchange", () => { cerrarModal(); render(); });
render();
