// Opción 2: mejoras sobre la maqueta base. Este archivo se carga después de app.js
// y reemplaza o envuelve sus funciones; app.js queda casi igual al de la opción 1.
const NUEVO = '<span class="chip e2" title="Función nueva: no incluida en la propuesta económica actual">nuevo</span>';

// Demo parcial de carga del 4° bimestre (sin publicar): Lengua completa, Matemática a medias.
if (!S.v2) {
  [["a1", 8], ["a2", 9], ["a3", 6], ["a4", 8], ["a5", 7]].forEach(([a, n]) => (S.notas[a].len[3] = n));
  [["a1", 9], ["a2", 9], ["a4", 7]].forEach(([a, n]) => (S.notas[a].mat[3] = n));
  S.v2 = true;
}
// Reiniciar recarga la página para volver a aplicar los datos de la opción 2.
reiniciar = function () { try { localStorage.removeItem(CLAVE_STORAGE); } catch (e) {} location.hash = "#/inicio"; location.reload(); };

// ───────────────────────── 10. avatares ─────────────────────────
const COLORES_AVATAR = ["#3b6ea5", "#7a5195", "#2f7d6d", "#b0563b", "#5b6b7a", "#8a6d1f", "#a14a76", "#3f7f3f"];
function avatar(id) {
  const n = nombre(id).split(" ");
  const ini = (n[0][0] + (n[1] ? n[1][0] : "")).toUpperCase();
  const i = [...id].reduce((s, c) => s + c.charCodeAt(0), 0) % COLORES_AVATAR.length;
  return `<span class="av" style="background:${COLORES_AVATAR[i]}">${ini}</span>`;
}
const _renderTop = renderTop;
renderTop = function (sec) { _renderTop(sec); $("#top-usuario").innerHTML = avatar(yo()) + $("#top-usuario").innerHTML; };

// ───────────────────────── menú: panel de dirección + barra inferior en celular ─────────────────────────
SECCIONES.panel = { t: "Panel de dirección", i: "{{grafico}}" };
MENU.secretaria.splice(1, 0, "panel");
const TABS = {
  familia: [["inicio", "Inicio"], ["mensajes", "Mensajes"], ["comunicados", "Avisos"], ["calificaciones", "Notas"]],
  alumno: [["inicio", "Inicio"], ["mensajes", "Mensajes"], ["tareas", "Tareas"], ["calificaciones", "Notas"]],
  docente: [["inicio", "Inicio"], ["mensajes", "Mensajes"], ["calificaciones", "Notas"], ["calendario", "Agenda"]],
  secretaria: [["inicio", "Inicio"], ["panel", "Panel"], ["mensajes", "Mensajes"], ["comunicados", "Avisos"]],
};
const _renderMenu = renderMenu;
renderMenu = function (sec) {
  _renderMenu(sec);
  const badge = (k) => { const n = k === "mensajes" ? noLeidos().length : k === "comunicados" ? comunicadosPendientes().length : 0; return n ? `<span class="badge">${n}</span>` : ""; };
  $("#tabbar").innerHTML = iconizar(TABS[S.rol].map(([k, t]) => `<a class="${sec === k ? "activo" : ""}" onclick="location.hash='#/${k}'">${SECCIONES[k].i}${badge(k)}<span>${t}</span></a>`).join("") + `<a onclick="menuMas()">{{puntos}}<span>Más</span></a>`);
};
function menuMas() {
  modal("Menú", [...MENU[S.rol], "perfil"].map((k) => `<div class="item-mas" onclick="cerrarModal();location.hash='#/${k}'">${SECCIONES[k].i} ${SECCIONES[k].t}</div>`).join("") + `<div class="item-mas" onclick="cerrarModal();salir()">Salir</div>`);
}

// ───────────────────────── 2 y 7. comunicados con autorización y respuesta rápida ─────────────────────────
const TIPOS_COM = { info: "Informativo", confirmacion: "Con confirmación de lectura", autorizacion: "Con autorización de la familia", respuesta: "Con respuesta rápida (asisto / no asisto)" };
const ACCION_COM = { confirmacion: "Confirmar lectura", autorizacion: "Autorización por firmar", respuesta: "Respuesta pendiente" };
comunicadosPendientes = function () {
  if (S.rol !== "familia") return [];
  return S.comunicados.filter((c) => comunicadoVisible(c) && c.tipo !== "info" && !c.respuestas[yo()]);
};
function chipComunicado(c) {
  if (c.tipo === "info") return "";
  if (S.rol === "familia") {
    const r = c.respuestas[yo()];
    return r ? `<span class="chip ${/^No/.test(r.r) ? "bad" : "ok"}">✓ ${esc(r.r)}</span>` : `<span class="chip bad">${ACCION_COM[c.tipo]}</span>`;
  }
  return `<span class="chip warn">Respondieron ${Object.keys(c.respuestas).length}/${familiasDeAlcance(c.alcance).length}</span>`;
}
vComunicados = function (id) {
  if (id === "nuevo") return vNuevoComunicado();
  if (id) return vComunicado(+id);
  const lista = S.comunicados.filter(comunicadoVisible).sort((a, b) => b.fecha.localeCompare(a.fecha));
  return `<h1 class="titulo-pagina">Comunicados</h1>
  ${S.rol === "secretaria" ? `<div class="toolbar"><button class="primario" onclick="location.hash='#/comunicados/nuevo'">{{mas}} Nuevo comunicado</button></div>` : ""}
  ${lista.map((c) => `<div class="panel fila" style="cursor:pointer" onclick="location.hash='#/comunicados/${c.id}'">
    <div class="toolbar" style="margin:0"><h3 style="margin:0">${esc(c.titulo)}</h3><span class="sep"></span>${chipComunicado(c)}<span class="small muted">${fFecha(c.fecha)}</span></div>
    <p class="small muted">${avatar(c.de)}${esc(nombre(c.de))} · Para: ${esc(c.alcance)}${c.vence && c.tipo !== "info" ? ` · Responder antes del ${fFecha(c.vence)}` : ""}</p><p>${esc(c.cuerpo.slice(0, 160))}${c.cuerpo.length > 160 ? "…" : ""}</p></div>`).join("")}`;
};
vComunicado = function (id) {
  const c = S.comunicados.find((x) => x.id === id);
  if (!c) return `<div class="panel">Comunicado no encontrado.</div>`;
  const fams = familiasDeAlcance(c.alcance);
  let accion = "";
  if (S.rol === "familia" && c.tipo !== "info") {
    const r = c.respuestas[yo()];
    const hijo = ROLES.familia.hijos.find((h) => c.alcance.includes(curso(cursoDeAlumno(h)).nombre)) || S.hijo;
    if (r) {
      accion = `<div class="panel" style="border-left:4px solid var(--verde)"><h3>Tu respuesta: ${esc(r.r)}</h3>
        ${r.firma ? `<p>Firmado digitalmente por <b>${esc(r.firma)}</b> el ${fFecha(r.fecha)}.</p><button onclick="toast('En el producto: descarga la constancia en PDF')">{{descargar}} Descargar constancia</button> ` : `<p class="small muted">Respondido el ${fFecha(r.fecha)}.</p>`}
        <button onclick="delete S.comunicados.find(x=>x.id===${c.id}).respuestas[yo()];guardar();render()">Cambiar respuesta</button></div>`;
    } else if (c.tipo === "autorizacion") {
      accion = `<div class="panel" style="border-left:4px solid var(--rojo)"><h3>{{firma}} Autorización ${NUEVO}</h3>
        <p>Autorizo a <b>${esc(nombre(hijo))}</b> a participar de: <b>${esc(c.titulo.replace(/: autorización$/, ""))}</b>.</p>
        <div class="grid"><div class="campo"><label>Aclaración (nombre y apellido del tutor)</label><input type="text" id="au-firma" value="${esc(nombre(yo()))}"></div><div class="campo"><label>DNI</label><input type="text" id="au-dni" placeholder="Sin puntos"></div></div>
        <div class="campo"><label>Observaciones (medicación, alergias, quién retira)</label><input type="text" style="width:100%"></div>
        <p class="small muted">Reemplaza el papel firmado. Queda registrado con fecha, hora y usuario.</p>
        <div class="toolbar"><button class="primario" onclick="responderComunicado(${c.id},'Autorizo',document.getElementById('au-firma').value)">✓ Autorizo</button><button class="peligro" onclick="responderComunicado(${c.id},'No autorizo',document.getElementById('au-firma').value)">No autorizo</button></div></div>`;
    } else if (c.tipo === "respuesta") {
      accion = `<div class="panel" style="border-left:4px solid var(--rojo)"><h3>¿Vas a asistir? ${NUEVO}</h3><div class="toolbar">${c.opciones.map((o) => `<button class="${/^No/.test(o) ? "" : "primario"}" onclick="responderComunicado(${c.id},'${o}')">${o}</button>`).join("")}</div></div>`;
    } else {
      accion = `<div class="panel" style="border-left:4px solid var(--rojo)"><button class="primario" onclick="responderComunicado(${c.id},'Leído')">✓ Confirmo que leí este comunicado</button></div>`;
    }
  }
  let seguimiento = "";
  if ((S.rol === "secretaria" || S.rol === "docente") && c.tipo !== "info") {
    const cuenta = {};
    fams.forEach((f) => { const k = c.respuestas[f] ? c.respuestas[f].r : "Sin responder"; cuenta[k] = (cuenta[k] || 0) + 1; });
    seguimiento = `<div class="panel"><h3>Seguimiento ${NUEVO}</h3>
      <div class="tiles">${Object.entries(cuenta).map(([k, n]) => `<div class="tile"><div class="valor">${n}</div><div class="rotulo">${esc(k)}</div></div>`).join("")}</div>
      <table><tr><th>Familia</th><th>Respuesta</th><th>Detalle</th></tr>${fams.map((f) => { const r = c.respuestas[f]; return `<tr><td>${avatar(f)}${esc(nombre(f))}<div class="small muted">${esc(rolDe(f))}</div></td><td>${r ? `<span class="chip ${/^No/.test(r.r) ? "bad" : "ok"}">${esc(r.r)}</span>` : '<span class="chip warn">Sin responder</span>'}</td><td class="small muted">${r ? (r.firma ? `Firmó ${esc(r.firma)} · ` : "") + fFecha(r.fecha) : "—"}</td></tr>`; }).join("")}</table>
      <div class="toolbar" style="margin-top:12px"><button onclick="toast('Recordatorio enviado a las familias que no respondieron')">Enviar recordatorio a pendientes</button><button onclick="toast('En el producto: descarga el listado en Excel/PDF')">{{descargar}} Exportar listado</button></div></div>`;
  }
  return `<div class="toolbar"><button onclick="location.hash='#/comunicados'">← Comunicados</button></div>
  <div class="panel"><h2>${esc(c.titulo)}</h2><p class="small muted">${avatar(c.de)}${esc(nombre(c.de))} — ${esc(rolDe(c.de))} · ${fFecha(c.fecha)} · Para: ${esc(c.alcance)}</p>
  <div class="msg-cuerpo">${esc(c.cuerpo)}</div></div>${accion}${seguimiento}`;
};
function responderComunicado(id, r, firma) {
  const c = S.comunicados.find((x) => x.id === id);
  if (c.tipo === "autorizacion" && !String(firma || "").trim()) return toast("Completá la aclaración");
  c.respuestas[yo()] = { r, fecha: HOY, ...(firma ? { firma: firma.trim() } : {}) };
  if (!c.confirmados.includes(yo())) c.confirmados.push(yo());
  guardar(); render(); toast("Respuesta registrada: " + r);
}

// ───────────────────────── 8. plantillas ─────────────────────────
vNuevoComunicado = function () {
  return `<div class="toolbar"><button onclick="location.hash='#/comunicados'">← Comunicados</button></div>
  <div class="panel"><h2>Nuevo comunicado</h2>
  <div class="campo"><label>Plantilla ${NUEVO}</label><select onchange="usarPlantilla(this.value)"><option value="">En blanco</option>${PLANTILLAS.map((p, i) => `<option value="${i}">${esc(p.nombre)}</option>`).join("")}</select></div>
  <div class="campo"><label>Título</label><input type="text" id="c-tit"></div>
  <div class="grid"><div class="campo"><label>Destinatarios</label><select id="c-alc"><option>Todo el colegio</option><option>Nivel Primario</option><option>Nivel Secundario</option>${CURSOS.map((c) => `<option>${esc(c.nombre)}</option>`).join("")}</select></div>
  <div class="campo"><label>Tipo de comunicado ${NUEVO}</label><select id="c-tipo">${Object.entries(TIPOS_COM).map(([k, t]) => `<option value="${k}">${t}</option>`).join("")}</select></div>
  <div class="campo"><label>Responder antes del</label><input type="date" id="c-vence" value="${HOY}"></div></div>
  <div class="campo"><label>Texto</label><textarea id="c-cue"></textarea></div>
  <div class="campo"><label>Adjuntos</label><div class="dropzone">Arrastrá archivos acá (PDF, imágenes)</div></div>
  <p><label><input type="checkbox" checked> Avisar también por email</label><br><label><input type="checkbox"> Agregar la fecha al calendario</label></p>
  <div class="toolbar"><span class="sep"></span><button onclick="location.hash='#/comunicados'">Cancelar</button><button class="primario" onclick="publicarComunicado()">Publicar</button></div></div>`;
};
function usarPlantilla(i) {
  if (i === "") return;
  const p = PLANTILLAS[+i];
  $("#c-tit").value = p.titulo; $("#c-cue").value = p.cuerpo; $("#c-tipo").value = p.tipo;
}
publicarComunicado = function () {
  const titulo = $("#c-tit").value.trim();
  if (!titulo) return toast("Falta el título");
  const id = Math.max(0, ...S.comunicados.map((c) => c.id)) + 1;
  const tipo = $("#c-tipo").value;
  S.comunicados.push({ id, de: yo(), tipo, opciones: tipo === "respuesta" ? ["Asisto", "No asisto"] : undefined, titulo, fecha: HOY, alcance: $("#c-alc").value, cuerpo: $("#c-cue").value, vence: $("#c-vence").value, requiereConfirmacion: tipo !== "info", confirmados: [], respuestas: {} });
  guardar(); toast("Comunicado publicado"); location.hash = `#/comunicados/${id}`;
};

// ───────────────────────── 3. aviso de ausencia ─────────────────────────
function avisarAusencia() {
  modal("Avisar ausencia", `
    <div class="campo"><label>Alumno/a</label><select id="au-al">${ROLES.familia.hijos.map((h) => `<option value="${h}" ${h === S.hijo ? "selected" : ""}>${esc(nombre(h))} — ${esc(curso(cursoDeAlumno(h)).nombre)}</option>`).join("")}</select></div>
    <div class="grid"><div class="campo"><label>Desde</label><input type="date" id="au-desde" value="${HOY}"></div><div class="campo"><label>Hasta</label><input type="date" id="au-hasta" value="${HOY}"></div></div>
    <div class="campo"><label>Motivo</label><select id="au-mot"><option>Enfermedad</option><option>Turno médico</option><option>Viaje / motivo familiar</option><option>Otro</option></select></div>
    <div class="campo"><label>Detalle (opcional)</label><input type="text" id="au-det"></div>
    <div class="campo"><label>Certificado (opcional)</label><div class="dropzone">Adjuntá una foto del certificado</div></div>
    <p class="small muted">Le llega a la docente del curso y a secretaría, y queda registrado en la asistencia de Búho.</p>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarAusencia()">Enviar aviso</button></div>`);
}
function guardarAusencia() {
  const desde = $("#au-desde").value, hasta = $("#au-hasta").value;
  if (!desde || hasta < desde) return toast("Revisá las fechas");
  S.ausencias.push({ id: Date.now(), alumno: $("#au-al").value, desde, hasta, motivo: $("#au-mot").value, detalle: $("#au-det").value, por: yo() });
  guardar(); cerrarModal(); render(); toast("Aviso de ausencia enviado");
}
function ausenciasVigentes(cursos) {
  return S.ausencias.filter((x) => x.hasta >= HOY && cursos.includes(cursoDeAlumno(x.alumno))).sort((a, b) => a.desde.localeCompare(b.desde));
}
function tablaAusencias(cursos) {
  const l = ausenciasVigentes(cursos);
  return l.length ? `<table>${l.map((x) => `<tr><td>${avatar(x.alumno)}${esc(nombre(x.alumno))}<div class="small muted">${esc(curso(cursoDeAlumno(x.alumno)).nombre)}</div></td><td>${x.desde === x.hasta ? fFecha(x.desde) : fFecha(x.desde) + " al " + fFecha(x.hasta)}${x.desde <= HOY ? ' <span class="chip warn">hoy</span>' : ""}</td><td>${esc(x.motivo)}${x.detalle ? `<div class="small muted">${esc(x.detalle)}</div>` : ""}</td><td class="small muted">Avisó ${esc(nombre(x.por))}</td></tr>`).join("")}</table>` : `<p class="muted">No hay ausencias avisadas.</p>`;
}

// ───────────────────────── 5. alerta temprana ─────────────────────────
function ultimoPublicado() { return REGIMEN.periodos.map((_, i) => i).filter((i) => S.publicado[i]).pop(); }
function alumnosEnRiesgo(c) {
  const p = ultimoPublicado();
  return ALUMNOS_CURSO[c].map((a) => {
    const bajas = materiasDeCurso(c).filter((m) => { const n = nota(a, m.id, p); return n != null && n < REGIMEN.aprobacion; });
    const venc = tareasDeAlumno(a).filter((t) => estadoTarea(t, a).clave === "atrasada");
    const motivos = [];
    if (bajas.length) motivos.push(`${bajas.length} materia(s) por debajo de ${REGIMEN.aprobacion} en ${REGIMEN.periodos[p]}: ${bajas.map((m) => m.nombre).join(", ")}`);
    if (venc.length) motivos.push(`${venc.length} tarea(s) vencida(s) sin entregar`);
    return { a, motivos, enRiesgo: bajas.length >= 2 || venc.length >= 2 || (bajas.length >= 1 && venc.length >= 1) };
  }).filter((x) => x.enRiesgo);
}
function familiaDe(a) { return Object.keys(PERSONAS).find((id) => PERSONAS[id].grupo === "Familias" && PERSONAS[id].rol.includes(nombre(a).split(" ")[0])); }
function tablaRiesgo(cursos) {
  const l = cursos.flatMap((c) => alumnosEnRiesgo(c));
  return l.length ? `<table>${l.map(({ a, motivos }) => `<tr><td>${avatar(a)}${esc(nombre(a))}<div class="small muted">${esc(curso(cursoDeAlumno(a)).nombre)}</div></td><td>${motivos.map((m) => `<div>{{alerta}} ${esc(m)}</div>`).join("")}</td><td style="white-space:nowrap">${familiaDe(a) ? `<a onclick="abrirRedactar({para:['${familiaDe(a)}'],asunto:'Seguimiento de ${esc(nombre(a))}'})">Escribir a la familia</a>` : ""}</td></tr>`).join("")}</table>` : `<p class="muted">Ningún alumno cumple los criterios de alerta.</p>`;
}

// ───────────────────────── 1. lo importante de hoy ─────────────────────────
function franjaHoy() {
  const items = [];
  const fam = S.rol === "familia";
  const hijos = fam ? ROLES.familia.hijos : [yo()];
  if (fam) {
    comunicadosPendientes().forEach((c) => items.push({ i: c.tipo === "autorizacion" ? "firma" : "megafono", t: `<b>${ACCION_COM[c.tipo]}:</b> ${esc(c.titulo)}${c.vence ? ` <span class="muted">(hasta el ${fDia(c.vence)})</span>` : ""}`, on: `location.hash='#/comunicados/${c.id}'`, urgente: true }));
  }
  hijos.forEach((a) => {
    const c = cursoDeAlumno(a);
    eventosVisibles().filter((e) => e.etiqueta === "Examen" && e.curso === c && diasHasta(e.fecha) >= 0 && diasHasta(e.fecha) <= 7).forEach((e) => items.push({ i: "calendario", t: `${fam ? primerNombre(a) + " tiene" : "Tenés"} <b>${esc(e.titulo.toLowerCase())}</b> el ${fDia(e.fecha)}`, on: `verEvento('${e.id}')` }));
    const pend = tareasDeAlumno(a).filter((t) => estadoTarea(t, a).clave === "pendiente" && diasHasta(t.entrega) <= 7);
    if (pend.length) items.push({ i: "tarea", t: `${fam ? primerNombre(a) + ": " : ""}<b>${pend.length} entrega(s)</b> esta semana — ${pend.map((t) => esc(t.titulo)).join(" · ")}`, on: `${fam ? `S.hijo='${a}';guardar();` : ""}location.hash='#/tareas'` });
  });
  if (fam) {
    S.ausencias.filter((x) => x.por === yo() && x.hasta >= HOY).forEach((x) => items.push({ i: "ausente", t: `Ausencia avisada: <b>${primerNombre(x.alumno)}</b>, ${fDia(x.desde)} (${esc(x.motivo)})`, on: "" }));
    items.push({ i: "tarjeta", t: `La cuota de octubre vence el <b>sáb 10/10</b>`, on: `location.hash='#/cuotas'` });
  }
  if (noLeidos().length) items.push({ i: "sobre", t: `<b>${noLeidos().length} mensaje(s)</b> sin leer`, on: `location.hash='#/mensajes'` });
  return `<div class="panel hoy-franja"><h3>Lo importante de hoy</h3>
    ${items.map((x) => `<a class="hoy-item ${x.urgente ? "urgente" : ""}" onclick="${x.on}">{{${x.i}}}<span>${x.t}</span>${x.on ? '<span class="flecha">→</span>' : ""}</a>`).join("") || `<p class="muted">No hay nada pendiente.</p>`}
    ${fam ? `<div class="toolbar" style="margin:12px 0 0"><button onclick="avisarAusencia()">{{ausente}} Avisar ausencia ${NUEVO}</button><button onclick="abrirRedactar({para:['${materia("len").docente}']})">{{lapiz}} Escribir a la docente</button></div>` : ""}</div>`;
}
const _vInicio = vInicio;
vInicio = function () {
  window.INICIO_SIN = ["pendientes", "mensajes", "entregas"]; // ya están en "Lo importante de hoy"
  let h = _vInicio();
  let extra = "";
  if (S.rol === "familia" || S.rol === "alumno") {    h = h.replace("</h1>", "</h1>" + franjaHoy());
  }
  if (S.rol === "docente") {
    extra = `<div class="panel"><h3>{{alerta}} Alumnos que necesitan atención ${NUEVO}</h3>${tablaRiesgo(ROLES.docente.cursos)}</div>
      <div class="panel"><h3>{{ausente}} Ausencias avisadas ${NUEVO}</h3>${tablaAusencias(ROLES.docente.cursos)}</div>`;
  }
  if (S.rol === "secretaria") {
    extra = `<div class="panel"><h3>{{ausente}} Ausencias avisadas ${NUEVO}</h3>${tablaAusencias(CURSOS.map((c) => c.id))}</div>`;
    h = h.replace("</h1>", `</h1><div class="toolbar"><button class="primario" onclick="location.hash='#/panel'">{{grafico}} Abrir panel de dirección</button></div>`);
  }
  return h.slice(0, -6) + extra + "</div>";
};

// ───────────────────────── 4. panel de dirección ─────────────────────────
function vPanel() {
  const p = REGIMEN.periodoActual;
  const coms = S.comunicados.filter((c) => c.tipo !== "info");
  const req = coms.reduce((s, c) => s + familiasDeAlcance(c.alcance).length, 0);
  const resp = coms.reduce((s, c) => s + familiasDeAlcance(c.alcance).filter((f) => c.respuestas[f]).length, 0);
  const cursos = CURSOS.map((c) => c.id);
  const cargas = cursos.flatMap((c) => materiasDeCurso(c).map((m) => progresoCarga(c, m.id, p)));
  const cargaProm = Math.round(cargas.reduce((s, x) => s + x, 0) / cargas.length);
  const riesgo = cursos.flatMap((c) => alumnosEnRiesgo(c));
  const autPend = S.comunicados.filter((c) => c.tipo === "autorizacion").reduce((s, c) => s + familiasDeAlcance(c.alcance).filter((f) => !c.respuestas[f]).length, 0);
  const tile = (v, r, d) => `<div class="tile"><div class="valor">${v}</div><div class="rotulo">${r}</div><div class="small muted">${d}</div></div>`;
  // Carga de notas agrupada por docente (7° B).
  const porDocente = {};
  materiasDeCurso("7B").forEach((m) => (porDocente[m.docente] = porDocente[m.docente] || []).push(m));
  return `<h1 class="titulo-pagina">Panel de dirección ${NUEVO}</h1>
  ${notaMaqueta("Indicadores calculados con los datos de la demo. En el producto se filtran por nivel, curso y período.")}
  <div class="tiles">
    ${tile(Math.round((resp / req) * 100) + "%", "Respuesta a comunicados", `${resp} de ${req} respuestas esperadas`)}
    ${tile(cargaProm + "%", "Notas cargadas", REGIMEN.periodos[p])}
    ${tile(riesgo.length, "Alumnos con alerta", "Notas bajas o tareas sin entregar")}
    ${tile(autPend, "Autorizaciones pendientes", "Familias que aún no firmaron")}
    ${tile(ausenciasVigentes(cursos).filter((x) => x.desde <= HOY).length, "Ausencias avisadas hoy", "Por las familias")}
  </div>
  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(380px,100%),1fr))">
    <div class="panel"><h3>Comunicados: quién respondió</h3><table>${coms.map((c) => { const t = familiasDeAlcance(c.alcance).length, n = familiasDeAlcance(c.alcance).filter((f) => c.respuestas[f]).length; return `<tr class="fila" onclick="location.hash='#/comunicados/${c.id}'"><td>${esc(c.titulo)}<div class="small muted">${TIPOS_COM[c.tipo]}</div></td><td style="width:30%"><div class="barra"><div style="width:${(n / t) * 100}%"></div></div></td><td style="white-space:nowrap">${n} / ${t}</td></tr>`; }).join("")}</table></div>
    <div class="panel"><h3>Carga de notas por docente — ${REGIMEN.periodos[p]}</h3><table>${Object.entries(porDocente).map(([d, ms]) => { const x = Math.round(ms.reduce((s, m) => s + progresoCarga("7B", m.id, p), 0) / ms.length); return `<tr><td>${avatar(d)}${esc(nombre(d))}<div class="small muted">${ms.map((m) => esc(m.nombre)).join(", ")}</div></td><td style="width:28%"><div class="barra"><div style="width:${x}%"></div></div></td><td>${x}%</td><td>${x < 100 ? `<a onclick="abrirRedactar({para:['${d}'],asunto:'Carga de notas ${REGIMEN.periodos[p]}'})">Recordar</a>` : "✓"}</td></tr>`; }).join("")}</table></div>
    <div class="panel"><h3>{{alerta}} Alumnos con alerta temprana</h3>${tablaRiesgo(cursos)}<p class="small muted">Criterio de la demo: 2 materias por debajo de ${REGIMEN.aprobacion}, o 1 materia baja y 1 tarea vencida. Configurable por la escuela.</p></div>
    <div class="panel"><h3>{{ausente}} Ausencias avisadas</h3>${tablaAusencias(cursos)}</div>
  </div>`;
}

// ───────────────────────── 6. evolución de notas ─────────────────────────
function graficoNotas(a) {
  const ms = materiasDeCurso(cursoDeAlumno(a));
  const sel = S.matGraf && ms.some((m) => m.id === S.matGraf) ? S.matGraf : "prom";
  const valor = (i) => {
    if (!S.publicado[i]) return null;
    if (sel !== "prom") return nota(a, sel, i);
    const v = ms.map((m) => nota(a, m.id, i)).filter((x) => x != null);
    return v.length ? Math.round((v.reduce((s, x) => s + x, 0) / v.length) * 10) / 10 : null;
  };
  const W = 600, H = 230, L = 34, R = 96, T = 16, B = 30;
  const x = (i) => L + (i * (W - L - R)) / (REGIMEN.periodos.length - 1);
  const y = (v) => T + ((10 - v) * (H - T - B)) / 9;
  const pts = REGIMEN.periodos.map((_, i) => ({ i, v: valor(i) })).filter((p) => p.v != null);
  const grilla = [2, 4, 6, 8, 10].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" class="g-grilla"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" class="g-eje">${v}</text>`).join("");
  const ejeX = REGIMEN.periodos.map((p, i) => `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="g-eje">${p}</text>`).join("");
  const ult = pts[pts.length - 1];
  const fmt = (v) => String(v).replace(".", ",");
  return `<div class="panel"><div class="toolbar" style="margin-bottom:4px"><h3 style="margin:0">Evolución de ${esc(nombre(a).split(" ")[0])}</h3><span class="sep"></span>
    <select onchange="S.matGraf=this.value;guardar();render()"><option value="prom">Promedio general</option>${ms.map((m) => `<option value="${m.id}" ${sel === m.id ? "selected" : ""}>${esc(m.nombre)}</option>`).join("")}</select></div>
    <svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="Evolución de notas por bimestre">
      ${grilla}${ejeX}
      <line x1="${L}" x2="${W - R}" y1="${y(REGIMEN.aprobacion)}" y2="${y(REGIMEN.aprobacion)}" class="g-ref"/><text x="${W - R + 8}" y="${y(REGIMEN.aprobacion) + 4}" class="g-eje">Aprobación (${REGIMEN.aprobacion})</text>
      ${pts.length > 1 ? `<polyline points="${pts.map((p) => `${x(p.i)},${y(p.v)}`).join(" ")}" class="g-linea"/>` : ""}
      ${pts.map((p) => `<circle cx="${x(p.i)}" cy="${y(p.v)}" r="5" class="g-punto"/><circle cx="${x(p.i)}" cy="${y(p.v)}" r="16" fill="transparent"><title>${REGIMEN.periodos[p.i]}: ${fmt(p.v)}</title></circle>`).join("")}
      ${ult ? `<text x="${x(ult.i)}" y="${y(ult.v) - 12}" text-anchor="middle" class="g-valor">${fmt(ult.v)}</text>` : ""}
    </svg>
    <p class="small muted">Pasá el mouse por cada punto para ver la nota. Los bimestres sin publicar no se muestran.</p></div>`;
}
const _vCalificaciones = vCalificaciones;
vCalificaciones = function (arg) {
  const h = _vCalificaciones(arg);
  if (S.rol !== "familia" && S.rol !== "alumno") return h;
  return h.replace('<div class="panel"><table class="tabla-notas"><tr><th>Materia</th>', graficoNotas(alumnoFoco()) + '<div class="panel"><table class="tabla-notas"><tr><th>Materia</th>');
};

// ───────────────────────── 11. bienvenida ─────────────────────────
function mostrarBienvenida(paso = 0) {
  if (!S.logueado || S.bienvenida[S.rol]) return;
  const pasos = BIENVENIDA[S.rol];
  const fin = `S.bienvenida[S.rol]=true;guardar();cerrarModal()`;
  modal("Te damos la bienvenida al Campus", `
    <div style="text-align:center;padding:12px 8px"><div class="bien-num">${paso + 1}</div><h2 style="font-weight:500">${esc(pasos[paso][0])}</h2><p style="font-size:15px;max-width:440px;margin:0 auto 16px">${esc(pasos[paso][1])}</p>
    <div>${pasos.map((_, i) => `<span class="bien-punto ${i === paso ? "activo" : ""}"></span>`).join("")}</div></div>
    <div class="toolbar"><a onclick="${fin}">Omitir</a><span class="sep"></span>${paso < pasos.length - 1 ? `<button class="primario" onclick="mostrarBienvenida(${paso + 1})">Siguiente</button>` : `<button class="primario" onclick="${fin}">Empezar</button>`}</div>`);
}
const _cambiarRol = cambiarRol;
cambiarRol = function (r) { _cambiarRol(r); setTimeout(mostrarBienvenida, 60); };
const _ingresar = ingresar;
ingresar = function () { _ingresar(); setTimeout(mostrarBienvenida, 60); };

render();
setTimeout(mostrarBienvenida, 60);
