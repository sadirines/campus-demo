// Versión 3: el aula es solo de alumnos y docentes. Cada materia se organiza como
// planificación: unidad → objetivos → contenidos → tareas (y foro en secundaria).
// Las familias no ven contenidos, tareas, entregas ni foros.
const clon = (x) => JSON.parse(JSON.stringify(x));
if (!S.unidades) { S.unidades = clon(UNIDADES_INICIALES); S.foros = clon(FOROS_INICIALES); S.nivel = "primario"; guardar(); }

function aplicarNivel() { Object.assign(ROLES.alumno, NIVELES[S.nivel].alumno); Object.assign(ROLES.docente, NIVELES[S.nivel].docente); }
function cambiarNivel(v) { S.nivel = v; aplicarNivel(); guardar(); location.hash = "#/inicio"; render(); }
aplicarNivel();

// ───────────────────────── menús por rol ─────────────────────────
MENU.familia = ["inicio", "mensajes", "comunicados", "calificaciones", "calendario", "cuotas"];
MENU.alumno = ["inicio", "mensajes", "comunicados", "materias", "calificaciones", "calendario"];
MENU.docente = ["inicio", "mensajes", "comunicados", "materias", "calificaciones", "calendario"];
SECCIONES.materias = { t: "Aula", i: "{{libro}}" };
SECCIONES.tareas = { t: "Mis pendientes", i: "{{tarea}}" };
TABS_HIJOS.length = 0; TABS_HIJOS.push("calificaciones", "cuotas");
TABS.alumno = [["inicio", "Inicio"], ["materias", "Aula"], ["tareas", "Pendientes"], ["calificaciones", "Notas"]];
TABS.docente = [["inicio", "Inicio"], ["materias", "Aula"], ["mensajes", "Mensajes"], ["calificaciones", "Notas"]];

// ───────────────────────── reglas de datos ─────────────────────────
materiasDeCurso = function (c) {
  if (curso(c).nivel === "Secundario") return MATERIAS.filter((m) => m.tipo === "secundaria");
  return MATERIAS.filter((m) => (c === "7B" ? m.tipo !== "secundaria" : m.tipo === "troncal"));
};
// Las familias no ven tareas en ningún lado (inicio, resumen del día, calendario).
tareasDeAlumno = function (a) { return S.rol === "familia" ? [] : S.tareas.filter((t) => t.curso === cursoDeAlumno(a)); };
const ETIQUETAS_AULA = ["Examen", "Entrega", "Tarea", "Clase"];
eventosVisibles = function () {
  const cs = cursosVisibles();
  const evs = S.eventos.filter((e) => e.curso === "todos" || cs.includes(e.curso) || e.curso === "personal:" + yo());
  if (S.rol === "familia") return evs.filter((e) => !ETIQUETAS_AULA.includes(e.etiqueta));
  const tareas = S.tareas.filter((t) => cs.includes(t.curso)).map((t) => ({ id: "t" + t.id, titulo: `Entrega: ${t.titulo} (${materia(t.materia).nombre})`, fecha: t.entrega, etiqueta: "Entrega", curso: t.curso, auto: true }));
  return [...evs, ...tareas];
};
const contenido = (id) => S.contenidos.find((c) => c.id === id);
const unidad = (id) => S.unidades.find((u) => u.id === id);
const esSecundaria = (c) => curso(c).nivel === "Secundario";
function cursoAula() { return S.rol === "alumno" ? ROLES.alumno.curso : ROLES.docente.cursos[0]; }
function materiasAula() { return S.rol === "docente" ? MATERIAS.filter((m) => ROLES.docente.materias.includes(m.id)) : materiasDeCurso(cursoAula()); }
function unidadesDe(mat, c) { return S.unidades.filter((u) => u.materia === mat && u.curso === c).sort((a, b) => a.orden - b.orden); }
function tareasDeContenido(id) { return S.tareas.filter((t) => t.contenido === id); }
// Avance = contenidos obligatorios vistos + tareas entregadas.
function progreso(a, conts, tars) {
  const total = conts.length + tars.length;
  if (!total) return null;
  return Math.round(((conts.filter((c) => c.vistoPor.includes(a)).length + tars.filter((t) => t.entregas[a]).length) / total) * 100);
}
function avanceUnidad(a, u) { return progreso(a, S.contenidos.filter((c) => c.unidad === u.id && c.obligatorio), S.tareas.filter((t) => contenido(t.contenido)?.unidad === u.id)); }
avance = function (a, mat) { const c = cursoDeAlumno(a); return progreso(a, S.contenidos.filter((x) => x.materia === mat && x.curso === c && x.obligatorio), S.tareas.filter((t) => t.materia === mat && t.curso === c)); };
const ICONO_CONT = { texto: "{{archivo}}", archivo: "{{clip}}", video: "{{video}}", enlace: "{{enlace}}" };
function migas(partes) { return `<div class="migas">${partes.map(([t, h]) => (h ? `<a onclick="location.hash='${h}'">${esc(t)}</a>` : `<span>${esc(t)}</span>`)).join(" › ")}</div>`; }
const A_CONFIRMAR = '<span class="chip warn">a confirmar</span>';

// ───────────────────────── aula: inicio ─────────────────────────
vMaterias = function (mat, sub, id) {
  if (!mat) return vAulaInicio();
  if (!materiasAula().some((m) => m.id === mat)) return `<div class="panel">Esta materia no está en tu aula.</div>`;
  if (/^\d+$/.test(sub || "")) return vAulaContenido(mat, +sub);
  if (sub === "contenido") return vAulaContenido(mat, +id);
  const cuerpo = sub === "tareas" ? vAulaTareasMateria(mat) : sub === "foro" ? (id ? vForoTema(mat, +id) : vForo(mat)) : vAulaPrograma(mat);
  return encabezadoMateria(mat, sub || "programa") + cuerpo;
};
function vAulaInicio() {
  const c = cursoAula();
  const card = (m) => {
    const us = unidadesDe(m.id, c);
    const actual = us.filter((u) => !u.desde || u.desde <= HOY).pop() || us[0];
    const tars = S.tareas.filter((t) => t.materia === m.id && t.curso === c);
    let pie = "";
    if (S.rol === "alumno") {
      const p = avance(yo(), m.id);
      const pend = tars.filter((t) => estadoTarea(t, yo()).clave === "pendiente").length;
      pie = (p == null ? "" : `<div class="barra"><div style="width:${p}%"></div></div><p class="small">${p}% de la unidad completado</p>`) + (pend ? `<span class="chip warn">${pend} tarea(s) pendiente(s)</span>` : "");
    } else {
      const porCorregir = tars.reduce((s, t) => s + Object.values(t.entregas).filter((e) => e.nota == null).length, 0);
      pie = `<p class="small muted">${us.length} unidad(es) · ${S.contenidos.filter((x) => x.materia === m.id && x.curso === c).length} contenidos · ${tars.length} tareas</p>${porCorregir ? `<span class="chip warn">${porCorregir} entrega(s) por corregir</span>` : ""}`;
    }
    const foro = esSecundaria(c) ? S.foros.filter((f) => f.materia === m.id && f.curso === c).length : 0;
    return `<div class="panel materia-card" onclick="location.hash='#/materias/${m.id}'"><h3>${esc(m.nombre)}</h3><p class="small muted">${av(m.docente)}${esc(nombre(m.docente))}</p>
      ${actual ? `<p class="small"><b>${esc(actual.titulo)}</b></p>` : `<p class="small muted">Sin unidades cargadas.</p>`}${pie}${foro ? ` <span class="chip">${foro} tema(s) en el foro</span>` : ""}</div>`;
  };
  const ms = materiasAula();
  return `<h1 class="titulo-pagina">Aula — ${esc(curso(c).nombre)} <span class="small muted">Nivel ${esc(curso(c).nivel)}</span></h1>
  ${notaMaqueta("El aula es solo de alumnos y docentes. Las familias no tienen acceso a contenidos, tareas ni foros.")}
  ${S.rol === "alumno" ? `<div class="toolbar"><button onclick="location.hash='#/tareas'">{{tarea}} Mis pendientes de todas las materias</button></div>` : `<div class="toolbar"><button onclick="location.hash='#/tareas'">{{tarea}} Entregas por corregir</button></div>`}
  <div class="grid">${ms.map(card).join("") || '<div class="panel muted">No hay materias.</div>'}</div>`;
}
function encabezadoMateria(mat, tab) {
  const m = materia(mat), c = cursoAula();
  const pend = S.rol === "alumno" ? S.tareas.filter((t) => t.materia === mat && t.curso === c && estadoTarea(t, yo()).clave === "pendiente").length : 0;
  const tabs = [["programa", "Programa"], ["tareas", `Tareas${pend ? ` (${pend})` : ""}`]].concat(esSecundaria(c) ? [["foro", "Foro"]] : []);
  return `${migas([["Aula", "#/materias"], [m.nombre]])}
  <div class="toolbar"><h2 style="margin:0">${esc(m.nombre)}</h2><span class="small muted">${av(m.docente)}${esc(nombre(m.docente))} · ${esc(curso(c).nombre)}</span><span class="sep"></span>
    ${S.rol === "docente" && tab === "programa" ? `<button class="primario" onclick="aulaNuevaUnidad('${mat}')">{{mas}} Nueva unidad</button>` : ""}</div>
  <div class="tabs">${tabs.map(([k, t]) => `<button class="${tab === k ? "activo" : ""}" onclick="location.hash='#/materias/${mat}/${k}'">${t}</button>`).join("")}</div>`;
}

// ───────────────────────── programa: unidades, objetivos, contenidos y sus tareas ─────────────────────────
function filaTarea(t) {
  const c = cursoAula();
  const estado = S.rol === "alumno" ? estadoTarea(t, yo()).html : `<span class="small">${Object.keys(t.entregas).length}/${ALUMNOS_CURSO[c].length} entregas</span>`;
  return `<tr class="fila fila-tarea" onclick="location.hash='#/tareas/${t.id}'"><td></td><td>↳ {{tarea}} <b>Tarea:</b> ${esc(t.titulo)}</td><td class="small" style="white-space:nowrap">Entrega ${fDia(t.entrega)}</td><td>${estado}</td></tr>`;
}
function vAulaPrograma(mat) {
  const c = cursoAula();
  const us = unidadesDe(mat, c);
  if (!us.length) return `<div class="panel muted">Todavía no hay unidades cargadas.${S.rol === "docente" ? " Empezá con “Nueva unidad”." : ""}</div>`;
  const total = ALUMNOS_CURSO[c].length;
  return us.map((u) => {
    const conts = S.contenidos.filter((x) => x.unidad === u.id);
    const p = S.rol === "alumno" ? avanceUnidad(yo(), u) : null;
    return `<div class="panel unidad"><div class="toolbar" style="margin-bottom:6px"><h3 style="margin:0">${esc(u.titulo)}</h3><span class="sep"></span>${u.desde ? `<span class="small muted">${fDia(u.desde)} al ${fDia(u.hasta)}</span>` : ""}</div>
      ${p != null ? `<div class="barra"><div style="width:${p}%"></div></div><p class="small">${p}% de la unidad completado (contenidos vistos y tareas entregadas)</p>` : ""}
      <div class="objetivos"><b>Objetivos de la unidad</b><ul>${u.objetivos.map((o) => `<li>${esc(o)}</li>`).join("")}</ul></div>
      <table>${conts.map((x) => `<tr class="fila" onclick="location.hash='#/materias/${mat}/contenido/${x.id}'">
          <td style="width:28px">${S.rol === "alumno" ? (x.vistoPor.includes(yo()) ? "{{hecho}}" : "{{circulo}}") : ICONO_CONT[x.tipo]}</td>
          <td>${S.rol === "alumno" ? ICONO_CONT[x.tipo] + " " : ""}${esc(x.titulo)} <span class="chip ${x.obligatorio ? "" : "ok"}">${x.obligatorio ? "Obligatorio" : "Opcional"}</span></td>
          <td class="small muted" style="white-space:nowrap">${fDia(x.fecha)}</td>
          <td class="small" style="white-space:nowrap">${S.rol === "docente" ? `Visto por ${x.vistoPor.length}/${total} · <a onclick="event.stopPropagation();aulaNuevaTarea(${x.id})">{{mas}} Tarea</a>` : ""}</td></tr>
          ${tareasDeContenido(x.id).map(filaTarea).join("")}`).join("") || `<tr><td class="muted">Sin contenidos todavía.</td></tr>`}</table>
      ${S.rol === "docente" ? `<div class="toolbar" style="margin:12px 0 0"><button onclick="aulaNuevoContenido(${u.id})">{{mas}} Contenido en esta unidad</button></div>` : ""}</div>`;
  }).join("");
}
function vAulaContenido(mat, id) {
  const x = contenido(id);
  if (!x || x.materia !== mat || x.curso !== cursoAula()) return `<div class="panel">Contenido no encontrado.</div>`;
  if (S.rol === "alumno" && !x.vistoPor.includes(yo())) { x.vistoPor.push(yo()); guardar(); }
  const u = unidad(x.unidad);
  const hermanos = S.contenidos.filter((y) => y.unidad === x.unidad);
  const sig = hermanos[hermanos.indexOf(x) + 1];
  let cuerpo = "";
  if (x.tipo === "texto") cuerpo = `<div class="msg-cuerpo">${esc(x.cuerpo)}</div>`;
  if (x.tipo === "video") cuerpo = `<div style="background:#222;color:#fff;aspect-ratio:16/9;max-width:640px;display:grid;place-items:center">{{play}} Video embebido</div><p>${esc(x.cuerpo)}</p>`;
  if (x.tipo === "archivo") cuerpo = `<span class="adjunto">{{clip}} ${esc(x.archivo)} <a onclick="toast('En la maqueta no se descargan archivos')">Descargar</a></span>`;
  if (x.tipo === "enlace") cuerpo = `<p>{{enlace}} <a>${esc(x.url)}</a></p>`;
  const tars = tareasDeContenido(id);
  const total = ALUMNOS_CURSO[x.curso].length;
  return `${migas([["Aula", "#/materias"], [materia(mat).nombre, `#/materias/${mat}`], [u.titulo, `#/materias/${mat}`], [x.titulo]])}
  <div class="panel"><h2>${esc(x.titulo)}</h2>${cuerpo}${S.rol === "alumno" ? `<p class="small" style="margin-top:16px"><span class="chip ok">✓ Marcado como visto</span></p>` : ""}</div>
  <div class="panel"><div class="toolbar"><h3 style="margin:0">{{tarea}} Tareas de este contenido</h3><span class="sep"></span>${S.rol === "docente" ? `<button class="primario" onclick="aulaNuevaTarea(${id})">{{mas}} Crear tarea desde este contenido</button>` : ""}</div>
    ${tars.map((t) => `<div class="tarea-card"><div class="toolbar" style="margin:0"><b>${esc(t.titulo)}</b><span class="sep"></span><span class="small">Entrega ${fDia(t.entrega)}</span>${S.rol === "alumno" ? estadoTarea(t, yo()).html : `<span class="small">${Object.keys(t.entregas).length}/${total} entregas</span>`}</div>
      <p>${esc(t.consigna)}</p><button onclick="location.hash='#/tareas/${t.id}'">${S.rol === "alumno" ? "Ver y entregar" : "Ver entregas"}</button></div>`).join("") || `<p class="muted">Este contenido no tiene tareas.</p>`}</div>
  <div class="toolbar"><button onclick="location.hash='#/materias/${mat}'">← Volver al programa</button><span class="sep"></span>${sig ? `<button class="primario" onclick="location.hash='#/materias/${mat}/contenido/${sig.id}'">Siguiente contenido ›</button>` : ""}</div>`;
}

// ───────────────────────── tareas: siempre con su contenido ─────────────────────────
function origenTarea(t) { const x = contenido(t.contenido); return { x, u: unidad(x.unidad) }; }
function vAulaTareasMateria(mat) {
  const c = cursoAula();
  const tars = S.tareas.filter((t) => t.materia === mat && t.curso === c).sort((a, b) => a.entrega.localeCompare(b.entrega));
  return `<div class="panel"><table><tr><th>Tarea</th><th>Unidad y contenido</th><th>Entrega</th><th>${S.rol === "alumno" ? "Estado" : "Entregas"}</th></tr>
  ${tars.map((t) => { const { x, u } = origenTarea(t); return `<tr class="fila" onclick="location.hash='#/tareas/${t.id}'"><td>${esc(t.titulo)}</td><td class="small">${esc(u.titulo)}<div class="muted">${esc(x.titulo)}</div></td><td style="white-space:nowrap">${fDia(t.entrega)}</td><td>${S.rol === "alumno" ? estadoTarea(t, yo()).html : `${Object.keys(t.entregas).length}/${ALUMNOS_CURSO[c].length}`}</td></tr>`; }).join("") || `<tr><td class="muted">No hay tareas en esta materia.</td></tr>`}</table>
  <p class="small muted">Las tareas se crean desde un contenido del programa.</p></div>`;
}
vTareas = function (id) {
  if (id) return vAulaTarea(+id);
  return S.rol === "docente" ? vPorCorregir() : vPendientes();
};
function vPendientes() {
  const ts = tareasDeAlumno(yo());
  const grupo = (titulo, clave) => {
    const l = ts.filter((t) => [].concat(clave).includes(estadoTarea(t, yo()).clave)).sort((a, b) => a.entrega.localeCompare(b.entrega));
    return `<div class="panel"><h3>${titulo} (${l.length})</h3>${l.length ? `<table>${l.map((t) => { const { x, u } = origenTarea(t); return `<tr class="fila" onclick="location.hash='#/tareas/${t.id}'"><td style="width:80px;white-space:nowrap">${fDia(t.entrega)}</td><td>${esc(t.titulo)}<div class="small muted">${esc(materia(t.materia).nombre)} › ${esc(u.titulo)} › ${esc(x.titulo)}</div></td><td>${estadoTarea(t, yo()).html}</td></tr>`; }).join("")}</table>` : '<p class="muted">Nada por acá.</p>'}</div>`;
  };
  return `<h1 class="titulo-pagina">Mis pendientes</h1><p class="muted">Las tareas de todas tus materias. Cada una te lleva al contenido del que sale.</p>
  ${grupo("Para entregar", "pendiente")}${grupo("Vencidas sin entregar", "atrasada")}${grupo("Entregadas", ["entregada", "corregida"])}`;
}
function vPorCorregir() {
  const c = cursoAula();
  return `<h1 class="titulo-pagina">Entregas por corregir</h1>${ROLES.docente.materias.map((m) => {
    const tars = S.tareas.filter((t) => t.materia === m && t.curso === c);
    return `<div class="panel"><h3>${esc(materia(m).nombre)}</h3><table><tr><th>Tarea</th><th>Contenido</th><th>Entrega</th><th>Entregaron</th><th>Por corregir</th></tr>${tars.map((t) => { const es = Object.values(t.entregas); return `<tr class="fila" onclick="location.hash='#/tareas/${t.id}'"><td>${esc(t.titulo)}</td><td class="small">${esc(origenTarea(t).x.titulo)}</td><td>${fDia(t.entrega)}</td><td>${es.length}/${ALUMNOS_CURSO[c].length}</td><td>${es.filter((e) => e.nota == null).length}</td></tr>`; }).join("") || '<tr><td class="muted">Sin tareas.</td></tr>'}</table></div>`;
  }).join("")}`;
}
function vAulaTarea(id) {
  const t = S.tareas.find((x) => x.id === id);
  const visible = t && (S.rol === "alumno" ? t.curso === ROLES.alumno.curso : ROLES.docente.materias.includes(t.materia) && ROLES.docente.cursos.includes(t.curso));
  if (!visible) return `<div class="panel">Tarea no encontrada.</div>`;
  const { x, u } = origenTarea(t);
  const mat = t.materia;
  const nota = `<span class="chip">${t.cuentaNota ? "Cuenta para la nota del período" : "Seguimiento: no suma a la nota"}</span> ${A_CONFIRMAR}`;
  let bloque;
  if (S.rol === "alumno") {
    const e = t.entregas[yo()];
    bloque = `<div class="panel"><h3>Mi entrega</h3><p class="small muted">{{candado}} Solo la ve tu docente.</p>
      ${e ? `<span class="adjunto">{{clip}} ${esc(e.archivo)}</span><p class="small muted">Entregado el ${fDia(e.fecha)}</p>${e.nota != null ? `<p><b>Nota:</b> ${e.nota}</p><p><b>Devolución:</b> ${esc(e.devolucion || "")}</p>` : ""}`
        : `<div class="dropzone">Arrastrá tu archivo o una foto de la carpeta, o <a onclick="document.getElementById('t-file').click()">buscalo</a><input type="file" id="t-file" hidden onchange="entregarTarea(${t.id},this.files[0])"></div>`}</div>`;
  } else {
    bloque = `<div class="panel"><h3>Entregas</h3><table><tr><th>Alumno</th><th>Estado</th><th>Archivo</th><th class="num">Nota</th><th>Devolución</th></tr>
      ${ALUMNOS_CURSO[t.curso].map((a) => { const e = t.entregas[a]; return `<tr><td>${av(a)}${esc(nombre(a))}</td><td>${estadoTarea(t, a).html}</td><td>${e ? "{{clip}} " + esc(e.archivo) : "—"}</td>
        <td class="num">${e ? `<input type="number" min="1" max="10" style="width:60px" value="${e.nota ?? ""}" onchange="S.tareas.find(x=>x.id===${id}).entregas['${a}'].nota=this.value?+this.value:null;guardar()">` : ""}</td>
        <td>${e ? `<input style="width:100%" value="${esc(e.devolucion || "")}" onchange="S.tareas.find(x=>x.id===${id}).entregas['${a}'].devolucion=this.value;guardar()">` : ""}</td></tr>`; }).join("")}</table>
      <div class="toolbar" style="margin-top:12px"><span class="sep"></span><button class="primario" onclick="render();toast('Correcciones guardadas y devueltas a los alumnos')">Guardar y devolver</button></div></div>`;
  }
  return `${migas([["Aula", "#/materias"], [materia(mat).nombre, `#/materias/${mat}`], [u.titulo, `#/materias/${mat}`], [x.titulo, `#/materias/${mat}/contenido/${x.id}`], ["Tarea"]])}
  <div class="panel"><h2>${esc(t.titulo)}</h2>
    <p><b>Entrega:</b> ${fDia(t.entrega)} (${cuandoTexto(t.entrega)}) ${S.rol === "alumno" ? estadoTarea(t, yo()).html : ""}</p>
    <div class="msg-cuerpo">${esc(t.consigna)}</div>
    <div class="origen"><p><b>Sale del contenido:</b> <a onclick="location.hash='#/materias/${mat}/contenido/${x.id}'">${esc(x.titulo)}</a></p>
      <p><b>Objetivos que trabaja</b> (${esc(u.titulo)}):</p><ul>${u.objetivos.map((o) => `<li>${esc(o)}</li>`).join("")}</ul><p>${nota}</p></div></div>
  ${bloque}`;
}

// ───────────────────────── foros (secundaria) ─────────────────────────
function vForo(mat) {
  const c = cursoAula();
  const temas = S.foros.filter((f) => f.materia === mat && f.curso === c).sort((a, b) => b.mensajes[b.mensajes.length - 1].fecha.localeCompare(a.mensajes[a.mensajes.length - 1].fecha));
  return `${notaMaqueta("Foros solo en secundaria. A confirmar con la escuela: si los alumnos pueden abrir temas o solo el docente (en la demo pueden los dos).")}
  <div class="toolbar"><button class="primario" onclick="nuevoTemaForo('${mat}')">{{mas}} Nuevo tema</button></div>
  <div class="panel"><table><tr><th>Tema</th><th>Abierto por</th><th class="num">Respuestas</th><th>Último mensaje</th></tr>
  ${temas.map((f) => { const ult = f.mensajes[f.mensajes.length - 1]; return `<tr class="fila" onclick="location.hash='#/materias/${mat}/foro/${f.id}'"><td>${esc(f.titulo)}${f.unidad ? `<div class="small muted">${esc(unidad(f.unidad).titulo)}</div>` : ""}${f.cerrado ? ' <span class="chip">Cerrado</span>' : ""}</td><td>${av(f.autor)}${esc(nombre(f.autor))}</td><td class="num">${f.mensajes.length - 1}</td><td class="small">${esc(nombre(ult.de))}<div class="muted">${fDia(ult.fecha)}</div></td></tr>`; }).join("") || '<tr><td class="muted">Todavía no hay temas.</td></tr>'}</table></div>`;
}
function vForoTema(mat, id) {
  const f = S.foros.find((x) => x.id === id && x.materia === mat);
  if (!f) return `<div class="panel">Tema no encontrado.</div>`;
  return `<div class="toolbar"><button onclick="location.hash='#/materias/${mat}/foro'">← Temas del foro</button><span class="sep"></span>
    ${S.rol === "docente" ? `<button onclick="S.foros.find(x=>x.id===${id}).cerrado=${!f.cerrado};guardar();render()">${f.cerrado ? "Reabrir tema" : "Cerrar tema"}</button>` : ""}</div>
  <div class="panel"><h2>${esc(f.titulo)}</h2>${f.unidad ? `<p class="small muted">Vinculado a ${esc(unidad(f.unidad).titulo)}</p>` : ""}
    ${f.mensajes.map((m) => `<div class="foro-msg">${av(m.de) || '<span class="av" style="background:#888">·</span>'}<div><b>${esc(nombre(m.de))}</b> <span class="small muted">${esc(rolDe(m.de))} · ${fDia(m.fecha)} ${m.fecha.slice(11, 16)}</span><div class="msg-cuerpo">${esc(m.texto)}</div></div></div>`).join("")}
    ${f.cerrado ? '<p class="muted">El docente cerró este tema.</p>' : `<div class="campo" style="margin-top:16px"><label>Tu respuesta</label><textarea id="foro-resp" style="min-height:90px"></textarea></div><div class="toolbar"><span class="sep"></span><button class="primario" onclick="responderForo(${id})">Responder</button></div>`}</div>`;
}
function responderForo(id) {
  const t = $("#foro-resp").value.trim();
  if (!t) return toast("Escribí tu respuesta");
  const ahora = new Date();
  S.foros.find((x) => x.id === id).mensajes.push({ de: yo(), fecha: `${HOY}T${String(ahora.getHours()).padStart(2, "0")}:${String(ahora.getMinutes()).padStart(2, "0")}`, texto: t });
  guardar(); render(); toast("Respuesta publicada");
}
function nuevoTemaForo(mat) {
  const us = unidadesDe(mat, cursoAula());
  modal("Nuevo tema — " + materia(mat).nombre, `
    <div class="campo"><label>Título</label><input type="text" id="f-tit"></div>
    <div class="campo"><label>Unidad (opcional)</label><select id="f-uni"><option value="">Tema general</option>${us.map((u) => `<option value="${u.id}">${esc(u.titulo)}</option>`).join("")}</select></div>
    <div class="campo"><label>Mensaje</label><textarea id="f-txt" style="min-height:100px"></textarea></div>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarTemaForo('${mat}')">Publicar</button></div>`);
}
function guardarTemaForo(mat) {
  const titulo = $("#f-tit").value.trim(), texto = $("#f-txt").value.trim();
  if (!titulo || !texto) return toast("Completá título y mensaje");
  const id = Math.max(0, ...S.foros.map((f) => f.id)) + 1;
  S.foros.push({ id, curso: cursoAula(), materia: mat, unidad: $("#f-uni").value ? +$("#f-uni").value : null, titulo, autor: yo(), fecha: HOY, cerrado: false, mensajes: [{ de: yo(), fecha: HOY + "T12:00", texto }] });
  guardar(); cerrarModal(); location.hash = `#/materias/${mat}/foro/${id}`;
}

// ───────────────────────── planificación del docente ─────────────────────────
function aulaNuevaUnidad(mat) {
  modal("Nueva unidad — " + materia(mat).nombre, `
    <div class="campo"><label>Título</label><input type="text" id="u-tit" placeholder="Unidad 4: ..."></div>
    <div class="grid"><div class="campo"><label>Desde</label><input type="date" id="u-desde" value="${HOY}"></div><div class="campo"><label>Hasta</label><input type="date" id="u-hasta" value="${HOY}"></div></div>
    <div class="campo"><label>Objetivos (uno por renglón) ${A_CONFIRMAR}</label><textarea id="u-obj" style="min-height:100px" placeholder="Que el alumno pueda..."></textarea></div>
    <p class="small muted">A confirmar: si los objetivos los escribe el docente o se eligen del diseño curricular.</p>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarUnidad('${mat}')">Crear unidad</button></div>`);
}
function guardarUnidad(mat) {
  const titulo = $("#u-tit").value.trim();
  const objetivos = $("#u-obj").value.split("\n").map((s) => s.trim()).filter(Boolean);
  if (!titulo || !objetivos.length) return toast("Completá el título y al menos un objetivo");
  const c = cursoAula();
  S.unidades.push({ id: Math.max(0, ...S.unidades.map((u) => u.id)) + 1, curso: c, materia: mat, orden: Math.max(0, ...unidadesDe(mat, c).map((u) => u.orden)) + 1, titulo, desde: $("#u-desde").value, hasta: $("#u-hasta").value, objetivos });
  guardar(); cerrarModal(); render(); toast("Unidad creada");
}
function aulaNuevoContenido(uid) {
  const u = unidad(uid);
  modal("Nuevo contenido — " + u.titulo, `
    <div class="campo"><label>Título</label><input type="text" id="n-tit"></div>
    <div class="campo"><label>Tipo</label><select id="n-tipo"><option value="texto">Texto / clase</option><option value="archivo">Archivo</option><option value="video">Video</option><option value="enlace">Enlace</option></select></div>
    <div class="campo"><label>Contenido</label><textarea id="n-cue"></textarea></div>
    <p><label><input type="checkbox" id="n-obl" checked> Obligatorio (cuenta para el avance)</label></p>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarContenidoAula(${uid})">Publicar</button></div>`);
}
function guardarContenidoAula(uid) {
  const titulo = $("#n-tit").value.trim();
  if (!titulo) return toast("Falta el título");
  const u = unidad(uid);
  S.contenidos.push({ id: Math.max(0, ...S.contenidos.map((c) => c.id)) + 1, curso: u.curso, materia: u.materia, unidad: uid, titulo, tipo: $("#n-tipo").value, obligatorio: $("#n-obl").checked, fecha: HOY, cuerpo: $("#n-cue").value, archivo: "archivo.pdf", url: "https://", vistoPor: [] });
  guardar(); cerrarModal(); render(); toast("Contenido publicado");
}
function aulaNuevaTarea(cid) {
  const x = contenido(cid), u = unidad(x.unidad);
  modal("Nueva tarea", `
    <p class="small muted">Desde el contenido <b>${esc(x.titulo)}</b> · ${esc(u.titulo)}</p>
    <div class="campo"><label>Título</label><input type="text" id="t-tit"></div>
    <div class="campo"><label>Consigna</label><textarea id="t-con"></textarea></div>
    <div class="campo"><label>Fecha de entrega (obligatoria)</label><input type="date" id="t-fec" value="${HOY}"></div>
    <p><label><input type="checkbox" id="t-nota" checked> La nota de esta tarea suma a la calificación del período</label> ${A_CONFIRMAR}</p>
    <p class="small muted">La fecha aparece sola en el calendario y en "Mis pendientes" de los alumnos. Las familias no la ven.</p>
    <div class="toolbar"><span class="sep"></span><button onclick="cerrarModal()">Cancelar</button><button class="primario" onclick="guardarTareaAula(${cid})">Publicar</button></div>`);
}
function guardarTareaAula(cid) {
  const titulo = $("#t-tit").value.trim();
  if (!titulo || !$("#t-fec").value) return toast("Completá título y fecha de entrega");
  const x = contenido(cid);
  S.tareas.push({ id: Math.max(0, ...S.tareas.map((t) => t.id)) + 1, curso: x.curso, materia: x.materia, contenido: cid, titulo, consigna: $("#t-con").value, entrega: $("#t-fec").value, cuentaNota: $("#t-nota").checked, entregas: {} });
  guardar(); cerrarModal(); render(); toast("Tarea publicada");
}

// ───────────────────────── avisos "a confirmar" en las vistas de familia ─────────────────────────
const _vCalendario3 = vCalendario;
vCalendario = function () {
  const h = _vCalendario3();
  return S.rol === "familia" ? notaMaqueta("Las familias ven solo fechas institucionales (actos, reuniones, feriados, salidas). A confirmar: si también ven las fechas de evaluación.") + h : h;
};
const _vCalificaciones3 = vCalificaciones;
vCalificaciones = function (arg) {
  const h = _vCalificaciones3(arg);
  return S.rol === "familia" ? notaMaqueta("A confirmar con la escuela: si las familias ven las calificaciones y el boletín. Las notas de cada tarea no se muestran a las familias.") + h : h;
};

// El selector de nivel refleja el estado guardado.
const _render3 = render;
render = function () { const n = $("#nivel-select"); if (n) n.value = S.nivel; _render3(); };
render();
setTimeout(mostrarBienvenida, 60);
