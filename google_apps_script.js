/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Google Apps Script - Webhook Receptor de Feedback
 *
 * INSTRUCCIONES DE INSTALACIÓN (100% GRATIS):
 * 1. Ve a https://sheets.new y crea una hoja de cálculo en blanco llamada "SGF 2026 - Respuestas Feedback".
 * 2. En la primera fila (encabezados), coloca:
 *    A1: ID Ticket | B1: Fecha y Hora | C1: GamerTag | D1: Email | E1: Torneo | F1: Calificación General (1-5) | G1: Puntualidad (1-5) | H1: Hardware/Setups (1-5) | I1: Staff/Jueces (1-5) | J1: Ambiente (1-5) | K1: NPS (0-10) | L1: Lo que más gustó | M1: Sugerencias 2027 | N1: Sorteo
 * 3. En el menú superior de Google Sheets, ve a: Extensiones > Apps Script.
 * 4. Borra todo el código que aparezca y pega este archivo completo.
 * 5. Haz clic en "Implementar" (botón azul arriba a la derecha) > "Nueva implementación".
 * 6. Tipo: "Aplicación web".
 *    - Descripción: "SGF 2026 Webhook"
 *    - Ejecutar como: "Yo" (tu cuenta de Google)
 *    - Quién tiene acceso: "Cualquier persona" (Anyone) -> IMPORTANTE para recibir respuestas sin requerir login.
 * 7. Copia la URL generada (termina en `/exec`) y pégala en GOOGLE_SHEETS_WEBHOOK_URL dentro de feedback/app.js.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000); // Evitar colisiones si entran muchas respuestas simultáneas

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Si la hoja está completamente vacía, insertar encabezados
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID Ticket",
        "Fecha Registro",
        "GamerTag",
        "Email",
        "Torneo",
        "Calificación General",
        "Puntualidad",
        "Hardware y Setups",
        "Staff y Jueces",
        "Ambiente y Audio",
        "NPS (0-10)",
        "Lo que más gustó",
        "Sugerencias y 2027",
        "Navegador"
      ]);
      // Dar formato a los encabezados
      var headerRange = sheet.getRange(1, 1, 1, 14);
      headerRange.setBackground("#16082b");
      headerRange.setFontColor("#a855f7");
      headerRange.setFontWeight("bold");
    }

    // Agregar fila con la respuesta del competidor
    sheet.appendRow([
      data.id || "N/A",
      data.dateFormatted || new Date().toLocaleString(),
      data.gamertag || "Competidor SGF",
      data.email || "",
      data.tournament || "No especificado",
      data.overallRating || "",
      data.metricPunctuality || "",
      data.metricHardware || "",
      data.metricStaff || "",
      data.metricAtmosphere || "",
      data.nps || "",
      data.likedMost || "",
      data.suggestions || "",
      data.userAgent || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", id: data.id }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput("SGF 2026 Feedback Webhook Activo.");
}

/**
 * FUNCIÓN DE AYUDA: Ejecuta esto una vez desde Apps Script para formatear la hoja
 * con los encabezados oficiales de SGF 2026 antes de conectar a Looker Studio.
 */
function inicializarHojaConEncabezados() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.clear();
  sheet.appendRow([
    "ID Ticket",
    "Fecha Registro",
    "GamerTag",
    "Email",
    "Torneo",
    "Calificación General",
    "Puntualidad",
    "Hardware y Setups",
    "Staff y Jueces",
    "Ambiente y Audio",
    "NPS (0-10)",
    "Lo que más gustó",
    "Sugerencias y 2027",
    "Navegador"
  ]);

  var headerRange = sheet.getRange(1, 1, 1, 14);
  headerRange.setBackground("#16082b");
  headerRange.setFontColor("#a855f7");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
  SpreadsheetApp.getUi().alert("Hoja de Feedback SGF 2026 inicializada con éxito.");
}

/**
 * Inserta 3 filas de prueba realistas para calibrar el Dashboard de Looker Studio.
 */
function insertarDatosDePruebaLookerStudio() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    inicializarHojaConEncabezados();
  }

  var pruebas = [
    ["SGF-26-DEMO1", new Date().toLocaleString(), "MasterChief", "demo1@pucmm.edu.do", "Super Smash Bros. Ultimate", 5, 5, 5, 5, 5, 10, "Los setups de Smash estuvieron a otro nivel y el ambiente con la pantalla gigante.", "Tener más estaciones libres para jugar retas mientras se espera.", "Chrome Windows"],
    ["SGF-26-DEMO2", new Date().toLocaleString(), "Viper_99", "demo2@gmail.com", "EA Sports FC 26", 4, 3, 5, 4, 4, 8, "Muy buenos mandos de PS5 y cero lag en las partidas.", "Mejorar la puntualidad de inicio en la fase de grupos.", "Safari iOS"],
    ["SGF-26-DEMO3", new Date().toLocaleString(), "DriftKing", "demo3@gmail.com", "Mario Kart 8 Deluxe", 5, 4, 5, 5, 5, 9, "El casteo y la energía del público en las semifinales.", "Hacer un bracket de consolación para los que pierden primera ronda.", "Firefox Windows"]
  ];

  pruebas.forEach(function(fila) {
    sheet.appendRow(fila);
  });

  SpreadsheetApp.getUi().alert("3 respuestas de prueba agregadas para calibrar Looker Studio.");
}
