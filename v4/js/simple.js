// Versión 4: menos información a la vez.
// 1) Enlace directo por rol (?rol=docente&nivel=jardin), sin barra de maqueta.
// 2) Modo presentación: oculta los carteles de maqueta ("nuevo", "a confirmar", notas).
// 3) Módulos según el nivel; Jardín solo usa mensajería, comunicados y foro de la sala.
// 4) Inicio con una sola lista de lo importante; el resto detrás de "Ver más".
// 5-7) Aula: solo la unidad en curso abierta, tareas y objetivos plegados.

// ───────────────────────── 3. módulos según el nivel ─────────────────────────
ICONOS.foro = "M4 5h16v11H9l-5 4z M8 9h8 M8 12h5";
SECCIONES.foro = { t: "Foro de la sala", i: "{{foro}}" };
const BIENVENIDA_BASE = { familia: BIENVENIDA.familia, docente: BIENVENIDA.docente };
const MENUS_NIVEL = {
  jardin: {
    familia: ["inicio", "mensajes", "comunicados", "foro", "calendario", "cuotas"],
    docente: ["inicio", "mensajes", "comunicados", "foro", "calendario"],
  },
  escolar: {
    familia: ["inicio", "mensajes", "comunicados", "calificaciones", "calendario", "cuotas"],
    alumno: ["inicio", "mensajes", "comunicados", "materias", "calificaciones", "calendario"],
    docente: ["inicio", "mensajes", "comunicados", "materias", "calificaciones", "calendario"],
  },
};
const esJardin = () => S.nivel === "jardin";
aplicarNivel = function () {
  const n = NIVELES[S.nivel] || NIVELES.primario;
  Object.assign(ROLES.alumno, n.alumno);
  Object.assign(ROLES.docente, n.docente);
  ROLES.familia.id = n.familia.id;
  ROLES.familia.hijos = n.familia.hijos.slice();
  if (!ROLES.familia.hijos.includes(S.hijo)) S.hijo = ROLES.familia.hijos[0];
  const j = esJardin();
  Object.assign(MENU, j ? MENUS_NIVEL.jardin : MENUS_NIVEL.escolar);
  TABS.familia = j ? [["inicio", "Inicio"], ["mensajes", "Mensajes"], ["comunicados", "Avisos"], ["foro", "Foro"]] : [["inicio", "Inicio"], ["mensajes", "Mensajes"], ["comunicados", "Avisos"], ["calificaciones", "Notas"]];
  TABS.docente = j ? [["inicio", "Inicio"], ["mensajes", "Mensajes"], ["foro", "Foro"], ["comunicados", "Avisos"]] : [["inicio", "Inicio"], ["materias", "Aula"], ["mensajes", "Mensajes"], ["calificaciones", "Notas"]];
  GRUPOS_DESTINO.docente = j ? ["Familias", "Docentes", "Directivos"] : ["Alumnos", "Familias", "Docentes", "Directivos"];
  BIENVENIDA.familia = j ? BIENVENIDA_JARDIN.familia : BIENVENIDA_BASE.familia;
  BIENVENIDA.docente = j ? BIENVENIDA_JARDIN.docente : BIENVENIDA_BASE.docente;
  const op = document.querySelector('#rol-select option[value="alumno"]');
  if (op) op.disabled = j;
};
cambiarNivel = function (v) {
  S.nivel = v; aplicarNivel();
  if (esJardin() && S.rol === "alumno") { toast("En Nivel Inicial los chicos no tienen usuario: se muestra la vista de la familia"); cambiarRol("familia"); return; }
  guardar(); location.hash = "#/inicio"; render();
};
cursoAula = function () { return S.rol === "familia" ? cursoDeAlumno(S.hijo) : S.rol === "alumno" ? ROLES.alumno.curso : ROLES.docente.cursos[0]; };
const _materiasDeCurso4 = materiasDeCurso;
materiasDeCurso = function (c) { return curso(c).nivel === "Inicial" ? [] : _materiasDeCurso4(c); };

// Comunicados y destinatarios según el curso, el nivel o todo el colegio.
function coincideAlcance(alcance, cursos) {
  return alcance === "Todo el colegio" || cursos.some((c) => alcance === "Nivel " + curso(c).nivel || alcance === curso(c).nombre);
}
comunicadoVisible = function (c) {
  if (S.rol === "secretaria") return true;
  return coincideAlcance(c.alcance, S.rol === "docente" ? ROLES.docente.cursos : cursosVisibles());
};
familiasDeAlcance = function (alcance) {
  return Object.keys(FAMILIAS).filter((f) => coincideAlcance(alcance, FAMILIAS[f].map(cursoDeAlumno)));
};
const _destinatarios4 = destinatariosPorGrupo;
destinatariosPorGrupo = function () {
  const out = _destinatarios4();
  if (out.Familias && S.rol === "docente") out.Familias = familiasDeAlcance(curso(ROLES.docente.cursos[0]).nombre);
  return out;
};

// Foro de la sala (jardín): la docente abre temas y las familias responden.
function vForoRuta(id) {
  if (!esJardin()) return `<div class="panel">En primario y secundario el foro está dentro del aula de cada materia.</div>`;
  let h = id ? vForoTema("sala", +id) : vForo("sala");
  h = h.split("#/materias/sala/foro").join("#/foro");
  if (S.rol === "familia") h = h.replace(/<div class="toolbar"><button class="primario" onclick="nuevoTemaForo\('sala'\)">[\s\S]*?<\/div>/, "");
  h = h.replace(/<div class="nota-maqueta[\s\S]*?<\/div>/, notaMaqueta("Jardín: foro de la sala entre la docente y las familias. A confirmar si las familias pueden abrir temas (en la demo, solo la docente)."));
  return `<h1 class="titulo-pagina">Foro de ${esc(curso(cursoAula()).nombre)}</h1>${h}`;
}
const _guardarTemaForo4 = guardarTemaForo;
guardarTemaForo = function (mat) {
  const antes = S.foros.length;
  _guardarTemaForo4(mat);
  if (mat === "sala" && S.foros.length > antes) location.hash = "#/foro/" + S.foros[S.foros.length - 1].id;
};
const _rutaEnModal4 = rutaEnModal;
rutaEnModal = function (h) { const [s, a] = partes(h); return s === "foro" ? /^\d+$/.test(a || "") : _rutaEnModal4(h); };
const _contenidoRuta4 = contenidoRuta;
contenidoRuta = function (h) { const [s, a] = partes(h); return s === "foro" ? { t: "Foro de la sala", html: vForoRuta(a) } : _contenidoRuta4(h); };

// ───────────────────────── 4. inicio: una sola lista de lo importante ─────────────────────────
function itemHoy(x) { return `<a class="hoy-item ${x.urgente ? "urgente" : ""}" onclick="${x.on}">{{${x.i}}}<span>${x.t}</span><span class="flecha">→</span></a>`; }
function paraHacerHoy() {
  const items = [];
  const n = noLeidos().length;
  if (S.rol === "docente") {
    const cursos = ROLES.docente.cursos;
    const porCorregir = S.tareas.filter((t) => ROLES.docente.materias.includes(t.materia) && cursos.includes(t.curso)).reduce((s, t) => s + Object.values(t.entregas).filter((e) => e.nota == null).length, 0);
    if (porCorregir) items.push({ i: "tarea", t: `<b>${porCorregir} entrega(s)</b> para corregir`, on: "location.hash='#/tareas'" });
    if (n) items.push({ i: "sobre", t: `<b>${n} mensaje(s)</b> sin leer`, on: "location.hash='#/mensajes'" });
    const aus = ausenciasVigentes(cursos).filter((x) => x.desde <= HOY);
    if (aus.length) items.push({ i: "ausente", t: `<b>${aus.length} ausencia(s)</b> avisada(s) para hoy: ${aus.map((x) => primerNombre(x.alumno)).join(", ")}`, on: "modal('Ausencias avisadas', tablaAusencias(ROLES.docente.cursos))" });
    if (!esJardin()) {
      const faltan = ROLES.docente.materias.map((m) => [m, progresoCarga(cursos[0], m, REGIMEN.periodoActual)]).filter(([, p]) => p < 100);
      if (faltan.length) items.push({ i: "grafico", t: `Notas del ${REGIMEN.periodos[REGIMEN.periodoActual]} sin completar: ${faltan.map(([m, p]) => `${esc(materia(m).nombre)} (${p}%)`).join(", ")}`, on: `location.hash='#/calificaciones/${faltan[0][0]}'` });
      const riesgo = cursos.flatMap((c) => alumnosEnRiesgo(c));
      if (riesgo.length) items.push({ i: "alerta", t: `<b>${riesgo.length} alumno(s)</b> necesitan atención`, on: "modal('Alumnos que necesitan atención', tablaRiesgo(ROLES.docente.cursos))" });
    }
    const foro = S.foros.filter((f) => cursos.includes(f.curso) && ROLES.docente.materias.includes(f.materia) && !f.cerrado && f.mensajes[f.mensajes.length - 1].de !== yo());
    if (foro.length) items.push({ i: "foro", t: `<b>${foro.length} tema(s) del foro</b> con respuestas nuevas`, on: esJardin() ? "location.hash='#/foro'" : `location.hash='#/materias/${foro[0].materia}/foro'` });
  } else {
    S.comunicados.filter((c) => c.tipo !== "info").forEach((c) => {
      const faltan = familiasDeAlcance(c.alcance).filter((f) => !c.respuestas[f]).length;
      if (faltan) items.push({ i: "megafono", t: `<b>${esc(c.titulo)}</b>: faltan ${faltan} respuesta(s)`, on: `location.hash='#/comunicados/${c.id}'` });
    });
    if (n) items.push({ i: "sobre", t: `<b>${n} mensaje(s)</b> sin leer`, on: "location.hash='#/mensajes'" });
    const aus = ausenciasVigentes(CURSOS.map((c) => c.id)).filter((x) => x.desde <= HOY);
    if (aus.length) items.push({ i: "ausente", t: `<b>${aus.length} ausencia(s)</b> avisada(s) para hoy`, on: "modal('Ausencias avisadas', tablaAusencias(CURSOS.map((c) => c.id)))" });
    const incompletos = CURSOS.filter((c) => { const ms = materiasDeCurso(c.id); return ms.length && ms.some((m) => progresoCarga(c.id, m.id, REGIMEN.periodoActual) < 100); });
    if (incompletos.length) items.push({ i: "grafico", t: `Notas del ${REGIMEN.periodos[REGIMEN.periodoActual]} sin completar en ${incompletos.length} curso(s)`, on: "location.hash='#/panel'" });
  }
  return `<div class="panel hoy-franja"><h3>Para hacer hoy</h3>${items.map(itemHoy).join("") || '<p class="muted">No tenés nada pendiente.</p>'}</div>`;
}
function tarjetaForoSala() {
  const temas = S.foros.filter((f) => f.curso === cursoAula() && f.materia === "sala").sort((a, b) => b.mensajes[b.mensajes.length - 1].fecha.localeCompare(a.mensajes[a.mensajes.length - 1].fecha));
  return `<div class="panel"><h3>{{foro}} Foro de la sala</h3><table>${temas.slice(0, 3).map((f) => { const ult = f.mensajes[f.mensajes.length - 1]; return `<tr class="fila" onclick="location.hash='#/foro/${f.id}'"><td>${esc(f.titulo)}<div class="small muted">${f.mensajes.length - 1} respuesta(s) · último mensaje ${fDia(ult.fecha)}</div></td></tr>`; }).join("") || '<tr><td class="muted">Todavía no hay temas.</td></tr>'}</table><a onclick="location.hash='#/foro'">Ver el foro →</a></div>`;
}
const _vInicio4 = vInicio;
vInicio = function () {
  const d = document.createElement("div");
  d.innerHTML = _vInicio4();
  const grid = d.querySelector(".grid.inicio");
  if (!grid) return d.innerHTML;
  const titulo = (p) => p.querySelector("h3")?.textContent || "";
  const paneles = [...grid.children];
  // En jardín no hay calificaciones, aula ni tareas.
  if (esJardin()) paneles.filter((p) => /Calificaciones|Entregas por corregir|Carga de notas|Alumnos que necesitan/.test(titulo(p))).forEach((p) => p.remove());
  // A la vista queda una sola tarjeta (la más útil para cada rol); el resto va a "Ver más".
  const visibles = paneles.filter((p) => p.parentNode && (S.rol === "familia" ? /Próximas fechas/ : S.rol === "alumno" ? /Retomar/ : /^$/).test(titulo(p)));
  visibles.forEach((p) => { if (/Próximas fechas/.test(titulo(p))) [...p.querySelectorAll("tr")].slice(3).forEach((tr) => tr.remove()); });
  const resto = paneles.filter((p) => p.parentNode && !visibles.includes(p));
  grid.innerHTML = "";
  if (esJardin() && S.rol === "familia") grid.insertAdjacentHTML("beforeend", tarjetaForoSala());
  visibles.forEach((p) => grid.appendChild(p));
  if (resto.length) {
    grid.insertAdjacentHTML("afterend", `<details class="mas-inicio"><summary>Ver más (${resto.length})</summary><div class="grid inicio"></div></details>`);
    resto.forEach((p) => d.querySelector(".mas-inicio .grid").appendChild(p));
  }
  if (!grid.children.length) grid.remove();
  // Docente y secretaría: una lista de lo que hay que hacer hoy, arriba de todo.
  if (S.rol === "docente" || S.rol === "secretaria") {
    const ancla = d.querySelector(".titulo-pagina + .toolbar") || d.querySelector(".titulo-pagina");
    ancla.insertAdjacentHTML("afterend", paraHacerHoy());
  }
  let h = d.innerHTML;
  // En jardín, "Escribir a la docente" va a la maestra de la sala.
  if (esJardin()) h = h.replace(/abrirRedactar\(\{para:\['d1'\]\}\)/, "abrirRedactar({para:['d11']})");
  return h;
};

// ───────────────────────── 5-7. aula: unidad en curso, tareas y objetivos plegados ─────────────────────────
function toggleTareas(btn, g) {
  document.querySelectorAll(`tr.fila-tarea[data-g="${g}"]`).forEach((r) => r.classList.toggle("oculto"));
  btn.classList.toggle("abierto");
}
function plegarPrograma(html, mat) {
  const d = document.createElement("div");
  d.innerHTML = html;
  const us = unidadesDe(mat, cursoAula());
  const actual = us.find((u) => u.desde <= HOY && HOY <= u.hasta) || us.filter((u) => u.desde <= HOY).pop() || us[0];
  let g = 0;
  d.querySelectorAll(".panel.unidad").forEach((p) => {
    const cab = p.firstElementChild;
    const u = us.find((x) => x.titulo === cab.querySelector("h3")?.textContent);
    const det = document.createElement("details");
    det.className = "panel unidad";
    det.open = !u || u === actual;
    if (u) {
      const estado = u.hasta < HOY ? "Terminada" : u.desde > HOY ? "Próxima" : "En curso";
      cab.insertAdjacentHTML("beforeend", `<span class="chip ${estado === "En curso" ? "ok" : ""}">${estado}</span>`);
    }
    const sum = document.createElement("summary");
    sum.appendChild(cab);
    det.appendChild(sum);
    while (p.firstChild) det.appendChild(p.firstChild);
    // Objetivos plegados.
    const obj = det.querySelector(".objetivos");
    if (obj) { const ul = obj.querySelector("ul"); obj.outerHTML = `<details class="objetivos"><summary>Objetivos de la unidad (${ul.children.length})</summary>${ul.outerHTML}</details>`; }
    // Tareas plegadas bajo el contenido del que salen.
    let fila = null;
    const grupos = new Map();
    det.querySelectorAll("tr").forEach((tr) => {
      if (tr.classList.contains("fila-tarea") && fila) {
        tr.classList.add("oculto"); tr.dataset.g = fila.dataset.g;
        const gr = grupos.get(fila) || { n: 0, pend: 0 };
        gr.n++; if (/Pendiente|vencida/.test(tr.textContent)) gr.pend++;
        grupos.set(fila, gr);
      } else if (tr.classList.contains("fila")) { fila = tr; tr.dataset.g = "g" + g++; }
    });
    grupos.forEach((gr, tr) => {
      tr.children[1].insertAdjacentHTML("beforeend", ` <button class="chip-tareas ${gr.pend ? "pend" : ""}" onclick="event.stopPropagation();toggleTareas(this,'${tr.dataset.g}')">{{tarea}} ${gr.n} tarea${gr.n > 1 ? "s" : ""}${gr.pend ? ` · ${gr.pend} pendiente${gr.pend > 1 ? "s" : ""}` : ""} ▾</button>`);
    });
    p.replaceWith(det);
  });
  return d.innerHTML;
}
const _vMaterias4 = vMaterias;
vMaterias = function (mat, sub, id) {
  const h = _vMaterias4(mat, sub, id);
  return mat && (!sub || sub === "programa") ? plegarPrograma(h, mat) : h;
};

// ───────────────────────── 1-2. enlaces por rol y modo presentación ─────────────────────────
const params = new URLSearchParams(location.search);
const DIRECTO = ROLES[params.get("rol")] ? params.get("rol") : null;
function aplicarPresentacion() {
  document.body.classList.toggle("presentacion", !!S.presentacion || !!DIRECTO);
  const c = $("#modo-pres"); if (c) c.checked = !!S.presentacion;
}
function cambiarPresentacion(v) { S.presentacion = v; guardar(); aplicarPresentacion(); }
function verEnlaces() {
  const base = location.href.split(/[?#]/)[0];
  const filas = [["familia", "jardin", "Familia — Jardín"], ["docente", "jardin", "Docente — Jardín"], ["familia", "primario", "Familia — Primario y Secundario"], ["alumno", "primario", "Alumno — Primario"], ["docente", "primario", "Docente — Primario"], ["alumno", "secundario", "Alumno — Secundario"], ["docente", "secundario", "Docente — Secundario"], ["secretaria", "primario", "Secretaría / Dirección"]];
  modal("Enlaces por rol", `<p>Cada enlace entra directo con ese rol, sin la barra amarilla ni los carteles de maqueta. Así cada persona prueba solo lo suyo.</p>
    <table>${filas.map(([r, n, t]) => { const u = `${base}?rol=${r}&nivel=${n}`; return `<tr><td style="white-space:nowrap">${t}</td><td><input type="text" readonly value="${u}" style="width:100%" onclick="this.select()"></td><td><button onclick="navigator.clipboard && navigator.clipboard.writeText('${u}');toast('Enlace copiado')">Copiar</button></td></tr>`; }).join("")}</table>`);
}
if (DIRECTO) {
  S.rol = DIRECTO; S.logueado = true;
  if (NIVELES[params.get("nivel")]) S.nivel = params.get("nivel");
  if (S.nivel === "jardin" && S.rol === "alumno") S.nivel = "primario";
  document.body.classList.add("directo");
}
if (!S.nivel) S.nivel = "primario";
aplicarNivel();
aplicarPresentacion();
guardar();
render();
