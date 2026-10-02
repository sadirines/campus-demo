# Campus — maqueta funcional

Maqueta navegable del Campus (capa académica sobre Búho Escuela). Sin servidor ni base de datos: todos los datos son ficticios y viven en el navegador.

## Cómo abrirla
Doble clic en `index.html`. Arriba, en la barra amarilla, se elige el rol (Familia, Alumno, Docente, Secretaría). "Reiniciar datos" vuelve la demo al estado inicial.

## Archivos
- `index.html` — estructura y pantalla de acceso
- `css/app.css` — estilos (funcionales; la estética final queda para después)
- `js/data.js` — datos de prueba (cursos, materias, personas, mensajes, notas, eventos)
- `js/app.js` — pantallas y lógica de la demo
- Las capturas de Educativa usadas como referencia tienen datos reales y no se suben al repositorio.

## Qué es genérico o está a definir
Las pantallas lo marcan con un recuadro amarillo "Maqueta":
- Régimen de calificación (se muestra numérico 1-10 por bimestre) y formato del boletín
- Tareas con entrega privada: opcional, no incluida en la propuesta económica
- Política de sesiones (una o varias por usuario)
- Vistas de Docente y Secretaría: diseñadas sin relevamiento de esos roles
- Cuotas: representa el módulo que ya existe en Búho

## Opción 2 (con mejoras)
En `opcion2/index.html`. Es una copia de la maqueta base con funciones agregadas; cada una está marcada en pantalla con la etiqueta "nuevo". Desde la barra amarilla se pasa de una opción a la otra.

- `opcion2/js/data2.js` — datos extra (3° bimestre publicado, comunicados con tipo, ausencias, plantillas)
- `opcion2/js/extras.js` — todas las mejoras, separadas del código base

Mejoras: resumen "Lo importante de hoy", autorizaciones firmadas en línea, respuesta rápida a comunicados (asisto / no asisto), aviso de ausencia, panel de dirección, alerta temprana de alumnos, gráfico de evolución de notas, plantillas de comunicados, barra inferior tipo app en celular, avatares con iniciales y pantalla de bienvenida.

Las funciones marcadas "nuevo" no están en la propuesta económica actual.
