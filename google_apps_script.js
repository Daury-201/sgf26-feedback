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

// ============================================================================
// 1. FUNCIÓN PRINCIPAL DE PRUEBA (EJECUCIÓN DIRECTA)
// ============================================================================
/**
 * Selecciona 'enviarPruebaDirecta' en el menú desplegable superior y haz clic en 'Ejecutar'.
 */
function enviarPruebaDirecta() {
  var emailDestino = "dauryrodriguez2005@gmail.com";
  var gamertag = "Daury (Organizador)";

  Logger.log("⏳ Preparando correo oficial para: " + emailDestino + "...");
  enviarCorreoIndividual(emailDestino, gamertag);
  Logger.log("🚀 ¡CORREO ENVIADO CON ÉXITO A: " + emailDestino + "!");
  Logger.log("Revisa tu bandeja de entrada o spam en Gmail.");
}

// ============================================================================
// 2. RECEPTOR WEBHOOK (doPost) - Recibe las respuestas y evita duplicados
// ============================================================================
function doPost(e) {
  // SALVAGUARDA: Si se hace clic en "Ejecutar" teniendo seleccionado doPost en el editor
  if (!e || !e.postData) {
    Logger.log("⚠️ Se ejecutó doPost manualmente sin datos web. Redirigiendo a enviarPruebaDirecta...");
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
      var correosRegistrados = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
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

    // Insertar nueva respuesta
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
// 3. API DASHBOARD + VALIDACIÓN DE CORREO ÚNICO (doGet)
// ============================================================================
function doGet(e) {
  // SALVAGUARDA: Si se hace clic en "Ejecutar" teniendo seleccionado doGet en el editor
  if (!e || !e.parameter) {
    Logger.log("⚠️ Se ejecutó doGet manualmente. Redirigiendo a enviarPruebaDirecta...");
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
        var emails = sheet.getRange(2, 4, sheet.getLastRow() - 1, 1).getValues();
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

      // Omitir filas vacías (si el organizador borró celdas en la hoja)
      var tieneContenido = false;
      for (var c = 0; c < row.length; c++) {
        if (String(row[c]).trim() !== "") {
          tieneContenido = true;
          break;
        }
      }
      if (!tieneContenido) continue;

      // Asegurar que tenga al menos identificador o GamerTag
      if (!row[0] && !row[2] && !row[5]) continue;

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

  var emailDestino = promptRes.getResponseText().trim() || "dauryrodriguez2005@gmail.com";
  if (!emailDestino || emailDestino.indexOf("@") === -1) {
    ui.alert("⚠️ Correo Inválido", "Por favor ingresa una dirección de correo válida.", ui.ButtonSet.OK);
    return;
  }

  try {
    enviarCorreoIndividual(emailDestino, "Daury (Organizador)");
    ui.alert(
      "✅ ¡Correo de Validación Enviado!",
      "Se ha enviado el correo oficial a: " + emailDestino + "\n\nRevisa tu bandeja de entrada (o carpeta de spam si es la primera vez).",
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
    "Tu cuenta de Google tiene actualmente " + cuota + " correos restantes disponibles hoy.\n\n" +
    "- Cuentas personales @gmail.com: 100 correos/día.\n" +
    "- Cuentas Google Workspace / PUCMM: 1,500 correos/día.",
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

  var asunto = "🎮 Tu opinión sobre el Students Gaming Festival 2026 • Evaluación Oficial CEIT";

  var textoPlano = "Estimado/a participante " + tag + ":\n\n" +
    "En nombre del Comité Organizador del Students Gaming Festival 2026, el CEIT y la PUCMM, agradecemos tu destacada participación.\n\n" +
    "Te invitamos a completar la Evaluación Oficial de Experiencia en el siguiente enlace:\n" +
    linkEncuesta + "\n\n" +
    "Tu evaluación define los estándares, setups y juegos del SGF 2027.\n" +
    "Tiempo estimado: 1 minuto.\n\n" +
    "Comité Organizador Oficial SGF 2026 • CEIT & PUCMM";

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
// 6. GENERADOR DE PLANTILLA HTML OFICIAL CYBERPUNK
// ============================================================================
function obtenerPlantillaEmailHtml(gamertag, email, linkPersonalizado) {
  var urlFinal = linkPersonalizado || ("https://sgf26-feedback.vercel.app/?gamertag=" + encodeURIComponent(gamertag) + "&email=" + encodeURIComponent(email));

  var baseHtml = '<!DOCTYPE html>\n<html lang="es">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Evaluación Oficial de Experiencia • Students Gaming Festival 2026</title>\n    <!--[if mso]>\n    <style type="text/css">\n      body, table, td, p, a { font-family: \'Segoe UI\', Arial, sans-serif !important; }\n    </style>\n    <![endif]-->\n</head>\n<body style="margin: 0; padding: 0; background-color: #05020a; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #e4e4e7;">\n\n    <!-- Pre-header invisible para visualización en bandeja de entrada -->\n    <div style="display: none; font-size: 1px; color: #05020a; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">\n        Consulta Oficial de Competidores: Tu evaluación define los estándares, setups y juegos del SGF 2027.\n    </div>\n\n    <!-- Wrapper Exterior -->\n    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #05020a; min-height: 100vh; padding: 36px 12px;">\n        <tr>\n            <td align="center">\n\n                <!-- Tarjeta Principal (Máximo 620px) -->\n                <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background: #0c0418; border: 1px solid rgba(168, 85, 247, 0.32); border-radius: 16px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.9);">\n                    \n                    <!-- Línea de Acento Neón Superior -->\n                    <tr>\n                        <td height="4" style="background: linear-gradient(90deg, #a855f7 0%, #06b6d4 50%, #f59e0b 100%);"></td>\n                    </tr>\n\n                    <!-- Cabecera Institucional con Logo Oficial -->\n                    <tr>\n                        <td align="center" style="padding: 40px 30px 24px 30px; background: linear-gradient(180deg, rgba(168, 85, 247, 0.14) 0%, transparent 100%);">\n                            \n                            <!-- Logo Oficial del Festival -->\n                            <img src="https://sgf26-feedback.vercel.app/images/logo.png" alt="Students Gaming Festival 2026" width="170" style="display: block; max-width: 170px; height: auto; margin: 0 auto 20px auto; border: 0; outline: none; filter: drop-shadow(0 0 16px rgba(168, 85, 247, 0.5));">\n\n                            <!-- Badge de Categoría Oficial -->\n                            <table role="presentation" border="0" cellpadding="0" cellspacing="0">\n                                <tr>\n                                    <td style="background: rgba(168, 85, 247, 0.16); border: 1px solid rgba(168, 85, 247, 0.45); border-radius: 9999px; padding: 5px 18px; text-align: center;">\n                                        <span style="font-size: 11px; font-weight: 800; letter-spacing: 2px; color: #c084fc; text-transform: uppercase;">\n                                            COMUNICADO OFICIAL • CEIT\n                                        </span>\n                                    </td>\n                                </tr>\n                            </table>\n\n                            <h1 style="margin: 18px 0 6px 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: 0.8px; text-transform: uppercase; line-height: 1.25;">\n                                EVALUACIÓN OFICIAL DE EXPERIENCIA\n                            </h1>\n                            <p style="margin: 0; font-size: 13px; color: #94a3b8; letter-spacing: 0.5px;">\n                                Students Gaming Festival 2026 • CEIT & PUCMM\n                            </p>\n                        </td>\n                    </tr>\n\n                    <!-- Separador de Precisión -->\n                    <tr>\n                        <td style="padding: 0 40px;">\n                            <div style="height: 1px; background: linear-gradient(90deg, transparent 0%, rgba(168, 85, 247, 0.45) 50%, transparent 100%);"></div>\n                        </td>\n                    </tr>\n\n                    <!-- Cuerpo Principal del Correo -->\n                    <tr>\n                        <td style="padding: 32px 42px 20px 42px; color: #e4e4e7; font-size: 15px; line-height: 1.75;">\n                            \n                            <p style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #ffffff;">\n                                Estimado/a participante <span style="color: #c084fc;">{{GamerTag}}</span>:\n                            </p>\n\n                            <p style="margin: 0 0 16px 0; color: #d4d4d8;">\n                                En nombre del Comité Organizador del <strong>Students Gaming Festival 2026</strong>, el <strong>CEIT</strong> y la <strong>PUCMM</strong>, agradecemos tu destacada participación y entrega competitiva en esta edición.\n                            </p>\n\n                            <p style="margin: 0 0 24px 0; color: #a1a1aa;">\n                                Con el propósito de perfeccionar la infraestructura técnica, el flujo de partidas y la calidad de los setups para el <strong>SGF 2027</strong>, hemos habilitado la Consulta Oficial de Satisfacción para todos los competidores registrados.\n                            </p>\n\n                            <!-- Cuadrícula Ejecutiva de 3 Ejes de Evaluación con SVG Vectoriales -->\n                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 26px 0; background: rgba(16, 7, 30, 0.85); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; overflow: hidden;">\n                                <tr>\n                                    <!-- Eje 1: Calidad Competitiva -->\n                                    <td width="33%" style="text-align: center; padding: 18px 12px; border-right: 1px solid rgba(255, 255, 255, 0.06);" valign="top">\n                                        <div style="margin-bottom: 8px;">\n                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">\n                                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>\n                                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>\n                                                <path d="M4 22h16"/>\n                                                <path d="M10 14.66V17c0 .55-.45 1-1 1H8v2h8v-2h-1c-.55 0-1-.45-1-1v-2.34"/>\n                                                <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z"/>\n                                            </svg>\n                                        </div>\n                                        <div style="font-size: 12px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 0.5px;">Desempeño</div>\n                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">Flujo de llaves y arbitraje oficial</div>\n                                    </td>\n\n                                    <!-- Eje 2: Infraestructura Técnica -->\n                                    <td width="33%" style="text-align: center; padding: 18px 12px; border-right: 1px solid rgba(255, 255, 255, 0.06);" valign="top">\n                                        <div style="margin-bottom: 8px;">\n                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">\n                                                <rect x="2" y="6" width="20" height="12" rx="6"/>\n                                                <path d="M6 12h4m-2-2v4"/>\n                                                <circle cx="15" cy="11" r="1" fill="#06b6d4"/>\n                                                <circle cx="18" cy="13" r="1" fill="#06b6d4"/>\n                                            </svg>\n                                        </div>\n                                        <div style="font-size: 12px; font-weight: 800; color: #06b6d4; text-transform: uppercase; letter-spacing: 0.5px;">Hardware</div>\n                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">Consolas, monitores y conectividad</div>\n                                    </td>\n\n                                    <!-- Eje 3: Visión y Mejoras 2027 -->\n                                    <td width="33%" style="text-align: center; padding: 18px 12px;" valign="top">\n                                        <div style="margin-bottom: 8px;">\n                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#c084fc" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display: inline-block;">\n                                                <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/>\n                                                <path d="M9 18h6"/>\n                                                <path d="M10 22h4"/>\n                                            </svg>\n                                        </div>\n                                        <div style="font-size: 12px; font-weight: 800; color: #c084fc; text-transform: uppercase; letter-spacing: 0.5px;">SGF 2027</div>\n                                        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px; line-height: 1.4;">Nuevos títulos y sugerencias</div>\n                                    </td>\n                                </tr>\n                            </table>\n\n                            <!-- Ficha Informativa de Seguridad y Tiempo -->\n                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 0 0 30px 0; background: rgba(255, 255, 255, 0.02); border-left: 3px solid #06b6d4; padding: 12px 16px; border-radius: 0 8px 8px 0;">\n                                <tr>\n                                    <td>\n                                        <div style="font-size: 12px; color: #94a3b8; line-height: 1.6;">\n                                            <span style="display: inline-block; margin-right: 18px;">\n                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>\n                                                Tiempo estimado: <strong style="color: #ffffff;">1 min</strong>\n                                            </span>\n                                            <span style="display: inline-block;">\n                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: -2px; margin-right: 5px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>\n                                                Tratamiento: <strong style="color: #ffffff;">Datos confidenciales y seguros</strong>\n                                            </span>\n                                        </div>\n                                    </td>\n                                </tr>\n                            </table>\n\n                            <!-- Botón de Llamado a la Acción -->\n                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 10px 0 20px 0;">\n                                <tr>\n                                    <td align="center">\n                                        <a href="{{SURVEY_LINK}}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #9333ea 0%, #06b6d4 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 800; letter-spacing: 1px; padding: 17px 42px; border-radius: 8px; box-shadow: 0 8px 30px rgba(147, 51, 234, 0.45); text-transform: uppercase;">\n                                            COMPLETAR EVALUACIÓN DE EXPERIENCIA\n                                        </a>\n                                    </td>\n                                </tr>\n                            </table>\n\n                        </td>\n                    </tr>\n\n                    <!-- Firma Institucional -->\n                    <tr>\n                        <td style="padding: 20px 42px 35px 42px; color: #a1a1aa; font-size: 13px; line-height: 1.6; border-top: 1px solid rgba(255, 255, 255, 0.06);">\n                            <p style="margin: 0 0 4px 0; color: #ffffff; font-weight: 700; font-size: 14px;">\n                                Comité Organizador Oficial • SGF 2026\n                            </p>\n                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">\n                                Comité de Estudiantes de Ingeniería Telemática - CEIT<br>\n                                Pontificia Universidad Católica Madre y Maestra - PUCMM\n                            </p>\n                        </td>\n                    </tr>\n\n                    <!-- Footer Oficial con Logos Institucionales -->\n                    <tr>\n                        <td align="center" style="background-color: #06020c; padding: 26px 30px; border-top: 1px solid rgba(255, 255, 255, 0.06); font-size: 11px; color: #52525b; line-height: 1.6;">\n                            \n                            <!-- Logos PUCMM y CEIT -->\n                            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 14px;">\n                                <tr>\n                                    <td style="padding: 0 12px;">\n                                        <img src="https://sgf26-feedback.vercel.app/images/pucmm.png" alt="PUCMM" height="26" style="display: block; opacity: 0.65; border: 0; filter: grayscale(30%);">\n                                    </td>\n                                    <td style="color: rgba(255, 255, 255, 0.2); font-size: 14px;">•</td>\n                                    <td style="padding: 0 12px;">\n                                        <img src="https://sgf26-feedback.vercel.app/images/ceit.png" alt="CEIT" height="26" style="display: block; opacity: 0.65; border: 0; filter: grayscale(30%);">\n                                    </td>\n                                </tr>\n                            </table>\n\n                            <p style="margin: 0 0 4px 0;">\n                                Este mensaje institucional fue enviado a los participantes registrados del Students Gaming Festival 2026.\n                            </p>\n                            <p style="margin: 0; color: #71717a;">\n                                © 2026 Students Gaming Festival. Todos los derechos reservados.<br>\n                                PUCMM, Campus Santiago • República Dominicana.\n                            </p>\n                        </td>\n                    </tr>\n\n                </table>\n\n            </td>\n        </tr>\n    </table>\n\n</body>\n</html>\n';

  var resultado = baseHtml
    .split("{{SURVEY_LINK}}").join(urlFinal)
    .split("https://sgf26-feedback.vercel.app/?gamertag={{GamerTag}}&email={{Email}}").join(urlFinal)
    .split("{{GamerTag}}").join(gamertag)
    .split("{{Email}}").join(email);

  return resultado;
}
