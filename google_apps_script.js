/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Sistema Integrado: Webhook de Feedback + Dashboard API + Despacho de Correos Masivos
 * CEIT & PUCMM
 *
 * ============================================================================
 * GUÍA DE INSTALACIÓN RÁPIDA:
 * ============================================================================
 * 1. Abre tu Google Sheet del feedback: https://sheets.new
 * 2. En el menú superior: Extensiones > Apps Script.
 * 3. Borra todo el código que esté allí y pega este archivo COMPLETO.
 * 4. Haz clic en 'Guardar' (icono de disquete).
 * 
 * ============================================================================
 * CÓMO PROBAR ENVIÁNDOTE UN CORREO A TI PRIMERO:
 * ============================================================================
 * MÉTODO 1 (Desde la Hoja de Google Sheets):
 *   - Recarga tu hoja de Google Sheets en el navegador.
 *   - Verás un nuevo menú arriba a la derecha: "🎮 SGF 2026 Feedback".
 *   - Haz clic en: "✉️ Enviar Correo de Prueba a Mí...".
 *   - Ingresa tu correo y ¡listo! Revisa tu bandeja de entrada o spam.
 *
 * MÉTODO 2 (Desde este editor de Apps Script):
 *   - Busca la función 'enviarPruebaDirecta' (en la línea ~120 de este código).
 *   - Cambia 'tu_correo@gmail.com' por tu correo real.
 *   - En la barra superior de Apps Script selecciona 'enviarPruebaDirecta' y haz clic en 'Ejecutar'.
 *
 * ============================================================================
 * CÓMO ENVIAR A LOS 171 PARTICIPANTES:
 * ============================================================================
 * 1. En el menú "🎮 SGF 2026 Feedback" de Google Sheets:
 *    Haz clic en "📋 Cargar 171 Participantes a la Hoja".
 *    (Creará la pestaña 'Participantes' con los 171 competidores en estado 'PENDIENTE').
 * 2. Haz clic en "🚀 Enviar Correos a Pendientes".
 *    El script enviará automáticamente los correos personalizados uno a uno,
 *    actualizando el estado a 'ENVIADO' en tiempo real.
 * ============================================================================
 */

// ============================================================================
// 1. RECEPTOR WEBHOOK (doPost) - Recibe las respuestas del formulario Vercel
// ============================================================================
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Respuestas");
    if (!sheet) {
      sheet = ss.insertSheet("Respuestas", 0);
    }

    var data = JSON.parse(e.postData.contents);

    // Si la hoja está vacía, insertar encabezados oficiales
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
      var headerRange = sheet.getRange(1, 1, 1, 14);
      headerRange.setBackground("#16082b");
      headerRange.setFontColor("#a855f7");
      headerRange.setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    // Agregar respuesta
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

// ============================================================================
// 2. API DASHBOARD (doGet) - Provee datos en tiempo real al Dashboard Ejecutivo
// ============================================================================
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Respuestas") || ss.getSheets()[0];
    var rows = sheet.getDataRange().getValues();

    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", count: 0, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = rows[0];
    var results = [];
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      var item = {};
      for (var j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      results.push(item);
    }

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", count: results.length, data: results }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// 3. MENÚ SUPERIOR PERSONALIZADO EN GOOGLE SHEETS
// ============================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🎮 SGF 2026 Feedback")
    .addItem("✉️ Enviar Correo de Prueba a Mí...", "menuEnviarPrueba")
    .addSeparator()
    .addItem("📋 Cargar 171 Participantes a la Hoja", "menuCargarParticipantes")
    .addItem("🚀 Enviar Correos a Pendientes", "menuEnviarCorreosMasivos")
    .addSeparator()
    .addItem("📊 Consultar Cuota Diaria Restante", "menuConsultarCuota")
    .addToUi();
}

// ============================================================================
// 4. ENVÍO DE PRUEBA RÁPIDO (DESDE EL EDITOR)
// ============================================================================
/**
 * Ejecuta esta función directamente en el editor para probar enviándote el correo.
 */
function enviarPruebaDirecta() {
  // >>> REEMPLAZA ESTE CORREO POR EL TUYO PARA PROBAR <<<
  var MI_CORREO_PRUEBA = "tu_correo@gmail.com"; 
  var MI_GAMERTAG = "Daury (Admin)";

  if (!MI_CORREO_PRUEBA || MI_CORREO_PRUEBA === "tu_correo@gmail.com" || MI_CORREO_PRUEBA.indexOf("@") === -1) {
    var errorMsg = "⚠️ Por favor escribe tu correo real en la variable 'MI_CORREO_PRUEBA' en la línea superior.";
    Logger.log(errorMsg);
    try {
      SpreadsheetApp.getUi().alert("Configuración Requerida", errorMsg, SpreadsheetApp.getUi().ButtonSet.OK);
    } catch(e) {}
    return;
  }

  Logger.log("Enviando correo de prueba a: " + MI_CORREO_PRUEBA + "...");
  enviarCorreoIndividual(MI_CORREO_PRUEBA, MI_GAMERTAG);
  Logger.log("✅ ¡Correo de prueba enviado exitosamente a: " + MI_CORREO_PRUEBA + "!");
}

// ============================================================================
// 5. ACCIONES DEL MENÚ DE GOOGLE SHEETS
// ============================================================================

function menuEnviarPrueba() {
  var ui = SpreadsheetApp.getUi();
  var promptRes = ui.prompt(
    "✉️ Enviar Correo de Prueba",
    "Ingresa tu correo electrónico para recibir una muestra idéntica a la que recibirán los participantes:",
    ui.ButtonSet.OK_CANCEL
  );

  if (promptRes.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var emailDestino = promptRes.getResponseText().trim();
  if (!emailDestino || emailDestino.indexOf("@") === -1) {
    ui.alert("⚠️ Correo Inválido", "Por favor ingresa una dirección de correo válida.", ui.ButtonSet.OK);
    return;
  }

  try {
    enviarCorreoIndividual(emailDestino, "Competidor Demo");
    ui.alert(
      "✅ ¡Correo de Prueba Enviado!",
      "Hemos enviado el correo oficial a: " + emailDestino + "\n\nRevisa tu bandeja de entrada o spam. Comprueba el botón y los enlaces personalizados.",
      ui.ButtonSet.OK
    );
  } catch (err) {
    ui.alert("❌ Error al enviar correo", err.toString(), ui.ButtonSet.OK);
  }
}

function menuCargarParticipantes() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Participantes");

  if (!sheet) {
    sheet = ss.insertSheet("Participantes");
  } else if (sheet.getLastRow() > 1) {
    var confirm = ui.alert(
      "⚠️ Reemplazar Lista",
      "La pestaña 'Participantes' ya contiene registros. ¿Deseas sobreescribir la lista con los 171 competidores oficiales?",
      ui.ButtonSet.YES_NO
    );
    if (confirm !== ui.Button.YES) return;
  }

  sheet.clear();
  sheet.appendRow([
    "Email",
    "GamerTag / Nombre",
    "Estado Envío",
    "Fecha y Hora de Envío",
    "Enlace Directo Personalizado"
  ]);

  var header = sheet.getRange(1, 1, 1, 5);
  header.setBackground("#16082b");
  header.setFontColor("#a855f7");
  header.setFontWeight("bold");
  sheet.setFrozenRows(1);

  var filas = [];
  for (var i = 0; i < LISTA_PARTICIPANTES_SGF26.length; i++) {
    var p = LISTA_PARTICIPANTES_SGF26[i];
    var urlPersonalizada = "https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(p.tag) + "&email=" + encodeURIComponent(p.email);
    filas.push([p.email, p.tag, "PENDIENTE", "", urlPersonalizada]);
  }

  if (filas.length > 0) {
    sheet.getRange(2, 1, filas.length, 5).setValues(filas);
  }

  sheet.autoResizeColumns(1, 5);
  ui.alert(
    "✅ 171 Participantes Listos",
    "Se cargaron los 171 participantes en la pestaña 'Participantes' con estado PENDIENTE.\n\nCuando estés listo, usa el menú '🚀 Enviar Correos a Pendientes'.",
    ui.ButtonSet.OK
  );
}

function menuEnviarCorreosMasivos() {
  var ui = SpreadsheetApp.getUi();
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Participantes");

  if (!sheet || sheet.getLastRow() <= 1) {
    ui.alert("⚠️ Hoja no preparada", "Primero debes hacer clic en '📋 Cargar 171 Participantes a la Hoja' para crear la lista.", ui.ButtonSet.OK);
    return;
  }

  var data = sheet.getDataRange().getValues();
  var pendientes = [];
  for (var i = 1; i < data.length; i++) {
    var estado = String(data[i][2]).trim().toUpperCase();
    if (estado !== "ENVIADO") {
      pendientes.push({
        fila: i + 1,
        email: String(data[i][0]).trim(),
        tag: String(data[i][1]).trim()
      });
    }
  }

  if (pendientes.length === 0) {
    ui.alert("🎉 ¡Completado!", "Todos los 171 participantes ya tienen el correo en estado 'ENVIADO'.", ui.ButtonSet.OK);
    return;
  }

  var cuotaRestante = MailApp.getRemainingDailyQuota();
  var confirm = ui.alert(
    "🚀 Iniciar Envío Masivo",
    "Participantes pendientes por enviar: " + pendientes.length + "\n" +
    "Cuota disponible en tu cuenta hoy: " + cuotaRestante + " correos\n\n" +
    "¿Deseas comenzar el envío en este momento?",
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) return;

  var enviados = 0;
  var fallidos = 0;

  for (var k = 0; k < pendientes.length; k++) {
    // Si la cuota de Gmail se agota, pausar de forma segura sin romper la hoja
    if (MailApp.getRemainingDailyQuota() <= 1) {
      ui.alert(
        "⚠️ Cuota Diaria Agotada",
        "Se enviaron " + enviados + " correos exitosamente.\nTu cuenta alcanzó el límite diario de Google. Los restantes se quedaron en 'PENDIENTE' y podrás continuar enviándolos mañana volviendo a presionar este botón.",
        ui.ButtonSet.OK
      );
      break;
    }

    var item = pendientes[k];
    try {
      enviarCorreoIndividual(item.email, item.tag);
      sheet.getRange(item.fila, 3).setValue("ENVIADO").setBackground("#064e3b").setFontColor("#34d399");
      sheet.getRange(item.fila, 4).setValue(new Date().toLocaleString());
      enviados++;
    } catch (e) {
      sheet.getRange(item.fila, 3).setValue("ERROR").setBackground("#7f1d1d").setFontColor("#f87171");
      sheet.getRange(item.fila, 4).setValue(e.toString());
      fallidos++;
    }

    // Cada 10 envíos guardar cambios y dar respiro para evitar bloqueos
    if ((k + 1) % 10 === 0) {
      SpreadsheetApp.flush();
      Utilities.sleep(500);
    }
  }

  SpreadsheetApp.flush();
  ui.alert(
    "🏁 Resumen de Envío",
    "✅ Enviados con éxito: " + enviados + "\n❌ Errores: " + fallidos + "\n\nPuedes consultar el estado de cada competidor en la pestaña 'Participantes'.",
    ui.ButtonSet.OK
  );
}

function menuConsultarCuota() {
  var cuota = MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getUi().alert(
    "📊 Cuota Diaria de Envíos",
    "Tu cuenta de Google tiene actualmente " + cuota + " correos restantes disponibles para enviar hoy.\n\n" +
    "- Cuentas @gmail.com personales: Límite de 100 correos/día.\n" +
    "- Cuentas Google Workspace / PUCMM: Límite de 1,500 correos/día.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ============================================================================
// 6. NÚCLEO DE ENVÍO DE EMAIL (GmailApp)
// ============================================================================
function enviarCorreoIndividual(destinatario, gamertag) {
  var tag = gamertag || "Competidor SGF";
  var htmlTemplate = obtenerPlantillaEmailHtml(tag, destinatario);
  var linkEncuesta = "https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(tag) + "&email=" + encodeURIComponent(destinatario);

  var asunto = "🎮 Tu opinión sobre el Students Gaming Festival 2026 • Evaluación Oficial CEIT";

  var textoPlano = "Estimado/a participante " + tag + ":\n\n" +
    "En nombre del Comité Organizador del Students Gaming Festival 2026, el CEIT y la PUCMM, agradecemos tu destacada participación.\n\n" +
    "Te invitamos a completar la Evaluación Oficial de Experiencia en el siguiente enlace:\n" +
    linkEncuesta + "\n\n" +
    "Tu evaluación define los estándares, setups y juegos del SGF 2027.\n" +
    "Tiempo estimado: 1 minuto.\n\n" +
    "Comité Organizador Oficial SGF 2026 • CEIT & PUCMM";

  GmailApp.sendEmail(destinatario, asunto, textoPlano, {
    htmlBody: htmlTemplate,
    name: "CEIT - Students Gaming Festival 2026"
  });
}

// ============================================================================
// 7. GENERADOR DE PLANTILLA HTML OFICIAL CYBERPUNK
// ============================================================================
function obtenerPlantillaEmailHtml(gamertag, email) {
  var baseHtml = "\u003c!DOCTYPE html\u003e\n\u003chtml lang=\"es\"\u003e\n\u003chead\u003e\n    \u003cmeta charset=\"UTF-8\"\u003e\n    \u003cmeta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"\u003e\n    \u003ctitle\u003eEvaluación Oficial de Experiencia • Students Gaming Festival 2026\u003c/title\u003e\n    \u003c!--[if mso]\u003e\n    \u003cstyle type=\"text/css\"\u003e\n      body, table, td, p, a { font-family: \u0027Segoe UI\u0027, Arial, sans-serif !important; }\n    \u003c/style\u003e\n    \u003c![endif]--\u003e\n\u003c/head\u003e\n\u003cbody style=\"margin: 0; padding: 0; background-color: #05020a; font-family: -apple-system, BlinkMacSystemFont, \u0027Segoe UI\u0027, Roboto, \u0027Helvetica Neue\u0027, Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #e4e4e7;\"\u003e\n\n    \u003c!-- Pre-header invisible para visualización en bandeja de entrada --\u003e\n    \u003cdiv style=\"display: none; font-size: 1px; color: #05020a; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;\"\u003e\n        Consulta Oficial de Competidores: Tu evaluación define los estándares, setups y juegos del SGF 2027.\n    \u003c/div\u003e\n\n    \u003c!-- Wrapper Exterior --\u003e\n    \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"background-color: #05020a; min-height: 100vh; padding: 36px 12px;\"\u003e\n        \u003ctr\u003e\n            \u003ctd align=\"center\"\u003e\n\n                \u003c!-- Tarjeta Principal (Máximo 620px) --\u003e\n                \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"max-width: 620px; background: #0c0418; border: 1px solid rgba(168, 85, 247, 0.32); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);\"\u003e\n                    \n                    \u003c!-- Línea de Acento Neón Superior --\u003e\n                    \u003ctr\u003e\n                        \u003ctd height=\"4\" style=\"background: linear-gradient(90deg, #a855f7 0%, #06b6d4 50%, #f59e0b 100%);\"\u003e\u003c/td\u003e\n                    \u003c/tr\u003e\n\n                    \u003c!-- Cabecera Institucional con Logo Oficial --\u003e\n                    \u003ctr\u003e\n                        \u003ctd align=\"center\" style=\"padding: 40px 30px 24px 30px; background: linear-gradient(180deg, rgba(168, 85, 247, 0.14) 0%, transparent 100%);\"\u003e\n                            \n                            \u003c!-- Logo Oficial del Festival --\u003e\n                            \u003cimg src=\"https://sgf26-feedback.vercel.app/images/logo.png\" alt=\"Students Gaming Festival 2026\" width=\"170\" style=\"display: block; max-width: 170px; height: auto; margin: 0 auto 20px auto; border: 0; outline: none; filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.5));\"\u003e\n\n                            \u003c!-- Badge de Categoría Oficial --\u003e\n                            \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\"\u003e\n                                \u003ctr\u003e\n                                    \u003ctd style=\"background: rgba(168, 85, 247, 0.16); border: 1px solid rgba(168, 85, 247, 0.45); border-radius: 9999px; padding: 5px 18px; text-align: center;\"\u003e\n                                        \u003cspan style=\"font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #c084fc; text-transform: uppercase;\"\u003e\n                                            COMUNICADO OFICIAL • CEIT\n                                        \u003c/span\u003e\n                                    \u003c/td\u003e\n                                \u003c/tr\u003e\n                            \u003c/table\u003e\n\n                            \u003ch1 style=\"margin: 18px 0 6px 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.8px; text-transform: uppercase; line-height: 1.25;\"\u003e\n                                EVALUACIÓN OFICIAL DE EXPERIENCIA\n                            \u003c/h1\u003e\n                            \u003cp style=\"margin: 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;\"\u003e\n                                Students Gaming Festival 2026 • CEIT \u0026 PUCMM\n                            \u003c/p\u003e\n                        \u003c/td\u003e\n                    \u003c/tr\u003e\n\n                    \u003c!-- Separador de Precisión --\u003e\n                    \u003ctr\u003e\n                        \u003ctd style=\"padding: 0 40px;\"\u003e\n                            \u003cdiv style=\"height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.45) 50%, transparent 100%);\"\u003e\u003c/div\u003e\n                        \u003c/td\u003e\n                    \u003c/tr\u003e\n\n                    \u003c!-- Cuerpo Principal del Correo --\u003e\n                    \u003ctr\u003e\n                        \u003ctd style=\"padding: 32px 42px 20px 42px; color: #e4e4e7; font-size: 15px; line-height: 1.75;\"\u003e\n                            \n                            \u003cp style=\"margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff;\"\u003e\n                                Estimado/a participante \u003cspan style=\"color: #c084fc;\"\u003e{{GamerTag}}\u003c/span\u003e:\n                            \u003c/p\u003e\n\n                            \u003cp style=\"margin: 0 0 16px 0; color: #d4d4d8;\"\u003e\n                                En nombre del Comité Organizador del \u003cstrong\u003eStudents Gaming Festival 2026\u003c/strong\u003e, el \u003cstrong\u003eCEIT\u003c/strong\u003e y la \u003cstrong\u003ePUCMM\u003c/strong\u003e, agradecemos tu destacada participación y entrega competitiva en esta edición.\n                            \u003c/p\u003e\n\n                            \u003cp style=\"margin: 0 0 24px 0; color: #a1a1aa;\"\u003e\n                                Con el propósito de perfeccionar la infraestructura técnica, el flujo de partidas y la calidad de los setups para el \u003cstrong\u003eSGF 2027\u003c/strong\u003e, hemos habilitado la Consulta Oficial de Satisfacción para todos los competidores registrados.\n                            \u003c/p\u003e\n\n                            \u003c!-- Cuadrícula Ejecutiva de 3 Ejes de Evaluación con SVG Vectoriales --\u003e\n                            \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin: 0 0 26px 0; background: rgba(16, 7, 30, 0.85); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; overflow: hidden;\"\u003e\n                                \u003ctr\u003e\n                                    \u003c!-- Eje 1: Calidad Competitiva --\u003e\n                                    \u003ctd width=\"33%\" style=\"text-align: center; padding: 18px 12px; border-right: 1px solid rgba(255, 255, 255, 0.06);\" valign=\"top\"\u003e\n                                        \u003cdiv style=\"margin-bottom: 8px;\"\u003e\n                                            \u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#fbbf24\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display: inline-block;\"\u003e\n                                                \u003cpath d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/\u003e\n                                                \u003cpath d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/\u003e\n                                                \u003cpath d=\"M4 22h16\"/\u003e\n                                                \u003cpath d=\"M10 14.66V17c0 .55-.45 1-1 1H8v2h8v-2h-1c-.55 0-1-.45-1-1v-2.34\"/\u003e\n                                                \u003cpath d=\"M6 4h12v7a6 6 0 0 1-12 0V4Z\"/\u003e\n                                            \u003c/svg\u003e\n                                        \u003c/div\u003e\n                                        \u003cdiv style=\"font-size: 12px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px;\"\u003eDesempeño\u003c/div\u003e\n                                        \u003cdiv style=\"font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;\"\u003eFlujo de llaves y arbitraje oficial\u003c/div\u003e\n                                    \u003c/td\u003e\n\n                                    \u003c!-- Eje 2: Infraestructura Técnica --\u003e\n                                    \u003ctd width=\"33%\" style=\"text-align: center; padding: 18px 12px; border-right: 1px solid rgba(255, 255, 255, 0.06);\" valign=\"top\"\u003e\n                                        \u003cdiv style=\"margin-bottom: 8px;\"\u003e\n                                            \u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#06b6d4\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display: inline-block;\"\u003e\n                                                \u003crect x=\"2\" y=\"6\" width=\"20\" height=\"12\" rx=\"6\"/\u003e\n                                                \u003cpath d=\"M6 12h4m-2-2v4\"/\u003e\n                                                \u003ccircle cx=\"15\" cy=\"11\" r=\"1\" fill=\"#06b6d4\"/\u003e\n                                                \u003ccircle cx=\"18\" cy=\"13\" r=\"1\" fill=\"#06b6d4\"/\u003e\n                                            \u003c/svg\u003e\n                                        \u003c/div\u003e\n                                        \u003cdiv style=\"font-size: 12px; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.5px;\"\u003eHardware\u003c/div\u003e\n                                        \u003cdiv style=\"font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;\"\u003eConsolas, monitores y conectividad\u003c/div\u003e\n                                    \u003c/td\u003e\n\n                                    \u003c!-- Eje 3: Visión y Mejoras 2027 --\u003e\n                                    \u003ctd width=\"33%\" style=\"text-align: center; padding: 18px 12px;\" valign=\"top\"\u003e\n                                        \u003cdiv style=\"margin-bottom: 8px;\"\u003e\n                                            \u003csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#c084fc\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"display: inline-block;\"\u003e\n                                                \u003cpath d=\"M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5\"/\u003e\n                                                \u003cpath d=\"M9 18h6\"/\u003e\n                                                \u003cpath d=\"M10 22h4\"/\u003e\n                                            \u003c/svg\u003e\n                                        \u003c/div\u003e\n                                        \u003cdiv style=\"font-size: 12px; font-weight: 800; color: #c084fc; text-transform: uppercase; letter-spacing: 0.5px;\"\u003eSGF 2027\u003c/div\u003e\n                                        \u003cdiv style=\"font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;\"\u003eNuevos títulos y sugerencias\u003c/div\u003e\n                                    \u003c/td\u003e\n                                \u003c/tr\u003e\n                            \u003c/table\u003e\n\n                            \u003c!-- Ficha Informativa de Seguridad y Tiempo --\u003e\n                            \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin: 0 0 30px 0; background: rgba(255, 255, 255, 0.02); border-left: 3px solid #06b6d4; padding: 12px 16px; border-radius: 0 8px 8px 0;\"\u003e\n                                \u003ctr\u003e\n                                    \u003ctd\u003e\n                                        \u003cdiv style=\"font-size: 12px; color: #94a3b8; line-height: 1.6;\"\u003e\n                                            \u003cspan style=\"display: inline-block; margin-right: 18px;\"\u003e\n                                                \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#94a3b8\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align: -2px; margin-right: 5px;\"\u003e\u003ccircle cx=\"12\" cy=\"12\" r=\"10\"/\u003e\u003cpolyline points=\"12 6 12 12 16 14\"/\u003e\u003c/svg\u003e\n                                                Tiempo estimado: \u003cstrong style=\"color: #ffffff;\"\u003e1 min\u003c/strong\u003e\n                                            \u003c/span\u003e\n                                            \u003cspan style=\"display: inline-block;\"\u003e\n                                                \u003csvg width=\"14\" height=\"14\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#10b981\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" style=\"vertical-align: -2px; margin-right: 5px;\"\u003e\u003cpath d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/\u003e\u003cpath d=\"m9 12 2 2 4-4\"/\u003e\u003c/svg\u003e\n                                                Tratamiento: \u003cstrong style=\"color: #ffffff;\"\u003eDatos confidenciales y seguros\u003c/strong\u003e\n                                            \u003c/span\u003e\n                                        \u003c/div\u003e\n                                    \u003c/td\u003e\n                                \u003c/tr\u003e\n                            \u003c/table\u003e\n\n                            \u003c!-- Botón de Llamado a la Acción --\u003e\n                            \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\" style=\"margin: 10px 0 20px 0;\"\u003e\n                                \u003ctr\u003e\n                                    \u003ctd align=\"center\"\u003e\n                                        \u003ca href=\"https://sgf26-feedback.vercel.app/?gamertag={{GamerTag}}\u0026email={{Email}}\" target=\"_blank\" style=\"display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: 1px; padding: 17px 42px; border-radius: 8px; box-shadow: 0 8px 30px rgba(147, 51, 234, 0.45); text-transform: uppercase;\"\u003e\n                                            COMPLETAR EVALUACIÓN DE EXPERIENCIA\n                                        \u003c/a\u003e\n                                    \u003c/td\u003e\n                                \u003c/tr\u003e\n                            \u003c/table\u003e\n\n                        \u003c/td\u003e\n                    \u003c/tr\u003e\n\n                    \u003c!-- Firma Institucional --\u003e\n                    \u003ctr\u003e\n                        \u003ctd style=\"padding: 20px 42px 35px 42px; color: #a1a1aa; font-size: 13px; line-height: 1.6; border-top: 1px solid rgba(255, 255, 255, 0.06);\"\u003e\n                            \u003cp style=\"margin: 0 0 4px 0; color: #ffffff; font-weight: 700; font-size: 14px;\"\u003e\n                                Comité Organizador Oficial • SGF 2026\n                            \u003c/p\u003e\n                            \u003cp style=\"margin: 0; color: #94a3b8; font-size: 12px;\"\u003e\n                                Comité de Estudiantes de Ingeniería Telemática - CEIT\u003cbr\u003e\n                                Pontificia Universidad Católica Madre y Maestra - PUCMM\n                            \u003c/p\u003e\n                        \u003c/td\u003e\n                    \u003c/tr\u003e\n\n                    \u003c!-- Footer Oficial con Logos Institucionales --\u003e\n                    \u003ctr\u003e\n                        \u003ctd align=\"center\" style=\"background-color: #06020c; padding: 26px 30px; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #52525b; line-height: 1.6;\"\u003e\n                            \n                            \u003c!-- Logos PUCMM y CEIT --\u003e\n                            \u003ctable role=\"presentation\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin-bottom: 14px;\"\u003e\n                                \u003ctr\u003e\n                                    \u003ctd style=\"padding: 0 12px;\"\u003e\n                                        \u003cimg src=\"https://sgf26-feedback.vercel.app/images/pucmm.png\" alt=\"PUCMM\" height=\"26\" style=\"display: block; opacity: 0.65; border: 0; filter: grayscale(30%);\"\u003e\n                                    \u003c/td\u003e\n                                    \u003ctd style=\"color: rgba(255, 255, 255, 0.2); font-size: 14px;\"\u003e•\u003c/td\u003e\n                                    \u003ctd style=\"padding: 0 12px;\"\u003e\n                                        \u003cimg src=\"https://sgf26-feedback.vercel.app/images/ceit.png\" alt=\"CEIT\" height=\"26\" style=\"display: block; opacity: 0.65; border: 0; filter: grayscale(30%);\"\u003e\n                                    \u003c/td\u003e\n                                \u003c/tr\u003e\n                            \u003c/table\u003e\n\n                            \u003cp style=\"margin: 0 0 4px 0;\"\u003e\n                                Este mensaje institucional fue enviado a los participantes registrados del Students Gaming Festival 2026.\n                            \u003c/p\u003e\n                            \u003cp style=\"margin: 0; color: #71717a;\"\u003e\n                                © 2026 Students Gaming Festival. Todos los derechos reservados.\u003cbr\u003e\n                                PUCMM, Campus Santiago • República Dominicana.\n                            \u003c/p\u003e\n                        \u003c/td\u003e\n                    \u003c/tr\u003e\n\n                \u003c/table\u003e\n\n            \u003c/td\u003e\n        \u003c/tr\u003e\n    \u003c/table\u003e\n\n\u003c/body\u003e\n\u003c/html\u003e\n";
  var linkPersonalizado = "https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(gamertag) + "&email=" + encodeURIComponent(email);

  var resultado = baseHtml
    .split("{{GamerTag}}").join(gamertag)
    .split("{{Email}}").join(email)
    .split("https://sgf26-feedback.vercel.app/?gamertag={{GamerTag}}&email={{Email}}").join(linkPersonalizado);

  return resultado;
}

// ============================================================================
// 8. LISTADO OFICIAL DE 171 PARTICIPANTES DEL SGF 2026
// ============================================================================
var LISTA_PARTICIPANTES_SGF26 = [
  { email: "migueljoseasencio@gmail.com", tag: "Miguel Jose Asencio" },
  { email: "carlosdgarcia210@gmail.com", tag: "Carlos Daniel García Núñez" },
  { email: "yorbyssoriano3@gmail.com", tag: "Yorby Enriques Soriano" },
  { email: "ozmann64@gmail.com", tag: "Oscar Jr Mercado" },
  { email: "valerioestarlin4tog@gmail.com", tag: "Estarlin Valerio" },
  { email: "melvinpaulino0019ceges@gmail.com", tag: "Melvin Paulino" },
  { email: "madarauchija2556@gmail.com", tag: "Raymond Aníbal Vélez Almonte" },
  { email: "soytolexd@gmail.com", tag: "Soytole" },
  { email: "hiroshy676@gmail.com", tag: "Hiroshy Luna" },
  { email: "petercastf14@gmail.com", tag: "Peter Castillo Fernandez" },
  { email: "manuel.gg130924@gmail.com", tag: "Manuel Alejandro Gil Gómez" },
  { email: "migueladrian150467@gmail.com", tag: "Miguel Miguel" },
  { email: "hectorrae0@gmail.com", tag: "Hector Rodriguez" },
  { email: "jjoaquinvillar01@gmail.com", tag: "Javier José Joaquín Villar" },
  { email: "enmanuelluz625@gmail.com", tag: "Enmanuel Quzada" },
  { email: "ricardoarturoguemez@gmail.com", tag: "Ricardo Güémez" },
  { email: "aa2351807@gmail.com", tag: "Alejandro Correa" },
  { email: "mcavalierepichardo@gmail.com", tag: "Maria Francesca Cavaliere Pichardo" },
  { email: "jeanrod2007@gmail.com", tag: "Jean Rodriguez" },
  { email: "diegobatista112018@gmail.com", tag: "Diego Batista Reyes" },
  { email: "saludos150196@gmail.com", tag: "Jose Luis Cabrera Ramirez" },
  { email: "wady178@gmail.com", tag: "Wady Rodríguez" },
  { email: "jaysongzm@gmail.com", tag: "Jayson Guzman" },
  { email: "manuelhidalgo246@gmail.com", tag: "Manuel Hidalgo" },
  { email: "ardymonium@gmail.com", tag: "Joan Vargas" },
  { email: "karlojuliodejesusgarcia@gmail.com", tag: "Karlo Julio De Jesus Garcia" },
  { email: "sebastianbencosme17@gmail.com", tag: "Sebastián Bencosme Ovalles" },
  { email: "Diegobetancourtblanco@gmail.com", tag: "Diego José Betancourt Blanco" },
  { email: "jisidro1109@gmail.com", tag: "José Isidro Vargas" },
  { email: "jcangarcia100@gmail.com", tag: "Juan Carlos Garcia" },
  { email: "diego.rodriguez110111@gmail.com", tag: "Diego Rodriguez" },
  { email: "reymerpolanco2131@gmail.com", tag: "Reymer Polanco" },
  { email: "moisesmart2607@gmail.com", tag: "Moisés Martínez" },
  { email: "elielsalvador.07@gmail.com", tag: "Eliel Salvador Muñoz" },
  { email: "maryann12334@gmail.com", tag: "Mary Ann Deprat" },
  { email: "orlandosantiagolizardo12@gmail.com", tag: "Orlando Santiago" },
  { email: "luisangel9905@gmail.com", tag: "Luis Angel Garcia Perez" },
  { email: "maderacesar226@gmail.com", tag: "Emmanuel Efrain Sorá Madera" },
  { email: "alanxd777l3@gmail.com", tag: "Alan Hidalgo" },
  { email: "odillepatricia30@gmail.com", tag: "Odille Santos" },
  { email: "carlosmanuelii2111@gmail.com", tag: "Carlos Manuel Ferreira" },
  { email: "eduardo.hernandez.ma1513@gmail.com", tag: "Eduardo Antonio Hernández Grullón" },
  { email: "dalicofresi@gmail.com", tag: "Dali Cofresi" },
  { email: "josuedejesusgg1@gmail.com", tag: "Josue Garcia" },
  { email: "egrick001@gmail.com", tag: "Erick Gomez Hernandez" },
  { email: "randall.minaya@gmail.com", tag: "Randall Minaya" },
  { email: "paulgarcialop@gmail.com", tag: "Paul García" },
  { email: "geomarac64@gmail.com", tag: "Geomar Abreu" },
  { email: "abelliard57@gmail.com", tag: "Ángel Belliard" },
  { email: "adamrguezz@gmail.com", tag: "Adam Rodríguez" },
  { email: "jcurielurena@gmail.com", tag: "Joel Curiel Ureña" },
  { email: "jos3phg1133@gmail.com", tag: "Joseph De Jesús Gómez Rodriguez" },
  { email: "dayamarie08@gmail.com", tag: "Dhayanna Peralta" },
  { email: "isaacminaya1620@gmail.com", tag: "Isaac Jose Minaya Garcia" },
  { email: "soribelsantosbritos05@gmail.com", tag: "Soribel Santos" },
  { email: "kiancisenrique685@gmail.com", tag: "Kiancis Enrique Puello Valerio" },
  { email: "rodriguezjuandaniel33@gmail.com", tag: "Juan Daniel Rodriguez Sarante" },
  { email: "pedrito272005@gmail.com", tag: "Pedro Rojas" },
  { email: "rias0331@gmail.com", tag: "Romario Abreu" },
  { email: "eg547154@gmail.com", tag: "Enmanuel Guzmán" },
  { email: "reynaldoac2104@gmail.com", tag: "Reynaldo Álvarez Casado" },
  { email: "nreyesdoaz332@gmail.com", tag: "Nicole Reyes" },
  { email: "mendozagarciaj947@gmail.com", tag: "Juan Manuel Mendoza García" },
  { email: "diegoroca2105@gmail.com", tag: "Diego Roca" },
  { email: "mauritrez02@gmail.com", tag: "Mauricio Trejo" },
  { email: "hugoferconcepcion@gmail.com", tag: "Hugo Fernando Concepción López" },
  { email: "joproxdh@gmail.com", tag: "Josue Rodriguez" },
  { email: "josero1driguez1@gmail.com", tag: "Randy Rodriguez" },
  { email: "luisandresdp@gmail.com", tag: "Luis Andres Duran Perez" },
  { email: "claudialan024@gmail.com", tag: "Claudia Lantigua" },
  { email: "liamgivanom@gmail.com", tag: "Liam Monción Lora" },
  { email: "rayanbm1917@gmail.com", tag: "Rayan Betances" },
  { email: "jandelventura.04@gmail.com", tag: "Jandel Tavarez" },
  { email: "josemlora1916@gmail.com", tag: "José Miguel Lora Peña" },
  { email: "jorge13.jr77@gmail.com", tag: "Jorge Luis Ramirez Carela" },
  { email: "naiobyabreu@gmail.com", tag: "Naioby Abreu" },
  { email: "mesquita.jeancarlos@gmail.com", tag: "Jean Carlos Mesquita Peña" },
  { email: "ardaving@gmail.com", tag: "George Ardavin" },
  { email: "davrosario09@gmail.com", tag: "David Rosario" },
  { email: "carloseduardo13055@hotmail.com", tag: "Carlos Eduardo Ferreira" },
  { email: "arturorodriguezuz003@gmail.com", tag: "Arturo Rodríguez" },
  { email: "jairoeliezerm@gmail.com", tag: "Jairo Martinez" },
  { email: "alexenmanuelsrb@gmail.com", tag: "Enmanuel Suarez Beato" },
  { email: "fidelferreiramorel@gmail.com", tag: "Fidel Ferreira" },
  { email: "javierabbottg@gmail.com", tag: "Javier Abbott" },
  { email: "adrianhidalgo714@gmail.com", tag: "Adrián Hidalgo" },
  { email: "nelsonarutnev@gmail.com", tag: "Nelson Ventura" },
  { email: "gabrielcepeda2007@gmail.com", tag: "Gabriel Cepeda" },
  { email: "asdrubaltejada2015@gmail.com", tag: "Asdruval Tejada" },
  { email: "leandroj21p@gmail.com", tag: "Leandro Jiménez" },
  { email: "gariasdisla@gmail.com", tag: "José David Arias" },
  { email: "rhandyemmanuels@gmail.com", tag: "Rhandy Emmanuel Saldivar Castillo" },
  { email: "LMGP0003@CE.PUCMM.EDU.DO", tag: "Leslie Grullon" },
  { email: "isael.estevez2@gmail.com", tag: "Isael Valerio" },
  { email: "deht0001@ce.pucmm.edu.do", tag: "Darlyn Hernández" },
  { email: "nreartejimenez@gmail.com", tag: "Nahuel Rearte" },
  { email: "joshepmperalta@gmail.com", tag: "Joseph Peralta" },
  { email: "adrianalexanderartiles@gmail.com", tag: "Adrian Artiles" },
  { email: "camilan0311@gmail.com", tag: "Camila Nuñez" },
  { email: "wjge0001@ce.pucmm.edu.do", tag: "Wilson Jose Garcia Estrella" },
  { email: "francistrinidadtrejo17@gmail.com", tag: "Francisco Trinidad" },
  { email: "roddypaulino8@gmail.com", tag: "Roddy Paulino" },
  { email: "emilalejandrop@gmail.com", tag: "Emil Peralta" },
  { email: "gabriedlcm05@gmail.com", tag: "Gabriel De La Cruz Marte" },
  { email: "iamemanuel30@gmail.com", tag: "Emanuel Isaias Martinez Garcia" },
  { email: "marino_0901@outlook.com", tag: "Marino Rafael García Fadul" },
  { email: "mishael.tavarez@gmail.com", tag: "Mishael Tavarez" },
  { email: "theyuridr_ceit_pucmm@aiyuri.pro", tag: "Ai Yuri" },
  { email: "claudioa0907@gmail.com", tag: "Claudio Yciano" },
  { email: "egarcofresi212@gmail.com", tag: "Egar Cofresi" },
  { email: "emmanuelrosariof20@gmail.com", tag: "Emmanuel Rosario Fermín" },
  { email: "guarionex6686@gmail.com", tag: "Guarionex Gomez" },
  { email: "arifranches15@gmail.com", tag: "Arianny Roque" },
  { email: "nanoabreu07@gmail.com", tag: "Jorge Abreu" },
  { email: "dionisrodriguezziea@gmail.com", tag: "Dionis Rodríguez" },
  { email: "luisjulianbaez@gmail.com", tag: "Luis Alfonso Julian Baez" },
  { email: "armandooyt@gmail.com", tag: "Narciso Leon" },
  { email: "andrewbatistagarcia@gmail.com", tag: "Andrew Batista Garcia" },
  { email: "samidcc26@gmail.com", tag: "Samid Castillo" },
  { email: "jesuseng08@gmail.com", tag: "Jesús Núñez" },
  { email: "caryfernandez9@gmail.com", tag: "Kary Esther Fernandez Solino" },
  { email: "jonasfuertespsp@gmail.com", tag: "Amohos Ovalles Fuertes" },
  { email: "anthonygarcoia09@gmail.com", tag: "Anthony García" },
  { email: "najavyuz10@gmail.com", tag: "Najavy Ureña" },
  { email: "jailanisburgosquezada@gmail.com", tag: "Jailanis Burgos" },
  { email: "estrellasalcedo.aj@gmail.com", tag: "Adrian Estrella" },
  { email: "bryannaquezada761@gmail.com", tag: "Meredich González" },
  { email: "cynthiagg126@gmail.com", tag: "Cynthia Gómez" },
  { email: "jamespumeran@gmail.com", tag: "James Flores" },
  { email: "jeretejadar@gmail.com", tag: "Jeremias Tejada" },
  { email: "meiverr733@gmail.com", tag: "Exmeiver Gavides Paulino" },
  { email: "cb.lebron@gmail.com", tag: "Eduardo Ramirez" },
  { email: "bumatthew679@gmail.com", tag: "Matthew Daniel Buceta Abreu" },
  { email: "sbrach29@gmail.com", tag: "Said Compres" },
  { email: "freudy0108@gmail.com", tag: "Freudy Cuevas" },
  { email: "foast584@gmail.com", tag: "Camell Marié Tejada Pérez" },
  { email: "isaacvalerio29@gmail.com", tag: "Isaac Valerio" },
  { email: "albertduran.d.m.a@gmail.com", tag: "Albert Duran Mora" },
  { email: "brandolesbo@hotmail.com", tag: "Brandol Estevez Bonilla" },
  { email: "Peliculasespanolatino@gmail.com", tag: "Estarly Almanzar" },
  { email: "joexgarcia2207@gmail.com", tag: "Joel Garcia" },
  { email: "raulrios27062008@gmail.com", tag: "Raul Rios" },
  { email: "wilovergomez9@gmail.com", tag: "Wilover Gomez" },
  { email: "alfred.miguel.mdina927@gmail.com", tag: "Alfred Chelo" },
  { email: "lxlroberto@gmail.com", tag: "Roberto Santana" },
  { email: "diegosalcedoc22@gmail.com", tag: "Diego Salcedo" },
  { email: "yvesdany63@gmail.com", tag: "Yves Dany" },
  { email: "rodqzstarlin@gmail.com", tag: "Starli. Rodriguez" },
  { email: "marioalfredo.deleon22@gmail.com", tag: "Mario De León" },
  { email: "manensolrod@gmail.com", tag: "Manuel Solano" },
  { email: "victorarcal1@gmail.com", tag: "Victor Rodriguez" },
  { email: "carlos.dgez@gmail.com", tag: "Carlos Domínguez" },
  { email: "nayhat.javier@gmail.com", tag: "Nayhat Javier" },
  { email: "marcos.david.dominguez@gmail.com", tag: "Marcos Dominguez" },
  { email: "yandelluis.taverasdiaz18@gmail.com", tag: "Yandel Luis Taveras Díaz" },
  { email: "miguelwilliamsfelizferreiras@gmail.com", tag: "Miguel Williams Feliz Ferreiras" },
  { email: "felizkrlos@gmail.com", tag: "Karlos Feliz" },
  { email: "reynardomartinezh@gmail.com", tag: "Reynardo Martinez" },
  { email: "robertcrack007@gmail.com", tag: "Robert Junior Abreu Suero" },
  { email: "emilioalejandrodc@gmail.com", tag: "Emilio Dominguez" },
  { email: "kventura16_6@hotmail.com", tag: "Karina Ventura Rodríguez" },
  { email: "angelramos180602@gmail.com", tag: "Angel Ernesto Ramos" },
  { email: "gomezstanley754@gmail.com", tag: "Stanley Gomez" },
  { email: "xaviermorel00701@gmail.com", tag: "Xavier Morel" },
  { email: "Delvie16@outlook.com", tag: "Delvi Garcia" },
  { email: "demianreynosogomez@gmail.com", tag: "Demian Reynoso" },
  { email: "albertrozon27@gmail.com", tag: "Albert Rozón Batista" },
  { email: "m.vasquez0606@gmail.com", tag: "Misael Vásquez" },
  { email: "rensogabrielr@gmail.com", tag: "Renso Gabriel Rodríguez Ureña" },
  { email: "seniaarzola20@gmail.com", tag: "Senia Arzola" },
  { email: "reyessaulfd@gmail.com", tag: "Reyes Saul Fernandez" },

];
