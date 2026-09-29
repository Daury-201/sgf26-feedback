/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Sistema: Webhook de Feedback + Dashboard API + Envío de Validación Personal
 * CEIT & PUCMM
 *
 * ============================================================================
 * CORREO CONFIGURADO PARA TU PRUEBA:
 * dauryrodriguez2005@gmail.com
 * ============================================================================
 */

var MI_CORREO_VALIDACION = "dauryrodriguez2005@gmail.com";
var MI_GAMERTAG = "Daury (Organizador)";

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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
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
    .addItem("📊 Consultar Cuota Diaria Restante", "menuConsultarCuota")
    .addToUi();
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
