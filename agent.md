# Contexto del Proyecto (Agent)

## Resumen
- Proyecto: `analytics`
- Tipo: aplicación de escritorio con Electron
- UI: React
- Bundler/dev server: Vite

## Stack actual
- Electron Forge (`@electron-forge/plugin-vite`)
- React `19.x`
- Vite `5.x`
- Electron `40.x`

## Estructura base
- `src/main.js`: proceso principal de Electron
- `src/preload.js`: bridge/preload
- `src/renderer.jsx`: aplicación React (renderer)
- `src/index.css`: estilos base
- `src/components/Header.jsx`: cabecera principal
- `src/components/SelectorCultivo.jsx`: botón derecho del header
- `src/components/UsuarioHeader.jsx`: bloque de usuario en header (icono + nombre)
- `src/components/SidePopover.jsx`: panel flotante lateral colapsable

## Decisiones tomadas
- Se removió el menú superior de la ventana principal:
  - `mainWindow.removeMenu()`
  - `mainWindow.setMenuBarVisibility(false)`

## Convenciones de trabajo
- Mantener cambios pequeños y verificables.
- Registrar aquí decisiones de arquitectura y alcance.
- Evitar agregar dependencias sin necesidad.

## Próximos pasos (vivos)
- Definir objetivo funcional del MVP.
- Diseñar estructura de pantallas/componentes.
- Definir estado global y manejo de datos.

## Bitácora de cambios
- 2026-02-23: Limpieza técnica de estilos y assets: se normalizan variables CSS (tipografía/color/peek del side popover), se simplifican reglas redundantes y se elimina el archivo residual `public/icono-cerezo.png:Zone.Identifier`.
- 2026-02-23: Se crea componente `SidePopover` con botón asomado a la izquierda y expansión a panel flotante ocupando aprox. 1/3 del área bajo el header.
- 2026-02-23: Se elimina el componente flyout/drawer del área de contenido para volver a una vista limpia con solo header.
- 2026-02-23: Se crea este archivo para mantener contexto compartido.
- 2026-02-23: Se elimina el menú superior en la ventana principal de Electron.
- 2026-02-23: Se define fondo global `#E5E5E5` y se crea componente `Header`.
- 2026-02-23: El logo del header se configura para cargarse desde `public/logo-empresa.png`.
- 2026-02-23: Se agrega componente SelectorCultivo (botón rojo "Cerezo") en el lado derecho del header con icono `public/icono-cerezo.png`.
- 2026-02-23: Se configura `@font-face` para `Lufga` (archivo esperado en `public/fonts/Lufga-Regular.woff2`).
- 2026-02-23: Se agrega divisor vertical `#222527` y componente de usuario (`icono-usuario.png` + `Demo`) en el lado derecho del header.
