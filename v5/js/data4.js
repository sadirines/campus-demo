// Versión 4: nivel Inicial (jardín). En jardín se usa mensajería, comunicados y el foro
// de la sala entre la docente y las familias; los chicos no tienen usuario.
// Todos los nombres son inventados.

CURSOS.push({ id: "S5", nombre: 'Sala de 5 "Celeste"', nivel: "Inicial" });
MATERIAS.push({ id: "sala", nombre: "Sala de 5", tipo: "jardin", docente: "d11" });

Object.assign(PERSONAS, {
  d11: { nombre: "Verónica Paredes", rol: "Maestra de Sala de 5", grupo: "Docentes" },
  f5: { nombre: "Natalia Gómez", rol: "Tutora de Benjamín Gómez", grupo: "Familias" },
  f6: { nombre: "Pablo Ruiz", rol: "Tutor de Emma Ruiz", grupo: "Familias" },
  a11: { nombre: "Benjamín Gómez", rol: 'Sala de 5 "Celeste"', grupo: "Alumnos" },
  a12: { nombre: "Emma Ruiz", rol: 'Sala de 5 "Celeste"', grupo: "Alumnos" },
  a13: { nombre: "Valentino Paz", rol: 'Sala de 5 "Celeste"', grupo: "Alumnos" },
});
ALUMNOS_CURSO.S5 = ["a11", "a12", "a13"];

// Hijos de cada familia (en el producto sale del Grupo Familia de Búho).
const FAMILIAS = { f1: ["a1", "a6", "a7"], f2: ["a2"], f3: ["a3"], f5: ["a11"], f6: ["a12"] };

// Usuarios de la demo por nivel: en jardín la familia es otra y no hay usuario de alumno.
NIVELES.primario.familia = { id: "f1", hijos: ["a1", "a6", "a7"] };
NIVELES.secundario.familia = { id: "f1", hijos: ["a1", "a6", "a7"] };
NIVELES.jardin = { alumno: NIVELES.primario.alumno, docente: { id: "d11", cursos: ["S5"], materias: ["sala"] }, familia: { id: "f5", hijos: ["a11"] } };

MENSAJES_INICIALES.push(
  { id: 20, de: "d11", para: ["f5", "f6"], asunto: "Fotos del paseo a la granja", fecha: "2026-10-14T17:30", adj: [{ n: "Fotos_granja.zip", t: "4.2 MB" }], cuerpo: "Familias: les comparto las fotos del paseo. ¡Los chicos la pasaron muy bien!\n\nSeño Vero", leidoPor: [], etiquetas: {} },
  { id: 21, de: "s1", para: ["f5", "f6"], asunto: "Reunión de padres de Sala de 5", fecha: "2026-10-13T10:00", adj: [], cuerpo: "Les recordamos la reunión de padres del jueves 22 a las 18 hs en la sala.", leidoPor: ["f5"], etiquetas: {} },
  { id: 22, de: "f6", para: ["d11"], asunto: "Emma se retira antes el viernes", fecha: "2026-10-14T08:05", adj: [], cuerpo: "Seño, el viernes la retira la abuela a las 11 hs. Gracias. Pablo", leidoPor: [], etiquetas: {} },
);

COMUNICADOS_INICIALES.push(
  { id: 7, de: "s2", tipo: "respuesta", opciones: ["Asisto", "No asisto"], titulo: "Acto de la primavera — Nivel Inicial", fecha: "2026-10-10", alcance: "Nivel Inicial", cuerpo: "Invitamos a las familias al acto de la primavera del viernes 23 a las 10 hs en el patio del jardín.", vence: "2026-10-20", requiereConfirmacion: true, confirmados: [], respuestas: {} },
  { id: 8, de: "s1", tipo: "autorizacion", titulo: "Paseo a la granja educativa: autorización", fecha: "2026-10-08", alcance: 'Sala de 5 "Celeste"', cuerpo: "El jueves 22 la Sala de 5 visitará la granja educativa. Salida 9 hs, regreso 12 hs.\n\nCada familia debe autorizar antes del 17/10.", vence: "2026-10-17", requiereConfirmacion: true, confirmados: ["f6"], respuestas: { f6: { r: "Autorizo", firma: "Pablo Ruiz", fecha: "2026-10-09" } } },
);

EVENTOS_INICIALES.push(
  { id: 30, titulo: "Paseo a la granja educativa", fecha: "2026-10-22", etiqueta: "Importante", curso: "S5", autor: "s1" },
  { id: 31, titulo: "Reunión de padres Sala de 5", fecha: "2026-10-22", etiqueta: "Reunión", curso: "S5", autor: "s1" },
  { id: 32, titulo: "Acto de la primavera", fecha: "2026-10-23", etiqueta: "Importante", curso: "S5", autor: "s2" },
);

// Foro de la sala: la docente abre temas y las familias responden.
FOROS_INICIALES.push(
  { id: 10, curso: "S5", materia: "sala", unidad: null, titulo: "¿Qué aprendimos en la granja?", autor: "d11", fecha: "2026-10-14", cerrado: false, mensajes: [
    { de: "d11", fecha: "2026-10-14T18:00", texto: "Familias: pregúntenles a los chicos qué animal les gustó más y cuéntenlo acá. Mañana lo charlamos en ronda." },
    { de: "f5", fecha: "2026-10-14T20:10", texto: "¡Benja no para de hablar de los chanchitos! Dice que eran muy ruidosos." },
    { de: "f6", fecha: "2026-10-14T21:30", texto: "Emma eligió los conejos. Quiere dibujarlos para la cartelera." },
  ] },
  { id: 11, curso: "S5", materia: "sala", unidad: null, titulo: "Materiales para el proyecto de reciclaje", autor: "d11", fecha: "2026-10-09", cerrado: false, mensajes: [
    { de: "d11", fecha: "2026-10-09T12:00", texto: "Para el proyecto de reciclaje necesitamos rollos de cartón, tapitas y botellas chicas limpias. Pueden mandarlos hasta el viernes 16." },
    { de: "f6", fecha: "2026-10-10T09:15", texto: "¿Las botellas tienen que ser de algún tamaño en especial?" },
    { de: "d11", fecha: "2026-10-10T13:40", texto: "De hasta 500 ml, así los chicos las pueden manejar." },
  ] },
);

// Bienvenida para jardín.
const BIENVENIDA_JARDIN = {
  familia: [["Todo en un solo lugar", "Mensajes con la seño, comunicados del jardín y cuotas, con un único usuario."], ["El foro de la sala", "La seño comparte lo que hacen en la sala y las familias pueden participar."], ["Sin papeles", "Podés autorizar salidas, confirmar asistencia y avisar una ausencia desde el celular."]],
  docente: [["Tu sala ya está cargada", "Las familias vienen de Búho: no hay que armar listas."], ["Comunicación con las familias", "Mensajes y foro de la sala, con registro de quién leyó."], ["Para hacer hoy", "Al entrar ves lo pendiente: mensajes, avisos de ausencia y respuestas del foro."]],
};

// Unidades anteriores y siguientes, para mostrar que solo la unidad en curso queda abierta.
UNIDADES_INICIALES.push(
  { id: 12, curso: "2B", materia: "his", orden: 1, titulo: "Unidad 1: El Virreinato del Río de la Plata", desde: "2026-08-03", hasta: "2026-08-28", objetivos: ["Describir la organización del Virreinato", "Reconocer los grupos sociales de la época"] },
  { id: 13, curso: "2B", materia: "his", orden: 3, titulo: "Unidad 3: Las guerras de independencia", desde: "2026-10-26", hasta: "2026-11-27", objetivos: ["Explicar las campañas libertadoras", "Ubicar las principales batallas en el mapa"] },
  { id: 14, curso: "7B", materia: "cna", orden: 2, titulo: "Unidad 2: Los materiales", desde: "2026-08-03", hasta: "2026-08-28", objetivos: ["Clasificar materiales según sus propiedades"] },
  { id: 15, curso: "7B", materia: "cna", orden: 4, titulo: "Unidad 4: La Tierra y el sistema solar", desde: "2026-10-13", hasta: "2026-11-13", objetivos: ["Describir los movimientos de la Tierra", "Reconocer los planetas del sistema solar"] },
);
CONTENIDOS_INICIALES.push(
  { id: 20, curso: "2B", materia: "his", unidad: 12, titulo: "La sociedad colonial", tipo: "texto", obligatorio: true, fecha: "2026-08-04", cuerpo: "Peninsulares, criollos, pueblos originarios y esclavizados: cómo se organizaba la sociedad.", vistoPor: ["a7", "a8", "a9", "a10"] },
  { id: 21, curso: "7B", materia: "cna", unidad: 14, titulo: "Propiedades de los materiales", tipo: "texto", obligatorio: true, fecha: "2026-08-04", cuerpo: "Dureza, elasticidad, conductividad: cómo se comportan los materiales.", vistoPor: ["a1", "a2", "a3", "a4", "a5"] },
);
