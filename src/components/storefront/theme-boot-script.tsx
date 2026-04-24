/**
 * Ejecuta antes de React para alinear `html.dark` con `localStorage` y evitar flash.
 * Default sin clave guardada: modo oscuro (clase `dark`).
 */
export function ThemeBootScript() {
  const code = `(function(){try{var k=${JSON.stringify(
    "tcds-theme"
  )};var v=localStorage.getItem(k);var r=document.documentElement;if(v==="light"){r.classList.remove("dark");}else{r.classList.add("dark");}}catch(e){}})();`;

  return <script dangerouslySetInnerHTML={{ __html: code }} />;
}
