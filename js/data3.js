// Versión 3: el aula se organiza como planificación (materia → unidad → objetivos →
// contenidos → tareas) y se agrega un curso de secundaria con foros.
// Todos los nombres son inventados.

CURSOS.push({ id: "2B", nombre: '2° Año "B"', nivel: "Secundario" });

MATERIAS.push(
  { id: "his", nombre: "Historia", tipo: "secundaria", docente: "d7" },
  { id: "bio", nombre: "Biología", tipo: "secundaria", docente: "d8" },
  { id: "mat2", nombre: "Matemática", tipo: "secundaria", docente: "d9" },
  { id: "len2", nombre: "Lengua y Literatura", tipo: "secundaria", docente: "d10" },
  { id: "ing2", nombre: "Inglés", tipo: "secundaria", docente: "d5" },
  { id: "efi2", nombre: "Educación Física", tipo: "secundaria", docente: "d4" },
);

Object.assign(PERSONAS, {
  d7: { nombre: "Gustavo Ferreyra", rol: "Profesor de Historia", grupo: "Docentes" },
  d8: { nombre: "Paula Medina", rol: "Profesora de Biología", grupo: "Docentes" },
  d9: { nombre: "Javier Ortiz", rol: "Profesor de Matemática", grupo: "Docentes" },
  d10: { nombre: "Silvina Luna", rol: "Profesora de Lengua y Literatura", grupo: "Docentes" },
  a7: { nombre: "Martina Rivero", rol: 'Alumna 2° Año "B"', grupo: "Alumnos" },
  a8: { nombre: "Bruno Sosa", rol: 'Alumno 2° Año "B"', grupo: "Alumnos" },
  a9: { nombre: "Lucía Herrera", rol: 'Alumna 2° Año "B"', grupo: "Alumnos" },
  a10: { nombre: "Franco Vega", rol: 'Alumno 2° Año "B"', grupo: "Alumnos" },
});
PERSONAS.f1.rol = "Tutora de Tomás, Sofía y Martina Rivero";
ALUMNOS_CURSO["2B"] = ["a7", "a8", "a9", "a10"];
ROLES.familia.hijos.push("a7");

// Usuario de la demo según el nivel elegido en la barra amarilla.
const NIVELES = {
  primario: { alumno: { id: "a1", curso: "7B" }, docente: { id: "d1", cursos: ["7B"], materias: ["len", "mat", "cna"] } },
  secundario: { alumno: { id: "a7", curso: "2B" }, docente: { id: "d7", cursos: ["2B"], materias: ["his"] } },
};

// Notas de secundaria (Bruno queda con dos materias por debajo de 6: alerta temprana).
Object.assign(NOTAS_INICIALES, {
  a7: { his: [8, 9, 9, null], bio: [9, 8, 9, null], mat2: [7, 8, 8, null], len2: [9, 9, 8, null], ing2: [8, 8, 9, null], efi2: [10, 9, 10, null] },
  a8: { his: [6, 6, 5, null], bio: [6, 5, 5, null], mat2: [6, 7, 6, null], len2: [7, 6, 7, null] },
  a9: { his: [9, 9, 10, null], bio: [8, 9, 9, null], mat2: [9, 8, 9, null], len2: [8, 9, 9, null] },
  a10: { his: [7, 7, 7, null], bio: [7, 6, 7, null], mat2: [6, 6, 7, null], len2: [7, 7, 7, null] },
});

// Planificación: unidades con objetivos.
const UNIDADES_INICIALES = [
  { id: 1, curso: "7B", materia: "cna", orden: 3, titulo: "Unidad 3: La energía", desde: "2026-09-01", hasta: "2026-10-09", objetivos: ["Reconocer distintas formas de energía en situaciones cotidianas", "Explicar transformaciones de energía con ejemplos", "Valorar el uso de energías renovables"] },
  { id: 2, curso: "7B", materia: "mat", orden: 4, titulo: "Unidad 4: Fracciones", desde: "2026-09-21", hasta: "2026-10-16", objetivos: ["Identificar fracciones equivalentes", "Resolver problemas con fracciones de uso cotidiano"] },
  { id: 3, curso: "7B", materia: "len", orden: 3, titulo: "Unidad 3: El texto narrativo", desde: "2026-09-07", hasta: "2026-10-02", objetivos: ["Reconocer la estructura del cuento", "Producir resúmenes respetando el orden de los hechos"] },
  { id: 4, curso: "7B", materia: "cso", orden: 3, titulo: "Unidad 3: Organización del territorio", desde: "2026-09-07", hasta: "2026-10-09", objetivos: ["Ubicar provincias y capitales en el mapa político"] },
  { id: 5, curso: "7B", materia: "edi", orden: 2, titulo: "Proyecto 2: Presentaciones", desde: "2026-09-14", hasta: "2026-10-09", objetivos: ["Organizar información en diapositivas"] },
  { id: 6, curso: "2B", materia: "his", orden: 2, titulo: "Unidad 2: Revolución de Mayo e independencia", desde: "2026-09-01", hasta: "2026-10-23", objetivos: ["Explicar las causas de la Revolución de Mayo", "Ordenar cronológicamente los hechos entre 1806 y 1816", "Analizar fuentes históricas de la época"] },
  { id: 7, curso: "2B", materia: "bio", orden: 3, titulo: "Unidad 3: La célula", desde: "2026-09-07", hasta: "2026-10-16", objetivos: ["Diferenciar célula animal y vegetal", "Usar el microscopio siguiendo normas de seguridad"] },
  { id: 8, curso: "2B", materia: "mat2", orden: 3, titulo: "Unidad 3: Funciones lineales", desde: "2026-09-14", hasta: "2026-10-23", objetivos: ["Representar funciones lineales en el plano", "Interpretar pendiente y ordenada al origen"] },
  { id: 9, curso: "2B", materia: "len2", orden: 2, titulo: "Unidad 2: Género lírico", desde: "2026-09-14", hasta: "2026-10-23", objetivos: ["Reconocer recursos expresivos en poemas"] },
];

// Contenidos: cada uno pertenece a una unidad de un curso.
CONTENIDOS_INICIALES.length = 0;
CONTENIDOS_INICIALES.push(
  { id: 1, curso: "7B", materia: "cna", unidad: 1, titulo: "LA ENERGÍA — formas y transformaciones", tipo: "texto", obligatorio: true, fecha: "2026-09-02", cuerpo: "La energía es la capacidad de producir cambios. Leé el texto, mirá el video y respondé las consignas 1 a 5 en la carpeta.", vistoPor: ["a1", "a2"] },
  { id: 2, curso: "7B", materia: "cna", unidad: 1, titulo: "Video: energías renovables", tipo: "video", obligatorio: true, fecha: "2026-09-03", cuerpo: "Video de 6 minutos sobre energía solar y eólica.", vistoPor: ["a1"] },
  { id: 3, curso: "7B", materia: "cna", unidad: 1, titulo: "Ficha de actividades", tipo: "archivo", obligatorio: false, fecha: "2026-09-03", archivo: "Ficha_energia.pdf", vistoPor: ["a1"] },
  { id: 4, curso: "7B", materia: "mat", unidad: 2, titulo: "Fracciones equivalentes", tipo: "texto", obligatorio: true, fecha: "2026-09-21", cuerpo: "Dos fracciones son equivalentes cuando representan la misma cantidad. Ejemplos y ejercicios.", vistoPor: [] },
  { id: 5, curso: "7B", materia: "mat", unidad: 2, titulo: "Ficha de fracciones", tipo: "archivo", obligatorio: true, fecha: "2026-09-30", archivo: "Ficha_fracciones.pdf", vistoPor: [] },
  { id: 6, curso: "7B", materia: "len", unidad: 3, titulo: "Estructura del cuento", tipo: "texto", obligatorio: true, fecha: "2026-09-10", cuerpo: "Introducción, nudo y desenlace. Leé el cuento 'La gallina degollada' y marcá cada parte.", vistoPor: ["a1"] },
  { id: 7, curso: "7B", materia: "edi", unidad: 5, titulo: "Cómo armar una presentación", tipo: "enlace", obligatorio: false, fecha: "2026-09-15", url: "https://ejemplo.edu/presentaciones", vistoPor: [] },
  { id: 8, curso: "7B", materia: "cso", unidad: 4, titulo: "Las provincias y sus capitales", tipo: "texto", obligatorio: true, fecha: "2026-09-12", cuerpo: "Mapa político de Argentina. Completá el mapa mudo en la carpeta.", vistoPor: ["a1"] },
  { id: 9, curso: "2B", materia: "his", unidad: 6, titulo: "Las invasiones inglesas y el Cabildo abierto", tipo: "texto", obligatorio: true, fecha: "2026-09-02", cuerpo: "Entre 1806 y 1807 Buenos Aires resistió dos invasiones inglesas. Leé el texto y armá un cuadro con causas y consecuencias.", vistoPor: ["a7", "a8", "a9"] },
  { id: 10, curso: "2B", materia: "his", unidad: 6, titulo: "Video: la Semana de Mayo", tipo: "video", obligatorio: true, fecha: "2026-09-09", cuerpo: "Documental de 12 minutos sobre los hechos del 18 al 25 de mayo de 1810.", vistoPor: ["a7", "a9"] },
  { id: 11, curso: "2B", materia: "his", unidad: 6, titulo: "Fuente histórica: el Acta del 25 de Mayo", tipo: "archivo", obligatorio: true, fecha: "2026-09-23", archivo: "Acta_25_de_mayo.pdf", vistoPor: ["a9"] },
  { id: 12, curso: "2B", materia: "bio", unidad: 7, titulo: "La célula: estructura y funciones", tipo: "texto", obligatorio: true, fecha: "2026-09-08", cuerpo: "Membrana, citoplasma y núcleo. Diferencias entre célula animal y vegetal.", vistoPor: ["a7", "a9"] },
  { id: 13, curso: "2B", materia: "bio", unidad: 7, titulo: "Guía de laboratorio: uso del microscopio", tipo: "archivo", obligatorio: true, fecha: "2026-09-15", archivo: "Guia_microscopio.pdf", vistoPor: ["a7", "a9", "a10"] },
  { id: 14, curso: "2B", materia: "mat2", unidad: 8, titulo: "Función lineal: pendiente y ordenada al origen", tipo: "texto", obligatorio: true, fecha: "2026-09-16", cuerpo: "y = mx + b. Qué representan m y b, con ejemplos graficados.", vistoPor: ["a7"] },
  { id: 15, curso: "2B", materia: "len2", unidad: 9, titulo: "Recursos expresivos en la poesía", tipo: "texto", obligatorio: true, fecha: "2026-09-17", cuerpo: "Metáfora, comparación, hipérbole y personificación, con ejemplos de poemas.", vistoPor: [] },
);

// Tareas: cada una sale de un contenido (y por lo tanto de una unidad y una materia).
// cuentaNota: si la nota de la tarea suma a la calificación del período (a confirmar con la escuela).
TAREAS_INICIALES.length = 0;
TAREAS_INICIALES.push(
  { id: 1, curso: "7B", materia: "cna", contenido: 2, titulo: "Presentación: energías renovables", consigna: "Armá una presentación de 5 diapositivas sobre una energía renovable.", entrega: "2026-10-06", cuentaNota: true, entregas: { a2: { fecha: "2026-09-29", archivo: "Valentina_presentacion.pptx", nota: null } } },
  { id: 2, curso: "7B", materia: "len", contenido: 6, titulo: "Resumen del cuento", consigna: "Resumí el cuento en no más de una carilla.", entrega: "2026-09-28", cuentaNota: true, entregas: {
    a1: { fecha: "2026-09-27", archivo: "Resumen_Tomas.docx", nota: 8, devolucion: "Muy bien organizado. Cuidá la ortografía." },
    a2: { fecha: "2026-09-28", archivo: "Resumen_Valentina.docx", nota: 9, devolucion: "Excelente." },
    a4: { fecha: "2026-09-28", archivo: "Resumen_Camila.docx", nota: 8, devolucion: "Muy bien." },
    a5: { fecha: "2026-09-29", archivo: "Resumen_Lautaro.docx", nota: 7, devolucion: "Bien. Entregado un día tarde." } } },
  { id: 3, curso: "7B", materia: "mat", contenido: 5, titulo: "Ficha de fracciones (foto de la carpeta)", consigna: "Sacale foto a la ficha resuelta y subila.", entrega: "2026-10-05", cuentaNota: false, entregas: {} },
  { id: 4, curso: "2B", materia: "his", contenido: 9, titulo: "Línea de tiempo 1806–1816", consigna: "Armá una línea de tiempo con al menos 8 hechos entre las invasiones inglesas y la independencia.", entrega: "2026-10-08", cuentaNota: true, entregas: { a9: { fecha: "2026-09-30", archivo: "Linea_tiempo_Lucia.pdf", nota: null } } },
  { id: 5, curso: "2B", materia: "his", contenido: 11, titulo: "Análisis de fuente: el Acta del 25 de Mayo", consigna: "Leé el Acta y respondé: ¿quiénes la firman?, ¿qué deciden?, ¿qué dice sobre Fernando VII?", entrega: "2026-10-15", cuentaNota: true, entregas: {} },
  { id: 6, curso: "2B", materia: "bio", contenido: 13, titulo: "Informe de laboratorio", consigna: "Informe de la práctica con microscopio: objetivo, materiales, procedimiento, observaciones y dibujo.", entrega: "2026-09-29", cuentaNota: true, entregas: { a7: { fecha: "2026-09-28", archivo: "Informe_Martina.pdf", nota: 9, devolucion: "Muy completo." }, a9: { fecha: "2026-09-29", archivo: "Informe_Lucia.pdf", nota: null } } },
  { id: 7, curso: "2B", materia: "mat2", contenido: 14, titulo: "Ejercicios: graficar funciones", consigna: "Resolvé los ejercicios 1 a 10 de la página 48 y subí una foto.", entrega: "2026-10-03", cuentaNota: false, entregas: { a7: { fecha: "2026-10-01", archivo: "Ejercicios_Martina.jpg", nota: null } } },
);

// Foros por materia (solo secundaria).
const FOROS_INICIALES = [
  { id: 1, curso: "2B", materia: "his", unidad: 6, titulo: "¿Fue la Revolución de Mayo una revolución?", autor: "d7", fecha: "2026-09-25", cerrado: false, mensajes: [
    { de: "d7", fecha: "2026-09-25T18:00", texto: "Después de leer el Acta y ver el video: ¿les parece que en mayo de 1810 hubo una revolución o un cambio de autoridades? Argumenten con lo que leyeron." },
    { de: "a9", fecha: "2026-09-26T20:15", texto: "Para mí fue una revolución porque el Cabildo dejó de obedecer al virrey, aunque todavía juraban por Fernando VII." },
    { de: "a7", fecha: "2026-09-27T17:40", texto: "Yo creo que al principio fue solo un cambio de autoridades. La independencia recién se declara en 1816." },
    { de: "d7", fecha: "2026-09-28T09:10", texto: "Muy buenos argumentos las dos. Martina, ¿qué pasó entre 1810 y 1816 que explique ese cambio?" },
  ] },
  { id: 2, curso: "2B", materia: "his", unidad: null, titulo: "Consultas sobre la línea de tiempo", autor: "d7", fecha: "2026-09-29", cerrado: false, mensajes: [
    { de: "d7", fecha: "2026-09-29T10:00", texto: "Dejen acá sus dudas sobre la línea de tiempo. Respondo por acá así le sirve a todo el curso." },
    { de: "a8", fecha: "2026-09-30T21:05", texto: "¿Hay que incluir las invasiones inglesas?" },
    { de: "d7", fecha: "2026-10-01T08:30", texto: "Sí, la línea arranca en 1806." },
  ] },
  { id: 3, curso: "2B", materia: "bio", unidad: 7, titulo: "Dudas para el laboratorio", autor: "d8", fecha: "2026-09-16", cerrado: true, mensajes: [
    { de: "d8", fecha: "2026-09-16T12:00", texto: "Antes de la práctica del jueves, lean la guía. Si tienen dudas sobre el microscopio, pregunten acá." },
    { de: "a10", fecha: "2026-09-16T19:20", texto: "¿Tenemos que traer las muestras nosotros?" },
    { de: "d8", fecha: "2026-09-17T07:50", texto: "No, las muestras las lleva la escuela. Solo traigan guardapolvo." },
  ] },
];

EVENTOS_INICIALES.push(
  { id: 20, titulo: "Evaluación de Historia", fecha: "2026-10-13", etiqueta: "Examen", curso: "2B", autor: "d7" },
  { id: 21, titulo: "Laboratorio de Biología", fecha: "2026-10-07", etiqueta: "Clase", curso: "2B", autor: "d8" },
);

// Textos de bienvenida ajustados: las familias no tienen acceso al aula.
BIENVENIDA.familia[0] = ["Todo en un solo lugar", "Comunicados, mensajes, calificaciones y cuotas de tus hijos con un único usuario."];
BIENVENIDA.alumno = [["Tu aula", "Cada materia tiene su programa: unidades, objetivos y contenidos."], ["Las tareas, dentro de su tema", "Cada tarea está en el contenido que trabaja. Así sabés qué estás practicando y para qué."], ["Tus pendientes", "En un solo lugar ves lo que tenés que entregar de todas las materias."]];
BIENVENIDA.docente[1] = ["Tu planificación", "Armás cada materia por unidades con sus objetivos, contenidos y tareas. En secundaria, además, el foro."];

// Curso del alumno o docente de la demo (depende del nivel elegido).
function CURSO_ACT() { return S.rol === "alumno" ? ROLES.alumno.curso : ROLES.docente.cursos[0]; }
