# ConectaReciclaje - Prototipo

Este es un prototipo web funcional utilizando HTML, CSS, JavaScript y Supabase, sin frameworks adicionales.

## Configuración de Supabase
1. Crea un nuevo proyecto en Supabase (https://supabase.com/).
2. Ve al editor SQL y ejecuta el contenido del archivo `supabase/schema.sql`.
3. Ve a `Project Settings` > `API`.
4. Copia `Project URL` y `anon public key`.
5. Pega estas credenciales en `js/supabase.js`.

## Ejecución
Abre `index.html` en un navegador o sirve la carpeta usando una extensión como Live Server.

## Publicación en GitHub Pages
1. Sube los archivos de este directorio a un repositorio en GitHub.
2. Ve a `Settings` > `Pages`.
3. Selecciona la rama `main` y guarda.
4. Tu sitio web será público y se conectará directamente a Supabase mediante la API REST en JavaScript.

## Creación de Administrador
1. Regístrate normalmente desde el formulario de la aplicación.
2. Ve a la consola SQL en Supabase y ejecuta: `UPDATE profiles SET rol = 'admin' WHERE email = 'tu_correo';`
