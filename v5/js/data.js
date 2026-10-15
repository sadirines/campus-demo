// Datos de prueba de la maqueta. Todos los nombres son inventados.
// Fecha "hoy" fija para que la demo sea reproducible.
const HOY = "2026-10-01";

const COLEGIO = {
  nombre: "Complejo Educativo José Hernández",
  sigla: "JH",
  ciclo: 2026,
};

// Régimen de calificación (a definir con la escuela). Los mails reales hablan de "3° bimestre".
const REGIMEN = {
  periodos: ["1° Bimestre", "2° Bimestre", "3° Bimestre", "4° Bimestre"],
  escala: "Numérica 1 a 10 (aprueba con 6)",
  aprobacion: 6,
  periodoActual: 2, // índice: 3° bimestre
};

const CURSOS = [
  { id: "7B", nombre: '7° Grado "B"', nivel: "Primario" },
  { id: "4A", nombre: '4° Grado "A"', nivel: "Primario" },
];

const MATERIAS = [
  { id: "len", nombre: "Lengua", tipo: "troncal", docente: "d1" },
  { id: "mat", nombre: "Matemática", tipo: "troncal", docente: "d1" },
  { id: "cso", nombre: "Ciencias Sociales", tipo: "troncal", docente: "d2" },
  { id: "fec", nombre: "Formación Ética y Ciudadana", tipo: "troncal", docente: "d2" },
  { id: "cna", nombre: "Ciencias Naturales", tipo: "troncal", docente: "d1" },
  { id: "tec", nombre: "Tecnología", tipo: "troncal", docente: "d2" },
  { id: "edi", nombre: "Educación Digital", tipo: "troncal", docente: "d3" },
  { id: "efi", nombre: "Educación Física y Natación", tipo: "especial", docente: "d4" },
  { id: "ing", nombre: "Inglés", tipo: "especial", docente: "d5" },
  { id: "art", nombre: "Artes Visuales", tipo: "especial", docente: "d6" },
  { id: "mus", nombre: "Música", tipo: "especial", docente: "d6" },
];

const PERSONAS = {
  d1: { nombre: "Laura Gómez", rol: "Maestra de Grado", grupo: "Docentes" },
  d2: { nombre: "Mariana Ríos", rol: "Maestra de Grado", grupo: "Docentes" },
  d3: { nombre: "Pablo Herrera", rol: "Educación Digital", grupo: "Docentes" },
  d4: { nombre: "Diego Suárez", rol: "Educación Física", grupo: "Docentes" },
  d5: { nombre: "Ana Torres", rol: "Inglés", grupo: "Docentes" },
  d6: { nombre: "Lucía Paz", rol: "Artes Visuales y Música", grupo: "Docentes" },
  s1: { nombre: "Claudia Vera", rol: "Secretaría", grupo: "Directivos" },
  s2: { nombre: "Roberto Luna", rol: "Dirección Nivel Primario", grupo: "Directivos" },
  f1: { nombre: "Carolina Rivero", rol: "Tutora de Tomás y Sofía Rivero", grupo: "Familias" },
  f2: { nombre: "Martín Acosta", rol: "Tutor de Valentina Acosta", grupo: "Familias" },
  f3: { nombre: "Silvia Medina", rol: "Tutora de Joaquín Medina", grupo: "Familias" },
  a1: { nombre: "Tomás Rivero", rol: 'Alumno 7° "B"', grupo: "Alumnos" },
  a2: { nombre: "Valentina Acosta", rol: 'Alumna 7° "B"', grupo: "Alumnos" },
  a3: { nombre: "Joaquín Medina", rol: 'Alumno 7° "B"', grupo: "Alumnos" },
  a4: { nombre: "Camila Ortiz", rol: 'Alumna 7° "B"', grupo: "Alumnos" },
  a5: { nombre: "Lautaro Díaz", rol: 'Alumno 7° "B"', grupo: "Alumnos" },
  a6: { nombre: "Sofía Rivero", rol: 'Alumna 4° "A"', grupo: "Alumnos" },
};

// Alumnos por curso (en el producto real salen de Inscripción de Búho).
const ALUMNOS_CURSO = { "7B": ["a1", "a2", "a3", "a4", "a5"], "4A": ["a6"] };

// Usuarios de la demo, uno por rol.
const ROLES = {
  familia: { id: "f1", etiqueta: "Familia", hijos: ["a1", "a6"] },
  alumno: { id: "a1", etiqueta: "Alumno", curso: "7B" },
  docente: { id: "d1", etiqueta: "Docente", cursos: ["7B"], materias: ["len", "mat", "cna"] },
  secretaria: { id: "s1", etiqueta: "Secretaría / Dirección" },
};

// Grupos de destinatarios que ofrece "Redactar" según el rol (relevamiento §4.7 y B11).
const GRUPOS_DESTINO = {
  familia: ["Docentes", "Directivos"],
  alumno: ["Docentes", "Alumnos"],
  docente: ["Alumnos", "Familias", "Docentes", "Directivos"],
  secretaria: ["Familias", "Alumnos", "Docentes", "Directivos"],
};

const ETIQUETAS_MAIL = [
  { id: "importante", nombre: "Importante", color: "#f8d7da" },
  { id: "tareas", nombre: "Tareas", color: "#dcecdd" },
];

// Mensajes: "para" es una lista de ids. Las carpetas se calculan por usuario.
const MENSAJES_INICIALES = [
  { id: 1, de: "s1", para: ["f1", "f2", "f3"], asunto: "Cambio en el punto de salida de estudiantes (5°, 6° y 7° grado)", fecha: "2026-09-29T10:33", adj: [], cuerpo: "Estimadas familias:\n\nA partir del lunes 5 de octubre la salida de 5°, 6° y 7° grado se realizará por el portón de calle lateral.\n\nMuchas gracias.\nSecretaría", leidoPor: [], etiquetas: {} },
  { id: 2, de: "d1", para: ["f1", "f2", "f3"], asunto: "Evaluaciones del 3° bimestre", fecha: "2026-09-29T20:24", adj: [{ n: "Cronograma_evaluaciones.pdf", t: "539.6 KB" }], cuerpo: "Familias, les comparto el cronograma de evaluaciones del 3° bimestre. Cualquier consulta, me escriben por acá.\n\nSeño Laura", leidoPor: [], etiquetas: {} },
  { id: 3, de: "s1", para: ["f1", "f2", "f3"], asunto: "Invitación al taller de cocina", fecha: "2026-09-29T10:28", adj: [{ n: "Taller_cocina.jpg", t: "298.7 KB" }], cuerpo: "Invitamos a las familias al taller de cocina saludable del viernes 9 de octubre a las 18 hs.", leidoPor: ["f1"], etiquetas: {} },
  { id: 4, de: "s2", para: ["f1", "f2", "f3"], asunto: "Campamento de 7° grado — autorización", fecha: "2026-09-18T23:23", adj: [{ n: "Autorizacion_campamento.pdf", t: "18.2 KB" }], cuerpo: "Adjuntamos la autorización para el campamento. Debe imprimirse, firmarse y entregarse a la maestra antes del 10/10.", leidoPor: ["f1"], etiquetas: { f1: ["importante"] } },
  { id: 5, de: "f1", para: ["d1"], asunto: "RE: Evaluaciones del 3° bimestre", fecha: "2026-09-30T08:10", adj: [], cuerpo: "Gracias seño. ¿La evaluación de Matemática incluye fracciones?\n\nCarolina", leidoPor: [], etiquetas: {} },
  { id: 6, de: "d1", para: ["a1", "a2", "a3", "a4", "a5"], asunto: "TAREA DE MATEMÁTICA — fracciones equivalentes", fecha: "2026-09-30T18:00", adj: [{ n: "Ficha_fracciones.pdf", t: "412.0 KB" }], cuerpo: "Chicos: resuelvan la ficha adjunta en la carpeta. La corregimos el lunes.", leidoPor: [], etiquetas: {} },
  { id: 7, de: "d3", para: ["a1", "a2", "a3", "a4", "a5"], asunto: "Educación Digital: proyecto de presentación", fecha: "2026-09-25T11:00", adj: [], cuerpo: "Recuerden que la presentación se entrega en la sección Tareas, no por mail.", leidoPor: ["a1"], etiquetas: {} },
  { id: 8, de: "a1", para: ["d1"], asunto: "Consulta tarea de Lengua", fecha: "2026-09-26T19:40", adj: [], cuerpo: "Seño, ¿el resumen va en la carpeta o lo mando por acá?", leidoPor: ["d1"], etiquetas: {} },
  { id: 9, de: "f2", para: ["d1"], asunto: "Ausencia de Valentina", fecha: "2026-09-30T07:45", adj: [], cuerpo: "Seño, Valentina hoy no va a asistir por turno médico. Saludos, Martín.", leidoPor: [], etiquetas: {} },
  { id: 10, de: "d1", para: ["s1"], asunto: "Pedido de materiales para la Feria de Ciencias", fecha: "2026-09-28T13:00", adj: [], cuerpo: "Claudia, para la feria vamos a necesitar 3 mesas y una extensión eléctrica.", leidoPor: [], etiquetas: {} },
];

// Comunicados institucionales (Novedades): con alcance y confirmación de lectura.
const COMUNICADOS_INICIALES = [
  { id: 1, de: "s2", titulo: "Acto Día del Maestro", fecha: "2026-09-08", alcance: "Nivel Primario", cuerpo: "El jueves 10/09 a las 9 hs se realizará el acto por el Día del Maestro en el SUM. Las familias están invitadas.", requiereConfirmacion: false, confirmados: [] },
  { id: 2, de: "s1", titulo: "Semana del Estudiante — cronograma", fecha: "2026-09-09", alcance: "Todo el colegio", cuerpo: "Compartimos el cronograma de actividades de la Semana del Estudiante. Cierre con obra de teatro el viernes.", requiereConfirmacion: false, confirmados: [] },
  { id: 3, de: "s2", titulo: "Campamento 7° grado: autorización obligatoria", fecha: "2026-09-18", alcance: '7° Grado "B"', cuerpo: "Para participar del campamento es obligatorio confirmar la lectura de este comunicado y entregar la autorización firmada.", requiereConfirmacion: true, confirmados: ["f2"] },
  { id: 4, de: "s1", titulo: "Requisitos para la inscripción 2027", fecha: "2026-09-24", alcance: "Todo el colegio", cuerpo: "Ya están disponibles los requisitos y fechas para la inscripción al ciclo lectivo 2027.", requiereConfirmacion: false, confirmados: [] },
];

// Contenidos por materia (Programa). tipo: texto | archivo | video | enlace
const CONTENIDOS_INICIALES = [
  { id: 1, materia: "cna", unidad: "Unidad 3: La energía", titulo: "LA ENERGÍA — formas y transformaciones", tipo: "texto", obligatorio: true, fecha: "2026-09-02", cuerpo: "La energía es la capacidad de producir cambios. Leé el texto, mirá el video y respondé las consignas 1 a 5 en la carpeta.", vistoPor: ["a1", "a2"] },
  { id: 2, materia: "cna", unidad: "Unidad 3: La energía", titulo: "Video: energías renovables", tipo: "video", obligatorio: true, fecha: "2026-09-03", cuerpo: "Video de 6 minutos sobre energía solar y eólica.", vistoPor: ["a1"] },
  { id: 3, materia: "cna", unidad: "Unidad 3: La energía", titulo: "Ficha de actividades", tipo: "archivo", obligatorio: false, fecha: "2026-09-03", archivo: "Ficha_energia.pdf", vistoPor: ["a1"] },
  { id: 4, materia: "mat", unidad: "Unidad 4: Fracciones", titulo: "Fracciones equivalentes", tipo: "texto", obligatorio: true, fecha: "2026-09-21", cuerpo: "Dos fracciones son equivalentes cuando representan la misma cantidad. Ejemplos y ejercicios.", vistoPor: [] },
  { id: 5, materia: "mat", unidad: "Unidad 4: Fracciones", titulo: "Ficha de fracciones", tipo: "archivo", obligatorio: true, fecha: "2026-09-30", archivo: "Ficha_fracciones.pdf", vistoPor: [] },
  { id: 6, materia: "len", unidad: "Unidad 3: El texto narrativo", titulo: "Estructura del cuento", tipo: "texto", obligatorio: true, fecha: "2026-09-10", cuerpo: "Introducción, nudo y desenlace. Leé el cuento 'La gallina degollada' y marcá cada parte.", vistoPor: ["a1"] },
  { id: 7, materia: "edi", unidad: "Proyecto 2", titulo: "Cómo armar una presentación", tipo: "enlace", obligatorio: false, fecha: "2026-09-15", url: "https://ejemplo.edu/presentaciones", vistoPor: [] },
  { id: 8, materia: "cso", unidad: "Unidad 3: Organización del territorio", titulo: "Las provincias y sus capitales", tipo: "texto", obligatorio: true, fecha: "2026-09-12", cuerpo: "Mapa político de Argentina. Completá el mapa mudo en la carpeta.", vistoPor: ["a1"] },
];

// Tareas con entrega privada (OPCIONAL: no está en la propuesta económica).
const TAREAS_INICIALES = [
  { id: 1, materia: "cna", titulo: "Presentación: energías renovables", consigna: "Armá una presentación de 5 diapositivas sobre una energía renovable.", entrega: "2026-10-06", entregas: { a2: { fecha: "2026-09-29", archivo: "Valentina_presentacion.pptx", nota: null } } },
  { id: 2, materia: "len", titulo: "Resumen del cuento", consigna: "Resumí el cuento en no más de una carilla.", entrega: "2026-09-28", entregas: { a1: { fecha: "2026-09-27", archivo: "Resumen_Tomas.docx", nota: 8, devolucion: "Muy bien organizado. Cuidá la ortografía." } } },
  { id: 3, materia: "mat", titulo: "Ficha de fracciones (foto de la carpeta)", consigna: "Sacale foto a la ficha resuelta y subila.", entrega: "2026-10-05", entregas: {} },
];

// Calificaciones: notas[alumno][materia] = [b1, b2, b3, b4]
const NOTAS_INICIALES = {
  a1: { len: [8, 7, null, null], mat: [7, 8, null, null], cso: [9, 8, null, null], fec: [9, 9, null, null], cna: [8, 9, null, null], tec: [7, 8, null, null], edi: [9, 9, null, null], efi: [10, 9, null, null], ing: [7, 7, null, null], art: [9, 10, null, null], mus: [8, 8, null, null] },
  a2: { len: [9, 9, null, null], mat: [8, 9, null, null], cna: [9, 8, null, null] },
  a3: { len: [6, 5, null, null], mat: [5, 6, null, null], cna: [7, 6, null, null] },
  a4: { len: [7, 8, null, null], mat: [8, 8, null, null], cna: [8, 8, null, null] },
  a5: { len: [6, 7, null, null], mat: [7, 6, null, null], cna: [6, 7, null, null] },
  a6: { len: [9, 9, null, null], mat: [8, 9, null, null], cso: [9, 9, null, null], cna: [9, 8, null, null] },
};

// Calendario. etiqueta: Clase | Cumpleaños | Entrega | Examen | Feriado | Importante | Reunión | Tarea
const EVENTOS_INICIALES = [
  { id: 1, titulo: "Evaluación de Matemática", fecha: "2026-10-07", etiqueta: "Examen", curso: "7B", autor: "d1" },
  { id: 2, titulo: "Taller de cocina (familias)", fecha: "2026-10-09", etiqueta: "Reunión", curso: "todos", autor: "s1" },
  { id: 3, titulo: "Entrega autorización campamento", fecha: "2026-10-10", etiqueta: "Importante", curso: "7B", autor: "s2" },
  { id: 4, titulo: "Feriado: Día del Respeto a la Diversidad Cultural", fecha: "2026-10-12", etiqueta: "Feriado", curso: "todos", autor: "s1" },
  { id: 5, titulo: "Feria de Ciencias", fecha: "2026-10-16", etiqueta: "Importante", curso: "todos", autor: "s2" },
  { id: 6, titulo: "Evaluación de Lengua", fecha: "2026-10-14", etiqueta: "Examen", curso: "7B", autor: "d1" },
  { id: 7, titulo: "Campamento 7° grado", fecha: "2026-10-22", etiqueta: "Importante", curso: "7B", autor: "s2" },
  { id: 8, titulo: "Reunión de padres 4° A", fecha: "2026-10-08", etiqueta: "Reunión", curso: "4A", autor: "s1" },
];
