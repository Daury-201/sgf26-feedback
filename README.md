# 🎮 Sistema Oficial de Feedback & Encuesta • SGF 2026

Micrositio web interactivo e independiente para la recolección de satisfacción y feedback de competidores y asistentes del **Students Gaming Festival 2026 (SGF 2026)**.

---

## 📁 Estructura del Módulo `feedback/`

```text
feedback/
├── index.html              # Estructura del formulario interactivo y pantalla de victoria
├── style.css               # Estilos Cyberpunk / Esports (Orbitron, Neón violeta & cian)
├── app.js                  # Lógica interactiva, barra de progreso en vivo, validación y confetti
├── google_apps_script.js   # Backend 100% gratuito para Google Sheets Webhook
├── email-template.html     # Plantilla de correo HTML personalizada para enviar a los participantes
└── images/                 # Logos oficiales (SGF 2026, PUCMM, CEIT)
```

---

## 🚀 Cómo Probar el Formulario Inmediatamente

1. Haz doble clic en [`feedback/index.html`](index.html) para abrirlo en tu navegador favorito (Chrome, Edge, Brave, Firefox).
2. Puedes probar los parámetros de auto-relleno agregando query params en la URL:
   ```text
   feedback/index.html?gamertag=DauryPro&email=daury@pucmm.edu.do&game=mk8
   ```
   *El formulario detectará automáticamente los datos, seleccionará la tarjeta de Mario Kart 8 Deluxe y aumentará el progreso automáticamente.*

---

## 📊 Cómo Conectar con Google Sheets (Gratis y en 2 Minutos)

1. Abre [Google Sheets](https://sheets.new) y crea una hoja llamada **"SGF 2026 - Feedback"**.
2. En el menú superior ve a **Extensiones > Apps Script**.
3. Pega todo el código de [`google_apps_script.js`](google_apps_script.js).
4. Pulsa **Implementar > Nueva implementación**:
   - Tipo: **Aplicación web**.
   - Ejecutar como: **Yo** (tu cuenta).
   - Quién tiene acceso: **Cualquier persona** (*Anyone*).
5. Copia la URL generada (`https://script.google.com/macros/s/.../exec`).
6. Pega esa URL en [`feedback/app.js`](app.js) en la variable:
   ```javascript
   const GOOGLE_SHEETS_WEBHOOK_URL = "TU_URL_AQUÍ";
   ```
¡Listo! Cada vez que un gamer complete la encuesta, la fila aparecerá automáticamente en tu hoja de cálculo con fecha, calificación general, notas y ticket verificado.

---

## 📧 Envío de Correos Masivos con la Plantilla

Abre [`feedback/email-template.html`](email-template.html). Puedes enviar este correo a todos los participantes usando:
- **Google Sheets Mail Merge** (con extensiones gratuitas como *Yet Another Mail Merge* o *Mailmeteor*).
- **Gmail** directamente copiando el diseño visual.
- **Brevo** o **Mailchimp** (cuentas gratuitas).

Cada participante recibirá su botón con su GamerTag y torneo precargados para que solo tengan que calificar con un par de clics.
