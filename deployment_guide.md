# Guía de Despliegue - Roomie App (Vibra Alta)

Para tener tu app en vivo y accesible desde cualquier dispositivo, la mejor opción es **Vercel** (creadores de Next.js). Es gratis, rápido y automático.

## Opción 1: Despliegue Automático (Recomendado)

Si tienes tu código en GitHub:

1.  Ve a [vercel.com](https://vercel.com) y crea una cuenta.
2.  Haz clic en **"Add New..."** > **"Project"**.
3.  Importa tu repositorio de GitHub.
4.  En "Framework Preset", detectará automáticamente **Next.js**.
5.  Haz clic en **"Deploy"**.
6.  ¡Listo! En unos segundos tendrás tu URL (ej. `roomie-app-anzures.vercel.app`).

## Opción 2: Despliegue desde tu Computadora (CLI)

Si no quieres usar GitHub aún, puedes desplegar directo desde tu terminal:

1.  Instala Vercel CLI:
    ```bash
    npm i -g vercel
    ```
2.  En la carpeta de tu proyecto (`Roomie App`), ejecuta:
    ```bash
    vercel
    ```
3.  Sigue las instrucciones en pantalla:
    - Set up and deploy? **Y**
    - Which scope? (Tu usuario)
    - Link to existing project? **N**
    - Project name? (Enter para default)
    - Directory? (Enter para default)
    - Want to modify settings? **N**
4.  Esperar a que termine. Te dará una URL de producción.

## Post-Despliegue

- **Compartir**: Manda el link al grupo de WhatsApp de los roomies.
- **Instalar como App**: Abre el link en Safari (iOS) o Chrome (Android), dale a "Compartir" y **"Agregar a Inicio"** (Add to Home Screen). Se verá como una app nativa.

---
*Vibra Alta - The Manifesto Anzures*
