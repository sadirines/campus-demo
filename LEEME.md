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

## Versión 5 (`v5/`) — "una cosa a la vez"
https://sadirines.github.io/campus-demo/v5/

Rediseño completo, pensado primero para el celular:

- **Sin menú lateral:** tres o cuatro pestañas abajo según el rol (Familia: Hoy · Mensajes · Mis hijos; en jardín, Hoy · Mensajes · La sala).
- **Hoy:** una pila de tarjetas, cada una con su acción (Autorizo, Entregar, Corregir, Pagar). Al resolverla desaparece. Se ven tres a la vez; el resto con "Ver las otras".
- **Mensajes como chat** y foros como conversación.
- **Aula:** solo la unidad en curso, como pasos (contenido → tarea). Las otras unidades en una línea.
- **Secretaría:** enviar un aviso en tres pasos (¿para quién? → ¿qué necesitás? → texto) y seguimiento con una barra por aviso.
- **Detalles en una hoja** que sube desde abajo y se cierra tocando afuera.

Código propio en `v5/js/app5.js` y `v5/css/app5.css`; reutiliza los datos de prueba de las versiones anteriores.

## Versión 4 (`v4/`)
https://sadirines.github.io/campus-demo/v4/

Misma base que la versión 3, con menos información a la vez (a partir de la devolución de una profesora: "está todo junto, me mareó"):

- **Enlaces por rol:** `v4/?rol=docente&nivel=jardin` entra directo con ese rol, sin la barra amarilla ni carteles. El botón "Enlaces por rol" los lista todos.
- **Modo presentación:** oculta los carteles de maqueta ("nuevo", "a confirmar" y notas).
- **Módulos por nivel:** Jardín (Sala de 5 "Celeste") solo tiene mensajería, comunicados y foro de la sala; los chicos no tienen usuario.
- **Inicio:** una sola lista ("Lo importante de hoy" o "Para hacer hoy") y como mucho una tarjeta más; el resto detrás de "Ver más".
- **Aula:** solo la unidad en curso abierta, objetivos plegados y tareas plegadas debajo de su contenido.

Archivos propios: `v4/js/data4.js` (jardín y unidades extra) y `v4/js/simple.js` (todos los cambios).

## Archivos de la versión 3
- `js/data.js`, `js/data2.js` — datos de prueba de las versiones anteriores
- `js/data3.js` — unidades, objetivos, contenidos y tareas vinculados, curso de secundaria y foros
- `js/app.js`, `js/extras.js` — pantallas comunes (heredadas de la opción 2)
- `js/aula.js` — el aula nueva y las reglas de acceso por rol
- `js/navegacion.js` — menú retráctil, ventanas desde el inicio y regreso al inicio
