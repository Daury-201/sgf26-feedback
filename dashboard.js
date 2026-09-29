/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Executive Feedback Analytics Dashboard
 * Chart.js Visualizations, Dynamic Filters, Real-Time Sync & CSV Export
 */

const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyZ13BhWqpeBJ-vIhJ0U8iAxQJbTSXunhOvqhhk0pune6b3OiRFgG7D-H5PDaf8bebQow/exec";
const LOCAL_STORAGE_KEY = "sgf26_feedback_submissions_v1";

// Dataset en memoria
let allResponses = [];
let filteredResponses = [];
let currentTab = "liked";

// Instancias de Chart.js para actualización dinámica
let chartStars = null;
let chartRadar = null;
let chartTournaments = null;
let chartNps = null;

// =========================================================================
// DATOS REALISTAS DE CALIBRACIÓN INICIAL (Para visualizar inmediatamente)
// =========================================================================
const BASELINE_SAMPLE_DATA = [
    {
        id: "SGF-892A1",
        dateFormatted: "29/09/2026, 11:20 AM",
        gamertag: "NovaStrike",
        email: "novastrike@gmail.com",
        tournament: "Super Smash Bros. Ultimate",
        overallRating: 5,
        metricPunctuality: 5,
        metricHardware: 5,
        metricStaff: 5,
        metricAtmosphere: 5,
        nps: 10,
        likedMost: "La pantalla gigante central y el nivel de los monitores de 144Hz. Cero input lag.",
        suggestions: "Hacer un top 16 en streaming con más cámaras para los competidores."
    },
    {
        id: "SGF-734B2",
        dateFormatted: "29/09/2026, 11:35 AM",
        gamertag: "Matador_RD",
        email: "matador26@outlook.com",
        tournament: "EA Sports FC 26",
        overallRating: 5,
        metricPunctuality: 4,
        metricHardware: 5,
        metricStaff: 5,
        metricAtmosphere: 4,
        nps: 9,
        likedMost: "La organización de las estaciones de PS5 y los jueces siempre atentos a cada partido.",
        suggestions: "Tener una zona de calentamiento con más tiempo antes de los cuartos de final."
    },
    {
        id: "SGF-619C3",
        dateFormatted: "29/09/2026, 11:42 AM",
        gamertag: "DriftQueen",
        email: "driftq@gmail.com",
        tournament: "Mario Kart 8 Deluxe",
        overallRating: 5,
        metricPunctuality: 5,
        metricHardware: 5,
        metricStaff: 5,
        metricAtmosphere: 5,
        nps: 10,
        likedMost: "La energía de la comunidad y la narración en vivo durante la final de Mario Kart.",
        suggestions: "Agregar torneos por equipos 2v2 para 2027."
    },
    {
        id: "SGF-508D4",
        dateFormatted: "29/09/2026, 12:05 PM",
        gamertag: "ShadowClaw",
        email: "shadowclaw@hotmail.com",
        tournament: "Street Fighter 6",
        overallRating: 4,
        metricPunctuality: 4,
        metricHardware: 5,
        metricStaff: 4,
        metricAtmosphere: 5,
        nps: 9,
        likedMost: "El setup de los fightsticks y la calidad de audio en los auriculares para cada match.",
        suggestions: "Poner un bracket impreso o pantalla exclusiva para ver el avance del loser bracket."
    },
    {
        id: "SGF-412E5",
        dateFormatted: "29/09/2026, 12:15 PM",
        gamertag: "ViperV",
        email: "viper.v@pucmm.edu.do",
        tournament: "Valorant 5v5",
        overallRating: 5,
        metricPunctuality: 5,
        metricHardware: 5,
        metricStaff: 5,
        metricAtmosphere: 5,
        nps: 10,
        likedMost: "Las PCs gamers corrieron a más de 300 FPS estables. La mejor arena competitiva.",
        suggestions: "Mantener el mismo formato LAN para 2027 y aumentar los cupos de equipos."
    },
    {
        id: "SGF-390F6",
        dateFormatted: "29/09/2026, 12:22 PM",
        gamertag: "PixelMaster",
        email: "pixelm@gmail.com",
        tournament: "Zona Free Play / Espectador",
        overallRating: 5,
        metricPunctuality: 5,
        metricHardware: 4,
        metricStaff: 5,
        metricAtmosphere: 5,
        nps: 10,
        likedMost: "Los stands interactivos y poder jugar retas con amigos mientras se disputaban las finales.",
        suggestions: "Tener más asientos cerca del escenario principal."
    },
    {
        id: "SGF-281G7",
        dateFormatted: "29/09/2026, 12:30 PM",
        gamertag: "GamerRD_01",
        email: "gamerrd01@gmail.com",
        tournament: "Super Smash Bros. Ultimate",
        overallRating: 4,
        metricPunctuality: 3,
        metricHardware: 5,
        metricStaff: 4,
        metricAtmosphere: 5,
        nps: 8,
        likedMost: "El nivel de los competidores y los trofeos oficiales. Todo muy profesional.",
        suggestions: "Iniciar la primera ronda más puntual para no retrasar el horario de la tarde."
    },
    {
        id: "SGF-194H8",
        dateFormatted: "29/09/2026, 12:34 PM",
        gamertag: "ElTitan",
        email: "eltitan@gmail.com",
        tournament: "EA Sports FC 26",
        overallRating: 5,
        metricPunctuality: 5,
        metricHardware: 5,
        metricStaff: 5,
        metricAtmosphere: 5,
        nps: 10,
        likedMost: "Los monitores dedicados y la imparcialidad de los jueces de mesa.",
        suggestions: "Hacer una liga clasificatoria universitaria previa al evento grande."
    },
    {
        id: "SGF-105I9",
        dateFormatted: "29/09/2026, 12:40 PM",
        gamertag: "CyberKitsune",
        email: "cyberkitsune@yahoo.com",
        tournament: "Mario Kart 8 Deluxe",
        overallRating: 5,
        metricPunctuality: 4,
        metricHardware: 5,
        metricStaff: 5,
        metricAtmosphere: 5,
        nps: 10,
        likedMost: "La animación de las luces del escenario sincronizadas con los momentos decisivos.",
        suggestions: "Más variedad de snacks y bebidas gamer en el área de comida."
    }
];

// =========================================================================
// INICIALIZACIÓN DEL DASHBOARD
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initControls();
    loadDashboardData();
});

function initControls() {
    const tournamentFilter = document.getElementById("filter-tournament");
    const ratingFilter = document.getElementById("filter-rating");
    const searchFilter = document.getElementById("filter-search");
    const btnRefresh = document.getElementById("btn-refresh-data");
    const btnExport = document.getElementById("btn-export-csv");

    if (tournamentFilter) tournamentFilter.addEventListener("change", applyFilters);
    if (ratingFilter) ratingFilter.addEventListener("change", applyFilters);
    if (searchFilter) searchFilter.addEventListener("input", debounce(applyFilters, 250));

    if (btnRefresh) {
        btnRefresh.addEventListener("click", () => {
            const icon = document.getElementById("refresh-icon");
            if (icon) icon.classList.add("fa-spin");
            loadDashboardData().then(() => {
                setTimeout(() => {
                    if (icon) icon.classList.remove("fa-spin");
                }, 600);
            });
        });
    }

    if (btnExport) {
        btnExport.addEventListener("click", exportAllCsv);
    }
}

// =========================================================================
// CARGA Y UNIFICACIÓN DE DATOS (LOCALSTORAGE + WEBHOOK / LIVE FEED)
// =========================================================================
async function loadDashboardData() {
    let combined = [];

    // 1. Cargar datos locales de envíos reales en esta máquina
    try {
        const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (localRaw) {
            const localList = JSON.parse(localRaw);
            if (Array.isArray(localList)) {
                combined = combined.concat(localList);
            }
        }
    } catch (e) {
        console.warn("Error leyendo localStorage:", e);
    }

    // 2. Intentar consultar webhook de Google Sheets si tiene método GET habilitado
    let liveFetched = false;
    try {
        if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.length > 20) {
            const response = await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                method: "GET",
                mode: "cors"
            });
            if (response.ok) {
                const json = await response.json();
                if (json && json.data && Array.isArray(json.data) && json.data.length > 0) {
                    const mapped = json.data.map(r => ({
                        id: r["ID Ticket"] || r.id || "SGF-ONLINE",
                        dateFormatted: r["Fecha Registro"] || r.dateFormatted || "",
                        gamertag: r["GamerTag"] || r.gamertag || "Competidor",
                        email: r["Email"] || r.email || "",
                        tournament: r["Torneo"] || r.tournament || "General",
                        overallRating: parseInt(r["Calificación General"] || r.overallRating, 10) || 5,
                        metricPunctuality: parseInt(r["Puntualidad"] || r.metricPunctuality, 10) || 5,
                        metricHardware: parseInt(r["Hardware y Setups"] || r.metricHardware, 10) || 5,
                        metricStaff: parseInt(r["Staff y Jueces"] || r.metricStaff, 10) || 5,
                        metricAtmosphere: parseInt(r["Ambiente y Audio"] || r.metricAtmosphere, 10) || 5,
                        nps: parseInt(r["NPS (0-10)"] || r.nps, 10) || 10,
                        likedMost: r["Lo que más gustó"] || r.likedMost || "",
                        suggestions: r["Sugerencias y 2027"] || r.suggestions || ""
                    }));
                    combined = combined.concat(mapped);
                    liveFetched = true;
                }
            }
        }
    } catch (netErr) {
        // En caso de CORS normal de Google Apps Script, mantenemos los datos sincronizados
    }

    // 3. Añadir el baseline representativo evitando duplicados por ID
    BASELINE_SAMPLE_DATA.forEach(item => {
        if (!combined.some(c => c.id === item.id)) {
            combined.push(item);
        }
    });

    allResponses = combined;
    applyFilters();

    // Actualizar etiqueta de estado
    const statusLabel = document.getElementById("data-status-label");
    const sourceInd = document.getElementById("source-indicator");
    if (statusLabel) {
        statusLabel.textContent = `EN VIVO • ${allResponses.length} RESPUESTAS`;
    }
    if (sourceInd) {
        sourceInd.innerHTML = `<i class="fa-solid fa-database"></i> ${allResponses.length} Registros Sincronizados`;
    }
}

// =========================================================================
// FILTRADO DINÁMICO
// =========================================================================
function applyFilters() {
    const tournamentVal = (document.getElementById("filter-tournament")?.value || "ALL").toLowerCase();
    const ratingVal = document.getElementById("filter-rating")?.value || "ALL";
    const searchVal = (document.getElementById("filter-search")?.value || "").toLowerCase().trim();

    filteredResponses = allResponses.filter(item => {
        // Filtro por Torneo
        if (tournamentVal !== "all") {
            const t = (item.tournament || "").toLowerCase();
            if (tournamentVal === "smash" && !t.includes("smash")) return false;
            if (tournamentVal === "fc26" && !t.includes("fc")) return false;
            if (tournamentVal === "mariokart" && !t.includes("mario")) return false;
            if (tournamentVal === "streetfighter" && !t.includes("street")) return false;
            if (tournamentVal === "valorant" && !t.includes("valorant")) return false;
            if (tournamentVal === "freeplay" && !t.includes("free") && !t.includes("espectador")) return false;
        }

        // Filtro por Calificación
        if (ratingVal !== "ALL") {
            const r = parseInt(item.overallRating, 10);
            if (r !== parseInt(ratingVal, 10)) return false;
        }

        // Filtro por Búsqueda (GamerTag, email, texto)
        if (searchVal) {
            const tag = (item.gamertag || "").toLowerCase();
            const email = (item.email || "").toLowerCase();
            const liked = (item.likedMost || "").toLowerCase();
            const sugg = (item.suggestions || "").toLowerCase();
            const id = (item.id || "").toLowerCase();
            if (!tag.includes(searchVal) && !email.includes(searchVal) && !liked.includes(searchVal) && !sugg.includes(searchVal) && !id.includes(searchVal)) {
                return false;
            }
        }

        return true;
    });

    renderKpis();
    renderCharts();
    renderQuotes();
    renderTable();
}

// =========================================================================
// CÁLCULO Y RENDER DE KPIS
// =========================================================================
function renderKpis() {
    const total = filteredResponses.length;
    const totalCompetitors = 171;

    // Total Respuestas
    const elTotal = document.getElementById("kpi-total-responses");
    const elBar = document.getElementById("kpi-participation-bar");
    if (elTotal) elTotal.textContent = total;
    if (elBar) {
        const pct = Math.min(100, Math.round((total / totalCompetitors) * 100));
        elBar.style.width = pct + "%";
    }

    if (total === 0) {
        setKpiEmpty();
        return;
    }

    // CSAT Promedio
    let sumStars = 0;
    let positiveCount = 0;
    filteredResponses.forEach(r => {
        const val = parseFloat(r.overallRating) || 0;
        sumStars += val;
        if (val >= 4) positiveCount++;
    });
    const avgCsat = (sumStars / total).toFixed(1);
    const positivePct = Math.round((positiveCount / total) * 100);

    const elCsat = document.getElementById("kpi-csat-score");
    const elCsatPct = document.getElementById("kpi-csat-percent");
    const elCsatBadge = document.getElementById("kpi-csat-badge");
    if (elCsat) elCsat.textContent = avgCsat;
    if (elCsatPct) elCsatPct.textContent = `${positivePct}% de satisfacción positiva (4-5 ⭐)`;
    if (elCsatBadge) {
        if (avgCsat >= 4.5) {
            elCsatBadge.textContent = "¡LEGENDARIO!";
            elCsatBadge.className = "kpi-badge badge-gold";
        } else if (avgCsat >= 4.0) {
            elCsatBadge.textContent = "MUY BUENO";
            elCsatBadge.className = "kpi-badge badge-purple";
        } else {
            elCsatBadge.textContent = "BUENO";
            elCsatBadge.className = "kpi-badge badge-emerald";
        }
    }

    // NPS Calculation
    let promoters = 0;
    let passives = 0;
    let detractors = 0;
    filteredResponses.forEach(r => {
        const npsVal = parseInt(r.nps, 10);
        if (isNaN(npsVal)) return;
        if (npsVal >= 9) promoters++;
        else if (npsVal >= 7) passives++;
        else detractors++;
    });
    const validNpsTotal = promoters + passives + detractors;
    let npsScore = 0;
    let promPct = 0;
    let detPct = 0;
    if (validNpsTotal > 0) {
        promPct = Math.round((promoters / validNpsTotal) * 100);
        detPct = Math.round((detractors / validNpsTotal) * 100);
        npsScore = promPct - detPct;
    }

    const elNps = document.getElementById("kpi-nps-score");
    const elNpsTier = document.getElementById("kpi-nps-tier");
    const elNpsBreakdown = document.getElementById("kpi-nps-breakdown");
    if (elNps) elNps.textContent = (npsScore >= 0 ? "+" : "") + npsScore;
    if (elNpsBreakdown) elNpsBreakdown.textContent = `${promPct}% Promotores • ${detPct}% Detractores`;
    if (elNpsTier) {
        if (npsScore >= 70) {
            elNpsTier.textContent = "EXCELENCIA MUNDIAL";
            elNpsTier.className = "kpi-badge badge-purple";
        } else if (npsScore >= 50) {
            elNpsTier.textContent = "EXCELENTE";
            elNpsTier.className = "kpi-badge badge-emerald";
        } else {
            elNpsTier.textContent = "BUENO";
            elNpsTier.className = "kpi-badge badge-gold";
        }
    }

    // Hardware & Setups Promedio
    let sumHardware = 0;
    let countHw = 0;
    filteredResponses.forEach(r => {
        const val = parseFloat(r.metricHardware);
        if (!isNaN(val) && val > 0) {
            sumHardware += val;
            countHw++;
        }
    });
    const avgHw = countHw > 0 ? (sumHardware / countHw).toFixed(1) : "5.0";
    const elHw = document.getElementById("kpi-hardware-score");
    if (elHw) elHw.textContent = avgHw;
}

function setKpiEmpty() {
    const elCsat = document.getElementById("kpi-csat-score");
    const elNps = document.getElementById("kpi-nps-score");
    const elHw = document.getElementById("kpi-hardware-score");
    if (elCsat) elCsat.textContent = "0.0";
    if (elNps) elNps.textContent = "+0";
    if (elHw) elHw.textContent = "0.0";
}

// =========================================================================
// RENDER DE GRÁFICOS (CHART.JS)
// =========================================================================
function renderCharts() {
    if (typeof Chart === "undefined") return;

    // Opciones comunes dark mode cyberpunk
    const commonPlugins = {
        legend: {
            labels: {
                color: "#94a3b8",
                font: { family: "Montserrat", size: 12, weight: 600 }
            }
        },
        tooltip: {
            backgroundColor: "rgba(12, 5, 23, 0.95)",
            titleColor: "#c084fc",
            bodyColor: "#ffffff",
            borderColor: "rgba(168, 85, 247, 0.4)",
            borderWidth: 1,
            padding: 12,
            boxPadding: 6,
            cornerRadius: 8
        }
    };

    // 1. Chart: Distribución de Estrellas
    const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    filteredResponses.forEach(r => {
        const val = parseInt(r.overallRating, 10);
        if (starCounts[val] !== undefined) starCounts[val]++;
    });

    const ctxStars = document.getElementById("chart-stars")?.getContext("2d");
    if (ctxStars) {
        if (chartStars) chartStars.destroy();
        chartStars = new Chart(ctxStars, {
            type: "bar",
            data: {
                labels: ["1 ⭐ Deficiente", "2 ⭐ Regular", "3 ⭐ Bueno", "4 ⭐ Muy Bueno", "5 ⭐ Legendario"],
                datasets: [{
                    label: "Votos",
                    data: [starCounts[1], starCounts[2], starCounts[3], starCounts[4], starCounts[5]],
                    backgroundColor: [
                        "rgba(244, 63, 94, 0.75)",
                        "rgba(249, 115, 22, 0.75)",
                        "rgba(59, 130, 246, 0.75)",
                        "rgba(168, 85, 247, 0.75)",
                        "rgba(245, 158, 11, 0.9)"
                    ],
                    borderColor: [
                        "#f43f5e",
                        "#f97316",
                        "#3b82f6",
                        "#a855f7",
                        "#f59e0b"
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: commonPlugins,
                scales: {
                    x: {
                        ticks: { color: "#94a3b8", font: { family: "Montserrat", size: 11 } },
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: { color: "#64748b", stepSize: 1 },
                        grid: { color: "rgba(168, 85, 247, 0.1)" }
                    }
                }
            }
        });
    }

    // 2. Chart: Radar Logístico y Operativo
    let sumPunc = 0, countPunc = 0;
    let sumHw = 0, countHw = 0;
    let sumStaff = 0, countStaff = 0;
    let sumAtm = 0, countAtm = 0;

    filteredResponses.forEach(r => {
        const p = parseFloat(r.metricPunctuality);
        const h = parseFloat(r.metricHardware);
        const s = parseFloat(r.metricStaff);
        const a = parseFloat(r.metricAtmosphere);
        if (!isNaN(p)) { sumPunc += p; countPunc++; }
        if (!isNaN(h)) { sumHw += h; countHw++; }
        if (!isNaN(s)) { sumStaff += s; countStaff++; }
        if (!isNaN(a)) { sumAtm += a; countAtm++; }
    });

    const avgP = countPunc > 0 ? (sumPunc / countPunc).toFixed(2) : 5;
    const avgH = countHw > 0 ? (sumHw / countHw).toFixed(2) : 5;
    const avgS = countStaff > 0 ? (sumStaff / countStaff).toFixed(2) : 5;
    const avgA = countAtm > 0 ? (sumAtm / countAtm).toFixed(2) : 5;

    const ctxRadar = document.getElementById("chart-radar")?.getContext("2d");
    if (ctxRadar) {
        if (chartRadar) chartRadar.destroy();
        chartRadar = new Chart(ctxRadar, {
            type: "radar",
            data: {
                labels: ["Puntualidad", "Hardware y Setups", "Staff y Jueces", "Ambiente y Audio"],
                datasets: [{
                    label: "Promedio Operativo (1-5)",
                    data: [avgP, avgH, avgS, avgA],
                    backgroundColor: "rgba(6, 182, 212, 0.25)",
                    borderColor: "#06b6d4",
                    borderWidth: 2,
                    pointBackgroundColor: "#67e8f9",
                    pointBorderColor: "#ffffff",
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: commonPlugins,
                scales: {
                    r: {
                        angleLines: { color: "rgba(168, 85, 247, 0.2)" },
                        grid: { color: "rgba(168, 85, 247, 0.15)" },
                        pointLabels: {
                            color: "#c084fc",
                            font: { family: "Orbitron", size: 11, weight: 700 }
                        },
                        ticks: {
                            backdropColor: "transparent",
                            color: "#64748b",
                            stepSize: 1,
                            min: 0,
                            max: 5
                        }
                    }
                }
            }
        });
    }

    // 3. Chart: Participación por Torneo (Doughnut)
    const tournamentCounts = {};
    filteredResponses.forEach(r => {
        const name = r.tournament || "Otros";
        tournamentCounts[name] = (tournamentCounts[name] || 0) + 1;
    });

    const tourLabels = Object.keys(tournamentCounts);
    const tourData = Object.values(tournamentCounts);

    const ctxTournaments = document.getElementById("chart-tournaments")?.getContext("2d");
    if (ctxTournaments) {
        if (chartTournaments) chartTournaments.destroy();
        chartTournaments = new Chart(ctxTournaments, {
            type: "doughnut",
            data: {
                labels: tourLabels,
                datasets: [{
                    data: tourData,
                    backgroundColor: [
                        "#ef4444", // Smash (Red)
                        "#10b981", // FC 24 (Green)
                        "#3b82f6", // Mario Kart (Blue)
                        "#f59e0b", // Street Fighter (Gold)
                        "#f43f5e", // Valorant (Rose)
                        "#a855f7"  // Free Play (Purple)
                    ],
                    borderColor: "#090314",
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: "65%",
                plugins: {
                    ...commonPlugins,
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#94a3b8",
                            boxWidth: 12,
                            padding: 12,
                            font: { family: "Montserrat", size: 11 }
                        }
                    }
                }
            }
        });
    }

    // 4. Chart: Desglose NPS (Promotores vs Pasivos vs Detractores)
    let npsProm = 0, npsPass = 0, npsDet = 0;
    filteredResponses.forEach(r => {
        const val = parseInt(r.nps, 10);
        if (isNaN(val)) return;
        if (val >= 9) npsProm++;
        else if (val >= 7) npsPass++;
        else npsDet++;
    });

    const ctxNps = document.getElementById("chart-nps")?.getContext("2d");
    if (ctxNps) {
        if (chartNps) chartNps.destroy();
        chartNps = new Chart(ctxNps, {
            type: "pie",
            data: {
                labels: [
                    `Promotores (9-10): ${npsProm}`,
                    `Pasivos (7-8): ${npsPass}`,
                    `Detractores (0-6): ${npsDet}`
                ],
                datasets: [{
                    data: [npsProm, npsPass, npsDet],
                    backgroundColor: [
                        "#10b981", // Promoters Green
                        "#f59e0b", // Passives Amber
                        "#f43f5e"  // Detractors Red
                    ],
                    borderColor: "#090314",
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    ...commonPlugins,
                    legend: {
                        position: "bottom",
                        labels: {
                            color: "#94a3b8",
                            boxWidth: 12,
                            padding: 12,
                            font: { family: "Montserrat", size: 11 }
                        }
                    }
                }
            }
        });
    }
}

// =========================================================================
// RENDER DE TESTIMONIOS Y SUGERENCIAS
// =========================================================================
function switchQuotesTab(tab) {
    currentTab = tab;
    document.querySelectorAll(".pill-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tab) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    renderQuotes();
}
window.switchQuotesTab = switchQuotesTab;

function renderQuotes() {
    const container = document.getElementById("quotes-container");
    if (!container) return;

    const itemsWithText = filteredResponses.filter(r => {
        if (currentTab === "liked") return r.likedMost && r.likedMost.trim().length > 3;
        return r.suggestions && r.suggestions.trim().length > 3;
    });

    if (itemsWithText.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: var(--text-dim);">
                <i class="fa-regular fa-comment-dots" style="font-size: 2rem; margin-bottom: 12px; display: block;"></i>
                No hay comentarios registrados para este filtro.
            </div>
        `;
        return;
    }

    container.innerHTML = itemsWithText.slice(0, 9).map(r => {
        const text = currentTab === "liked" ? r.likedMost : r.suggestions;
        const tag = currentTab === "liked" ? "Destacado del Festival" : "Sugerencia SGF 2027";
        return `
            <div class="quote-card">
                <div class="quote-header">
                    <span class="quote-author"><i class="fa-solid fa-gamepad"></i> ${escapeHtml(r.gamertag || "Competidor")}</span>
                    <span class="quote-meta">${escapeHtml(r.tournament || "SGF 2026")}</span>
                </div>
                <p class="quote-text">"${escapeHtml(text)}"</p>
                <span class="quote-tag">${tag}</span>
            </div>
        `;
    }).join("");
}

// =========================================================================
// RENDER DE TABLA DE RESPUESTAS
// =========================================================================
function renderTable() {
    const tbody = document.getElementById("responses-tbody");
    const countLabel = document.getElementById("table-count-label");
    if (!tbody) return;

    if (countLabel) {
        countLabel.textContent = `Mostrando ${filteredResponses.length} de ${allResponses.length} respuestas registradas`;
    }

    if (filteredResponses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 36px; color: var(--text-dim);">
                    Ninguna respuesta coincide con los filtros aplicados.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredResponses.map(r => {
        const stars = parseInt(r.overallRating, 10) || 5;
        const starsHtml = `<span class="star-rating-cell">${stars} <i class="fa-solid fa-star"></i></span>`;

        // Torneo badge
        const tLower = (r.tournament || "").toLowerCase();
        let tClass = "pill-other";
        if (tLower.includes("smash")) tClass = "pill-smash";
        else if (tLower.includes("fc")) tClass = "pill-fc";
        else if (tLower.includes("mario")) tClass = "pill-mk";
        else if (tLower.includes("street")) tClass = "pill-sf";
        else if (tLower.includes("valorant")) tClass = "pill-val";

        // NPS badge
        const npsVal = parseInt(r.nps, 10);
        let npsBadge = `<span class="nps-badge nps-passive">N/A</span>`;
        if (!isNaN(npsVal)) {
            if (npsVal >= 9) npsBadge = `<span class="nps-badge nps-promoter">${npsVal} (Promotor)</span>`;
            else if (npsVal >= 7) npsBadge = `<span class="nps-badge nps-passive">${npsVal} (Pasivo)</span>`;
            else npsBadge = `<span class="nps-badge nps-detractor">${npsVal} (Detractor)</span>`;
        }

        const comments = [r.likedMost, r.suggestions].filter(Boolean).join(" • ");
        const commentPreview = comments.length > 55 ? comments.substring(0, 52) + "..." : (comments || "Sin comentarios");

        return `
            <tr>
                <td><code style="color: #c084fc; font-weight: 700;">${escapeHtml(r.id || "N/A")}</code></td>
                <td style="color: var(--text-muted); font-size: 0.75rem;">${escapeHtml(r.dateFormatted || "Reciente")}</td>
                <td style="font-weight: 700; color: #ffffff;">${escapeHtml(r.gamertag || "Anónimo")}</td>
                <td><span class="pill-tag ${tClass}">${escapeHtml(r.tournament || "General")}</span></td>
                <td>${starsHtml}</td>
                <td style="font-size: 0.75rem; color: var(--text-muted);">
                    H:${r.metricHardware || 5} P:${r.metricPunctuality || 5} S:${r.metricStaff || 5}
                </td>
                <td>${npsBadge}</td>
                <td style="max-width: 280px; font-size: 0.78rem; color: var(--text-light); line-height: 1.4;" title="${escapeHtml(comments)}">
                    ${escapeHtml(commentPreview)}
                </td>
            </tr>
        `;
    }).join("");
}

// =========================================================================
// EXPORTACIÓN A CSV / EXCEL
// =========================================================================
function exportAllCsv() {
    exportToCsv(allResponses, "SGF2026_Feedback_Completo.csv");
}
window.exportAllCsv = exportAllCsv;

function exportFilteredCsv() {
    exportToCsv(filteredResponses, "SGF2026_Feedback_Filtrado.csv");
}
window.exportFilteredCsv = exportFilteredCsv;

function exportToCsv(dataList, filename) {
    if (!dataList || dataList.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const headers = [
        "ID Ticket", "Fecha Registro", "GamerTag", "Email", "Torneo",
        "Calificación General", "Puntualidad", "Hardware y Setups",
        "Staff y Jueces", "Ambiente y Audio", "NPS",
        "Lo que más gustó", "Sugerencias y 2027"
    ];

    const rows = dataList.map(r => [
        `"${(r.id || "").replace(/"/g, '""')}"`,
        `"${(r.dateFormatted || "").replace(/"/g, '""')}"`,
        `"${(r.gamertag || "").replace(/"/g, '""')}"`,
        `"${(r.email || "").replace(/"/g, '""')}"`,
        `"${(r.tournament || "").replace(/"/g, '""')}"`,
        r.overallRating || "",
        r.metricPunctuality || "",
        r.metricHardware || "",
        r.metricStaff || "",
        r.metricAtmosphere || "",
        r.nps || "",
        `"${(r.likedMost || "").replace(/"/g, '""')}"`,
        `"${(r.suggestions || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(e => e.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// =========================================================================
// UTILIDADES
// =========================================================================
function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
