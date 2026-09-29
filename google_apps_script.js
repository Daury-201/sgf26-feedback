/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Sistema Oficial: Webhook de Feedback + Dashboard API + Envío Masivo Oficial
 * CEIT & PUCMM
 *
 * Emisor Oficial: sgfceit26@gmail.com
 * Google Sheet ID: 1l0E2qpvKP7cuDbFdmLUlAfkmc0gi1iYV57yaa067-d0
 */

var SPREADSHEET_ID = "1l0E2qpvKP7cuDbFdmLUlAfkmc0gi1iYV57yaa067-d0";
var MI_CORREO_VALIDACION = "rafaeldario1961@gmail.com";
var MI_GAMERTAG = "Rafael";

/**
 * Conexión segura con el Google Sheet oficial
 */
function obtenerHojaCalculo() {
  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    try {
      var doc = SpreadsheetApp.openById(SPREADSHEET_ID.trim());
      if (doc) return doc;
    } catch (e) {
      Logger.log("⚠️ Error en openById: " + e.toString());
      throw new Error("No se pudo acceder a la hoja (" + SPREADSHEET_ID + "). Verifica que esté compartida con sgfceit26@gmail.com como Editor.");
    }
  }
  var active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error("No se encontró ninguna hoja activa ni se pudo abrir el ID: " + SPREADSHEET_ID);
}

// ============================================================================
// 1. FUNCIÓN DE PRUEBA PERSONAL
// ============================================================================
function enviarPruebaDirecta() {
  Logger.log("⏳ Preparando correo oficial para: " + MI_CORREO_VALIDACION + "...");
  enviarCorreoIndividual(MI_CORREO_VALIDACION, MI_GAMERTAG);
  Logger.log("🚀 ¡CORREO ENVIADO CON ÉXITO A: " + MI_CORREO_VALIDACION + "!");
}

// ============================================================================
// 2. REINICIAR HOJA LIMPIA (14 COLUMNAS OFICIALES)
// ============================================================================
function reiniciarHojaDesdeCero() {
  var ss = obtenerHojaCalculo();
  var sheet = ss.getSheetByName("Respuestas");
  if (!sheet) {
    sheet = ss.insertSheet("Respuestas", 0);
  } else {
    sheet.clear();
  }

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

  var hoja1 = ss.getSheetByName("Hoja 1");
  if (hoja1 && ss.getSheets().length > 1) {
    try { ss.deleteSheet(hoja1); } catch (e) {}
  }

  ss.setActiveSheet(sheet);
  Logger.log("✅ Hoja 'Respuestas' reiniciada en blanco con los 14 encabezados oficiales.");
}

// ============================================================================
// 3. RECEPTOR WEBHOOK (doPost) - GUARDA RESPUESTAS Y BLOQUEA DUPLICADOS
// ============================================================================
function doPost(e) {
  if (!e || !e.postData) {
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

    // Bloqueo anti-duplicados por correo
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

    if (sheet.getLastRow() === 0) {
      reiniciarHojaDesdeCero();
      sheet = ss.getSheetByName("Respuestas");
    }

    // Insertar fila con la evaluación (14 columnas)
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
// 4. API PARA EL DASHBOARD (/admin) Y VALIDACIÓN DE CORREO (doGet)
// ============================================================================
function doGet(e) {
  if (!e || !e.parameter) {
    enviarPruebaDirecta();
    return;
  }

  try {
    var ss = obtenerHojaCalculo();
    var sheet = ss.getSheetByName("Respuestas") || ss.getSheets()[0];

    // Validación si un correo ya respondió (?checkEmail=...)
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
      var tieneContenido = false;
      for (var c = 0; c < row.length; c++) {
        if (String(row[c]).trim() !== "") { tieneContenido = true; break; }
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
// 5. MENÚ PERSONALIZADO EN GOOGLE SHEETS
// ============================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🎮 SGF 2026 Feedback")
    .addItem("✉️ Enviar Correo de Prueba a Mí...", "menuEnviarPrueba")
    .addSeparator()
    .addItem("🚀 Enviar Lote 1 Oficial (1 al 86)", "menuEnviarLote1")
    .addItem("🚀 Enviar Lote 2 Oficial (87 al 172)", "menuEnviarLote2")
    .addSeparator()
    .addItem("🗑️ Vaciar y Reiniciar Hoja (Listo para Pruebas)", "reiniciarHojaDesdeCero")
    .addSeparator()
    .addItem("📊 Consultar Cuota Diaria Restante", "menuConsultarCuota")
    .addToUi();
}

function menuEnviarPrueba() {
  try {
    var ui = SpreadsheetApp.getUi();
    var promptRes = ui.prompt("✉️ Enviar Correo de Validación", "Ingresa el correo destino:", ui.ButtonSet.OK_CANCEL);
    if (promptRes.getSelectedButton() !== ui.Button.OK) return;
    var emailDestino = promptRes.getResponseText().trim() || MI_CORREO_VALIDACION;
    enviarCorreoIndividual(emailDestino, MI_GAMERTAG);
    ui.alert("✅ Correo enviado a: " + emailDestino);
  } catch (e) {
    enviarPruebaDirecta();
  }
}

function menuEnviarLote1() {
  try {
    var ui = SpreadsheetApp.getUi();
    var resp = ui.alert(
      "⚠️ CONFIRMACIÓN DE ENVÍO - LOTE 1",
      "¿Estás seguro de enviar los correos oficiales a los primeros 86 participantes?\n\nCuenta emisora: sgfceit26@gmail.com",
      ui.ButtonSet.YES_NO
    );
    if (resp === ui.Button.YES) {
      enviarLote1_Oficial();
      ui.alert("✅ Proceso de Lote 1 finalizado.");
    }
  } catch (e) {
    // Si se ejecutó directamente desde el editor de Apps Script (sin UI):
    Logger.log("Ejecutando Lote 1 directamente...");
    enviarLote1_Oficial();
  }
}

function menuEnviarLote2() {
  try {
    var ui = SpreadsheetApp.getUi();
    var resp = ui.alert(
      "⚠️ CONFIRMACIÓN DE ENVÍO - LOTE 2",
      "¿Estás seguro de enviar los correos oficiales a los participantes 87 al 172?\n\nCuenta emisora: sgfceit26@gmail.com",
      ui.ButtonSet.YES_NO
    );
    if (resp === ui.Button.YES) {
      enviarLote2_Oficial();
      ui.alert("✅ Proceso de Lote 2 finalizado.");
    }
  } catch (e) {
    // Si se ejecutó directamente desde el editor de Apps Script (sin UI):
    Logger.log("Ejecutando Lote 2 directamente...");
    enviarLote2_Oficial();
  }
}

function menuConsultarCuota() {
  verificarEstadoEnvios();
  try {
    var cuota = MailApp.getRemainingDailyQuota();
    SpreadsheetApp.getUi().alert("📊 Cuota Restante", "Tienes " + cuota + " correos disponibles hoy.", SpreadsheetApp.getUi().ButtonSet.OK);
  } catch(e) {}
}

// ============================================================================
// 6. DISPATCHER DE CORREO OFICIAL CON LOGO SGF 2026
// ============================================================================
function enviarCorreoIndividual(destinatario, gamertag) {
  var tag = gamertag || "Competidor SGF";
  var linkEncuesta = "https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(tag) + "&email=" + encodeURIComponent(destinatario);
  var htmlTemplate = obtenerPlantillaEmailHtml(tag, destinatario, linkEncuesta);
  var asunto = "Tu opinión sobre el Students Gaming Festival 2026 - Evaluación Oficial CEIT";

  var textoPlano = "Estimado/a participante " + tag + ":\n\n" +
    "Agradecemos tu destacada participación en el Students Gaming Festival 2026.\n\n" +
    "Te invitamos a completar la Evaluación Oficial de Experiencia en el siguiente enlace:\n" +
    linkEncuesta + "\n\n" +
    "Tu evaluación define los setups, reglas y torneos del SGF 2027.\n\n" +
    "Comité Organizador Oficial SGF 2026 - CEIT y PUCMM";

  try {
    GmailApp.sendEmail(destinatario, asunto, textoPlano, {
      htmlBody: htmlTemplate,
      name: "CEIT - Students Gaming Festival 2026"
    });
  } catch (e1) {
    MailApp.sendEmail({
      to: destinatario,
      subject: asunto,
      body: textoPlano,
      htmlBody: htmlTemplate,
      name: "CEIT - Students Gaming Festival 2026"
    });
  }
}

function obtenerPlantillaEmailHtml(gamertag, email, linkPersonalizado) {
  var urlFinal = linkPersonalizado || ("https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(gamertag) + "&email=" + encodeURIComponent(email));

  var baseHtml = '<!DOCTYPE html>\n' +
    '<html lang="es" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <meta name="color-scheme" content="light dark">\n' +
    '  <title>Evaluación de Experiencia - SGF 2026</title>\n' +
    '  <style>\n' +
    '    :root { color-scheme: light dark; supported-color-schemes: light dark; }\n' +
    '    body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }\n' +
    '    .email-wrapper { background-color: #f3f4f6; }\n' +
    '    .email-container { background-color: #ffffff; border: 1px solid #e5e7eb; }\n' +
    '    .title-text { color: #111827; }\n' +
    '    .body-text { color: #374151; }\n' +
    '    .muted-text { color: #6b7280; }\n' +
    '    .divider-line { background-color: #e5e7eb; }\n' +
    '    .footer-section { background-color: #fafafa; border-top: 1px solid #e5e7eb; }\n' +
    '    @media (prefers-color-scheme: dark) {\n' +
    '      .email-wrapper { background-color: #0f0f12 !important; }\n' +
    '      .email-container { background-color: #18181c !important; border-color: #27272a !important; }\n' +
    '      .title-text { color: #ffffff !important; }\n' +
    '      .body-text { color: #d1d5db !important; }\n' +
    '      .muted-text { color: #9ca3af !important; }\n' +
    '      .divider-line { background-color: #27272a !important; }\n' +
    '      .footer-section { background-color: #141416 !important; border-top-color: #27272a !important; }\n' +
    '    }\n' +
    '  </style>\n' +
    '</head>\n' +
    '<body class="email-wrapper" style="margin: 0; padding: 0; background-color: #f3f4f6;">\n' +
    '  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-wrapper" style="padding: 36px 12px;">\n' +
    '    <tr>\n' +
    '      <td align="center">\n' +
    '        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-container" style="max-width: 560px; background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">\n' +
    '          <tr>\n' +
    '            <td align="center" style="padding: 36px 32px 20px 32px;">\n' +
    '              <img src="https://sgf26-feedback.vercel.app/images/logo.png" alt="SGF 2026" width="130" style="display: block; max-width: 130px; height: auto; margin: 0 auto 16px auto; border: 0;">\n' +
    '              <h1 class="title-text" style="margin: 0; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.3px;">Evaluación de Experiencia</h1>\n' +
    '              <p class="muted-text" style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">Students Gaming Festival 2026 • CEIT & PUCMM</p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '          <tr><td style="padding: 0 32px;"><div class="divider-line" style="height: 1px; background-color: #e5e7eb;"></div></td></tr>\n' +
    '          <tr>\n' +
    '            <td class="body-text" style="padding: 28px 32px 24px 32px; font-size: 15px; line-height: 1.65; color: #374151;">\n' +
    '              <p style="margin: 0 0 16px 0;">Hola <strong style="color: #6d28d9;">{{GamerTag}}</strong>,</p>\n' +
    '              <p style="margin: 0 0 16px 0;">Muchas gracias por haber participado en el <strong>Students Gaming Festival 2026</strong>. Tu presencia y espíritu competitivo fueron fundamentales para hacer posible esta edición.</p>\n' +
    '              <p style="margin: 0 0 16px 0;">Queremos conocer tu opinión sobre la puntualidad, los setups, el arbitraje, las rifas y la organización general del evento para seguir mejorando de cara al <strong>SGF 2027</strong>.</p>\n' +
    '              <p class="muted-text" style="margin: 0 0 24px 0; font-size: 14px; color: #6b7280;">La encuesta es breve y te tomará aproximadamente <strong>1 minuto</strong>.</p>\n' +
    '              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 8px 0 24px 0;">\n' +
    '                <tr>\n' +
    '                  <td align="center">\n' +
    '                    <a href="{{SURVEY_LINK}}" target="_blank" style="display: inline-block; background-color: #6d28d9; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">\n' +
    '                      Completar encuesta de experiencia\n' +
    '                    </a>\n' +
    '                  </td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '              <p class="muted-text" style="margin: 0 0 28px 0; font-size: 12px; color: #6b7280; word-break: break-all;">\n' +
    '                Si el botón no abre, puedes acceder con este enlace:<br>\n' +
    '                <a href="{{SURVEY_LINK}}" target="_blank" style="color: #6d28d9; text-decoration: underline;">{{SURVEY_LINK}}</a>\n' +
    '              </p>\n' +
    '              <p class="muted-text" style="margin: 0; font-size: 13px; color: #6b7280; line-height: 1.5;">\n' +
    '                Atentamente,<br>\n' +
    '                <strong class="title-text" style="color: #111827;">Comité Organizador Oficial SGF 2026</strong><br>\n' +
    '                Comité de Estudiantes de Ingeniería Telemática (CEIT)<br>\n' +
    '                Pontificia Universidad Católica Madre y Maestra (PUCMM)\n' +
    '              </p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '          <tr>\n' +
    '            <td align="center" class="footer-section" style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background-color: #fafafa;">\n' +
    '              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 12px;">\n' +
    '                <tr>\n' +
    '                  <td style="padding: 0 10px;"><img src="https://sgf26-feedback.vercel.app/images/pucmm.png" alt="PUCMM" height="22" style="display: block; opacity: 0.75; border: 0;"></td>\n' +
    '                  <td class="muted-text" style="color: #9ca3af; font-size: 12px;">•</td>\n' +
    '                  <td style="padding: 0 10px;"><img src="https://sgf26-feedback.vercel.app/images/ceit.png" alt="CEIT" height="22" style="display: block; opacity: 0.75; border: 0;"></td>\n' +
    '                </tr>\n' +
    '              </table>\n' +
    '              <p class="muted-text" style="margin: 0; font-size: 11px; color: #9ca3af;">Students Gaming Festival 2026 • PUCMM, Campus Santiago</p>\n' +
    '            </td>\n' +
    '          </tr>\n' +
    '        </table>\n' +
    '      </td>\n' +
    '    </tr>\n' +
    '  </table>\n' +
    '</body>\n' +
    '</html>';

  return baseHtml
    .split("{{SURVEY_LINK}}").join(urlFinal)
    .split("{{GamerTag}}").join(gamertag)
    .split("{{Email}}").join(email);
}

// ============================================================================
// 7. LISTA OFICIAL DE 172 PARTICIPANTES Y ENVÍO POR LOTES
// ============================================================================
var LISTA_PARTICIPANTES = [

];

// ============================================================================
// FUNCIONES DE DESPACHO MASIVO
// ============================================================================
function enviarLote1_Oficial() {
  Logger.log("🚀 Iniciando envío del Lote 1 (Participantes 1 al 86)...");
  enviarRangoParticipantes(0, 86, "Lote 1");
}

function enviarLote2_Oficial() {
  Logger.log("🚀 Iniciando envío del Lote 2 (Participantes 87 al 172)...");
  enviarRangoParticipantes(86, LISTA_PARTICIPANTES.length, "Lote 2");
}

function enviarRangoParticipantes(inicio, fin, nombreLote) {
  var cuotaInicial = MailApp.getRemainingDailyQuota();
  Logger.log("📊 Cuota antes de iniciar: " + cuotaInicial);
  
  if (cuotaInicial <= 0) {
    var msg = "⚠️ Sin cuota disponible hoy en sgfceit26@gmail.com. Espera 24 horas para que Google renueve tu límite diario.";
    Logger.log(msg);
    try { SpreadsheetApp.getUi().alert("⚠️ Sin Cuota", msg, SpreadsheetApp.getUi().ButtonSet.OK); } catch(e){}
    return;
  }
  
  var exitosos = 0;
  var fallidos = 0;
  
  for (var i = inicio; i < fin && i < LISTA_PARTICIPANTES.length; i++) {
    var cuotaActual = MailApp.getRemainingDailyQuota();
    if (cuotaActual <= 1) {
      var alerta = "⚠️ Límite de envíos alcanzado hoy en Google (quedan " + cuotaActual + "). Se pausó el envío en el participante #" + (i + 1);
      Logger.log(alerta);
      try { SpreadsheetApp.getUi().alert("Alerta de Cuota Diaria", alerta, SpreadsheetApp.getUi().ButtonSet.OK); } catch(e){}
      break;
    }

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
  Logger.log("📦 Lote 1: Participantes 1 al 86 (86 correos)");
  Logger.log("📦 Lote 2: Participantes 87 al 172 (86 correos)");
}