// Versión 5 — "una cosa a la vez".
// Sin menú lateral: tres o cuatro pestañas por rol. "Hoy" es una pila de tarjetas, cada una
// con su acción; al resolverla desaparece. Mensajes como chat. El detalle se abre en una hoja.
// Reutiliza los datos de prueba de data.js … data4.js.

// ───────────────────────── estado ─────────────────────────
const CLAVE = "campus-maqueta-v5";
const clonar = (x) => JSON.parse(JSON.stringify(x));
function inicial() {
  const s = clonar({
    rol: "familia", nivel: "primario", hijo: null,
    mensajes: MENSAJES_INICIALES, comunicados: COMUNICADOS_INICIALES, contenidos: CONTENIDOS_INICIALES,
    tareas: TAREAS_INICIALES, notas: NOTAS_INICIALES, eventos: EVENTOS_INICIALES, unidades: UNIDADES_INICIALES,
    foros: FOROS_INICIALES, ausencias: AUSENCIAS_INICIALES,
    publicado: [true, true, true, false], vistas: {}, cuotas: {}, borrador: null,
  });
  // 4° bimestre a medio cargar (para mostrar "faltan notas").
  [["a1", 8], ["a2", 9], ["a3", 6], ["a4", 8], ["a5", 7]].forEach(([a, n]) => (s.notas[a].len[3] = n));
  [["a1", 9], ["a2", 9], ["a4", 7]].forEach(([a, n]) => (s.notas[a].mat[3] = n));
  return s;
}
let S;
try { S = JSON.parse(localStorage.getItem(CLAVE)) || inicial(); } catch (e) { S = inicial(); }
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(S)); } catch (e) { /* sin storage: sigue en memoria */ } }

// ───────────────────────── utilidades ─────────────────────────
const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const nombre = (id) => PERSONAS[id]?.nombre || id;
const primer = (id) => esc(nombre(id).split(" ")[0]);
const rolDe = (id) => PERSONAS[id]?.rol || "";
const materia = (id) => MATERIAS.find((m) => m.id === id);
const curso = (id) => CURSOS.find((c) => c.id === id);
const cursoDe = (a) => Object.keys(ALUMNOS_CURSO).find((c) => ALUMNOS_CURSO[c].includes(a));
const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
const fecha = (iso) => new Date(iso.slice(0, 10) + "T12:00");
const fDia = (iso) => { const d = fecha(iso); return `${DIAS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`; };
const dias = (iso) => Math.round((fecha(iso) - fecha(HOY)) / 86400000);
function cuando(iso) {
  const d = dias(iso);
  if (d === 0) return "hoy"; if (d === 1) return "mañana"; if (d === -1) return "ayer";
  if (d > 1 && d < 7) return "el " + fDia(iso); if (d >= 7) return `en ${d} días`; return `hace ${-d} días`;
}
const fmtNota = (n) => String(n).replace(".", ",");
const COLORES = ["#3b6ea5", "#7a5195", "#2f7d6d", "#b0563b", "#5b6b7a", "#8a6d1f", "#a14a76", "#3f7f3f"];
function avatar(id, grande) {
  const n = nombre(id).split(" ");
  const i = [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORES.length;
  return `<span class="av ${grande ? "grande" : ""}" style="background:${COLORES[i]}">${esc((n[0][0] + (n[1] ? n[1][0] : "")).toUpperCase())}</span>`;
}
function toast(t) {
  document.querySelector(".toast")?.remove();
  const el = document.createElement("div"); el.className = "toast"; el.textContent = t;
  document.body.appendChild(el); setTimeout(() => el.remove(), 2800);
}
ICONOS.enviar = "M4 12 20 4l-6 16-2-6z";
ICONOS.check = "M5 12l5 5 9-10";
ICONOS.chevron = "M9 5l7 7-7 7";
ICONOS.foro = "M4 5h16v11H9l-5 4z M8 9h8 M8 12h5";

// ───────────────────────── quién soy ─────────────────────────
const esJardin = () => S.nivel === "jardin";
const N = () => NIVELES[S.nivel] || NIVELES.primario;
function yo() { return S.rol === "familia" ? N().familia.id : S.rol === "alumno" ? N().alumno.id : S.rol === "docente" ? N().docente.id : "s1"; }
const hijos = () => N().familia.hijos;
const cursoAlumno = () => N().alumno.curso;
const cursosDocente = () => N().docente.cursos;
const materiasDocente = () => N().docente.materias;
function materiasDeCurso(c) {
  const nv = curso(c).nivel;
  if (nv === "Inicial") return [];
  if (nv === "Secundario") return MATERIAS.filter((m) => m.tipo === "secundaria");
  return MATERIAS.filter((m) => (c === "7B" ? m.tipo === "troncal" || m.tipo === "especial" : m.tipo === "troncal"));
}
function coincide(alcance, cursos) { return alcance === "Todo el colegio" || cursos.some((c) => alcance === "Nivel " + curso(c).nivel || alcance === curso(c).nombre); }
const familiasDe = (alcance) => Object.keys(FAMILIAS).filter((f) => coincide(alcance, FAMILIAS[f].map(cursoDe)));
function misCursos() { return S.rol === "familia" ? hijos().map(cursoDe) : S.rol === "alumno" ? [cursoAlumno()] : S.rol === "docente" ? cursosDocente() : CURSOS.map((c) => c.id); }
function estadoTarea(t, a) {
  const e = t.entregas[a];
  if (e && e.nota != null) return { k: "corregida", txt: `Corregida · ${e.nota}` };
  if (e) return { k: "entregada", txt: "Entregada" };
  if (dias(t.entrega) < 0) return { k: "vencida", txt: "Vencida" };
  return { k: "pendiente", txt: "Pendiente" };
}
const ultPeriodo = () => S.publicado.lastIndexOf(true);
const nota = (a, m, p) => S.notas[a]?.[m]?.[p] ?? null;
const vista = (id) => (S.vistas[yo()] || []).includes(id);
function descartar(id) { (S.vistas[yo()] = S.vistas[yo()] || []).push(id); guardar(); animarYRender(id); }
function animarYRender(id) {
  const el = document.querySelector(`[data-card="${id}"]`);
  if (!el) return render();
  el.classList.add("resuelta"); setTimeout(render, 260);
}

// ───────────────────────── tarjetas de "Hoy" ─────────────────────────
// Cada tarjeta: { id, icono, tipo, titulo, texto, acciones: [[texto, js, primaria?]], tono }
function tarjeta(t) {
  return `<article class="card ${t.tono || ""}" data-card="${t.id}">
    <div class="card-tipo">{{${t.icono}}} ${esc(t.tipo)}</div>
    <h3>${t.titulo}</h3>${t.texto ? `<p>${t.texto}</p>` : ""}
    <div class="acciones">${t.acciones.map(([x, js, pri]) => `<button class="btn ${pri ? "pri" : ""}" onclick="${js}">${x}</button>`).join("")}</div></article>`;
}
function noLeidosDe(me) { return S.mensajes.filter((m) => m.para.includes(me) && !m.leidoPor.includes(me)); }
function tarjetasMensajes() {
  const me = yo();
  const porRemitente = {};
  noLeidosDe(me).forEach((m) => (porRemitente[m.de] = porRemitente[m.de] || []).push(m));
  const quienes = Object.keys(porRemitente);
  if (quienes.length > 1) return [{ id: "msgs", icono: "sobre", tipo: "Mensajes", titulo: `${quienes.length} personas te escribieron`, texto: quienes.map((q) => esc(nombre(q))).join(", "), acciones: [["Ver mensajes", "ir('#/mensajes')", true]] }];
  return Object.entries(porRemitente).map(([de, ms]) => ({ id: "msg-" + de, icono: "sobre", tipo: "Mensaje", titulo: `${esc(nombre(de))} te escribió`, texto: `<span class="cita">“${esc((ms[ms.length - 1].asunto ? ms[ms.length - 1].asunto + ": " : "") + ms[ms.length - 1].cuerpo).slice(0, 110)}…”</span>`, acciones: [["Responder", `ir('#/mensajes/${encodeURIComponent(de)}')`, true]] }));
}
function hoyFamilia() {
  const me = yo(), cs = misCursos(), cards = [];
  S.comunicados.filter((c) => c.tipo !== "info" && coincide(c.alcance, cs) && !c.respuestas[me]).forEach((c) => {
    const hijo = hijos().find((h) => coincide(c.alcance, [cursoDe(h)]));
    const plazo = c.vence ? ` · respondé ${cuando(c.vence)}` : "";
    const base = { id: "com-" + c.id, icono: c.tipo === "autorizacion" ? "firma" : "megafono", titulo: esc(c.titulo), texto: esc(primeraOracion(c.cuerpo)), tono: "accion" };
    if (c.tipo === "autorizacion") cards.push({ ...base, tipo: `Autorización · ${nombre(hijo).split(" ")[0]}${plazo}`, acciones: [["Autorizo", `responderCom(${c.id},'Autorizo')`, true], ["No autorizo", `responderCom(${c.id},'No autorizo')`], ["Ver más", `verComunicado(${c.id})`]] });
    else if (c.tipo === "respuesta") cards.push({ ...base, tipo: "¿Vas a ir?" + plazo, acciones: c.opciones.map((o, i) => [o, `responderCom(${c.id},'${o}')`, i === 0]) });
    else cards.push({ ...base, tipo: "Leé y confirmá" + plazo, acciones: [["Leído", `responderCom(${c.id},'Leído')`, true], ["Ver más", `verComunicado(${c.id})`]] });
  });
  cards.push(...tarjetasMensajes());
  if (!S.cuotas[me]) cards.push({ id: "cuota", icono: "tarjeta", tipo: "Cuota", titulo: "La cuota de octubre vence el sáb 10/10", texto: "", acciones: [["Pagar", "pagarCuota()", true]], tono: "accion" });
  S.comunicados.filter((c) => c.tipo === "info" && coincide(c.alcance, cs) && dias(c.fecha) > -14 && !vista("info-" + c.id)).forEach((c) => cards.push({ id: "info-" + c.id, icono: "megafono", tipo: "Para saber", titulo: esc(c.titulo), texto: esc(primeraOracion(c.cuerpo)), acciones: [["Entendido", `descartar('info-${c.id}')`]] }));
  return cards;
}
function hoyAlumno() {
  const me = yo(), c = cursoAlumno(), cards = [];
  const ts = S.tareas.filter((t) => t.curso === c).sort((a, b) => a.entrega.localeCompare(b.entrega));
  ts.filter((t) => estadoTarea(t, me).k === "vencida").forEach((t) => cards.push({ id: "t-" + t.id, icono: "alerta", tipo: materia(t.materia).nombre, titulo: `Se te pasó: ${esc(t.titulo)}`, texto: `Venció ${cuando(t.entrega)}. Todavía podés entregarla.`, acciones: [["Entregar", `entregar(${t.id})`, true], ["Ver consigna", `verTarea(${t.id})`]], tono: "alerta" }));
  ts.filter((t) => estadoTarea(t, me).k === "pendiente" && dias(t.entrega) <= 7).forEach((t) => cards.push({ id: "t-" + t.id, icono: "tarea", tipo: materia(t.materia).nombre, titulo: `Entregá: ${esc(t.titulo)}`, texto: `Vence ${cuando(t.entrega)}.`, acciones: [["Entregar", `entregar(${t.id})`, true], ["Ver consigna", `verTarea(${t.id})`]], tono: "accion" }));
  S.eventos.filter((e) => e.etiqueta === "Examen" && e.curso === c && dias(e.fecha) >= 0 && dias(e.fecha) <= 7 && !vista("ex-" + e.id)).forEach((e) => cards.push({ id: "ex-" + e.id, icono: "calendario", tipo: "Evaluación", titulo: `${esc(e.titulo)} ${cuando(e.fecha)}`, texto: "", acciones: [["Entendido", `descartar('ex-${e.id}')`]] }));
  ts.filter((t) => t.entregas[me]?.nota != null && !vista("corr-" + t.id)).forEach((t) => cards.push({ id: "corr-" + t.id, icono: "check", tipo: "Te corrigieron", titulo: `${esc(t.titulo)}: <span class="nota-grande">${t.entregas[me].nota}</span>`, texto: esc(t.entregas[me].devolucion || ""), acciones: [["Entendido", `descartar('corr-${t.id}')`]] }));
  const sig = S.contenidos.find((x) => x.curso === c && x.obligatorio && !x.vistoPor.includes(me));
  if (sig) cards.push({ id: "seguir", icono: "play", tipo: "Seguí donde quedaste", titulo: esc(sig.titulo), texto: esc(materia(sig.materia).nombre), acciones: [["Abrir", `verContenido(${sig.id})`, true]] });
  cards.push(...tarjetasMensajes());
  return cards;
}
function hoyDocente() {
  const me = yo(), cs = cursosDocente(), ms = materiasDocente(), cards = [];
  S.ausencias.filter((x) => cs.includes(cursoDe(x.alumno)) && x.desde <= HOY && x.hasta >= HOY && !vista("aus-" + x.id)).forEach((x) => cards.push({ id: "aus-" + x.id, icono: "ausente", tipo: "Aviso de ausencia", titulo: `${primer(x.alumno)} falta hoy`, texto: `${esc(x.motivo)}. Avisó ${esc(nombre(x.por))}.`, acciones: [["Entendido", `descartar('aus-${x.id}')`, true]] }));
  S.tareas.filter((t) => ms.includes(t.materia) && cs.includes(t.curso)).forEach((t) => Object.entries(t.entregas).filter(([, e]) => e.nota == null).forEach(([a]) => cards.push({ id: `corr-${t.id}-${a}`, icono: "tarea", tipo: materia(t.materia).nombre, titulo: `${esc(nombre(a))} entregó «${esc(t.titulo)}»`, texto: "", acciones: [["Corregir", `corregir(${t.id},'${a}')`, true]], tono: "accion" })));
  cards.push(...tarjetasMensajes());
  if (!esJardin()) {
    const p = S.publicado.indexOf(false);
    ms.forEach((m) => { const faltan = ALUMNOS_CURSO[cs[0]].filter((a) => nota(a, m, p) == null); if (faltan.length) cards.push({ id: `notas-${m}`, icono: "grafico", tipo: `Notas del ${REGIMEN.periodos[p]}`, titulo: `Faltan las notas de ${esc(materia(m).nombre)}`, texto: `${faltan.length} de ${ALUMNOS_CURSO[cs[0]].length} alumnos sin nota.`, acciones: [["Cargar", `cargarNotas('${m}')`, true]] }); });
    cs.forEach((c) => riesgo(c).filter((r) => !vista("riesgo-" + r.a)).forEach((r) => cards.push({ id: "riesgo-" + r.a, icono: "alerta", tipo: "Necesita atención", titulo: esc(nombre(r.a)), texto: esc(r.motivos.join(". ")) + ".", acciones: [["Escribir a la familia", `ir('#/mensajes/${familiaDe(r.a)}')`, true], ["Entendido", `descartar('riesgo-${r.a}')`]], tono: "alerta" })));
  }
  S.foros.filter((f) => cs.includes(f.curso) && ms.includes(f.materia) && !f.cerrado && f.mensajes[f.mensajes.length - 1].de !== me).forEach((f) => { const u = f.mensajes[f.mensajes.length - 1]; cards.push({ id: "foro-" + f.id, icono: "foro", tipo: "Foro", titulo: `${esc(nombre(u.de))} escribió en «${esc(f.titulo)}»`, texto: `<span class="cita">“${esc(u.texto.slice(0, 100))}…”</span>`, acciones: [["Ver y responder", `ir('${rutaForo(f)}')`, true]] }); });
  return cards;
}
function hoySecretaria() {
  const cards = [];
  S.comunicados.filter((c) => c.tipo !== "info").forEach((c) => {
    const fs = familiasDe(c.alcance), faltan = fs.filter((f) => !c.respuestas[f]);
    if (faltan.length && !vista("seg-" + c.id)) cards.push({ id: "seg-" + c.id, icono: "megafono", tipo: "Seguimiento", titulo: esc(c.titulo), texto: `Respondieron ${fs.length - faltan.length} de ${fs.length} familias.`, acciones: [["Recordar a los que faltan", `recordar(${c.id})`, true], ["Ver", `ir('#/seguimiento/${c.id}')`]], tono: "accion" });
  });
  const aus = S.ausencias.filter((x) => x.desde <= HOY && x.hasta >= HOY);
  if (aus.length && !vista("aus-hoy")) cards.push({ id: "aus-hoy", icono: "ausente", tipo: "Ausencias avisadas", titulo: `${aus.length} alumno(s) faltan hoy`, texto: aus.map((x) => `${esc(nombre(x.alumno))} (${esc(curso(cursoDe(x.alumno)).nombre)})`).join(", "), acciones: [["Entendido", "descartar('aus-hoy')"]] });
  cards.push(...tarjetasMensajes());
  const p = S.publicado.indexOf(false);
  const incompletos = CURSOS.filter((c) => materiasDeCurso(c.id).some((m) => ALUMNOS_CURSO[c.id].some((al) => nota(al, m.id, p) == null)));
  if (incompletos.length && !vista("notas")) cards.push({ id: "notas", icono: "grafico", tipo: `Notas del ${REGIMEN.periodos[p]}`, titulo: `Faltan notas en ${incompletos.length} curso(s)`, texto: incompletos.map((c) => esc(c.nombre)).join(", "), acciones: [["Recordar a los docentes", "descartar('notas');toast('Recordatorio enviado a los docentes')", true]] });
  return cards;
}
function riesgo(c) {
  const p = ultPeriodo();
  return ALUMNOS_CURSO[c].map((a) => {
    const bajas = materiasDeCurso(c).filter((m) => { const n = nota(a, m.id, p); return n != null && n < REGIMEN.aprobacion; });
    const venc = S.tareas.filter((t) => t.curso === c && estadoTarea(t, a).k === "vencida");
    const motivos = [];
    if (bajas.length) motivos.push(`Por debajo de ${REGIMEN.aprobacion} en ${bajas.map((m) => m.nombre).join(" y ")}`);
    if (venc.length) motivos.push(`${venc.length} tarea(s) sin entregar`);
    return { a, motivos, ok: bajas.length >= 2 || venc.length >= 2 || (bajas.length && venc.length) };
  }).filter((r) => r.ok);
}
const familiaDe = (a) => Object.keys(FAMILIAS).find((f) => FAMILIAS[f].includes(a)) || "s1";

let verTodasHoy = false;
function primeraOracion(t) { const s = t.split("\n").find((x) => x.trim()) || ""; const o = s.split(/(?<=\.)\s/)[0]; return o.length > 140 ? o.slice(0, 137) + "…" : o; }
function vHoy() {
  const cards = { familia: hoyFamilia, alumno: hoyAlumno, docente: hoyDocente, secretaria: hoySecretaria }[S.rol]();
  const n = cards.length, VISIBLES = 4;
  let izq = `<h1 class="saludo">Hola, ${primer(yo())}</h1>
    <p class="resumen">${n ? `Tenés <b>${n} ${n === 1 ? "cosa" : "cosas"}</b> para hoy.` : "Estás al día. No tenés nada pendiente."}</p>`;
  izq += n ? cards.slice(0, VISIBLES).map(tarjeta).join("") : `<div class="vacio">{{check}}<p>Todo listo por hoy.</p></div>`;
  if (n > VISIBLES) izq += verTodasHoy ? cards.slice(VISIBLES).map(tarjeta).join("") : `<button class="btn ancho" onclick="verTodasHoy=true;render()">Ver ${n - VISIBLES === 1 ? "la otra" : `las otras ${n - VISIBLES}`}</button>`;
  // Columna lateral (debajo en el celular): lo próximo y un resumen según el rol.
  const evs = eventosAgenda().filter((e) => dias(e.fecha) >= 0).slice(0, 4);
  let der = `<section class="caja"><h2>Próximamente</h2>${evs.map((e) => `<button class="fila-simple" onclick="verEvento('${e.id}')"><span class="fecha-chica">${fDia(e.fecha)}</span><span>${esc(e.titulo)}</span></button>`).join("") || '<p class="sub">No hay fechas próximas.</p>'}<button class="link" onclick="ir('#/agenda')">Ver la agenda</button></section>`;
  if (S.rol === "familia" && !esJardin()) der += `<section class="caja"><h2>Notas de tus hijos</h2>${hijos().map((a) => { const r = resumenNotas(a); return `<button class="fila-simple" onclick="ir('#/hijos/${a}')"><span class="fecha-chica">${primer(a)}</span><span>${r.prom == null ? "Sin notas" : r.bajas.length ? `Atención en ${esc(r.bajas.map((m) => m.nombre).join(" y "))}` : `Promedio ${fmtNota(r.prom)}`}</span></button>`; }).join("")}</section>`;
  if (S.rol === "alumno") { const r = resumenNotas(yo()); der += `<section class="caja"><h2>Tus notas</h2><p class="grande">${r.prom == null ? "—" : fmtNota(r.prom)}</p><p class="sub">Promedio del ${REGIMEN.periodos[ultPeriodo()]}</p><button class="link" onclick="ir('#/notas')">Ver todas</button></section>`; }
  if (S.rol === "docente") der += `<section class="caja"><h2>${esJardin() ? "Tu sala" : "Tus cursos"}</h2>${cursosDocente().flatMap((c) => materiasDocente().map((m) => `<button class="fila-simple" onclick="ir('#/cursos/${c}.${m}')"><span>${esc(m === "sala" ? curso(c).nombre : `${materia(m).nombre} · ${curso(c).nombre}`)}</span></button>`)).join("")}</section>`;
  if (S.rol === "secretaria") der += `<section class="caja"><h2>De un vistazo</h2>${indicadores().map(([v, t]) => `<div class="fila-simple"><span class="fecha-chica"><b>${v}</b></span><span>${t}</span></div>`).join("")}<button class="link" onclick="ir('#/panel')">Abrir el panel</button></section>`;
  if (S.rol === "familia") der += `<div class="atajos"><button class="btn" onclick="avisarAusencia()">{{ausente}} Avisar que falta</button></div>`;
  return `<div class="hoy-grid"><div>${izq}</div><aside>${der}</aside></div>`;
}
function proximasFechas() {
  const cs = misCursos();
  const aula = ["Examen", "Entrega", "Tarea", "Clase"];
  return S.eventos.filter((e) => (e.curso === "todos" || cs.includes(e.curso)) && dias(e.fecha) >= 0 && (S.rol !== "familia" || !aula.includes(e.etiqueta))).sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// ───────────────────────── acciones de "Hoy" ─────────────────────────
function responderCom(id, r) {
  const c = S.comunicados.find((x) => x.id === id), me = yo();
  c.respuestas[me] = { r, fecha: HOY, ...(r === "Autorizo" ? { firma: nombre(me) } : {}) };
  if (!c.confirmados.includes(me)) c.confirmados.push(me);
  guardar(); cerrarHoja(); toast(r === "Autorizo" ? `Listo: autorizaste como ${nombre(me)}.` : `Listo: respondiste “${r}”.`); animarYRender("com-" + id);
}
function pagarCuota() { S.cuotas[yo()] = true; guardar(); toast("En el producto abre el pago con MercadoPago de Búho."); animarYRender("cuota"); }
function recordar(id) { toast("Recordatorio enviado a las familias que faltan."); descartar("seg-" + id); }
function entregar(tid) {
  const inp = $("#archivo");
  inp.value = "";
  inp.onchange = () => {
    const f = inp.files[0]; if (!f) return;
    S.tareas.find((t) => t.id === tid).entregas[yo()] = { fecha: HOY, archivo: f.name, nota: null };
    guardar(); cerrarHoja(); toast("Entregada. Solo la ve tu docente."); animarYRender("t-" + tid);
  };
  inp.click();
}

// ───────────────────────── hoja inferior (detalle) ─────────────────────────
function hoja(titulo, html) {
  cerrarHoja();
  const f = document.createElement("div");
  f.id = "hoja"; f.className = "hoja-fondo";
  f.innerHTML = iconizar(`<div class="hoja" role="dialog"><div class="agarre"></div><div class="hoja-cab"><h2>${titulo}</h2><button class="cerrar" onclick="cerrarHoja()" aria-label="Cerrar">✕</button></div><div class="hoja-cuerpo">${html}</div></div>`);
  let desdeFondo = false;
  f.addEventListener("mousedown", (e) => { desdeFondo = e.target === f; });
  f.addEventListener("click", (e) => { if (desdeFondo && e.target === f) cerrarHoja(); });
  document.body.appendChild(f);
  requestAnimationFrame(() => f.classList.add("abierta"));
}
function cerrarHoja() { $("#hoja")?.remove(); }
document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarHoja(); });

function verComunicado(id) {
  const c = S.comunicados.find((x) => x.id === id), r = c.respuestas[yo()];
  const acciones = c.tipo === "autorizacion" ? [["Autorizo", true], ["No autorizo"]] : c.tipo === "respuesta" ? c.opciones.map((o, i) => [o, i === 0]) : c.tipo === "confirmacion" ? [["Leído", true]] : [];
  hoja(esc(c.titulo), `<p class="meta">${avatar(c.de)} ${esc(nombre(c.de))} · ${fDia(c.fecha)}</p><p class="texto">${esc(c.cuerpo).replace(/\n/g, "<br>")}</p>
    ${S.rol === "familia" && acciones.length ? (r ? `<p class="hecho">{{check}} Respondiste: <b>${esc(r.r)}</b>${r.firma ? ` · firmado por ${esc(r.firma)}` : ""}</p>` : `<div class="acciones">${acciones.map(([o, p]) => `<button class="btn ${p ? "pri" : ""}" onclick="responderCom(${c.id},'${o}')">${o}</button>`).join("")}</div>${c.tipo === "autorizacion" ? `<p class="nota-chica">Al tocar “Autorizo” queda firmado a nombre de ${esc(nombre(yo()))}, con fecha y hora.</p>` : ""}`) : ""}`);
}
function verAvisos() {
  const cs = misCursos();
  const l = S.comunicados.filter((c) => coincide(c.alcance, cs)).sort((a, b) => b.fecha.localeCompare(a.fecha));
  hoja("Avisos del colegio", l.map((c) => `<button class="item" onclick="verComunicado(${c.id})"><span><b>${esc(c.titulo)}</b><small>${fDia(c.fecha)}${c.tipo !== "info" ? (c.respuestas[yo()] ? " · respondido" : " · falta responder") : ""}</small></span>{{chevron}}</button>`).join(""));
}
function verFechas() {
  hoja("Próximas fechas", proximasFechas().map((e) => `<div class="fila-simple"><span class="fecha-chica">${fDia(e.fecha)}</span><span>${esc(e.titulo)}</span></div>`).join("") || "<p>No hay fechas próximas.</p>");
}
function avisarAusencia() {
  const hs = hijos();
  window.ausencia = { alumno: hs[0], cuando: HOY, motivo: "Enfermedad" };
  const chips = (campo, ops) => `<div class="chips" data-campo="${campo}">${ops.map(([v, t], i) => `<button class="chip-op ${i === 0 ? "sel" : ""}" onclick="elegirChip(this,'${campo}','${v}')">${t}</button>`).join("")}</div>`;
  const manana = new Date(fecha(HOY).getTime() + 86400000).toISOString().slice(0, 10);
  hoja("Avisar que falta", `${hs.length > 1 ? `<p class="pregunta">¿Quién?</p>${chips("alumno", hs.map((h) => [h, nombre(h).split(" ")[0]]))}` : ""}
    <p class="pregunta">¿Cuándo?</p>${chips("cuando", [[HOY, "Hoy"], [manana, "Mañana"]])}
    <p class="pregunta">¿Por qué?</p>${chips("motivo", [["Enfermedad", "Enfermedad"], ["Turno médico", "Turno médico"], ["Motivo familiar", "Motivo familiar"]])}
    <button class="btn pri ancho" onclick="enviarAusencia()">Avisar</button>`);
}
function elegirChip(b, campo, v) { b.parentNode.querySelectorAll(".chip-op").forEach((x) => x.classList.remove("sel")); b.classList.add("sel"); window.ausencia[campo] = v; }
function enviarAusencia() {
  const a = window.ausencia;
  S.ausencias.push({ id: Date.now(), alumno: a.alumno, desde: a.cuando, hasta: a.cuando, motivo: a.motivo, detalle: "", por: yo() });
  guardar(); cerrarHoja(); toast(`Listo: le avisamos a la docente de ${nombre(a.alumno).split(" ")[0]}.`);
}

// ───────────────────────── mensajes (chat) ─────────────────────────
function claveHilo(m, me) { return m.de === me ? (m.para.length === 1 ? m.para[0] : "g:" + [...m.para].sort().join(",")) : m.de; }
function hilos() {
  const me = yo(), map = new Map();
  S.mensajes.filter((m) => m.de === me || m.para.includes(me)).forEach((m) => {
    const k = claveHilo(m, me);
    if (!map.has(k)) map.set(k, { k, msgs: [] });
    map.get(k).msgs.push(m);
  });
  return [...map.values()].map((h) => { h.msgs.sort((a, b) => a.fecha.localeCompare(b.fecha)); h.ult = h.msgs[h.msgs.length - 1]; h.nuevos = h.msgs.filter((m) => m.para.includes(me) && !m.leidoPor.includes(me)).length; return h; }).sort((a, b) => b.ult.fecha.localeCompare(a.ult.fecha));
}
function nombreHilo(k) {
  if (!k.startsWith("g:")) return nombre(k);
  const ids = k.slice(2).split(",");
  const grupo = PERSONAS[ids[0]]?.grupo;
  const c = grupo === "Alumnos" ? cursoDe(ids[0]) : grupo === "Familias" ? cursoDe(FAMILIAS[ids[0]]?.[0]) : null;
  return grupo === "Alumnos" ? `Alumnos de ${curso(c).nombre}` : grupo === "Familias" && c ? `Familias de ${curso(c).nombre}` : `Grupo de ${ids.length} personas`;
}
function vMensajes() {
  const hs = hilos();
  return `<div class="titulo-fila"><h1>Mensajes</h1><button class="btn pri" onclick="nuevoChat()">{{lapiz}} Nuevo</button></div>
    ${hs.length > 4 ? `<input class="buscar" placeholder="Buscar en mensajes" oninput="const q=this.value.toLowerCase();document.querySelectorAll('.hilo').forEach(b=>b.style.display=b.textContent.toLowerCase().includes(q)?'':'none')">` : ""}
    ${hs.map((h) => `<button class="hilo ${h.nuevos ? "nuevo" : ""}" onclick="ir('#/mensajes/${encodeURIComponent(h.k)}')">${h.k.startsWith("g:") ? '<span class="av grupo">{{usuario}}</span>' : avatar(h.k)}
      <span class="hilo-texto"><b>${esc(nombreHilo(h.k))}</b><small>${h.ult.de === yo() ? "Vos: " : ""}${esc((h.ult.asunto ? h.ult.asunto + " — " : "") + h.ult.cuerpo).slice(0, 70)}</small></span>
      <span class="hilo-lado"><small>${fDia(h.ult.fecha)}</small>${h.nuevos ? `<span class="burbuja-n">${h.nuevos}</span>` : ""}</span></button>`).join("") || `<div class="vacio">{{sobre}}<p>Todavía no tenés mensajes.</p></div>`}`;
}
function vChat(k) {
  const me = yo();
  const h = hilos().find((x) => x.k === k) || { k, msgs: [] };
  h.msgs.forEach((m) => { if (m.para.includes(me) && !m.leidoPor.includes(me)) m.leidoPor.push(me); });
  guardar();
  let dia = "";
  const burbujas = h.msgs.map((m) => {
    const sep = m.fecha.slice(0, 10) !== dia ? `<div class="dia-sep">${fDia(m.fecha)}</div>` : "";
    dia = m.fecha.slice(0, 10);
    const mio = m.de === me;
    return `${sep}<div class="burbuja ${mio ? "mia" : ""}">${!mio && k.startsWith("g:") ? `<b class="quien">${esc(nombre(m.de))}</b>` : ""}${m.asunto ? `<b>${esc(m.asunto)}</b><br>` : ""}${esc(m.cuerpo).replace(/\n/g, "<br>")}
      ${m.adj.map((a) => `<span class="adj">{{clip}} ${esc(a.n)}</span>`).join("")}<span class="hora">${m.fecha.slice(11, 16)}</span></div>`;
  }).join("");
  return `<div class="chat">${burbujas || '<p class="vacio-chat">Escribí el primer mensaje.</p>'}</div>
    <div class="redactar"><button class="icono" onclick="adjuntarChat()" aria-label="Adjuntar">{{clip}}</button><span id="adj-chat"></span>
      <textarea id="txt" rows="1" placeholder="Escribí un mensaje" oninput="this.style.height='auto';this.style.height=this.scrollHeight+'px'"></textarea>
      <button class="icono enviar" onclick="enviarChat('${encodeURIComponent(k)}')" aria-label="Enviar">{{enviar}}</button></div>`;
}
let adjuntos = [];
function adjuntarChat() {
  const inp = $("#archivo"); inp.value = "";
  inp.onchange = () => { adjuntos = [...inp.files].map((f) => ({ n: f.name, t: (f.size / 1024).toFixed(1) + " KB" })); $("#adj-chat").textContent = adjuntos.map((a) => a.n).join(", "); };
  inp.click();
}
function enviarChat(kc) {
  const k = decodeURIComponent(kc), t = $("#txt").value.trim();
  if (!t && !adjuntos.length) return;
  const para = k.startsWith("g:") ? k.slice(2).split(",") : [k];
  const ahora = new Date();
  S.mensajes.push({ id: Date.now(), de: yo(), para, asunto: "", cuerpo: t, fecha: `${HOY}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`, adj: adjuntos, leidoPor: [], etiquetas: {} });
  adjuntos = []; guardar(); render();
  window.scrollTo(0, document.body.scrollHeight);
}
function contactos() {
  const me = yo(), cs = misCursos();
  const docentesDe = (c) => [...new Set([...materiasDeCurso(c).map((m) => m.docente), ...(curso(c).nivel === "Inicial" ? ["d11"] : [])])];
  let ids = [];
  if (S.rol === "familia") ids = [...new Set(cs.flatMap(docentesDe)), "s1", "s2"];
  if (S.rol === "alumno") ids = [...docentesDe(cs[0]), ...ALUMNOS_CURSO[cs[0]]];
  if (S.rol === "docente") ids = [...familiasDe(curso(cs[0]).nombre), ...(esJardin() ? [] : ALUMNOS_CURSO[cs[0]]), "s1", "s2"];
  if (S.rol === "secretaria") ids = Object.keys(PERSONAS);
  return [...new Set(ids)].filter((id) => id !== me && PERSONAS[id]);
}
function nuevoChat() {
  const ids = contactos();
  const cs = misCursos();
  const grupos = S.rol === "docente" ? [[`g:${[...familiasDe(curso(cs[0]).nombre)].sort().join(",")}`, `Todas las familias de ${curso(cs[0]).nombre}`]].concat(esJardin() ? [] : [[`g:${[...ALUMNOS_CURSO[cs[0]]].sort().join(",")}`, `Todos los alumnos de ${curso(cs[0]).nombre}`]]) : [];
  hoja("¿A quién le escribís?", `<input class="buscar" placeholder="Buscar" oninput="document.querySelectorAll('#hoja .item').forEach(b=>b.style.display=b.textContent.toLowerCase().includes(this.value.toLowerCase())?'':'none')">
    ${grupos.map(([k, t]) => `<button class="item" onclick="cerrarHoja();ir('#/mensajes/${encodeURIComponent(k)}')"><span class="av grupo">{{usuario}}</span><span><b>${esc(t)}</b><small>Mensaje a todo el grupo</small></span></button>`).join("")}
    ${ids.map((id) => `<button class="item" onclick="cerrarHoja();ir('#/mensajes/${id}')">${avatar(id)}<span><b>${esc(nombre(id))}</b><small>${esc(rolDe(id))}</small></span></button>`).join("")}`);
}

// ───────────────────────── familia: mis hijos y la sala ─────────────────────────
function resumenNotas(a) {
  const p = ultPeriodo(), ms = materiasDeCurso(cursoDe(a)).filter((m) => nota(a, m.id, p) != null);
  if (!ms.length) return { prom: null, bajas: [] };
  const v = ms.map((m) => nota(a, m.id, p));
  return { prom: Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 10) / 10, bajas: ms.filter((m) => nota(a, m.id, p) < REGIMEN.aprobacion) };
}
function vHijos() {
  return `<h1>Mis hijos</h1>${hijos().map((a) => {
    const r = resumenNotas(a);
    return `<button class="card hijo" onclick="ir('#/hijos/${a}')">${avatar(a, true)}<span class="hijo-texto"><b>${esc(nombre(a))}</b><small>${esc(curso(cursoDe(a)).nombre)}</small>
      ${r.prom == null ? "" : r.bajas.length ? `<span class="estado mal">Atención en ${esc(r.bajas.map((m) => m.nombre).join(" y "))}</span>` : `<span class="estado bien">{{check}} Va bien · promedio ${fmtNota(r.prom)}</span>`}</span>{{chevron}}</button>`;
  }).join("")}`;
}
function vHijo(a) {
  const p = ultPeriodo(), c = cursoDe(a), ms = materiasDeCurso(c);
  return `<h1>${esc(nombre(a))}</h1><p class="sub">${esc(curso(c).nombre)} · notas del ${REGIMEN.periodos[p]}</p>
    <div class="mosaico">${ms.map((m) => { const n = nota(a, m.id, p), ant = nota(a, m.id, p - 1); const fl = n == null || ant == null ? "" : n > ant ? "↑" : n < ant ? "↓" : ""; return `<div class="tesela ${n != null && n < REGIMEN.aprobacion ? "baja" : ""}"><span class="num">${n ?? "—"}<small>${fl}</small></span><span class="mat">${esc(m.nombre)}</span></div>`; }).join("")}</div>
    <details class="caja plegable"><summary>Ver todos los bimestres</summary>${tablaNotas(a)}</details>
    <div class="atajos"><button class="btn" onclick="toast('En el producto descarga el boletín en PDF')">{{archivo}} Boletín</button><button class="btn" onclick="ir('#/mensajes/${materiasDeCurso(c)[0]?.docente || "s1"}')">{{lapiz}} Escribir a la docente</button></div>`;
}
function vSala(id) {
  const c = cursoDe(hijos()[0]);
  return id ? vForoTema(+id) : `<h1>${esc(curso(c).nombre)}</h1><p class="sub">Lo que comparte la seño con las familias</p>${listaTemas(c, "sala")}`;
}

// ───────────────────────── aula: materias, contenidos y tareas ─────────────────────────
function unidadesDe(mat, c) { return S.unidades.filter((u) => u.materia === mat && u.curso === c).sort((a, b) => a.orden - b.orden); }
function unidadActual(us) { return us.find((u) => u.desde <= HOY && HOY <= u.hasta) || us.filter((u) => u.desde <= HOY).pop() || us[0]; }
const contenido = (id) => S.contenidos.find((x) => x.id === id);
function vMaterias() {
  const c = cursoAlumno(), me = yo(), p = ultPeriodo();
  return `<h1>Materias</h1><p class="sub">${esc(curso(c).nombre)}</p>${materiasDeCurso(c).map((m) => {
    const pend = S.tareas.filter((t) => t.materia === m.id && t.curso === c && ["pendiente", "vencida"].includes(estadoTarea(t, me).k)).length;
    const n = nota(me, m.id, p);
    return `<button class="card materia" onclick="ir('#/materias/${m.id}')"><span class="materia-texto"><b>${esc(m.nombre)}</b><small>${esc(nombre(m.docente))}</small></span>
      ${pend ? `<span class="pill aviso">${pend} para entregar</span>` : ""}${n != null ? `<span class="pill">Nota ${n}</span>` : ""}{{chevron}}</button>`;
  }).join("")}`;
}
// Vista de una materia: la unidad en curso como pasos (contenido → tarea); el resto en una línea.
function vMateria(mat, c) {
  const me = yo(), doc = S.rol === "docente", us = unidadesDe(mat, c), act = unidadActual(us), total = ALUMNOS_CURSO[c].length;
  const pasos = (u) => S.contenidos.filter((x) => x.unidad === u.id).map((x) => {
    const visto = x.vistoPor.includes(me);
    const ts = S.tareas.filter((t) => t.contenido === x.id);
    return `<li class="paso ${!doc && visto ? "visto" : ""}"><button class="paso-btn" onclick="verContenido(${x.id})"><span class="marca">${!doc && visto ? "{{check}}" : ""}</span><span><b>${esc(x.titulo)}</b><small>${doc ? `Lo vieron ${x.vistoPor.length} de ${total}` : x.obligatorio ? "Para leer" : "Opcional"}</small></span></button>
      ${ts.map((t) => { const e = estadoTarea(t, me); return `<button class="subpaso" onclick="verTarea(${t.id})">{{tarea}} <span>${esc(t.titulo)}<small>${doc ? `${Object.keys(t.entregas).length} de ${total} entregaron` : `Vence ${cuando(t.entrega)}`}</small></span>${doc ? "" : `<span class="pill ${e.k === "pendiente" || e.k === "vencida" ? "aviso" : "ok"}">${e.txt}</span>`}</button>`; }).join("")}</li>`;
  }).join("");
  const foros = S.foros.filter((f) => f.materia === mat && f.curso === c);
  const p = !doc ? avanceMateria(me, mat, c) : null;
  return `<div class="titulo-fila"><h1>${esc(materia(mat).nombre)}</h1>${doc ? `<button class="btn" onclick="nuevaUnidad('${mat}','${c}')">{{mas}} Nueva unidad</button>` : ""}</div><p class="sub">${esc(nombre(materia(mat).docente))} · ${esc(curso(c).nombre)}${p != null ? ` · ${p}% de la unidad hecho` : ""}</p>
    ${act ? `<section class="unidad-actual"><p class="etiqueta">Ahora</p><h2>${esc(act.titulo)}</h2><p class="sub">Hasta el ${fDia(act.hasta)} · <button class="link" onclick="verObjetivos(${act.id})">¿Qué vamos a aprender?</button></p><ol class="pasos">${pasos(act) || '<li class="vacio-chico">Todavía no hay contenidos.</li>'}</ol>
      ${doc ? `<button class="btn" onclick="nuevoContenido(${act.id})">{{mas}} Agregar contenido</button>` : ""}</section>` : `<p>Todavía no hay unidades.</p>`}
    ${us.filter((u) => u !== act).map((u) => `<button class="otra-unidad" onclick="verUnidad(${u.id})"><span>${esc(u.titulo)}</span><small>${u.hasta < HOY ? "Terminada" : "Empieza el " + fDia(u.desde)}</small></button>`).join("")}
    ${curso(c).nivel === "Secundario" ? `<button class="card materia" onclick="ir('${doc ? `#/cursos/${c}.${mat}/foro` : `#/materias/${mat}/foro`}')"><span class="materia-texto"><b>{{foro}} Foro de la materia</b><small>${foros.length} tema(s)</small></span>{{chevron}}</button>` : ""}
    ${doc ? `<button class="card materia" onclick="ir('#/notas/${mat}')"><span class="materia-texto"><b>{{grafico}} Notas de ${esc(materia(mat).nombre)}</b><small>Planilla del curso</small></span>{{chevron}}</button>` : ""}`;
}
function verObjetivos(uid) { const u = S.unidades.find((x) => x.id === uid); hoja(esc(u.titulo), `<p class="pregunta">Al terminar la unidad vas a poder:</p><ul class="lista">${u.objetivos.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>`); }
function verUnidad(uid) {
  const u = S.unidades.find((x) => x.id === uid);
  hoja(esc(u.titulo), `<p class="sub">${u.hasta < HOY ? "Terminada" : "Empieza el " + fDia(u.desde)}</p><ul class="lista">${u.objetivos.map((o) => `<li>${esc(o)}</li>`).join("")}</ul>${S.contenidos.filter((x) => x.unidad === uid).map((x) => `<button class="item" onclick="verContenido(${x.id})"><span><b>${esc(x.titulo)}</b></span>{{chevron}}</button>`).join("")}`);
}
function verContenido(id) {
  const x = contenido(id), me = yo();
  if (S.rol === "alumno" && !x.vistoPor.includes(me)) { x.vistoPor.push(me); guardar(); }
  const hermanos = S.contenidos.filter((y) => y.unidad === x.unidad), sig = hermanos[hermanos.indexOf(x) + 1];
  const cuerpo = x.tipo === "video" ? `<div class="video">{{play}}</div><p class="texto">${esc(x.cuerpo)}</p>` : x.tipo === "archivo" ? `<p><span class="adj">{{clip}} ${esc(x.archivo)}</span></p>` : x.tipo === "enlace" ? `<p>{{enlace}} ${esc(x.url)}</p>` : `<p class="texto">${esc(x.cuerpo)}</p>`;
  const ts = S.tareas.filter((t) => t.contenido === id);
  hoja(esc(x.titulo), `<p class="sub">${esc(materia(x.materia).nombre)}</p>${cuerpo}
    ${ts.map((t) => `<button class="item" onclick="verTarea(${t.id})">{{tarea}}<span><b>Tarea: ${esc(t.titulo)}</b><small>Vence ${cuando(t.entrega)}</small></span>{{chevron}}</button>`).join("")}
    <div class="acciones">${S.rol === "docente" ? `<button class="btn" onclick="nuevaTarea(${id})">{{mas}} Crear tarea de este contenido</button>` : ""}${sig ? `<button class="btn pri" onclick="verContenido(${sig.id})">Siguiente</button>` : ""}</div>`);
  if (S.rol === "alumno") render();
}
function verTarea(id) {
  const t = S.tareas.find((x) => x.id === id), me = yo(), x = contenido(t.contenido);
  const u = S.unidades.find((y) => y.id === x.unidad);
  let bloque;
  if (S.rol === "alumno") {
    const e = t.entregas[me];
    bloque = e ? `<p class="hecho">{{check}} Entregaste <b>${esc(e.archivo)}</b> ${cuando(e.fecha)}.</p>${e.nota != null ? `<p class="pregunta">Nota: <span class="nota-grande">${e.nota}</span></p><p class="texto">${esc(e.devolucion || "")}</p>` : ""}` : `<button class="btn pri ancho" onclick="entregar(${id})">Entregar</button><p class="nota-chica">Podés subir un archivo o una foto de la carpeta. Solo la ve tu docente.</p>`;
  } else {
    bloque = ALUMNOS_CURSO[t.curso].map((a) => { const e = estadoTarea(t, a); return `<div class="fila-alumno">${avatar(a)}<span>${esc(nombre(a))}<small>${e.txt}</small></span>${t.entregas[a] && t.entregas[a].nota == null ? `<button class="btn pri" onclick="corregir(${id},'${a}')">Corregir</button>` : ""}</div>`; }).join("");
  }
  hoja(esc(t.titulo), `<p class="sub">${esc(materia(t.materia).nombre)} · vence ${cuando(t.entrega)}</p><p class="texto">${esc(t.consigna)}</p>
    <p class="nota-chica">Sale de “${esc(x.titulo)}” · trabaja: ${esc(u.objetivos[0])}${u.objetivos.length > 1 ? " y más" : ""}.</p>${bloque}`);
}
function corregir(tid, a) {
  const t = S.tareas.find((x) => x.id === tid), e = t.entregas[a];
  hoja(`Corregir: ${esc(nombre(a))}`, `<p class="sub">${esc(t.titulo)}</p><p><span class="adj">{{clip}} ${esc(e.archivo)}</span></p>
    <p class="pregunta">Nota</p><div class="chips">${[4, 5, 6, 7, 8, 9, 10].map((n) => `<button class="chip-op" onclick="this.parentNode.querySelectorAll('.chip-op').forEach(b=>b.classList.remove('sel'));this.classList.add('sel');window.notaElegida=${n}">${n}</button>`).join("")}</div>
    <p class="pregunta">Devolución</p><textarea id="devolucion" class="campo" rows="3" placeholder="Un comentario para ${primer(a)}"></textarea>
    <button class="btn pri ancho" onclick="guardarCorreccion(${tid},'${a}')">Devolver</button>`);
  window.notaElegida = null;
}
function guardarCorreccion(tid, a) {
  if (window.notaElegida == null) return toast("Elegí una nota");
  const e = S.tareas.find((x) => x.id === tid).entregas[a];
  e.nota = window.notaElegida; e.devolucion = $("#devolucion").value;
  guardar(); cerrarHoja(); toast(`Listo: ${nombre(a).split(" ")[0]} ya ve su nota.`); animarYRender(`corr-${tid}-${a}`);
}
function cargarNotas(m) {
  const c = cursosDocente()[0], p = S.publicado.indexOf(false);
  hoja(`Notas de ${esc(materia(m).nombre)}`, `<p class="sub">${REGIMEN.periodos[p]} · ${esc(curso(c).nombre)} · se guardan solas</p>
    ${ALUMNOS_CURSO[c].map((a) => `<div class="fila-alumno">${avatar(a)}<span>${esc(nombre(a))}</span><input class="nota-in" type="number" min="1" max="10" value="${nota(a, m, p) ?? ""}" onfocus="this.select()" onchange="ponerNota('${a}','${m}',${p},this.value)" onkeydown="if(event.key==='Enter'){const l=[...document.querySelectorAll('.nota-in')];(l[l.indexOf(this)+1]||this).focus()}"></div>`).join("")}
    <button class="btn pri ancho" onclick="cerrarHoja();render()">Listo</button>`);
}
function ponerNota(a, m, p, v) { S.notas[a] = S.notas[a] || {}; S.notas[a][m] = S.notas[a][m] || [null, null, null, null]; S.notas[a][m][p] = v === "" ? null : Math.max(1, Math.min(10, +v)); guardar(); }
function nuevoContenido(uid) {
  hoja("Agregar contenido", `<input id="nc-tit" class="campo" placeholder="Título"><textarea id="nc-txt" class="campo" rows="5" placeholder="Texto, consigna o enlace"></textarea><button class="btn pri ancho" onclick="guardarContenido(${uid})">Publicar</button>`);
}
function guardarContenido(uid) {
  const t = $("#nc-tit").value.trim(); if (!t) return toast("Poné un título");
  const u = S.unidades.find((x) => x.id === uid);
  S.contenidos.push({ id: Date.now(), curso: u.curso, materia: u.materia, unidad: uid, titulo: t, tipo: "texto", obligatorio: true, fecha: HOY, cuerpo: $("#nc-txt").value, vistoPor: [] });
  guardar(); cerrarHoja(); render(); toast("Contenido publicado");
}
function nuevaTarea(cid) {
  hoja("Crear tarea", `<p class="sub">De “${esc(contenido(cid).titulo)}”</p><input id="nt-tit" class="campo" placeholder="Título"><textarea id="nt-txt" class="campo" rows="4" placeholder="Consigna"></textarea><p class="pregunta">¿Para cuándo?</p><input id="nt-fec" class="campo" type="date" value="${HOY}"><button class="btn pri ancho" onclick="guardarTarea(${cid})">Publicar</button>`);
}
function guardarTarea(cid) {
  const t = $("#nt-tit").value.trim(); if (!t) return toast("Poné un título");
  const x = contenido(cid);
  S.tareas.push({ id: Date.now(), curso: x.curso, materia: x.materia, contenido: cid, titulo: t, consigna: $("#nt-txt").value, entrega: $("#nt-fec").value, cuentaNota: true, entregas: {} });
  guardar(); cerrarHoja(); render(); toast("Tarea publicada. Los alumnos la ven en Hoy.");
}
function vCursos() {
  const cs = cursosDocente(), ms = materiasDocente();
  return `<h1>${esJardin() ? "Mi sala" : "Mis cursos"}</h1>${cs.flatMap((c) => ms.map((m) => {
    const porCorregir = S.tareas.filter((t) => t.materia === m && t.curso === c).reduce((s, t) => s + Object.values(t.entregas).filter((e) => e.nota == null).length, 0);
    return `<button class="card materia" onclick="ir('#/cursos/${c}.${m}')"><span class="materia-texto"><b>${esc(m === "sala" ? curso(c).nombre : materia(m).nombre)}</b><small>${esc(m === "sala" ? `${ALUMNOS_CURSO[c].length} chicos` : curso(c).nombre)}</small></span>${porCorregir ? `<span class="pill aviso">${porCorregir} para corregir</span>` : ""}{{chevron}}</button>`;
  })).join("")}`;
}
function vCurso(clave, sub, id) {
  const [c, m] = clave.split(".");
  if (m === "sala") return id ? vForoTema(+id) : `<h1>${esc(curso(c).nombre)}</h1><p class="sub">Foro con las familias</p><button class="btn pri" onclick="nuevoTema('${c}','sala')">{{mas}} Nuevo tema</button>${listaTemas(c, "sala")}
    <section class="proximo"><h2>Familias de la sala</h2>${familiasDe(curso(c).nombre).map((f) => `<button class="item" onclick="ir('#/mensajes/${f}')">${avatar(f)}<span><b>${esc(nombre(f))}</b><small>${esc(rolDe(f))}</small></span>{{chevron}}</button>`).join("")}</section>`;
  if (sub === "foro") return id ? vForoTema(+id) : `<h1>Foro · ${esc(materia(m).nombre)}</h1><button class="btn pri" onclick="nuevoTema('${c}','${m}')">{{mas}} Nuevo tema</button>${listaTemas(c, m)}`;
  return vMateria(m, c);
}

// ───────────────────────── foros (como conversación) ─────────────────────────
function rutaForo(f) { return S.rol === "familia" ? `#/sala/${f.id}` : S.rol === "alumno" ? `#/materias/${f.materia}/foro/${f.id}` : `#/cursos/${f.curso}.${f.materia}/foro/${f.id}`; }
function listaTemas(c, m) {
  const ts = S.foros.filter((f) => f.curso === c && f.materia === m).sort((a, b) => b.mensajes[b.mensajes.length - 1].fecha.localeCompare(a.mensajes[a.mensajes.length - 1].fecha));
  return ts.map((f) => { const u = f.mensajes[f.mensajes.length - 1]; return `<button class="hilo" onclick="ir('${rutaForo(f)}')"><span class="av grupo">{{foro}}</span><span class="hilo-texto"><b>${esc(f.titulo)}</b><small>${esc(nombre(u.de).split(" ")[0])}: ${esc(u.texto.slice(0, 60))}</small></span><span class="hilo-lado"><small>${fDia(u.fecha)}</small><small>${f.mensajes.length - 1} resp.</small></span></button>`; }).join("") || `<div class="vacio">{{foro}}<p>Todavía no hay temas.</p></div>`;
}
function vForoTema(id) {
  const f = S.foros.find((x) => x.id === id), me = yo();
  if (!f) return "<p>Tema no encontrado.</p>";
  return `<h1 class="h-tema">${esc(f.titulo)}</h1><div class="chat">${f.mensajes.map((m) => `<div class="burbuja ${m.de === me ? "mia" : ""}">${m.de !== me ? `<b class="quien">${esc(nombre(m.de))}</b>` : ""}${esc(m.texto)}<span class="hora">${fDia(m.fecha)} ${m.fecha.slice(11, 16)}</span></div>`).join("")}</div>
    ${f.cerrado ? '<p class="sub centro">La docente cerró este tema.</p>' : `<div class="redactar"><textarea id="txt" rows="1" placeholder="Escribí tu respuesta"></textarea><button class="icono enviar" onclick="responderForo(${id})" aria-label="Enviar">{{enviar}}</button></div>`}`;
}
function responderForo(id) {
  const t = $("#txt").value.trim(); if (!t) return;
  const ahora = new Date();
  S.foros.find((x) => x.id === id).mensajes.push({ de: yo(), fecha: `${HOY}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`, texto: t });
  guardar(); render(); window.scrollTo(0, document.body.scrollHeight);
}
function nuevoTema(c, m) {
  hoja("Nuevo tema", `<input id="ft-tit" class="campo" placeholder="Título del tema"><textarea id="ft-txt" class="campo" rows="4" placeholder="Primer mensaje"></textarea>
    ${S.rol === "docente" ? `<label class="check"><input type="checkbox" id="ft-todas"> Publicar también en las otras ${m === "sala" ? "salas" : "divisiones"} del nivel</label>` : ""}
    <button class="btn pri ancho" onclick="guardarTema('${c}','${m}')">Publicar</button>`);
}
function guardarTema(c, m) {
  const t = $("#ft-tit").value.trim(), x = $("#ft-txt").value.trim();
  if (!t || !x) return toast("Completá título y mensaje");
  const id = Date.now();
  S.foros.push({ id, curso: c, materia: m, unidad: null, titulo: t, autor: yo(), fecha: HOY, cerrado: false, mensajes: [{ de: yo(), fecha: HOY + "T12:00", texto: x }] });
  guardar(); cerrarHoja();
  if ($("#ft-todas")?.checked) toast("En el producto se publica en todas las salas del nivel.");
  ir(rutaForo(S.foros.find((f) => f.id === id)));
}

// ───────────────────────── secretaría: enviar aviso paso a paso y seguimiento ─────────────────────────
const TIPOS = [["info", "Solo informar"], ["confirmacion", "Que confirmen que lo leyeron"], ["autorizacion", "Que autoricen (salidas, campamentos)"], ["respuesta", "Que digan si van"]];
function vEnviar() {
  const b = S.borrador || (S.borrador = { paso: 1 });
  const atras = b.paso > 1 ? `<button class="link" onclick="S.borrador.paso--;guardar();render()">← Atrás</button>` : "";
  const pasoTxt = `<p class="etiqueta">Paso ${b.paso} de 3</p>`;
  if (b.paso === 1) {
    const ops = ["Todo el colegio", "Nivel Inicial", "Nivel Primario", "Nivel Secundario", ...CURSOS.map((c) => c.nombre)];
    return `${pasoTxt}<h1>¿Para quién es el aviso?</h1>${ops.map((o) => `<button class="opcion" onclick="S.borrador.alcance=this.dataset.v;S.borrador.paso=2;guardar();render()" data-v="${esc(o)}">${esc(o)}<small>${familiasDe(o).length} familias</small></button>`).join("")}`;
  }
  if (b.paso === 2) return `${pasoTxt}${atras}<h1>¿Qué necesitás de las familias?</h1>${TIPOS.map(([k, t]) => `<button class="opcion" onclick="S.borrador.tipo='${k}';S.borrador.paso=3;guardar();render()">${t}</button>`).join("")}`;
  const pl = PLANTILLAS.filter((p) => p.tipo === b.tipo);
  return `${pasoTxt}${atras}<h1>Escribí el aviso</h1><p class="sub">Para ${esc(b.alcance)} · ${TIPOS.find((x) => x[0] === b.tipo)[1].toLowerCase()}</p>
    ${pl.length ? `<div class="chips">${pl.map((p) => `<button class="chip-op" onclick="document.getElementById('av-tit').value=${JSON.stringify(p.titulo).replace(/"/g, "&quot;")};document.getElementById('av-txt').value=${JSON.stringify(p.cuerpo).replace(/"/g, "&quot;")}">Usar: ${esc(p.nombre)}</button>`).join("")}</div>` : ""}
    <input id="av-tit" class="campo" placeholder="Título"><textarea id="av-txt" class="campo" rows="6" placeholder="Texto"></textarea>
    ${b.tipo !== "info" ? `<p class="pregunta">¿Hasta cuándo pueden responder?</p><input id="av-vence" class="campo" type="date" value="${HOY}">` : ""}
    <button class="btn pri ancho" onclick="enviarAviso()">Enviar a ${familiasDe(b.alcance).length} familias</button>`;
}
function enviarAviso() {
  const b = S.borrador, t = $("#av-tit").value.trim();
  if (!t) return toast("Poné un título");
  const id = Math.max(...S.comunicados.map((c) => c.id)) + 1;
  S.comunicados.push({ id, de: yo(), tipo: b.tipo, opciones: b.tipo === "respuesta" ? ["Asisto", "No asisto"] : undefined, titulo: t, fecha: HOY, alcance: b.alcance, cuerpo: $("#av-txt").value, vence: $("#av-vence")?.value, requiereConfirmacion: b.tipo !== "info", confirmados: [], respuestas: {} });
  S.borrador = null; guardar(); toast("Aviso enviado");
  ir(b.tipo === "info" ? "#/hoy" : `#/seguimiento/${id}`);
}
function vSeguimiento(id) {
  if (id) {
    const c = S.comunicados.find((x) => x.id === +id), fs = familiasDe(c.alcance), si = fs.filter((f) => c.respuestas[f]);
    return `<h1>${esc(c.titulo)}</h1><p class="sub">Para ${esc(c.alcance)}</p><div class="barra"><div style="width:${(si.length / fs.length) * 100}%"></div></div><p class="resumen"><b>${si.length} de ${fs.length}</b> familias respondieron.</p>
      ${fs.filter((f) => !c.respuestas[f]).length ? `<button class="btn pri" onclick="recordar(${c.id})">Recordar a los que faltan</button>` : ""}
      ${fs.map((f) => `<div class="fila-alumno">${avatar(f)}<span>${esc(nombre(f))}<small>${esc(rolDe(f))}</small></span><span class="pill ${c.respuestas[f] ? (/^No/.test(c.respuestas[f].r) ? "aviso" : "ok") : ""}">${c.respuestas[f] ? esc(c.respuestas[f].r) : "Sin responder"}</span></div>`).join("")}`;
  }
  const l = S.comunicados.filter((c) => c.tipo !== "info").sort((a, b) => b.fecha.localeCompare(a.fecha));
  return `<h1>Seguimiento</h1><p class="sub">Avisos que esperan respuesta</p>${l.map((c) => { const fs = familiasDe(c.alcance), n = fs.filter((f) => c.respuestas[f]).length; return `<button class="card seg" onclick="ir('#/seguimiento/${c.id}')"><b>${esc(c.titulo)}</b><div class="barra"><div style="width:${fs.length ? (n / fs.length) * 100 : 0}%"></div></div><small>${n} de ${fs.length} respondieron</small></button>`; }).join("")}`;
}

// ───────────────────────── secciones que vuelven (punto medio) ─────────────────────────
function avanceMateria(a, mat, c) {
  const conts = S.contenidos.filter((x) => x.materia === mat && x.curso === c && x.obligatorio && S.unidades.find((u) => u.id === x.unidad) === unidadActual(unidadesDe(mat, c)));
  const tars = S.tareas.filter((t) => t.materia === mat && t.curso === c && conts.some((x) => x.id === t.contenido));
  const total = conts.length + tars.length;
  return total ? Math.round(((conts.filter((x) => x.vistoPor.includes(a)).length + tars.filter((t) => t.entregas[a]).length) / total) * 100) : null;
}
function vMas() {
  const resto = secciones().slice(4);
  return `<h1>Más</h1>${resto.map(([k, t, i]) => `<button class="item" onclick="ir('#/${k}')"><span class="av grupo">{{${i}}}</span><span><b>${t}</b></span>{{chevron}}</button>`).join("")}
    <button class="item" onclick="verPerfil()">${avatar(yo())}<span><b>Mi perfil</b><small>${esc(nombre(yo()))}</small></span>{{chevron}}</button>`;
}

// Avisos del colegio (todos los roles).
function avisosVisibles() { return S.comunicados.filter((c) => S.rol === "secretaria" || coincide(c.alcance, misCursos())).sort((a, b) => b.fecha.localeCompare(a.fecha)); }
function vAvisos() {
  const filtro = S.filtroAvisos || "todos";
  const me = yo();
  const estado = (c) => (c.tipo === "info" ? ["Informativo", ""] : S.rol !== "familia" ? [`${Object.keys(c.respuestas).length} de ${familiasDe(c.alcance).length} respondieron`, ""] : c.respuestas[me] ? [`Respondiste: ${c.respuestas[me].r}`, "ok"] : ["Falta responder", "aviso"]);
  let l = avisosVisibles();
  if (filtro === "pendientes") l = l.filter((c) => c.tipo !== "info" && !c.respuestas[me]);
  return `<h1>Avisos del colegio</h1>
    ${S.rol === "familia" ? `<div class="chips"><button class="chip-op ${filtro === "todos" ? "sel" : ""}" onclick="S.filtroAvisos='todos';render()">Todos</button><button class="chip-op ${filtro === "pendientes" ? "sel" : ""}" onclick="S.filtroAvisos='pendientes';render()">Por responder</button></div>` : ""}
    ${l.map((c) => { const [t, k] = estado(c); return `<button class="item" onclick="verComunicado(${c.id})">${avatar(c.de)}<span><b>${esc(c.titulo)}</b><small>${esc(nombre(c.de))} · ${fDia(c.fecha)} · para ${esc(c.alcance)}</small></span><span class="pill ${k}">${esc(t)}</span></button>`; }).join("") || '<div class="vacio">{{megafono}}<p>No hay avisos.</p></div>'}`;
}

// Agenda: lista por defecto y vista de mes.
function eventosAgenda() {
  const cs = misCursos(), aula = ["Examen", "Entrega", "Tarea", "Clase"];
  let evs = S.eventos.filter((e) => e.curso === "todos" || cs.includes(e.curso));
  if (S.rol === "familia") evs = evs.filter((e) => !aula.includes(e.etiqueta));
  if (S.rol === "alumno" || S.rol === "docente") evs = evs.concat(S.tareas.filter((t) => cs.includes(t.curso) && (S.rol === "alumno" || materiasDocente().includes(t.materia))).map((t) => ({ id: "t" + t.id, titulo: `Entrega: ${t.titulo}`, fecha: t.entrega, etiqueta: "Entrega", curso: t.curso })));
  return evs.sort((a, b) => a.fecha.localeCompare(b.fecha));
}
function verEvento(id) {
  const e = eventosAgenda().find((x) => String(x.id) === String(id));
  if (!e) return;
  const d = fecha(e.fecha);
  hoja(esc(e.titulo), `<p class="pill">${esc(e.etiqueta)}</p><p class="texto"><b>${["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"][d.getDay()]} ${d.getDate()} de ${MESES[d.getMonth()]}</b> · ${cuando(e.fecha)}</p><p class="sub">Para ${e.curso === "todos" ? "todo el colegio" : esc(curso(e.curso).nombre)}</p>
    ${String(e.id).startsWith("t") ? `<button class="btn pri" onclick="verTarea(${String(e.id).slice(1)})">Ver la tarea</button>` : ""}`);
}
function vAgenda() {
  const mes = S.mesAgenda || HOY.slice(0, 7), vista = S.vistaAgenda || "lista";
  const [y, m] = mes.split("-").map(Number);
  const evs = eventosAgenda().filter((e) => e.fecha.startsWith(mes));
  const mover = (d) => { const n = new Date(y, m - 1 + d, 1); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}`; };
  let cuerpo;
  if (vista === "mes") {
    const primero = new Date(y, m - 1, 1).getDay(), total = new Date(y, m, 0).getDate();
    let celdas = DIAS.map((d) => `<div class="cal-dow">${d}</div>`).join("") + "<div></div>".repeat(primero);
    for (let d = 1; d <= total; d++) {
      const f = `${mes}-${String(d).padStart(2, "0")}`, del = evs.filter((e) => e.fecha === f);
      celdas += `<div class="cal-dia ${f === HOY ? "hoy" : ""}"><span>${d}</span>${del.map((e) => `<button class="cal-ev" onclick="verEvento('${e.id}')" title="${esc(e.titulo)}">${esc(e.titulo)}</button>`).join("")}</div>`;
    }
    cuerpo = `<div class="cal">${celdas}</div>`;
  } else {
    cuerpo = evs.map((e) => `<button class="item" onclick="verEvento('${e.id}')"><span class="fecha-chica">${fDia(e.fecha)}</span><span><b>${esc(e.titulo)}</b><small>${esc(e.etiqueta)}</small></span>{{chevron}}</button>`).join("") || '<p class="sub">No hay fechas este mes.</p>';
  }
  return `<div class="titulo-fila"><h1>Agenda</h1><div class="chips"><button class="chip-op ${vista === "lista" ? "sel" : ""}" onclick="S.vistaAgenda='lista';render()">Lista</button><button class="chip-op ${vista === "mes" ? "sel" : ""}" onclick="S.vistaAgenda='mes';render()">Mes</button></div></div>
    <div class="mes-nav"><button class="icono" onclick="S.mesAgenda='${mover(-1)}';render()">{{izq}}</button><b>${MESES[m - 1][0].toUpperCase() + MESES[m - 1].slice(1)} ${y}</b><button class="icono" onclick="S.mesAgenda='${mover(1)}';render()">{{der}}</button></div>${cuerpo}`;
}

// Cuotas (módulo existente de Búho).
function vCuotas() {
  const pagada = !!S.cuotas[yo()];
  const filas = [["Octubre 2026", "10/10/26", pagada], ["Septiembre 2026", "10/09/26", true], ["Agosto 2026", "10/08/26", true], ["Julio 2026", "10/07/26", true]];
  return `<h1>Cuotas</h1><p class="sub">${hijos().map((h) => primer(h)).join(", ")} · se paga desde Búho con MercadoPago</p>
    ${filas.map(([mes, vence, ok], i) => `<div class="item"><span class="av grupo">{{tarjeta}}</span><span><b>${mes}</b><small>Vence ${vence}</small></span>${ok ? '<span class="pill ok">Pagada</span>' : `<button class="btn pri" onclick="pagarCuota();render()">Pagar</button>`}</div>`).join("")}`;
}

// Notas: alumno (las propias), docente (planilla por materia).
function tablaNotas(a) {
  const ms = materiasDeCurso(cursoDe(a));
  return `<div class="tabla-scroll"><table class="tabla"><tr><th>Materia</th>${REGIMEN.periodos.map((p) => `<th>${p.replace(" Bimestre", "°").replace("°°", "°")}</th>`).join("")}<th>Prom.</th></tr>
    ${ms.map((m) => { const v = REGIMEN.periodos.map((_, i) => (S.publicado[i] ? nota(a, m.id, i) : null)); const ok = v.filter((x) => x != null); return `<tr><td>${esc(m.nombre)}</td>${v.map((x) => `<td class="${x != null && x < REGIMEN.aprobacion ? "baja" : ""}">${x ?? "—"}</td>`).join("")}<td><b>${ok.length ? fmtNota(Math.round((ok.reduce((s, x) => s + x, 0) / ok.length) * 10) / 10) : "—"}</b></td></tr>`; }).join("")}</table></div>`;
}
function vNotas(mat) {
  if (S.rol === "alumno") {
    const me = yo(), p = ultPeriodo(), ms = materiasDeCurso(cursoAlumno());
    return `<h1>Mis notas</h1><p class="sub">${REGIMEN.periodos[p]}</p><div class="mosaico">${ms.map((m) => { const n = nota(me, m.id, p); return `<div class="tesela ${n != null && n < REGIMEN.aprobacion ? "baja" : ""}"><span class="num">${n ?? "—"}</span><span class="mat">${esc(m.nombre)}</span></div>`; }).join("")}</div>
      <h2 class="separa">Todos los bimestres</h2>${tablaNotas(me)}<div class="atajos"><button class="btn" onclick="toast('En el producto descarga el boletín en PDF')">{{archivo}} Boletín</button></div>`;
  }
  const c = cursosDocente()[0], ms = materiasDocente(), m = mat && ms.includes(mat) ? mat : ms[0], p = S.publicado.indexOf(false);
  return `<h1>Notas</h1><div class="chips">${ms.map((x) => `<button class="chip-op ${x === m ? "sel" : ""}" onclick="ir('#/notas/${x}')">${esc(materia(x).nombre)}</button>`).join("")}</div>
    <p class="sub">${esc(curso(c).nombre)} · se carga el ${REGIMEN.periodos[p]} · los cambios se guardan solos</p>
    <div class="tabla-scroll"><table class="tabla"><tr><th>Alumno</th>${REGIMEN.periodos.map((x, i) => `<th>${i + 1}°</th>`).join("")}</tr>
    ${ALUMNOS_CURSO[c].map((a) => `<tr><td>${esc(nombre(a))}</td>${REGIMEN.periodos.map((_, i) => i === p ? `<td><input class="nota-in" type="number" min="1" max="10" value="${nota(a, m, i) ?? ""}" onfocus="this.select()" onchange="ponerNota('${a}','${m}',${i},this.value)" onkeydown="if(event.key==='Enter'){const l=[...document.querySelectorAll('.nota-in')];(l[l.indexOf(this)+1]||this).focus()}"></td>` : `<td class="${nota(a, m, i) != null && nota(a, m, i) < REGIMEN.aprobacion ? "baja" : ""}">${nota(a, m, i) ?? "—"}</td>`).join("")}</tr>`).join("")}</table></div>
    <button class="btn pri" onclick="toast('Notas publicadas: alumnos y familias ya las ven')">Publicar ${REGIMEN.periodos[p]}</button>`;
}

// Pendientes del alumno (todas las materias) y entregas por corregir del docente.
function vPendientes() {
  const me = yo(), ts = S.tareas.filter((t) => t.curso === cursoAlumno()).sort((a, b) => a.entrega.localeCompare(b.entrega));
  const grupo = (titulo, ks) => { const l = ts.filter((t) => ks.includes(estadoTarea(t, me).k)); return l.length ? `<h2 class="separa">${titulo} (${l.length})</h2>${l.map((t) => `<button class="item" onclick="verTarea(${t.id})"><span class="fecha-chica">${fDia(t.entrega)}</span><span><b>${esc(t.titulo)}</b><small>${esc(materia(t.materia).nombre)} · ${esc(contenido(t.contenido).titulo)}</small></span><span class="pill ${ks.includes("pendiente") || ks.includes("vencida") ? "aviso" : "ok"}">${estadoTarea(t, me).txt}</span></button>`).join("")}` : ""; };
  return `<h1>Pendientes</h1><p class="sub">Las tareas de todas tus materias</p>${grupo("Para entregar", ["pendiente"])}${grupo("Vencidas", ["vencida"])}${grupo("Entregadas", ["entregada", "corregida"])}`;
}
function vCorregir() {
  const cs = cursosDocente();
  const filas = S.tareas.filter((t) => materiasDocente().includes(t.materia) && cs.includes(t.curso)).flatMap((t) => Object.entries(t.entregas).filter(([, e]) => e.nota == null).map(([a]) => ({ t, a })));
  return `<h1>Por corregir</h1><p class="sub">${filas.length ? `${filas.length} entrega(s) esperando tu corrección` : "No tenés entregas pendientes."}</p>
    ${filas.map(({ t, a }) => `<div class="item">${avatar(a)}<span><b>${esc(nombre(a))}</b><small>${esc(t.titulo)} · ${esc(materia(t.materia).nombre)}</small></span><button class="btn pri" onclick="corregir(${t.id},'${a}')">Corregir</button></div>`).join("")}`;
}
function nuevaUnidad(mat, c) {
  hoja("Nueva unidad", `<input id="nu-tit" class="campo" placeholder="Título (ej. Unidad 4: …)"><p class="pregunta">¿Cuándo?</p><div class="dos"><input id="nu-desde" class="campo" type="date" value="${HOY}"><input id="nu-hasta" class="campo" type="date" value="${HOY}"></div>
    <p class="pregunta">¿Qué van a aprender? (un objetivo por renglón)</p><textarea id="nu-obj" class="campo" rows="4"></textarea><button class="btn pri ancho" onclick="guardarUnidad('${mat}','${c}')">Crear unidad</button>`);
}
function guardarUnidad(mat, c) {
  const t = $("#nu-tit").value.trim(), obj = $("#nu-obj").value.split("\n").map((x) => x.trim()).filter(Boolean);
  if (!t || !obj.length) return toast("Completá el título y al menos un objetivo");
  S.unidades.push({ id: Date.now(), curso: c, materia: mat, orden: Math.max(0, ...unidadesDe(mat, c).map((u) => u.orden)) + 1, titulo: t, desde: $("#nu-desde").value, hasta: $("#nu-hasta").value, objetivos: obj });
  guardar(); cerrarHoja(); render(); toast("Unidad creada");
}

// Secretaría: panel y calificaciones por curso.
function indicadores() {
  const coms = S.comunicados.filter((c) => c.tipo !== "info");
  const esperadas = coms.reduce((s, c) => s + familiasDe(c.alcance).length, 0), resp = coms.reduce((s, c) => s + familiasDe(c.alcance).filter((f) => c.respuestas[f]).length, 0);
  const p = S.publicado.indexOf(false);
  const celdas = CURSOS.flatMap((c) => materiasDeCurso(c.id).flatMap((m) => ALUMNOS_CURSO[c.id].map((a) => nota(a, m.id, p) != null)));
  return [[`${esperadas ? Math.round((resp / esperadas) * 100) : 0}%`, "respuesta a los avisos"], [`${celdas.length ? Math.round((celdas.filter(Boolean).length / celdas.length) * 100) : 0}%`, `notas del ${REGIMEN.periodos[p]} cargadas`], [CURSOS.flatMap((c) => riesgo(c.id)).length, "alumnos necesitan atención"], [S.ausencias.filter((x) => x.desde <= HOY && x.hasta >= HOY).length, "ausencias avisadas hoy"]];
}
function vPanel() {
  const p = S.publicado.indexOf(false);
  return `<h1>Panel</h1><div class="mosaico">${indicadores().map(([v, t]) => `<div class="tesela"><span class="num">${v}</span><span class="mat">${t}</span></div>`).join("")}</div>
    <h2 class="separa">Notas del ${REGIMEN.periodos[p]} por curso</h2>${CURSOS.filter((c) => materiasDeCurso(c.id).length).map((c) => { const ms = materiasDeCurso(c.id), celdas = ms.flatMap((m) => ALUMNOS_CURSO[c.id].map((a) => nota(a, m.id, p) != null)), x = Math.round((celdas.filter(Boolean).length / celdas.length) * 100); return `<button class="card seg" onclick="ir('#/boletines/${c.id}')"><b>${esc(c.nombre)}</b><div class="barra"><div style="width:${x}%"></div></div><small>${x}% cargado</small></button>`; }).join("")}
    <h2 class="separa">Necesitan atención</h2>${CURSOS.flatMap((c) => riesgo(c.id)).map((r) => `<div class="item">${avatar(r.a)}<span><b>${esc(nombre(r.a))}</b><small>${esc(curso(cursoDe(r.a)).nombre)} · ${esc(r.motivos.join(". "))}</small></span><button class="btn" onclick="ir('#/mensajes/${familiaDe(r.a)}')">Escribir</button></div>`).join("") || '<p class="sub">Nadie por ahora.</p>'}`;
}
function vBoletines(cid) {
  const cs = CURSOS.filter((c) => materiasDeCurso(c.id).length), c = cs.find((x) => x.id === cid) || cs[0], p = S.publicado.indexOf(false);
  return `<h1>Calificaciones</h1><div class="chips">${cs.map((x) => `<button class="chip-op ${x.id === c.id ? "sel" : ""}" onclick="ir('#/boletines/${x.id}')">${esc(x.nombre)}</button>`).join("")}</div>
    <h2 class="separa">Carga del ${REGIMEN.periodos[p]}</h2>${materiasDeCurso(c.id).map((m) => { const x = Math.round((ALUMNOS_CURSO[c.id].filter((a) => nota(a, m.id, p) != null).length / ALUMNOS_CURSO[c.id].length) * 100); return `<div class="item"><span><b>${esc(m.nombre)}</b><small>${esc(nombre(m.docente))}</small><span class="barra"><span style="display:block;height:100%;width:${x}%;background:var(--ok)"></span></span></span>${x < 100 ? `<button class="btn" onclick="toast('Recordatorio enviado a ${esc(nombre(m.docente))}')">Recordar</button>` : '<span class="pill ok">Completa</span>'}</div>`; }).join("")}
    <h2 class="separa">Alumnos</h2>${ALUMNOS_CURSO[c.id].map((a) => { const r = resumenNotas(a); return `<div class="item">${avatar(a)}<span><b>${esc(nombre(a))}</b><small>Promedio ${r.prom == null ? "—" : fmtNota(r.prom)}</small></span><button class="btn" onclick="toast('En el producto descarga el boletín en PDF')">Boletín</button></div>`; }).join("")}`;
}

// ───────────────────────── navegación ─────────────────────────
// Todas las secciones de cada rol: en computadora van en el menú lateral; en el celular,
// las primeras cuatro como pestañas y el resto en "Más".
function secciones() {
  const j = esJardin();
  if (S.rol === "familia") return [["hoy", "Hoy", "inicio"], ["mensajes", "Mensajes", "sobre"], j ? ["sala", "La sala", "foro"] : ["hijos", "Mis hijos", "usuario"], ["avisos", "Avisos del colegio", "megafono"], ["agenda", "Agenda", "calendario"], ["cuotas", "Cuotas", "tarjeta"]];
  if (S.rol === "alumno") return [["hoy", "Hoy", "inicio"], ["materias", "Materias", "libro"], ["pendientes", "Pendientes", "tarea"], ["mensajes", "Mensajes", "sobre"], ["notas", "Mis notas", "grafico"], ["agenda", "Agenda", "calendario"], ["avisos", "Avisos del colegio", "megafono"]];
  if (S.rol === "docente") return [["hoy", "Hoy", "inicio"], ["cursos", j ? "Mi sala" : "Mis cursos", "libro"], ["mensajes", "Mensajes", "sobre"], ...(j ? [] : [["corregir", "Por corregir", "tarea"], ["notas", "Notas", "grafico"]]), ["agenda", "Agenda", "calendario"], ["avisos", "Avisos del colegio", "megafono"]];
  return [["hoy", "Hoy", "inicio"], ["enviar", "Enviar aviso", "lapiz"], ["seguimiento", "Seguimiento", "megafono"], ["mensajes", "Mensajes", "sobre"], ["panel", "Panel", "grafico"], ["boletines", "Calificaciones", "archivo"], ["agenda", "Agenda", "calendario"]];
}
// En las pestañas del celular, nombres cortos.
const CORTOS = { "Avisos del colegio": "Avisos", "Por corregir": "Corregir", "Enviar aviso": "Enviar" };
function pestanas() { const s = secciones().map(([k, t, i]) => [k, CORTOS[t] || t, i]); return s.length > 4 ? [...s.slice(0, 4), ["mas", "Más", "puntos"]] : s; }
function ir(h) { location.hash = h; }
function ruta() { return (location.hash.replace(/^#\/?/, "") || "hoy").split("/").map(decodeURIComponent); }
function render() {
  $("#rol-select").value = S.rol; $("#nivel-select").value = S.nivel;
  $("#rol-select option[value=alumno]").disabled = esJardin();
  const [sec, a, b, c] = ruta();
  const todas = secciones();
  const nuevos = noLeidosDe(yo()).length;
  const pendCom = S.rol === "familia" ? S.comunicados.filter((x) => x.tipo !== "info" && coincide(x.alcance, misCursos()) && !x.respuestas[yo()]).length : 0;
  const contador = (k) => (k === "mensajes" && nuevos ? `<span class="burbuja-n">${nuevos}</span>` : k === "avisos" && pendCom ? `<span class="burbuja-n">${pendCom}</span>` : "");
  const enMas = !pestanas().some(([k]) => k === sec) && todas.some(([k]) => k === sec);
  $("#pestanas").innerHTML = iconizar(pestanas().map(([k, t, i]) => `<button class="${sec === k || (k === "mas" && enMas) ? "activa" : ""}" onclick="ir('#/${k}')">{{${i}}}${contador(k)}<span>${t}</span></button>`).join(""));
  $("#lateral").innerHTML = iconizar(`<div class="lat-cab"><span class="logo">JH</span><span class="cab-titulo">Campus<small>${esc(COLEGIO.nombre)}</small></span></div>
    ${todas.map(([k, t, i]) => `<button class="lat-item ${sec === k ? "activa" : ""}" onclick="ir('#/${k}')">{{${i}}}<span>${t}</span>${contador(k)}</button>`).join("")}
    <button class="lat-item lat-yo" onclick="verPerfil()">${avatar(yo())}<span>${esc(nombre(yo()))}</span></button>`);
  const vistas = {
    hoy: () => vHoy(),
    mensajes: () => (a ? vChat(a) : vMensajes()),
    hijos: () => (a ? vHijo(a) : vHijos()),
    sala: () => vSala(a),
    materias: () => (a ? (b === "foro" ? (c ? vForoTema(+c) : `<h1>Foro · ${esc(materia(a).nombre)}</h1><button class="btn pri" onclick="nuevoTema('${cursoAlumno()}','${a}')">{{mas}} Nuevo tema</button>${listaTemas(cursoAlumno(), a)}`) : vMateria(a, cursoAlumno())) : vMaterias()),
    cursos: () => (a ? vCurso(a, b, c) : vCursos()),
    enviar: () => vEnviar(),
    seguimiento: () => vSeguimiento(a),
    avisos: () => vAvisos(),
    agenda: () => vAgenda(),
    cuotas: () => vCuotas(),
    notas: () => vNotas(a),
    pendientes: () => vPendientes(),
    corregir: () => vCorregir(),
    panel: () => vPanel(),
    boletines: () => vBoletines(a),
    mas: () => vMas(),
  };
  const permitida = sec === "mas" || todas.some(([k]) => k === sec);
  const dentro = permitida && a && sec !== "notas" && sec !== "boletines";
  const titulo = sec === "mensajes" && a ? esc(nombreHilo(a)) : "";
  $("#cabecera").innerHTML = iconizar(dentro
    ? `<button class="atras" onclick="history.length > 1 ? history.back() : ir('#/${sec}')">{{izq}}</button><span class="cab-titulo">${titulo}</span>`
    : `<span class="logo solo-movil">JH</span><span class="cab-titulo solo-movil">Campus<small>${esc(COLEGIO.nombre)}</small></span><span class="espacio"></span><button class="yo solo-movil" onclick="verPerfil()">${avatar(yo())}</button>`);
  $("#pantalla").innerHTML = iconizar(permitida ? vistas[sec]() : vHoy());
  document.body.classList.toggle("en-chat", !!$("#pantalla .redactar"));
}
function verPerfil() {
  hoja(esc(nombre(yo())), `<p class="sub">${esc(rolDe(yo()) || "Secretaría")}</p>
    <label class="check"><input type="checkbox" checked> Avisarme por email cuando llega algo nuevo</label>
    <button class="item" onclick="toast('En el producto cierra la sesión')"><span><b>Cerrar sesión</b></span>{{chevron}}</button>`);
}
function cambiarRol(r) { verTodasHoy = false; S.rol = r; if (esJardin() && r === "alumno") S.rol = "familia"; guardar(); ir("#/hoy"); render(); }
function cambiarNivel(n) { verTodasHoy = false; S.nivel = n; if (n === "jardin" && S.rol === "alumno") { S.rol = "familia"; toast("En jardín los chicos no tienen usuario: se muestra la familia"); } guardar(); ir("#/hoy"); render(); }
function reiniciar() { try { localStorage.removeItem(CLAVE); } catch (e) {} S = inicial(); aplicarParams(); ir("#/hoy"); render(); toast("Datos de la demo reiniciados"); }
function verEnlaces() {
  const base = location.href.split(/[?#]/)[0];
  const l = [["familia", "jardin", "Familia — Jardín"], ["docente", "jardin", "Docente — Jardín"], ["familia", "primario", "Familia — Primario y Secundario"], ["alumno", "primario", "Alumno — Primario"], ["docente", "primario", "Docente — Primario"], ["alumno", "secundario", "Alumno — Secundario"], ["docente", "secundario", "Docente — Secundario"], ["secretaria", "primario", "Secretaría"]];
  hoja("Enlaces por rol", `<p class="sub">Cada enlace entra directo con ese rol, sin la barra de maqueta.</p>${l.map(([r, n, t]) => { const u = `${base}?rol=${r}&nivel=${n}`; return `<div class="fila-enlace"><b>${t}</b><input class="campo" readonly value="${u}" onclick="this.select()"><button class="btn" onclick="navigator.clipboard && navigator.clipboard.writeText('${u}');toast('Copiado')">Copiar</button></div>`; }).join("")}`);
}
function aplicarParams() {
  const p = new URLSearchParams(location.search);
  if (["familia", "alumno", "docente", "secretaria"].includes(p.get("rol"))) {
    S.rol = p.get("rol");
    if (NIVELES[p.get("nivel")]) S.nivel = p.get("nivel");
    if (S.nivel === "jardin" && S.rol === "alumno") S.nivel = "primario";
    document.body.classList.add("directo");
  }
}
window.addEventListener("hashchange", () => { cerrarHoja(); render(); window.scrollTo(0, 0); });
aplicarParams();
guardar();
render();
