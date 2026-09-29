/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Sistema: Webhook de Feedback + Dashboard API + Envío en 2 Tandas Automáticas
 * CEIT & PUCMM
 *
 * ESTRATEGIA DE 2 TANDAS (Para respetar el límite de 100 correos/día de Gmail):
 * - Tanda 1 (Hoy): 86 participantes
 * - Tanda 2 (Mañana): 85 participantes
 * Total: 171 participantes (100% libre de bloqueos de cuota)
 */

var MI_CORREO_VALIDACION = "dauryrodriguez2005@gmail.com";
var MI_GAMERTAG = "Daury (Organizador)";

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
];


// ============================================================================
// 1. FUNCIONES PRINCIPALES DE ENVÍO
// ============================================================================

/**
 * Envía un correo de prueba únicamente a tu correo personal para verificar antes de despachar.
 */
function enviarPruebaDirecta() {
  Logger.log("⏳ Preparando correo oficial para: " + MI_CORREO_VALIDACION + "...");
  enviarCorreoIndividual(MI_CORREO_VALIDACION, MI_GAMERTAG);
  Logger.log("🚀 ¡CORREO ENVIADO CON ÉXITO A: " + MI_CORREO_VALIDACION + "!");
  Logger.log("Revisa tu bandeja de entrada o spam en Gmail.");
}

/**
 * Carga o sincroniza los 171 participantes en la hoja 'Participantes' del Google Sheet.
 */
function inicializarHojaParticipantes() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Participantes");

  if (!sheet) {
    sheet = ss.insertSheet("Participantes");
  }

  // Si ya tiene filas de datos, no sobrescribir para proteger el estado de envíos previos
  if (sheet.getLastRow() > 1) {
    Logger.log("ℹ️ La hoja 'Participantes' ya contiene " + (sheet.getLastRow() - 1) + " registros.");
    return sheet;
  }

  // Encabezados oficiales
  sheet.clear();
  sheet.appendRow(["Email", "GamerTag / Nombre", "Estado de Envío", "Fecha de Envío", "Lote Asignado"]);
  var headerRange = sheet.getRange(1, 1, 1, 5);
  headerRange.setBackground("#16082b");
  headerRange.setFontColor("#a855f7");
  headerRange.setFontWeight("bold");
  sheet.setFrozenRows(1);

  // Cargar los 171 registros distribuidos en Tanda 1 y Tanda 2
  var filas = [];
  for (var i = 0; i < LISTA_PARTICIPANTES.length; i++) {
    var p = LISTA_PARTICIPANTES[i];
    var lote = (i < 86) ? "Tanda 1" : "Tanda 2";
    filas.push([p.email, p.gamertag, "PENDIENTE", "", lote]);
  }

  sheet.getRange(2, 1, filas.length, 5).setValues(filas);
  sheet.setColumnWidth(1, 280);
  sheet.setColumnWidth(2, 240);
  sheet.setColumnWidth(3, 170);
  sheet.setColumnWidth(4, 180);
  sheet.setColumnWidth(5, 120);

  Logger.log("✅ Se cargaron exitosamente los " + filas.length + " participantes en la hoja 'Participantes'.");
  return sheet;
}

/**
 * EJECUTAR TANDA 1: Envía los primeros 86 correos hoy.
 */
function ejecutarTanda1() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Participantes") || inicializarHojaParticipantes();

  var data = sheet.getDataRange().getValues();
  var totalEnviados = 0;
  var limiteTanda1 = 86;

  Logger.log("🚀 INICIANDO EJECUCIÓN DE TANDA 1 (Máximo 86 correos)...");

  for (var r = 1; r < data.length; r++) {
    var email = String(data[r][0]).trim();
    var gamertag = String(data[r][1]).trim();
    var estado = String(data[r][2]).trim();
    var lote = String(data[r][4]).trim();

    // Solo procesar participantes pendientes de Tanda 1
    if (lote === "Tanda 1" && estado === "PENDIENTE") {
      // Verificar cuota restante de Gmail por seguridad
      var cuotaRestante = MailApp.getRemainingDailyQuota();
      if (cuotaRestante < 5) {
        Logger.log("⚠️ ALERTA: Cuota diaria de Gmail casi agotada (" + cuotaRestante + " restantes). Pausando envío seguro.");
        break;
      }

      try {
        enviarCorreoIndividual(email, gamertag);
        var ahora = new Date().toLocaleString();
        sheet.getRange(r + 1, 3).setValue("ENVIADO - TANDA 1").setFontColor("#10b981");
        sheet.getRange(r + 1, 4).setValue(ahora);

        totalEnviados++;
        Logger.log("[" + totalEnviados + "/" + limiteTanda1 + "] ✅ Enviado a: " + email + " (" + gamertag + ")");

        // Pausa breve para evitar saturación de envío de Gmail
        Utilities.sleep(350);
      } catch (err) {
        Logger.log("❌ Error enviando a " + email + ": " + err.toString());
        sheet.getRange(r + 1, 3).setValue("ERROR: " + err.message).setFontColor("#ef4444");
      }
    }
  }

  Logger.log("=================================================");
  Logger.log("🏁 TANDA 1 FINALIZADA CON ÉXITO.");
  Logger.log("Se enviaron: " + totalEnviados + " correos hoy.");
  Logger.log("Quedan 85 correos asignados para la TANDA 2 de mañana.");
  Logger.log("=================================================");
}

/**
 * EJECUTAR TANDA 2: Envía los 85 correos restantes.
 */
function ejecutarTanda2() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Participantes") || inicializarHojaParticipantes();

  var data = sheet.getDataRange().getValues();
  var totalEnviados = 0;

  Logger.log("🚀 INICIANDO EJECUCIÓN DE TANDA 2 (Restantes 85 correos)...");

  for (var r = 1; r < data.length; r++) {
    var email = String(data[r][0]).trim();
    var gamertag = String(data[r][1]).trim();
    var estado = String(data[r][2]).trim();

    // Procesar cualquier participante que siga pendiente
    if (estado === "PENDIENTE") {
      var cuotaRestante = MailApp.getRemainingDailyQuota();
      if (cuotaRestante < 5) {
        Logger.log("⚠️ ALERTA: Cuota diaria de Gmail casi agotada (" + cuotaRestante + " restantes). Pausando.");
        break;
      }

      try {
        enviarCorreoIndividual(email, gamertag);
        var ahora = new Date().toLocaleString();
        sheet.getRange(r + 1, 3).setValue("ENVIADO - TANDA 2").setFontColor("#3b82f6");
        sheet.getRange(r + 1, 4).setValue(ahora);

        totalEnviados++;
        Logger.log("[" + totalEnviados + "] ✅ Enviado a: " + email + " (" + gamertag + ")");
        Utilities.sleep(350);
      } catch (err) {
        Logger.log("❌ Error enviando a " + email + ": " + err.toString());
        sheet.getRange(r + 1, 3).setValue("ERROR: " + err.message).setFontColor("#ef4444");
      }
    }
  }

  Logger.log("=================================================");
  Logger.log("🎉 ¡TANDA 2 FINALIZADA! Se enviaron: " + totalEnviados + " correos.");
  Logger.log("Todos los participantes registrados han sido contactados.");
  Logger.log("=================================================");
}

/**
 * Programa automáticamente la Tanda 2 para que Google la ejecute 24 horas después en la nube.
 */
function programarTanda2Automatica() {
  // Limpiar activadores previos para evitar duplicados
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === "ejecutarTanda2") {
      ScriptApp.deleteTrigger(triggers[i]);
    }
  }

  // Crear temporizador para dentro de 24 horas
  ScriptApp.newTrigger("ejecutarTanda2")
    .timeBased()
    .after(24 * 60 * 60 * 1000)
    .create();

  Logger.log("⏰ ¡Tanda 2 programada con éxito para ejecutarse automáticamente en 24 horas!");
}

// ============================================================================
// 2. RECEPTOR WEBHOOK (doPost) - Recibe las respuestas y evita duplicados
// ============================================================================
function doPost(e) {
  if (!e || !e.postData) {
    Logger.log("⚠️ Ejecución manual en el editor detectada. Redirigiendo a enviarPruebaDirecta...");
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

    // Encabezados si está vacía
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

    // Insertar fila
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
  if (!e || !e.parameter) {
    Logger.log("⚠️ Ejecución manual detectada en doGet. Redirigiendo a enviarPruebaDirecta...");
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

    // Datos del Dashboard Ejecutivo
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
        if (String(row[c]).trim() !== "") {
          tieneContenido = true;
          break;
        }
      }
      if (!tieneContenido) continue;
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
// 4. MENÚ INTERACTIVO EN GOOGLE SHEETS
// ============================================================================
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("🎮 SGF 2026 Feedback")
    .addItem("✉️ 0. Enviar Prueba a mi Correo Personal", "menuEnviarPrueba")
    .addSeparator()
    .addItem("📋 1. Cargar Lista de 171 Participantes", "menuCargarParticipantes")
    .addItem("🚀 2. Ejecutar TANDA 1 (Enviar 86 Hoy)", "menuEjecutarTanda1")
    .addItem("⏰ 3. Programar TANDA 2 Automática (Mañana)", "menuProgramarTanda2")
    .addItem("⏩ 4. Ejecutar TANDA 2 Ahora (Restantes 85)", "menuEjecutarTanda2")
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

  if (promptRes.getSelectedButton() !== ui.Button.OK) return;

  var emailDestino = promptRes.getResponseText().trim() || MI_CORREO_VALIDACION;
  try {
    enviarCorreoIndividual(emailDestino, MI_GAMERTAG);
    ui.alert("✅ Correo Enviado", "Se envió el correo oficial a: " + emailDestino + "\n\nRevisa tu bandeja de entrada o spam.", ui.ButtonSet.OK);
  } catch (err) {
    ui.alert("❌ Error", err.toString(), ui.ButtonSet.OK);
  }
}

function menuCargarParticipantes() {
  var sheet = inicializarHojaParticipantes();
  SpreadsheetApp.getUi().alert(
    "📋 Lista de Participantes Lista",
    "Se han configurado los 171 participantes en la hoja 'Participantes':\n\n" +
    "- Tanda 1 (Hoy): 86 participantes asignados.\n" +
    "- Tanda 2 (Mañana): 85 participantes asignados.\n\n" +
    "Puedes proceder con el paso '2. Ejecutar TANDA 1' cuando desees.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function menuEjecutarTanda1() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.alert(
    "🚀 Iniciar Tanda 1 (86 Correos)",
    "¿Deseas enviar los primeros 86 correos hoy?\n\nEsto consumirá 86 envíos de tu cuota diaria de Google.",
    ui.ButtonSet.YES_NO
  );

  if (res !== ui.Button.YES) return;

  ejecutarTanda1();

  ui.alert(
    "✅ Tanda 1 Finalizada",
    "Se enviaron los 86 correos de la Tanda 1 con éxito.\n\n" +
    "La hoja 'Participantes' fue actualizada con fecha y estado de cada competidor.\n" +
    "Ahora puedes usar la opción '3. Programar TANDA 2 Automática' para que mañana se envíen los 85 restantes.",
    ui.ButtonSet.OK
  );
}

function menuProgramarTanda2() {
  programarTanda2Automatica();
  SpreadsheetApp.getUi().alert(
    "⏰ Tanda 2 Programada",
    "La Tanda 2 (85 participantes restantes) se ejecutará automáticamente en 24 horas desde los servidores de Google.\n\n" +
    "No necesitas tener la computadora encendida.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

function menuEjecutarTanda2() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.alert(
    "⏩ Iniciar Tanda 2 Manualmente",
    "¿Deseas enviar los 85 correos restantes de la Tanda 2 ahora mismo?",
    ui.ButtonSet.YES_NO
  );

  if (res !== ui.Button.YES) return;

  ejecutarTanda2();

  ui.alert(
    "🎉 Proceso Masivo Completado",
    "Se han enviado los correos de la Tanda 2 con éxito.\n¡Todos los participantes han recibido su enlace personalizado!",
    ui.ButtonSet.OK
  );
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
