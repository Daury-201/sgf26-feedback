/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Sistema: Webhook de Feedback + Dashboard API + Envío de Validación Personal
 * CEIT & PUCMM
 *
 * ============================================================================
 * CORREO CONFIGURADO PARA TU PRUEBA:
 * rafaeldario1961@gmail.com
 * ============================================================================
 */

var MI_CORREO_VALIDACION = "rafaeldario1961@gmail.com";
var MI_GAMERTAG = "Rafael";
var SPREADSHEET_ID = "1l0E2qpvKP7cuDbFdmLUlAfkmc0gi1iYV57yaa067-d0";

/**
 * Conexión fija y segura al Google Sheet oficial
 */
function obtenerHojaCalculo() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      var doc = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
      if (doc) return doc;
    } catch (e) {
      Logger.log("⚠️ Error en openById: " + e.toString());
      throw new Error("No se pudo acceder a la hoja (" + SPREADSHEET_ID + "). Causa: " + e.toString() + ". Por favor ve a tu Google Sheet, haz clic en 'Compartir' arriba a la derecha y pon 'Cualquier persona que tenga el vínculo: Editor' o añade a sgfceit26@gmail.com como Editor.");
    }
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error("No se encontró ninguna hoja activa ni se pudo abrir el ID: " + SPREADSHEET_ID + ". Asegúrate de compartir la hoja con sgfceit26@gmail.com como Editor.");
}

// ============================================================================
// 1. FUNCIÓN PRINCIPAL DE PRUEBA (EJECUCIÓN DIRECTA)
// ============================================================================
/**
 * Haz clic en 'Ejecutar' en la barra superior de Apps Script para recibir el correo.
 */
function enviarPruebaDirecta() {
  Logger.log("⏳ Preparando correo oficial para: " + MI_CORREO_VALIDACION + "...");
  enviarCorreoIndividual(MI_CORREO_VALIDACION, MI_GAMERTAG);
  Logger.log("🚀 ¡CORREO ENVIADO CON ÉXITO A: " + MI_CORREO_VALIDACION + "!");
  Logger.log("Revisa tu bandeja de entrada o spam en Gmail.");
}

// ============================================================================
// 2. RECEPTOR WEBHOOK (doPost) - Recibe las respuestas y evita duplicados
// ============================================================================
function doPost(e) {
  // Salvaguarda: si se ejecuta manualmente en el editor teniendo doPost seleccionado
  if (!e || !e.postData) {
    Logger.log("⚠️ Detectada ejecución manual en el editor. Redirigiendo a enviarPruebaDirecta...");
    enviarPruebaDirecta();
    return;
  }

  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = obtenerHojaCalculo();
    var sheet = ss.getSheetByName("Respuestas");
    if (!sheet) {
      sheet = ss.insertSheet("Respuestas", 0);
    }

    var data = JSON.parse(e.postData.contents);
    var emailRecibido = (data.email || "").trim().toLowerCase();

    // BLOQUEO ANTI-DUPLICADOS: Si el participante ya completó la encuesta, no duplicar fila
    if (emailRecibido && sheet.getLastRow() > 1) {
      var correosRegistrados = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
      for (var k = 0; k < correosRegistrados.length; k++) {
        if (String(correosRegistrados[k][0]).trim().toLowerCase() === emailRecibido) {
          return ContentService
            .createTextOutput(JSON.stringify({ 
              status: "duplicate", 
              message: "Este participante ya ha completado la encuesta previamente." 
            }))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }

    // Encabezados oficiales si la hoja está vacía
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Fecha Registro",
        "GamerTag",
        "Email",
        "Torneo",
        "Calificación General",
        "Puntualidad",
        "Hardware y Setups",
        "Staff y Jueces",
        "Ambiente y Audio",
        "Gestión de Rifas (1-10)",
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

    // Insertar fila con la respuesta
    sheet.appendRow([
      data.dateFormatted || new Date().toLocaleString(),
      data.gamertag || "Competidor SGF",
      data.email || "",
      data.tournament || "No especificado",
      data.overallRating || "",
      data.metricPunctuality || "",
      data.metricHardware || "",
      data.metricStaff || "",
      data.metricAtmosphere || "",
      data.rifasRating || "",
      data.nps || "",
      data.likedMost || "",
      data.suggestions || "",
      data.userAgent || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success" }))
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
// 3. API DASHBOARD + VALIDACIÓN DE CORREO ÚNICO (doGet)
// ============================================================================
function doGet(e) {
  // Salvaguarda: si se ejecuta manualmente en el editor teniendo doGet seleccionado
  if (!e || !e.parameter) {
    Logger.log("⚠️ Detectada ejecución manual en el editor. Redirigiendo a enviarPruebaDirecta...");
    enviarPruebaDirecta();
    return;
  }

  try {
    var ss = obtenerHojaCalculo();
    var sheet = ss.getSheetByName("Respuestas") || ss.getSheets()[0];

    // Endpoint de Verificación en Tiempo Real: ?checkEmail=correo@ejemplo.com
    if (e && e.parameter && e.parameter.checkEmail) {
      var targetEmail = String(e.parameter.checkEmail).trim().toLowerCase();
      var yaRespondio = false;

      if (sheet && sheet.getLastRow() > 1) {
        var emails = sheet.getRange(2, 3, sheet.getLastRow() - 1, 1).getValues();
        for (var i = 0; i < emails.length; i++) {
          if (String(emails[i][0]).trim().toLowerCase() === targetEmail) {
            yaRespondio = true;
            break;
          }
        }
      }

      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", alreadySubmitted: yaRespondio }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Retorno de datos para el Dashboard Ejecutivo
    var rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", count: 0, data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var headers = rows[0];
    var results = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];

      // Omitir filas vacías
      var tieneContenido = false;
      for (var c = 0; c < row.length; c++) {
        if (String(row[c]).trim() !== "") {
          tieneContenido = true;
          break;
        }
      }
      if (!tieneContenido) continue;
      if (!row[0] && !row[1] && !row[2]) continue;

      var item = {};
      for (var c = 0; c < headers.length; c++) {
        item[headers[c]] = row[c];
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
// 4. MENÚ PERSONALIZADO EN GOOGLE SHEETS
// ============================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🎮 SGF 2026 Feedback")
    .addItem("✉️ Enviar Correo de Prueba a Mí...", "menuEnviarPrueba")
    .addSeparator()
    .addItem("🚀 Enviar Lote 1 Oficial (1 al 85)", "menuEnviarLote1")
    .addItem("🚀 Enviar Lote 2 Oficial (86 al 171)", "menuEnviarLote2")
    .addSeparator()
    .addItem("🗑️ Vaciar y Reiniciar Hoja (Listo para Pruebas)", "reiniciarHojaDesdeCero")
    .addSeparator()
    .addItem("📊 Consultar Cuota Diaria Restante", "menuConsultarCuota")
    .addToUi();
}

/**
 * Vacía todas las respuestas recibidas en la hoja, elimina 'Hoja 1' si existe,
 * y coloca los 14 encabezados oficiales actualizados (sin ID Ticket y con Rifas).
 * Puedes ejecutarla directamente desde el botón 'Ejecutar' o desde el menú de la hoja.
 */
function reiniciarHojaDesdeCero() {
  var ss = obtenerHojaCalculo();
  
  // 1. Obtener o crear pestaña 'Respuestas'
  var sheet = ss.getSheetByName("Respuestas");
  if (!sheet) {
    sheet = ss.insertSheet("Respuestas", 0);
  }
  
  // 2. Limpiar todo el contenido anterior
  sheet.clear();
  
  // 3. Encabezados oficiales limpios y actualizados
  var headers = [
    "Fecha Registro",
    "GamerTag",
    "Email",
    "Torneo",
    "Calificación General",
    "Puntualidad",
    "Hardware y Setups",
    "Staff y Jueces",
    "Ambiente y Audio",
    "Gestión de Rifas (1-10)",
    "NPS (0-10)",
    "Lo que más gustó",
    "Sugerencias y 2027",
    "Navegador"
  ];
  
  sheet.appendRow(headers);
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#16082b");
  headerRange.setFontColor("#a855f7");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);
  
  // 4. Si existe 'Hoja 1' vacía, eliminarla para que quede solo una pestaña limpia
  var hoja1 = ss.getSheetByName("Hoja 1");
  if (hoja1 && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(hoja1);
    } catch (e) {
      Logger.log("Aviso al eliminar Hoja 1: " + e.toString());
    }
  }
  
  ss.setActiveSheet(sheet);
  Logger.log("✅ Hoja 'Respuestas' reiniciada en blanco con los 14 encabezados oficiales.");

  try {
    var ui = SpreadsheetApp.getUi();
    ui.alert(
      "✅ Hoja Reiniciada",
      "Se han vaciado todas las respuestas de prueba.\nLos encabezados oficiales quedaron actualizados (sin ID Ticket y con Rifas) en la pestaña 'Respuestas'.\n\n¡Listo para tus pruebas finales!",
      ui.ButtonSet.OK
    );
  } catch (e) {
    // Si se ejecutó desde el editor de código sin UI
  }
}

function menuEnviarPrueba() {
  var ui = SpreadsheetApp.getUi();
  var promptRes = ui.prompt(
    "✉️ Enviar Correo de Validación",
    "Ingresa el correo electrónico donde deseas recibir el correo de prueba:",
    ui.ButtonSet.OK_CANCEL
  );

  if (promptRes.getSelectedButton() !== ui.Button.OK) {
    return;
  }

  var emailDestino = promptRes.getResponseText().trim() || MI_CORREO_VALIDACION;
  if (!emailDestino || emailDestino.indexOf("@") === -1) {
    ui.alert("⚠️ Correo Inválido", "Por favor ingresa una dirección de correo válida.", ui.ButtonSet.OK);
    return;
  }

  try {
    enviarCorreoIndividual(emailDestino, MI_GAMERTAG);
    ui.alert(
      "✅ ¡Correo de Validación Enviado!",
      "Se ha enviado el correo oficial a: " + emailDestino + "\n\nRevisa tu bandeja de entrada o spam.",
      ui.ButtonSet.OK
    );
  } catch (err) {
    ui.alert("❌ Error al enviar correo", err.toString(), ui.ButtonSet.OK);
  }
}

function menuConsultarCuota() {
  var cuota = MailApp.getRemainingDailyQuota();
  SpreadsheetApp.getUi().alert(
    "📊 Cuota Diaria de Envíos",
    "Tu cuenta tiene actualmente " + cuota + " correos restantes disponibles hoy.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

// ============================================================================
// 5. DISPATCHER DE CORREO ELECTRÓNICO (GmailApp + MailApp Fallback)
// ============================================================================
function enviarCorreoIndividual(destinatario, gamertag) {
  var tag = gamertag || "Competidor SGF";
  var linkEncuesta = "https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(tag) + "&email=" + encodeURIComponent(destinatario);
  var htmlTemplate = obtenerPlantillaEmailHtml(tag, destinatario, linkEncuesta);

  var asunto = "Tu opinión sobre el Students Gaming Festival 2026 - Evaluación Oficial CEIT";

  var textoPlano = "Estimado/a participante " + tag + ":\n\n" +
    "En nombre del Comité Organizador del Students Gaming Festival 2026, el CEIT y la PUCMM, agradecemos tu destacada participación.\n\n" +
    "Te invitamos a completar la Evaluación Oficial de Experiencia en el siguiente enlace:\n" +
    linkEncuesta + "\n\n" +
    "Tu evaluación define los estándares, setups y juegos del SGF 2027.\n" +
    "Tiempo estimado: 1 minuto.\n\n" +
    "Comité Organizador Oficial SGF 2026 - CEIT y PUCMM";

  try {
    GmailApp.sendEmail(destinatario, asunto, textoPlano, {
      htmlBody: htmlTemplate,
      name: "CEIT - Students Gaming Festival 2026"
    });
  } catch (e1) {
    Logger.log("Aviso GmailApp, intentando con MailApp: " + e1.toString());
    MailApp.sendEmail({
      to: destinatario,
      subject: asunto,
      body: textoPlano,
      htmlBody: htmlTemplate,
      name: "CEIT - Students Gaming Festival 2026"
    });
  }
}

// ============================================================================
// 6. GENERADOR DE PLANTILLA HTML OFICIAL (ADAPTATIVA A MODO CLARO Y OSCURO)
// ============================================================================
function obtenerPlantillaEmailHtml(gamertag, email, linkPersonalizado) {
  var urlFinal = linkPersonalizado || ("https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(gamertag) + "&email=" + encodeURIComponent(email));

  var baseHtml = '<!DOCTYPE html>\n' +
    '<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <meta name="color-scheme" content="light dark">\n' +
    '  <meta name="supported-color-schemes" content="light dark">\n' +
    '  <title>Evaluación de Experiencia - SGF 2026</title>\n' +
    '  <!--[if mso]>\n' +
    '  <style type="text/css">\n' +
    '    body, table, td, p, a { font-family: Segoe UI, Arial, sans-serif !important; }\n' +
    '  </style>\n' +
    '  <![endif]-->\n' +
    '  <style>\n' +
    '    :root {\n' +
    '      color-scheme: light dark;\n' +
    '      supported-color-schemes: light dark;\n' +
    '    }\n' +
    '    body {\n' +
    '      margin: 0; padding: 0;\n' +
    '      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;\n' +
    '      -webkit-font-smoothing: antialiased;\n' +
    '    }\n' +
    '    .email-wrapper {\n' +
    '      background-color: #f3f4f6;\n' +
    '    }\n' +
    '    .email-container {\n' +
    '      background-color: #ffffff;\n' +
    '      border: 1px solid #e5e7eb;\n' +
    '    }\n' +
    '    .title-text {\n' +
    '      color: #111827;\n' +
    '    }\n' +
    '    .body-text {\n' +
    '      color: #374151;\n' +
    '    }\n' +
    '    .muted-text {\n' +
    '      color: #6b7280;\n' +
    '    }\n' +
    '    .divider-line {\n' +
    '      background-color: #e5e7eb;\n' +
    '    }\n' +
    '    .footer-section {\n' +
    '      background-color: #fafafa;\n' +
    '      border-top: 1px solid #e5e7eb;\n' +
    '    }\n' +
    '    .link-alt {\n' +
    '      color: #6d28d9;\n' +
    '    }\n' +
    '\n' +
    '    /* Modo Oscuro Automático */\n' +
    '    @media (prefers-color-scheme: dark) {\n' +
    '      .email-wrapper {\n' +
    '        background-color: #0f0f12 !important;\n' +
    '      }\n' +
    '      .email-container {\n' +
    '        background-color: #18181c !important;\n' +
    '        border-color: #27272a !important;\n' +
    '      }\n' +
    '      .title-text {\n' +
    '        color: #ffffff !important;\n' +
    '      }\n' +
    '      .body-text {\n' +
    '        color: #d1d5db !important;\n' +
    '      }\n' +
    '      .muted-text {\n' +
    '        color: #9ca3af !important;\n' +
    '      }\n' +
    '      .divider-line {\n' +
    '        background-color: #27272a !important;\n' +
    '      }\n' +
    '      .footer-section {\n' +
    '        background-color: #141416 !important;\n' +
    '        border-top-color: #27272a !important;\n' +
    '      }\n' +
    '      .link-alt {\n' +
    '        color: #a78bfa !important;\n' +
    '      }\n' +
    '    }\n' +
    '\n' +
    '    /* Compatibilidad Outlook Web / Gmail App */\n' +
    '    [data-ogsc] .email-wrapper { background-color: #0f0f12 !important; }\n' +
    '    [data-ogsc] .email-container { background-color: #18181c !important; border-color: #27272a !important; }\n' +
    '    [data-ogsc] .title-text { color: #ffffff !important; }\n' +
    '    [data-ogsc] .body-text { color: #d1d5db !important; }\n' +
    '    [data-ogsc] .muted-text { color: #9ca3af !important; }\n' +
    '    [data-ogsc] .divider-line { background-color: #27272a !important; }\n' +
    '    [data-ogsc] .footer-section { background-color: #141416 !important; border-top-color: #27272a !important; }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body class="email-wrapper" style="margin: 0; padding: 0; background-color: #f3f4f6; -webkit-font-smoothing: antialiased;">\n' +
    '  <div style="display: none; font-size: 1px; color: #f3f4f6; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">\n' +
    '    Queremos conocer tu opinión sobre el Students Gaming Festival 2026. Te tomará solo 1 minuto.\n' +
    '  </div>\n' +
    '\n' +
    '  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="background-color: #f3f4f6; padding: 36px 12px;">\n' +
    '    <tr>\n' +
    '      <td align="center">\n' +
    '        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);">\n' +
    '          \n' +
    '          <!-- Cabecera Limpia con Logo -->\n' +
    '          <tr>\n' +
    '            <td align="center" style="padding: 36px 32px 20px 32px;">\n' +
    '              <img src="https://sgf26-feedback.vercel.app/images/logo.png" alt="Students Gaming Festival 2026" width="130" style="display: block; max-width: 130px; height: auto; margin: 0 auto 16px auto; border: 0;">\n' +
    '              <h1 class="title-text" style="margin: 0; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px; line-height: 1.3;">\n' +
    '                Evaluación de Experiencia\n' +
    '              </h1>\n' +
    '              <p class="muted-text" style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">\n' +
    '                Students Gaming Festival 2026 • CEIT & PUCMM\n' +
    '              </p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '\n' +
    '          <!-- Línea Divisoria -->\n' +
    '          <tr>\n' +
    '            <td style="padding: 0 32px;">\n' +
    '              <div class="divider-line" style="height: 1px; background-color: #e5e7eb;"></div>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '\n' +
    '          <!-- Cuerpo del Mensaje -->\n' +
    '          <tr>\n' +
    '            <td class="body-text" style="padding: 28px 32px 24px 32px; font-size: 15px; line-height: 1.65; color: #374151;">\n' +
    '              <p style="margin: 0 0 16px 0;">\n' +
    '                Hola <strong style="color: #6d28d9;">{{GamerTag}}</strong>,\n' +
    '              </p>\n' +
    '              <p style="margin: 0 0 16px 0;">\n' +
    '                Muchas gracias por haber participado en el <strong>Students Gaming Festival 2026</strong>. Tu presencia y espíritu competitivo fueron fundamentales para hacer posible esta edición.\n' +
    '              </p>\n' +
    '              <p style="margin: 0 0 16px 0;">\n' +
    '                Queremos conocer tu opinión sobre la puntualidad, los setups, el arbitraje y la organización general del evento. Tus respuestas nos servirán de guía directa para mejorar la experiencia del <strong>SGF 2027</strong>.\n' +
    '              </p>\n' +
    '              <p class="muted-text" style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">\n' +
    '                La encuesta es breve y te tomará aproximadamente <strong>1 minuto</strong>.\n' +
    '              </p>\n' +
    '\n' +
    '              <!-- Botón Principal -->\n' +
    '              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 8px 0 24px 0;">\n' +
    '                <tr>\n' +
    '                  <td align="center">\n' +
    '                    <a href="{{SURVEY_LINK}}" target="_blank" style="display: inline-block; background-color: #6d28d9; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; text-align: center;">\n' +
    '                      Completar encuesta de experiencia\n' +
    '                    </a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '\n' +
    '              <!-- Enlace de Respaldo -->\n' +
    '              <p class="muted-text" style="margin: 0 0 28px 0; font-size: 12px; color: #6b7280; line-height: 1.5; word-break: break-all;">\n' +
    '                Si el botón no abre correctamente, puedes acceder directamente pegando este enlace en tu navegador:<br>\n' +
    '                <a href="{{SURVEY_LINK}}" target="_blank" class="link-alt" style="color: #6d28d9; text-decoration: underline;">{{SURVEY_LINK}}</a>\n' +
    '              </p>\n' +
    '\n' +
    '              <!-- Despedida Institucional -->\n' +
    '              <p class="muted-text" style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">\n' +
    '                Atentamente,<br>\n' +
    '                <strong class="title-text" style="color: #111827;">Comité Organizador Oficial SGF 2026</strong><br>\n' +
    '                Comité de Estudiantes de Ingeniería Telemática (CEIT)<br>\n' +
    '                Pontificia Universidad Católica Madre y Maestra (PUCMM)\n' +
    '              </p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '\n' +
    '          <!-- Footer Institucional -->\n' +
    '          <tr>\n' +
    '            <td align="center" class="footer-section" style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">\n' +
    '              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">\n' +
    '                <tr>\n' +
    '                  <td style="padding: 0 10px;">\n' +
    '                    <img src="https://sgf26-feedback.vercel.app/images/pucmm.png" alt="PUCMM" height="22" style="display: block; opacity: 0.75; border: 0;">\n' +
    '                  </td>\n' +
    '                  <td class="muted-text" style="color: #9ca3af; font-size: 12px;">•</td>\n' +
    '                  <td style="padding: 0 10px;">\n' +
    '                    <img src="https://sgf26-feedback.vercel.app/images/ceit.png" alt="CEIT" height="22" style="display: block; opacity: 0.75; border: 0;">\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '              <p class="muted-text" style="margin: 0; font-size: 11px; color: #9ca3af; line-height: 1.4;">\n' +
    '                Students Gaming Festival 2026 • PUCMM, Campus Santiago\n' +
    '              </p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '\n' +
    '        </table>\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '</body>\n' +
    '</html>';

  var resultado = baseHtml
    .split("{{SURVEY_LINK}}").join(urlFinal)
    .split("{{GamerTag}}").join(gamertag)
    .split("{{Email}}").join(email);

  return resultado;
}


// ============================================================================
// 7. ENVÍO MASIVO OFICIAL EN 2 LOTES (171 PARTICIPANTES)
// ============================================================================
var LISTA_PARTICIPANTES = [
    {
        "email":  "migueljoseasencio@gmail.com",
        "gamertag":  "Miguel Jose Asencio"
    },
    {
        "email":  "carlosdgarcia210@gmail.com",
        "gamertag":  "Carlos Daniel García Núñez"
    },
    {
        "email":  "yorbyssoriano3@gmail.com",
        "gamertag":  "Yorby Enriques Soriano"
    },
    {
        "email":  "ozmann64@gmail.com",
        "gamertag":  "Oscar Jr Mercado"
    },
    {
        "email":  "valerioestarlin4tog@gmail.com",
        "gamertag":  "Estarlin Valerio"
    },
    {
        "email":  "melvinpaulino0019ceges@gmail.com",
        "gamertag":  "Melvin Paulino"
    },
    {
        "email":  "madarauchija2556@gmail.com",
        "gamertag":  "Raymond Aníbal Vélez Almonte"
    },
    {
        "email":  "soytolexd@gmail.com",
        "gamertag":  "Soytole"
    },
    {
        "email":  "hiroshy676@gmail.com",
        "gamertag":  "Hiroshy Luna"
    },
    {
        "email":  "petercastf14@gmail.com",
        "gamertag":  "Peter Castillo Fernandez"
    },
    {
        "email":  "manuel.gg130924@gmail.com",
        "gamertag":  "Manuel Alejandro Gil Gómez"
    },
    {
        "email":  "migueladrian150467@gmail.com",
        "gamertag":  "Miguel Miguel"
    },
    {
        "email":  "hectorrae0@gmail.com",
        "gamertag":  "Hector Rodriguez"
    },
    {
        "email":  "jjoaquinvillar01@gmail.com",
        "gamertag":  "Javier José Joaquín Villar"
    },
    {
        "email":  "enmanuelluz625@gmail.com",
        "gamertag":  "Enmanuel Quzada"
    },
    {
        "email":  "ricardoarturoguemez@gmail.com",
        "gamertag":  "Ricardo Güémez"
    },
    {
        "email":  "aa2351807@gmail.com",
        "gamertag":  "Alejandro Correa"
    },
    {
        "email":  "mcavalierepichardo@gmail.com",
        "gamertag":  "Maria Francesca Cavaliere Pichardo"
    },
    {
        "email":  "jeanrod2007@gmail.com",
        "gamertag":  "Jean Rodriguez"
    },
    {
        "email":  "diegobatista112018@gmail.com",
        "gamertag":  "Diego Batista Reyes"
    },
    {
        "email":  "saludos150196@gmail.com",
        "gamertag":  "Jose Luis Cabrera Ramirez"
    },
    {
        "email":  "wady178@gmail.com",
        "gamertag":  "Wady Rodríguez"
    },
    {
        "email":  "jaysongzm@gmail.com",
        "gamertag":  "Jayson Guzman"
    },
    {
        "email":  "manuelhidalgo246@gmail.com",
        "gamertag":  "Manuel Hidalgo"
    },
    {
        "email":  "ardymonium@gmail.com",
        "gamertag":  "Joan Vargas"
    },
    {
        "email":  "karlojuliodejesusgarcia@gmail.com",
        "gamertag":  "Karlo Julio De Jesus Garcia"
    },
    {
        "email":  "sebastianbencosme17@gmail.com",
        "gamertag":  "Sebastián Bencosme Ovalles"
    },
    {
        "email":  "Diegobetancourtblanco@gmail.com",
        "gamertag":  "Diego José Betancourt Blanco"
    },
    {
        "email":  "jisidro1109@gmail.com",
        "gamertag":  "José Isidro Vargas"
    },
    {
        "email":  "jcangarcia100@gmail.com",
        "gamertag":  "Juan Carlos Garcia"
    },
    {
        "email":  "diego.rodriguez110111@gmail.com",
        "gamertag":  "Diego Rodriguez"
    },
    {
        "email":  "reymerpolanco2131@gmail.com",
        "gamertag":  "Reymer Polanco"
    },
    {
        "email":  "moisesmart2607@gmail.com",
        "gamertag":  "Moisés Martínez"
    },
    {
        "email":  "elielsalvador.07@gmail.com",
        "gamertag":  "Eliel Salvador Muñoz"
    },
    {
        "email":  "maryann12334@gmail.com",
        "gamertag":  "Mary Ann Deprat"
    },
    {
        "email":  "orlandosantiagolizardo12@gmail.com",
        "gamertag":  "Orlando Santiago"
    },
    {
        "email":  "luisangel9905@gmail.com",
        "gamertag":  "Luis Angel Garcia Perez"
    },
    {
        "email":  "maderacesar226@gmail.com",
        "gamertag":  "Emmanuel Efrain Sorá Madera"
    },
    {
        "email":  "alanxd777l3@gmail.com",
        "gamertag":  "Alan Hidalgo"
    },
    {
        "email":  "odillepatricia30@gmail.com",
        "gamertag":  "Odille Santos"
    },
    {
        "email":  "carlosmanuelii2111@gmail.com",
        "gamertag":  "Carlos Manuel Ferreira"
    },
    {
        "email":  "eduardo.hernandez.ma1513@gmail.com",
        "gamertag":  "Eduardo Antonio Hernández Grullón"
    },
    {
        "email":  "dalicofresi@gmail.com",
        "gamertag":  "Dali Cofresi"
    },
    {
        "email":  "josuedejesusgg1@gmail.com",
        "gamertag":  "Josue Garcia"
    },
    {
        "email":  "egrick001@gmail.com",
        "gamertag":  "Erick Gomez Hernandez"
    },
    {
        "email":  "randall.minaya@gmail.com",
        "gamertag":  "Randall Minaya"
    },
    {
        "email":  "paulgarcialop@gmail.com",
        "gamertag":  "Paul García"
    },
    {
        "email":  "geomarac64@gmail.com",
        "gamertag":  "Geomar Abreu"
    },
    {
        "email":  "abelliard57@gmail.com",
        "gamertag":  "Ángel Belliard"
    },
    {
        "email":  "adamrguezz@gmail.com",
        "gamertag":  "Adam Rodríguez"
    },
    {
        "email":  "jcurielurena@gmail.com",
        "gamertag":  "Joel Curiel Ureña"
    },
    {
        "email":  "jos3phg1133@gmail.com",
        "gamertag":  "Joseph De Jesús Gómez Rodriguez"
    },
    {
        "email":  "dayamarie08@gmail.com",
        "gamertag":  "Dhayanna Peralta"
    },
    {
        "email":  "isaacminaya1620@gmail.com",
        "gamertag":  "Isaac Jose Minaya Garcia"
    },
    {
        "email":  "soribelsantosbritos05@gmail.com",
        "gamertag":  "Soribel Santos"
    },
    {
        "email":  "kiancisenrique685@gmail.com",
        "gamertag":  "Kiancis Enrique Puello Valerio"
    },
    {
        "email":  "rodriguezjuandaniel33@gmail.com",
        "gamertag":  "Juan Daniel Rodriguez Sarante"
    },
    {
        "email":  "pedrito272005@gmail.com",
        "gamertag":  "Pedro Rojas"
    },
    {
        "email":  "rias0331@gmail.com",
        "gamertag":  "Romario Abreu"
    },
    {
        "email":  "eg547154@gmail.com",
        "gamertag":  "Enmanuel Guzmán"
    },
    {
        "email":  "reynaldoac2104@gmail.com",
        "gamertag":  "Reynaldo Álvarez Casado"
    },
    {
        "email":  "nreyesdoaz332@gmail.com",
        "gamertag":  "Nicole Reyes"
    },
    {
        "email":  "mendozagarciaj947@gmail.com",
        "gamertag":  "Juan Manuel Mendoza García"
    },
    {
        "email":  "diegoroca2105@gmail.com",
        "gamertag":  "Diego Roca"
    },
    {
        "email":  "mauritrez02@gmail.com",
        "gamertag":  "Mauricio Trejo"
    },
    {
        "email":  "hugoferconcepcion@gmail.com",
        "gamertag":  "Hugo Fernando Concepción López"
    },
    {
        "email":  "joproxdh@gmail.com",
        "gamertag":  "Josue Rodriguez"
    },
    {
        "email":  "josero1driguez1@gmail.com",
        "gamertag":  "Randy Rodriguez"
    },
    {
        "email":  "luisandresdp@gmail.com",
        "gamertag":  "Luis Andres Duran Perez"
    },
    {
        "email":  "claudialan024@gmail.com",
        "gamertag":  "Claudia Lantigua"
    },
    {
        "email":  "liamgivanom@gmail.com",
        "gamertag":  "Liam Monción Lora"
    },
    {
        "email":  "rayanbm1917@gmail.com",
        "gamertag":  "Rayan Betances"
    },
    {
        "email":  "jandelventura.04@gmail.com",
        "gamertag":  "Jandel Tavarez"
    },
    {
        "email":  "josemlora1916@gmail.com",
        "gamertag":  "José Miguel Lora Peña"
    },
    {
        "email":  "jorge13.jr77@gmail.com",
        "gamertag":  "Jorge Luis Ramirez Carela"
    },
    {
        "email":  "naiobyabreu@gmail.com",
        "gamertag":  "Naioby Abreu"
    },
    {
        "email":  "mesquita.jeancarlos@gmail.com",
        "gamertag":  "Jean Carlos Mesquita Peña"
    },
    {
        "email":  "ardaving@gmail.com",
        "gamertag":  "George Ardavin"
    },
    {
        "email":  "davrosario09@gmail.com",
        "gamertag":  "David Rosario"
    },
    {
        "email":  "carloseduardo13055@hotmail.com",
        "gamertag":  "Carlos Eduardo Ferreira"
    },
    {
        "email":  "arturorodriguezuz003@gmail.com",
        "gamertag":  "Arturo Rodríguez"
    },
    {
        "email":  "jairoeliezerm@gmail.com",
        "gamertag":  "Jairo Martinez"
    },
    {
        "email":  "alexenmanuelsrb@gmail.com",
        "gamertag":  "Enmanuel Suarez Beato"
    },
    {
        "email":  "fidelferreiramorel@gmail.com",
        "gamertag":  "Fidel Ferreira"
    },
    {
        "email":  "javierabbottg@gmail.com",
        "gamertag":  "Javier Abbott"
    },
    {
        "email":  "adrianhidalgo714@gmail.com",
        "gamertag":  "Adrián Hidalgo"
    },
    {
        "email":  "nelsonarutnev@gmail.com",
        "gamertag":  "Nelson Ventura"
    },
    {
        "email":  "gabrielcepeda2007@gmail.com",
        "gamertag":  "Gabriel Cepeda"
    },
    {
        "email":  "asdrubaltejada2015@gmail.com",
        "gamertag":  "Asdruval Tejada"
    },
    {
        "email":  "leandroj21p@gmail.com",
        "gamertag":  "Leandro Jiménez"
    },
    {
        "email":  "gariasdisla@gmail.com",
        "gamertag":  "José David Arias"
    },
    {
        "email":  "rhandyemmanuels@gmail.com",
        "gamertag":  "Rhandy Emmanuel Saldivar Castillo"
    },
    {
        "email":  "LMGP0003@CE.PUCMM.EDU.DO",
        "gamertag":  "Leslie Grullon"
    },
    {
        "email":  "isael.estevez2@gmail.com",
        "gamertag":  "Isael Valerio"
    },
    {
        "email":  "deht0001@ce.pucmm.edu.do",
        "gamertag":  "Darlyn Hernández"
    },
    {
        "email":  "nreartejimenez@gmail.com",
        "gamertag":  "Nahuel Rearte"
    },
    {
        "email":  "joshepmperalta@gmail.com",
        "gamertag":  "Joseph Peralta"
    },
    {
        "email":  "adrianalexanderartiles@gmail.com",
        "gamertag":  "Adrian Artiles"
    },
    {
        "email":  "camilan0311@gmail.com",
        "gamertag":  "Camila Nuñez"
    },
    {
        "email":  "wjge0001@ce.pucmm.edu.do",
        "gamertag":  "Wilson Jose Garcia Estrella"
    },
    {
        "email":  "francistrinidadtrejo17@gmail.com",
        "gamertag":  "Francisco Trinidad"
    },
    {
        "email":  "roddypaulino8@gmail.com",
        "gamertag":  "Roddy Paulino"
    },
    {
        "email":  "emilalejandrop@gmail.com",
        "gamertag":  "Emil Peralta"
    },
    {
        "email":  "gabriedlcm05@gmail.com",
        "gamertag":  "Gabriel De La Cruz Marte"
    },
    {
        "email":  "iamemanuel30@gmail.com",
        "gamertag":  "Emanuel Isaias Martinez Garcia"
    },
    {
        "email":  "marino_0901@outlook.com",
        "gamertag":  "Marino Rafael García Fadul"
    },
    {
        "email":  "mishael.tavarez@gmail.com",
        "gamertag":  "Mishael Tavarez"
    },
    {
        "email":  "theyuridr_ceit_pucmm@aiyuri.pro",
        "gamertag":  "Ai Yuri"
    },
    {
        "email":  "claudioa0907@gmail.com",
        "gamertag":  "Claudio Yciano"
    },
    {
        "email":  "egarcofresi212@gmail.com",
        "gamertag":  "Egar Cofresi"
    },
    {
        "email":  "emmanuelrosariof20@gmail.com",
        "gamertag":  "Emmanuel Rosario Fermín"
    },
    {
        "email":  "guarionex6686@gmail.com",
        "gamertag":  "Guarionex Gomez"
    },
    {
        "email":  "arifranches15@gmail.com",
        "gamertag":  "Arianny Roque"
    },
    {
        "email":  "nanoabreu07@gmail.com",
        "gamertag":  "Jorge Abreu"
    },
    {
        "email":  "dionisrodriguezziea@gmail.com",
        "gamertag":  "Dionis Rodríguez"
    },
    {
        "email":  "luisjulianbaez@gmail.com",
        "gamertag":  "Luis Alfonso Julian Baez"
    },
    {
        "email":  "armandooyt@gmail.com",
        "gamertag":  "Narciso Leon"
    },
    {
        "email":  "andrewbatistagarcia@gmail.com",
        "gamertag":  "Andrew Batista Garcia"
    },
    {
        "email":  "samidcc26@gmail.com",
        "gamertag":  "Samid Castillo"
    },
    {
        "email":  "jesuseng08@gmail.com",
        "gamertag":  "Jesús Núñez"
    },
    {
        "email":  "caryfernandez9@gmail.com",
        "gamertag":  "Kary Esther Fernandez Solino"
    },
    {
        "email":  "jonasfuertespsp@gmail.com",
        "gamertag":  "Amohos Ovalles Fuertes"
    },
    {
        "email":  "anthonygarcoia09@gmail.com",
        "gamertag":  "Anthony García"
    },
    {
        "email":  "najavyuz10@gmail.com",
        "gamertag":  "Najavy Ureña"
    },
    {
        "email":  "jailanisburgosquezada@gmail.com",
        "gamertag":  "Jailanis Burgos"
    },
    {
        "email":  "estrellasalcedo.aj@gmail.com",
        "gamertag":  "Adrian Estrella"
    },
    {
        "email":  "bryannaquezada761@gmail.com",
        "gamertag":  "Meredich González"
    },
    {
        "email":  "cynthiagg126@gmail.com",
        "gamertag":  "Cynthia Gómez"
    },
    {
        "email":  "jamespumeran@gmail.com",
        "gamertag":  "James Flores"
    },
    {
        "email":  "jeretejadar@gmail.com",
        "gamertag":  "Jeremias Tejada"
    },
    {
        "email":  "meiverr733@gmail.com",
        "gamertag":  "Exmeiver Gavides Paulino"
    },
    {
        "email":  "cb.lebron@gmail.com",
        "gamertag":  "Eduardo Ramirez"
    },
    {
        "email":  "bumatthew679@gmail.com",
        "gamertag":  "Matthew Daniel Buceta Abreu"
    },
    {
        "email":  "sbrach29@gmail.com",
        "gamertag":  "Said Compres"
    },
    {
        "email":  "freudy0108@gmail.com",
        "gamertag":  "Freudy Cuevas"
    },
    {
        "email":  "foast584@gmail.com",
        "gamertag":  "Camell Marié Tejada Pérez"
    },
    {
        "email":  "isaacvalerio29@gmail.com",
        "gamertag":  "Isaac Valerio"
    },
    {
        "email":  "albertduran.d.m.a@gmail.com",
        "gamertag":  "Albert Duran Mora"
    },
    {
        "email":  "brandolesbo@hotmail.com",
        "gamertag":  "Brandol Estevez Bonilla"
    },
    {
        "email":  "Peliculasespanolatino@gmail.com",
        "gamertag":  "Estarly Almanzar"
    },
    {
        "email":  "joexgarcia2207@gmail.com",
        "gamertag":  "Joel Garcia"
    },
    {
        "email":  "raulrios27062008@gmail.com",
        "gamertag":  "Raul Rios"
    },
    {
        "email":  "wilovergomez9@gmail.com",
        "gamertag":  "Wilover Gomez"
    },
    {
        "email":  "alfred.miguel.mdina927@gmail.com",
        "gamertag":  "Alfred Chelo"
    },
    {
        "email":  "lxlroberto@gmail.com",
        "gamertag":  "Roberto Santana"
    },
    {
        "email":  "diegosalcedoc22@gmail.com",
        "gamertag":  "Diego Salcedo"
    },
    {
        "email":  "yvesdany63@gmail.com",
        "gamertag":  "Yves Dany"
    },
    {
        "email":  "rodqzstarlin@gmail.com",
        "gamertag":  "Starli. Rodriguez"
    },
    {
        "email":  "marioalfredo.deleon22@gmail.com",
        "gamertag":  "Mario De León"
    },
    {
        "email":  "manensolrod@gmail.com",
        "gamertag":  "Manuel Solano"
    },
    {
        "email":  "victorarcal1@gmail.com",
        "gamertag":  "Victor Rodriguez"
    },
    {
        "email":  "carlos.dgez@gmail.com",
        "gamertag":  "Carlos Domínguez"
    },
    {
        "email":  "nayhat.javier@gmail.com",
        "gamertag":  "Nayhat Javier"
    },
    {
        "email":  "marcos.david.dominguez@gmail.com",
        "gamertag":  "Marcos Dominguez"
    },
    {
        "email":  "yandelluis.taverasdiaz18@gmail.com",
        "gamertag":  "Yandel Luis Taveras Díaz"
    },
    {
        "email":  "miguelwilliamsfelizferreiras@gmail.com",
        "gamertag":  "Miguel Williams Feliz Ferreiras"
    },
    {
        "email":  "felizkrlos@gmail.com",
        "gamertag":  "Karlos Feliz"
    },
    {
        "email":  "reynardomartinezh@gmail.com",
        "gamertag":  "Reynardo Martinez"
    },
    {
        "email":  "robertcrack007@gmail.com",
        "gamertag":  "Robert Junior Abreu Suero"
    },
    {
        "email":  "emilioalejandrodc@gmail.com",
        "gamertag":  "Emilio Dominguez"
    },
    {
        "email":  "kventura16_6@hotmail.com",
        "gamertag":  "Karina Ventura Rodríguez"
    },
    {
        "email":  "angelramos180602@gmail.com",
        "gamertag":  "Angel Ernesto Ramos"
    },
    {
        "email":  "gomezstanley754@gmail.com",
        "gamertag":  "Stanley Gomez"
    },
    {
        "email":  "xaviermorel00701@gmail.com",
        "gamertag":  "Xavier Morel"
    },
    {
        "email":  "Delvie16@outlook.com",
        "gamertag":  "Delvi Garcia"
    },
    {
        "email":  "demianreynosogomez@gmail.com",
        "gamertag":  "Demian Reynoso"
    },
    {
        "email":  "albertrozon27@gmail.com",
        "gamertag":  "Albert Rozón Batista"
    },
    {
        "email":  "m.vasquez0606@gmail.com",
        "gamertag":  "Misael Vásquez"
    },
    {
        "email":  "rensogabrielr@gmail.com",
        "gamertag":  "Renso Gabriel Rodríguez Ureña"
    },
    {
        "email":  "seniaarzola20@gmail.com",
        "gamertag":  "Senia Arzola"
    },
    {
        "email":  "reyessaulfd@gmail.com",
        "gamertag":  "Re⁸yes Saul Fernandez"
    }
]
;

function menuEnviarLote1() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert(
    "⚠️ CONFIRMACIÓN DE ENVÍO - LOTE 1",
    "¿Estás seguro de enviar los correos oficiales a los primeros 85 participantes?\n\nCuenta emisora: sgfceit26@gmail.com",
    ui.ButtonSet.YES_NO
  );
  if (resp === ui.Button.YES) {
    enviarLote1_Oficial();
    ui.alert("✅ Proceso de Lote 1 finalizado. Revisa el registro de ejecuciones en Apps Script.");
  }
}

function menuEnviarLote2() {
  var ui = SpreadsheetApp.getUi();
  var resp = ui.alert(
    "⚠️ CONFIRMACIÓN DE ENVÍO - LOTE 2",
    "¿Estás seguro de enviar los correos oficiales a los participantes 86 al 171?\n\nCuenta emisora: sgfceit26@gmail.com",
    ui.ButtonSet.YES_NO
  );
  if (resp === ui.Button.YES) {
    enviarLote2_Oficial();
    ui.alert("✅ Proceso de Lote 2 finalizado. Revisa el registro de ejecuciones en Apps Script.");
  }
}

function enviarLote1_Oficial() {
  Logger.log("🚀 Iniciando envío del Lote 1 (Participantes 1 al 85)...");
  enviarRangoParticipantes(0, 85, "Lote 1");
}

function enviarLote2_Oficial() {
  Logger.log("🚀 Iniciando envío del Lote 2 (Participantes 86 al 171)...");
  enviarRangoParticipantes(85, LISTA_PARTICIPANTES.length, "Lote 2");
}

function enviarRangoParticipantes(inicio, fin, nombreLote) {
  var cuotaInicial = MailApp.getRemainingDailyQuota();
  Logger.log("📊 Cuota antes de iniciar: " + cuotaInicial);
  
  var exitosos = 0;
  var fallidos = 0;
  
  for (var i = inicio; i < fin && i < LISTA_PARTICIPANTES.length; i++) {
    var p = LISTA_PARTICIPANTES[i];
    try {
      enviarCorreoIndividual(p.email, p.gamertag);
      exitosos++;
      Logger.log("[" + (i + 1) + "/" + LISTA_PARTICIPANTES.length + "] ✅ Enviado a: " + p.email + " (" + p.gamertag + ")");
      Utilities.sleep(150); // Pausa preventiva
    } catch (err) {
      fallidos++;
      Logger.log("[" + (i + 1) + "/" + LISTA_PARTICIPANTES.length + "] ❌ Error con: " + p.email + " - " + err.toString());
    }
  }
  
  Logger.log("==================================================");
  Logger.log("🎉 Resumen de " + nombreLote + ": " + exitosos + " enviados, " + fallidos + " fallidos.");
  Logger.log("📊 Cuota restante: " + MailApp.getRemainingDailyQuota());
  Logger.log("==================================================");
}

function verificarEstadoEnvios() {
  var cuota = MailApp.getRemainingDailyQuota();
  Logger.log("📊 CUOTA DIARIA RESTANTE: " + cuota + " correos.");
  Logger.log("👥 TOTAL PARTICIPANTES CARGADOS: " + LISTA_PARTICIPANTES.length);
  Logger.log("📦 Lote 1: Participantes 1 al 85 (85 correos)");
  Logger.log("📦 Lote 2: Participantes 86 al 171 (86 correos)");
}
