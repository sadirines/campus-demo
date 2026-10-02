// Opción 2: ajustes de datos sobre data.js para mostrar las funciones nuevas.
REGIMEN.periodoActual = 3; // 3° bimestre ya publicado; se está cargando el 4°

// Notas del 3° bimestre (Joaquín queda con dos materias por debajo de 6: alerta temprana).
const B3 = {
  a1: { len: 8, mat: 9, cso: 8, fec: 9, cna: 9, tec: 8, edi: 10, efi: 9, ing: 8, art: 9, mus: 9 },
  a2: { len: 9, mat: 9, cna: 9 }, a3: { len: 5, mat: 5, cna: 6 }, a4: { len: 8, mat: 7, cna: 8 },
  a5: { len: 7, mat: 7, cna: 6 }, a6: { len: 9, mat: 9, cso: 9, cna: 9 },
};
for (const a in B3) for (const m in B3[a]) NOTAS_INICIALES[a][m][2] = B3[a][m];

// Todos entregaron el resumen de Lengua menos Joaquín.
Object.assign(TAREAS_INICIALES[1].entregas, {
  a2: { fecha: "2026-09-28", archivo: "Resumen_Valentina.docx", nota: 9, devolucion: "Excelente." },
  a4: { fecha: "2026-09-28", archivo: "Resumen_Camila.docx", nota: 8, devolucion: "Muy bien." },
  a5: { fecha: "2026-09-29", archivo: "Resumen_Lautaro.docx", nota: 7, devolucion: "Bien. Entregado un día tarde." },
});

// Comunicados con tipo: info | confirmacion | autorizacion | respuesta.
// respuestas[familia] = { r, firma?, fecha }. "confirmados" se mantiene en paralelo.
COMUNICADOS_INICIALES.length = 0;
COMUNICADOS_INICIALES.push(
  { id: 1, de: "s2", tipo: "info", titulo: "Acto Día del Maestro", fecha: "2026-09-08", alcance: "Nivel Primario", cuerpo: "El jueves 10/09 a las 9 hs se realizará el acto por el Día del Maestro en el SUM. Las familias están invitadas.", requiereConfirmacion: false, confirmados: [], respuestas: {} },
  { id: 2, de: "s1", tipo: "info", titulo: "Semana del Estudiante — cronograma", fecha: "2026-09-09", alcance: "Todo el colegio", cuerpo: "Compartimos el cronograma de actividades de la Semana del Estudiante. Cierre con obra de teatro el viernes.", requiereConfirmacion: false, confirmados: [], respuestas: {} },
  { id: 3, de: "s2", tipo: "autorizacion", titulo: "Campamento 7° grado: autorización", fecha: "2026-09-18", alcance: '7° Grado "B"', cuerpo: "El campamento de 7° grado se realizará el jueves 22 y viernes 23 de octubre. Salida 8 hs desde el colegio, regreso viernes 18 hs.\n\nPara participar, cada familia debe autorizar a su hijo/a antes del 10/10.", vence: "2026-10-10", requiereConfirmacion: true, confirmados: ["f2"], respuestas: { f2: { r: "Autorizo", firma: "Martín Acosta", fecha: "2026-09-20" } } },
  { id: 4, de: "s1", tipo: "info", titulo: "Requisitos para la inscripción 2027", fecha: "2026-09-24", alcance: "Todo el colegio", cuerpo: "Ya están disponibles los requisitos y fechas para la inscripción al ciclo lectivo 2027.", requiereConfirmacion: false, confirmados: [], respuestas: {} },
  { id: 5, de: "s1", tipo: "respuesta", opciones: ["Asisto", "No asisto"], titulo: "Taller de cocina saludable para familias", fecha: "2026-09-29", alcance: "Nivel Primario", cuerpo: "Invitamos a las familias al taller de cocina saludable del viernes 9 de octubre a las 18 hs en el comedor. Por favor indiquen si asisten para organizar los materiales.", vence: "2026-10-07", requiereConfirmacion: true, confirmados: ["f3"], respuestas: { f3: { r: "Asisto", fecha: "2026-09-29" } } },
  { id: 6, de: "s1", tipo: "confirmacion", titulo: "Cambio en el punto de salida (5°, 6° y 7° grado)", fecha: "2026-09-29", alcance: '7° Grado "B"', cuerpo: "A partir del lunes 5 de octubre la salida de 5°, 6° y 7° grado se realizará por el portón de la calle lateral.", requiereConfirmacion: true, confirmados: ["f2", "f3"], respuestas: { f2: { r: "Leído", fecha: "2026-09-29" }, f3: { r: "Leído", fecha: "2026-09-30" } } },
);

const AUSENCIAS_INICIALES = [
  { id: 1, alumno: "a2", desde: "2026-10-01", hasta: "2026-10-01", motivo: "Turno médico", detalle: "", por: "f2" },
];

const PLANTILLAS = [
  { nombre: "Reunión de padres", tipo: "respuesta", titulo: "Reunión de padres — [curso]", cuerpo: "Estimadas familias:\n\nLos convocamos a la reunión de padres el día [fecha] a las [hora] hs en [lugar].\n\nPor favor indiquen si asisten." },
  { nombre: "Salida educativa / campamento", tipo: "autorizacion", titulo: "Salida educativa a [lugar]: autorización", cuerpo: "El día [fecha] realizaremos una salida educativa a [lugar]. Salida [hora] hs, regreso [hora] hs.\n\nPara participar, cada familia debe autorizar a su hijo/a antes del [fecha límite]." },
  { nombre: "Cambio de horario", tipo: "confirmacion", titulo: "Cambio de horario — [curso]", cuerpo: "Informamos que a partir del [fecha] el horario de [ingreso/salida] será a las [hora] hs." },
  { nombre: "Acto escolar", tipo: "info", titulo: "Acto por [motivo]", cuerpo: "El día [fecha] a las [hora] hs se realizará el acto por [motivo]. Las familias están invitadas." },
];

const BIENVENIDA = {
  familia: [["Todo en un solo lugar", "Comunicados, mensajes, materias, calificaciones y cuotas de tus hijos con un único usuario."], ["Lo importante, primero", "Al entrar vas a ver qué necesita tu atención hoy: autorizaciones, evaluaciones y vencimientos."], ["Sin papeles", "Podés autorizar salidas, confirmar asistencia y avisar una ausencia desde el celular."]],
  alumno: [["Tus materias", "Cada materia tiene sus contenidos y te muestra cuánto llevás visto."], ["Tus entregas", "Las tareas tienen fecha y solo tu docente ve lo que entregás."], ["Tus notas", "Cuando la escuela las publica, las ves acá junto con tu evolución."]],
  docente: [["Tu curso ya está cargado", "Los alumnos y las familias vienen de Búho: no hay que armar listas."], ["Comunicación con respaldo", "Mensajes a alumnos y familias, con registro de quién leyó."], ["Notas y seguimiento", "Cargás las notas una vez y el boletín sale solo. El sistema te avisa qué alumnos necesitan atención."]],
  secretaria: [["Panel de dirección", "Lectura de comunicados, carga de notas y alumnos en riesgo, en una pantalla."], ["Comunicados con respuesta", "Autorizaciones y confirmaciones de asistencia sin papel, con plantillas."], ["Un solo sistema", "La misma base de alumnos y familias que ya usa la administración."]],
};
