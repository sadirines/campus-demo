# Campus — maqueta funcional

Maqueta navegable del Campus (capa académica sobre Búho Escuela). Sin servidor ni base de datos: todos los datos son ficticios y viven en el navegador.

Publicada en https://sadirines.github.io/campus-demo/

## Versión 3 (raíz)
Arma el aula como planificación, según lo que pidieron los usuarios:

- **Aula solo para alumnos y docentes.** Cada materia tiene unidades con objetivos, contenidos y, dentro de cada contenido, sus tareas. Una tarea no existe suelta: siempre sale de un contenido.
- **Secundaria con foros por materia.** En la barra amarilla, "Nivel" cambia entre 7° Grado "B" (primario) y 2° Año "B" (secundario).
- **Las familias no ven nada del aula:** ni contenidos, ni tareas, ni entregas, ni foros. Ven comunicados, mensajería, calificaciones, calendario institucional, cuotas y avisos de ausencia.
- **Navegación:** menú lateral retráctil (botón ☰). Desde el inicio, comunicados, mensajes, tareas, calificaciones, cuotas, contenidos y fechas se abren en una ventana. Si hay que cambiar de página, "Volver al inicio" y la flecha atrás del navegador te devuelven al inicio.
- **Mis pendientes (alumno) y Entregas por corregir (docente):** listas de todas las materias donde cada tarea lleva a su contenido.

Lo marcado "a confirmar" en pantalla depende de decisiones de la escuela: si las familias ven calificaciones y fechas de evaluación, si la nota de una tarea suma al período, quién abre temas en el foro y de dónde salen los objetivos.

## Versiones anteriores
- `opcion1/` — maqueta base.
- `opcion2/` — base más las mejoras marcadas "nuevo".

## Archivos de la versión 3
- `js/data.js`, `js/data2.js` — datos de prueba de las versiones anteriores
- `js/data3.js` — unidades, objetivos, contenidos y tareas vinculados, curso de secundaria y foros
- `js/app.js`, `js/extras.js` — pantallas comunes (heredadas de la opción 2)
- `js/aula.js` — el aula nueva y las reglas de acceso por rol
- `js/navegacion.js` — menú retráctil, ventanas desde el inicio y regreso al inicio
