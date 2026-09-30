/**
 * STUDENTS GAMING FESTIVAL 2026 (SGF 2026)
 * Executive Feedback Analytics Dashboard
 * 
 * 1. Admin Authentication Gate (Security Login)
 * 2. Real-Time Data Pipeline (Google Sheets Webhook + LocalStorage)
 * 3. Pure Real Data Engine (Zero Hardcoded Mock Data)
 * 4. Interactive Charts (Chart.js), Filtering, and CSV Export
 */

const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycby13vJq2zI3ZG0IhzVdeMo3DTjp0szr5YGYtE0tD91_1hGyNUoYJVv8__g6Wny43WNo/exec";
const LOCAL_STORAGE_SUBMISSIONS_KEY = "sgf26_feedback_submissions_v1";
const AUTH_STORAGE_KEY = "sgf26_admin_authenticated";

// Credenciales Administrativas Oficiales SGF 2026
const VALID_USERS = ["admin", "sgf2026", "comite", "pucmm"];
const VALID_PASSWORDS = ["sgf2026", "admin2026", "pucmm2026", "esports2026"];

// Estado en memoria
let allResponses = [];
let filteredResponses = [];
let currentTab = "liked";

// Paginación de Tabla (5 registros por página)
const TABLE_PAGE_SIZE = 5;
let currentTablePage = 1;

// Paginación de Opiniones / Muro de Feedback (6 testimonios por página)
const QUOTES_PAGE_SIZE = 6;
let currentQuotesPage = 1;
let lastDataFingerprint = "";

// Instancias de Chart.js
let chartStars = null;
let chartRadar = null;
let chartTournaments = null;
let chartNps = null;

// =========================================================================
// 1. CONTROL DE ACCESO Y AUTENTICACIÓN (LOGIN GATE)
// =========================================================================
document.addEventListener("DOMContentLoaded", () => {
    initAuth();
});

function initAuth() {
    const isAuth = sessionStorage.getItem(AUTH_STORAGE_KEY) === "true" || localStorage.getItem(AUTH_STORAGE_KEY) === "true";
    const loginScreen = document.getElementById("login-screen");
    const dashboardApp = document.getElementById("dashboard-app");

    if (isAuth) {
        if (loginScreen) loginScreen.style.display = "none";
        if (dashboardApp) dashboardApp.style.display = "block";
        initDashboard();
    } else {
        if (loginScreen) loginScreen.style.display = "flex";
        if (dashboardApp) dashboardApp.style.display = "none";
        setupLoginForm();
    }

    // Botón de alternar visibilidad de contraseña
    const btnTogglePass = document.getElementById("btn-toggle-password");
    const passInput = document.getElementById("admin-pass");
    const passIcon = document.getElementById("toggle-pass-icon");
    if (btnTogglePass && passInput && passIcon) {
        btnTogglePass.addEventListener("click", () => {
            if (passInput.type === "password") {
                passInput.type = "text";
                passIcon.className = "fa-regular fa-eye-slash";
            } else {
                passInput.type = "password";
                passIcon.className = "fa-regular fa-eye";
            }
        });
    }

    // Botón de Logout
    const btnLogout = document.getElementById("btn-logout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem(AUTH_STORAGE_KEY);
            localStorage.removeItem(AUTH_STORAGE_KEY);
            window.location.reload();
        });
    }
}

function setupLoginForm() {
    const form = document.getElementById("login-form");
    const userInput = document.getElementById("admin-user");
    const passInput = document.getElementById("admin-pass");
    const rememberChk = document.getElementById("chk-remember-session");
    const errorMsg = document.getElementById("login-error-msg");
    const errorText = document.getElementById("login-error-text");

    if (!form) return;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const user = (userInput ? userInput.value.trim().toLowerCase() : "");
        const pass = (passInput ? passInput.value.trim().toLowerCase() : "");

        const isValidUser = VALID_USERS.includes(user);
        const isValidPass = VALID_PASSWORDS.includes(pass);

        if (isValidUser && isValidPass) {
            if (errorMsg) errorMsg.classList.remove("visible");

            if (rememberChk && rememberChk.checked) {
                localStorage.setItem(AUTH_STORAGE_KEY, "true");
            } else {
                sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
            }

            const loginScreen = document.getElementById("login-screen");
            const dashboardApp = document.getElementById("dashboard-app");
            if (loginScreen) loginScreen.style.display = "none";
            if (dashboardApp) {
                dashboardApp.style.display = "block";
                dashboardApp.style.animation = "loginFadeIn 0.4s ease-out";
            }

            initDashboard();
        } else {
            if (errorMsg) {
                errorMsg.classList.add("visible");
                if (errorText) errorText.textContent = "Credenciales incorrectas. Verifica usuario o contraseña.";
            }
            if (passInput) {
                passInput.value = "";
                passInput.focus();
            }
        }
    });
}

// =========================================================================
// 2. INICIALIZACIÓN DEL DASHBOARD Y CONTROLES
// =========================================================================
function initDashboard() {
    initControls();
    loadDashboardData();

    // Sincronización automática periódica en segundo plano cada 30 segundos
    setInterval(() => {
        loadDashboardData(true);
    }, 30000);

    // Sincronización automática instantánea al regresar a esta pestaña
    window.addEventListener("focus", () => {
        loadDashboardData(true);
    });
}

function initControls() {
    const tournamentFilter = document.getElementById("filter-tournament");
    const ratingFilter = document.getElementById("filter-rating");
    const searchFilter = document.getElementById("filter-search");
    const btnRefresh = document.getElementById("btn-refresh-data");
    const btnExport = document.getElementById("btn-export-csv");

    if (tournamentFilter) tournamentFilter.addEventListener("change", () => applyFilters(true));
    if (ratingFilter) ratingFilter.addEventListener("change", () => applyFilters(true));
    if (searchFilter) searchFilter.addEventListener("input", debounce(() => applyFilters(true), 250));

    if (btnRefresh) {
        btnRefresh.addEventListener("click", async () => {
            const icon = document.getElementById("refresh-icon");
            btnRefresh.disabled = true;
            if (icon) icon.classList.add("fa-spin");

            showDashboardBanner("Sincronizando con Google Sheets...", "loading");

            try {
                await loadDashboardData(false);
                showDashboardBanner(`✅ Sincronizado en vivo: ${allResponses.length} registros de Google Sheets`, "success");
            } catch (err) {
                console.error("Error sincronizando:", err);
                showDashboardBanner("⚠️ No se pudo sincronizar con Google Sheets", "error");
            } finally {
                setTimeout(() => {
                    btnRefresh.disabled = false;
                    if (icon) icon.classList.remove("fa-spin");
                }, 600);
            }
        });
    }

    if (btnExport) {
        btnExport.addEventListener("click", exportAllCsv);
    }
}

// Banner de Notificación Rápida para Sincronización
function showDashboardBanner(msg, type = "info") {
    const banner = document.getElementById("sync-banner");
    const textEl = document.getElementById("sync-banner-text");
    if (!banner || !textEl) return;

    textEl.textContent = msg;
    banner.style.display = "block";
    banner.style.animation = "fadeIn 0.3s ease";

    if (type === "success") {
        banner.style.borderColor = "rgba(16, 185, 129, 0.4)";
        banner.style.background = "rgba(16, 185, 129, 0.1)";
        textEl.style.color = "#34d399";
    } else if (type === "error") {
        banner.style.borderColor = "rgba(239, 68, 68, 0.4)";
        banner.style.background = "rgba(239, 68, 68, 0.1)";
        textEl.style.color = "#f87171";
    } else {
        banner.style.borderColor = "rgba(168, 85, 247, 0.4)";
        banner.style.background = "rgba(168, 85, 247, 0.1)";
        textEl.style.color = "#c084fc";
    }

    if (type !== "loading") {
        setTimeout(() => {
            banner.style.display = "none";
        }, 4000);
    }
}

// =========================================================================
// 3. CARGA DE DATOS REALES (GOOGLE SHEETS ES LA FUENTE AUTORIZADA)
// =========================================================================
async function loadDashboardData(isBackground = false) {
    let combined = [];

    // Limpiar de inmediato cualquier respuesta de prueba guardada localmente
    localStorage.removeItem(LOCAL_STORAGE_SUBMISSIONS_KEY);

    // 1. Consultar Webhook oficial de Google Sheets (con _t para evitar caché de navegador/red)
    try {
        if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.length > 20) {
            const sep = GOOGLE_SHEETS_WEBHOOK_URL.includes("?") ? "&" : "?";
            const freshUrl = `${GOOGLE_SHEETS_WEBHOOK_URL}${sep}_t=${Date.now()}`;
            
            const response = await fetch(freshUrl, {
                method: "GET",
                cache: "no-store"
            });

            if (response.ok) {
                const text = await response.text();
                let json = null;
                try {
                    json = JSON.parse(text);
                } catch(err) {
                    console.warn("Aviso: El webhook respondió pero aún no es JSON:", text);
                }

                if (json && json.status === "success" && Array.isArray(json.data)) {
                    // Descartar filas vacías o borradas en Google Sheets
                    const validData = json.data.filter(r => {
                        const tag = (r["GamerTag"] || r.gamertag || "").toString().trim();
                        const email = (r["Email"] || r.email || "").toString().trim();
                        const stars = r["Calificación General"] || r.overallRating;
                        return tag !== "" || email !== "" || (stars !== "" && stars !== undefined);
                    });

                    // Detectar si los datos realmente cambiaron antes de re-procesar
                    const currentFingerprint = JSON.stringify(validData);
                    if (isBackground && currentFingerprint === lastDataFingerprint) {
                        // Los datos son idénticos; salir silenciosamente sin tocar el DOM ni parpadear
                        return;
                    }
                    lastDataFingerprint = currentFingerprint;

                    combined = validData.map(r => ({
                        dateFormatted: r["Fecha Registro"] || r.dateFormatted || "Reciente",
                        gamertag: r["GamerTag"] || r.gamertag || "Competidor",
                        email: r["Email"] || r.email || "",
                        tournament: r["Torneo"] || r.tournament || "General",
                        overallRating: parseInt(r["Calificación General"] || r.overallRating, 10) || 5,
                        metricPunctuality: parseInt(r["Puntualidad"] || r.metricPunctuality, 10) || 5,
                        metricHardware: parseInt(r["Hardware y Setups"] || r.metricHardware, 10) || 5,
                        metricStaff: parseInt(r["Staff y Jueces"] || r.metricStaff, 10) || 5,
                        metricAtmosphere: parseInt(r["Ambiente y Audio"] || r.metricAtmosphere, 10) || 5,
                        rifasRating: parseInt(r["Gestión de Rifas (1-10)"] || r.rifasRating, 10) || null,
                        nps: parseInt(r["NPS (0-10)"] || r.nps, 10) || 10,
                        likedMost: r["Lo que más gustó"] || r.likedMost || "",
                        suggestions: r["Sugerencias y 2027"] || r.suggestions || ""
                    }));
                }
            }
        }
    } catch (netErr) {
        console.warn("Sincronización con Google Sheets:", netErr);
    }

    // Los datos reflejados son EXCLUSIVAMENTE los que están en Google Sheets
    allResponses = combined;
    applyFilters(false);

    // Actualizar indicador de fuente
    const sourceInd = document.getElementById("source-indicator");
    if (sourceInd) {
        sourceInd.innerHTML = `<i class="fa-solid fa-database"></i> ${allResponses.length} Registros en Google Sheets`;
    }
}

// =========================================================================
// 4. FILTRADO DINÁMICO
// =========================================================================
function applyFilters(resetPage = false) {
    if (resetPage === true) {
        currentTablePage = 1;
        currentQuotesPage = 1;
    }
    const tournamentVal = (document.getElementById("filter-tournament")?.value || "ALL").toLowerCase();
    const ratingVal = document.getElementById("filter-rating")?.value || "ALL";
    const searchVal = (document.getElementById("filter-search")?.value || "").toLowerCase().trim();

    filteredResponses = allResponses.filter(item => {
        // Filtro por Torneo
        if (tournamentVal !== "all") {
            const t = (item.tournament || "").toLowerCase();
            if (tournamentVal === "smash" && !t.includes("smash")) return false;
            if ((tournamentVal === "fc26" || tournamentVal === "fc") && !t.includes("fc")) return false;
            if ((tournamentVal === "mariokart" || tournamentVal === "mk8") && !t.includes("mario")) return false;
            if (tournamentVal === "streetfighter" && !t.includes("street")) return false;
            if (tournamentVal === "nba" && !t.includes("nba")) return false;
            if (tournamentVal === "pokemon" && !t.includes("pokemon") && !t.includes("pokémon")) return false;
            if (tournamentVal === "clash" && !t.includes("clash")) return false;
            if (tournamentVal === "brawl" && !t.includes("brawl")) return false;
            if (tournamentVal === "valorant" && !t.includes("valorant")) return false;
            if (tournamentVal === "freeplay" && !t.includes("free") && !t.includes("espectador") && !t.includes("público")) return false;
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
// 5. CÁLCULO Y RENDER DE KPIS
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

    // Si no hay respuestas aún
    if (total === 0) {
        const elCsat = document.getElementById("kpi-csat-score");
        const elCsatPct = document.getElementById("kpi-csat-percent");
        const elCsatBadge = document.getElementById("kpi-csat-badge");
        const elNps = document.getElementById("kpi-nps-score");
        const elNpsTier = document.getElementById("kpi-nps-tier");
        const elNpsBreakdown = document.getElementById("kpi-nps-breakdown");
        const elHw = document.getElementById("kpi-hardware-score");
        const elHwBadge = document.getElementById("kpi-hw-badge");
        const elRifas = document.getElementById("kpi-rifas-score");
        const elRifasBadge = document.getElementById("kpi-rifas-badge");

        if (elCsat) elCsat.textContent = "0.0";
        if (elCsatPct) elCsatPct.textContent = "Esperando respuestas";
        if (elCsatBadge) { elCsatBadge.textContent = "SIN DATOS"; elCsatBadge.className = "kpi-badge badge-gold"; }
        if (elNps) elNps.textContent = "+0";
        if (elNpsTier) { elNpsTier.textContent = "N/A"; elNpsTier.className = "kpi-badge badge-purple"; }
        if (elNpsBreakdown) elNpsBreakdown.textContent = "0% Promotores • 0% Detractores";
        if (elHw) elHw.textContent = "0.0";
        if (elHwBadge) elHwBadge.textContent = "N/A";
        if (elRifas) elRifas.textContent = "0.0";
        if (elRifasBadge) { elRifasBadge.textContent = "N/A"; elRifasBadge.className = "kpi-badge badge-gold"; }
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
    if (elCsatPct) elCsatPct.textContent = `${positivePct}% de satisfacción positiva`;
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
    const elHwBadge = document.getElementById("kpi-hw-badge");
    if (elHw) elHw.textContent = avgHw;
    if (elHwBadge) elHwBadge.textContent = avgHw >= 4.5 ? "TOP TIER" : "APROBADO";

    // Gestión de Rifas Promedio (1-10)
    let sumRifas = 0;
    let countRifas = 0;
    filteredResponses.forEach(r => {
        const val = parseFloat(r.rifasRating);
        if (!isNaN(val) && val > 0) {
            sumRifas += val;
            countRifas++;
        }
    });
    const avgRifas = countRifas > 0 ? (sumRifas / countRifas).toFixed(1) : "0.0";
    const elRifas = document.getElementById("kpi-rifas-score");
    const elRifasBadge = document.getElementById("kpi-rifas-badge");
    if (elRifas) elRifas.textContent = countRifas > 0 ? avgRifas : "0.0";
    if (elRifasBadge) {
        if (countRifas === 0) {
            elRifasBadge.textContent = "N/A";
            elRifasBadge.className = "kpi-badge badge-gold";
        } else if (avgRifas >= 8.5) {
            elRifasBadge.textContent = "EXCELENTE";
            elRifasBadge.className = "kpi-badge badge-purple";
        } else if (avgRifas >= 7.0) {
            elRifasBadge.textContent = "BUENO";
            elRifasBadge.className = "kpi-badge badge-emerald";
        } else {
            elRifasBadge.textContent = "POR MEJORAR";
            elRifasBadge.className = "kpi-badge badge-gold";
        }
    }
}

// =========================================================================
// 6. RENDER DE GRÁFICOS (CHART.JS) CON SOPORTE DE ESTADO VACÍO
// =========================================================================
function renderCharts() {
    if (typeof Chart === "undefined") return;

    const hasData = filteredResponses.length > 0;

    const emptyStars = document.getElementById("empty-stars");
    const emptyRadar = document.getElementById("empty-radar");
    const emptyTour = document.getElementById("empty-tournaments");
    const emptyNps = document.getElementById("empty-nps");

    if (emptyStars) emptyStars.style.display = hasData ? "none" : "flex";
    if (emptyRadar) emptyRadar.style.display = hasData ? "none" : "flex";
    if (emptyTour) emptyTour.style.display = hasData ? "none" : "flex";
    if (emptyNps) emptyNps.style.display = hasData ? "none" : "flex";

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
        const starValues = [starCounts[1], starCounts[2], starCounts[3], starCounts[4], starCounts[5]];
        if (chartStars) {
            chartStars.data.datasets[0].data = starValues;
            chartStars.update("none");
        } else {
            chartStars = new Chart(ctxStars, {
                type: "bar",
                data: {
                    labels: ["1 ⭐ Deficiente", "2 ⭐ Regular", "3 ⭐ Bueno", "4 ⭐ Muy Bueno", "5 ⭐ Legendario"],
                    datasets: [{
                        label: "Votos Reales",
                        data: starValues,
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

    const avgP = countPunc > 0 ? (sumPunc / countPunc).toFixed(2) : 0;
    const avgH = countHw > 0 ? (sumHw / countHw).toFixed(2) : 0;
    const avgS = countStaff > 0 ? (sumStaff / countStaff).toFixed(2) : 0;
    const avgA = countAtm > 0 ? (sumAtm / countAtm).toFixed(2) : 0;

    const ctxRadar = document.getElementById("chart-radar")?.getContext("2d");
    if (ctxRadar) {
        const radarValues = [avgP, avgH, avgS, avgA];
        if (chartRadar) {
            chartRadar.data.datasets[0].data = radarValues;
            chartRadar.update("none");
        } else {
            chartRadar = new Chart(ctxRadar, {
                type: "radar",
                data: {
                    labels: ["Puntualidad", "Hardware y Setups", "Staff y Jueces", "Ambiente y Audio"],
                    datasets: [{
                        label: "Evaluación Operativa",
                        data: radarValues,
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
    }

    // 3. Chart: Participación por Torneo (Doughnut)
    const tournamentCounts = {};
    filteredResponses.forEach(r => {
        const raw = r.tournament || "General";
        const parts = raw.split(/,\s*|\s*\+\s*/).map(s => s.trim()).filter(Boolean);
        if (parts.length === 0) {
            tournamentCounts["General"] = (tournamentCounts["General"] || 0) + 1;
        } else {
            parts.forEach(name => {
                tournamentCounts[name] = (tournamentCounts[name] || 0) + 1;
            });
        }
    });

    const tourLabels = Object.keys(tournamentCounts);
    const tourData = Object.values(tournamentCounts);

    const ctxTournaments = document.getElementById("chart-tournaments")?.getContext("2d");
    if (ctxTournaments) {
        const labelsToUse = tourLabels.length > 0 ? tourLabels : ["Sin Respuestas"];
        const dataToUse = tourData.length > 0 ? tourData : [1];
        const bgColors = tourData.length > 0 ? [
            "#ef4444", "#10b981", "#3b82f6", "#f59e0b", "#f43f5e", "#a855f7"
        ] : ["rgba(255, 255, 255, 0.08)"];

        if (chartTournaments) {
            chartTournaments.data.labels = labelsToUse;
            chartTournaments.data.datasets[0].data = dataToUse;
            chartTournaments.data.datasets[0].backgroundColor = bgColors;
            chartTournaments.update("none");
        } else {
            chartTournaments = new Chart(ctxTournaments, {
                type: "doughnut",
                data: {
                    labels: labelsToUse,
                    datasets: [{
                        data: dataToUse,
                        backgroundColor: bgColors,
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
        const npsLabels = [
            `Promotores: ${npsProm}`,
            `Pasivos: ${npsPass}`,
            `Detractores: ${npsDet}`
        ];
        const npsData = (npsProm + npsPass + npsDet > 0) ? [npsProm, npsPass, npsDet] : [0, 0, 1];
        const npsBg = (npsProm + npsPass + npsDet > 0) ? [
            "#10b981", "#f59e0b", "#f43f5e"
        ] : ["rgba(255, 255, 255, 0.08)"];

        if (chartNps) {
            chartNps.data.labels = npsLabels;
            chartNps.data.datasets[0].data = npsData;
            chartNps.data.datasets[0].backgroundColor = npsBg;
            chartNps.update("none");
        } else {
            chartNps = new Chart(ctxNps, {
                type: "pie",
                data: {
                    labels: npsLabels,
                    datasets: [{
                        data: npsData,
                        backgroundColor: npsBg,
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
}

// =========================================================================
// 7. RENDER DE TESTIMONIOS Y SUGERENCIAS (CON PAGINACIÓN DE 6 REGISTROS)
// =========================================================================
function switchQuotesTab(tab) {
    currentTab = tab;
    currentQuotesPage = 1; // Al cambiar pestaña se vuelve a la página 1
    document.querySelectorAll(".pill-btn").forEach(btn => {
        if (btn.getAttribute("data-tab") === tab) btn.classList.add("active");
        else btn.classList.remove("active");
    });
    renderQuotes();
}
window.switchQuotesTab = switchQuotesTab;

function renderQuotes() {
    const container = document.getElementById("quotes-container");
    const paginationEl = document.getElementById("quotes-pagination");
    const paginationInfo = document.getElementById("quotes-pagination-info");
    const paginationNumbers = document.getElementById("quotes-pagination-numbers");
    const btnPrev = document.getElementById("btn-quotes-prev");
    const btnNext = document.getElementById("btn-quotes-next");

    // Mini controles en el encabezado
    const miniNav = document.getElementById("quotes-mini-nav");
    const miniIndicator = document.getElementById("quotes-mini-indicator");
    const miniBtnPrev = document.getElementById("btn-quotes-prev-mini");
    const miniBtnNext = document.getElementById("btn-quotes-next-mini");

    if (!container) return;

    const itemsWithText = filteredResponses.filter(r => {
        if (currentTab === "liked") return r.likedMost && r.likedMost.trim().length > 1;
        return r.suggestions && r.suggestions.trim().length > 1;
    });

    const totalQuotes = itemsWithText.length;

    if (totalQuotes === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-dim);">
                <i class="fa-regular fa-comment-dots" style="font-size: 2.4rem; margin-bottom: 12px; display: block; opacity: 0.5;"></i>
                <p style="font-size: 0.95rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">No hay comentarios registrados todavía</p>
                <p style="font-size: 0.8rem;">Las opiniones que los participantes envíen en la encuesta se mostrarán aquí de inmediato.</p>
            </div>
        `;
        if (paginationEl) paginationEl.style.display = "none";
        if (miniNav) miniNav.style.display = "none";
        return;
    }

    const totalPages = Math.ceil(totalQuotes / QUOTES_PAGE_SIZE) || 1;

    if (currentQuotesPage > totalPages) currentQuotesPage = totalPages;
    if (currentQuotesPage < 1) currentQuotesPage = 1;

    // Solo se muestra navegación si se superan los 6 testimonios (más de 1 página)
    const hasMultiplePages = totalQuotes > QUOTES_PAGE_SIZE;
    if (paginationEl) paginationEl.style.display = hasMultiplePages ? "flex" : "none";
    if (miniNav) miniNav.style.display = hasMultiplePages ? "flex" : "none";

    const startIdx = (currentQuotesPage - 1) * QUOTES_PAGE_SIZE;
    const endIdx = Math.min(startIdx + QUOTES_PAGE_SIZE, totalQuotes);
    const pageQuotes = itemsWithText.slice(startIdx, endIdx);

    const labelCategory = currentTab === "liked" ? "lo que más gustó" : "sugerencias 2027";

    if (paginationInfo) {
        paginationInfo.innerHTML = `Mostrando <strong>${startIdx + 1} - ${endIdx}</strong> de <strong>${totalQuotes}</strong> opiniones (${labelCategory} • Pág. ${currentQuotesPage} de ${totalPages})`;
    }

    if (miniIndicator) {
        miniIndicator.textContent = `${currentQuotesPage} / ${totalPages}`;
    }

    const isFirstPage = currentQuotesPage <= 1;
    const isLastPage = currentQuotesPage >= totalPages;

    if (btnPrev) btnPrev.disabled = isFirstPage;
    if (btnNext) btnNext.disabled = isLastPage;
    if (miniBtnPrev) miniBtnPrev.disabled = isFirstPage;
    if (miniBtnNext) miniBtnNext.disabled = isLastPage;

    if (paginationNumbers) {
        let pagesHtml = "";
        for (let p = 1; p <= totalPages; p++) {
            pagesHtml += `<button type="button" class="page-num-btn ${p === currentQuotesPage ? 'active' : ''}" onclick="goToQuotesPage(${p})">${p}</button>`;
        }
        paginationNumbers.innerHTML = pagesHtml;
    }

    const quotesHtml = pageQuotes.map(r => {
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

    if (container.innerHTML !== quotesHtml) {
        container.innerHTML = quotesHtml;
    }
}

// Handlers de Paginación de Opiniones
window.changeQuotesPage = function(delta) {
    const itemsWithText = filteredResponses.filter(r => {
        if (currentTab === "liked") return r.likedMost && r.likedMost.trim().length > 1;
        return r.suggestions && r.suggestions.trim().length > 1;
    });
    const totalPages = Math.ceil(itemsWithText.length / QUOTES_PAGE_SIZE) || 1;
    const targetPage = currentQuotesPage + delta;
    if (targetPage >= 1 && targetPage <= totalPages) {
        currentQuotesPage = targetPage;
        renderQuotes();
    }
};

window.goToQuotesPage = function(page) {
    const itemsWithText = filteredResponses.filter(r => {
        if (currentTab === "liked") return r.likedMost && r.likedMost.trim().length > 1;
        return r.suggestions && r.suggestions.trim().length > 1;
    });
    const totalPages = Math.ceil(itemsWithText.length / QUOTES_PAGE_SIZE) || 1;
    if (page >= 1 && page <= totalPages) {
        currentQuotesPage = page;
        renderQuotes();
    }
};

// =========================================================================
// 8. RENDER DE TABLA DE RESPUESTAS (CON PAGINACIÓN DE 5 REGISTROS)
// =========================================================================
function renderTable() {
    const tbody = document.getElementById("responses-tbody");
    const countLabel = document.getElementById("table-count-label");
    const paginationEl = document.getElementById("table-pagination");
    const paginationInfo = document.getElementById("pagination-info");
    const paginationNumbers = document.getElementById("pagination-numbers");
    const btnPrev = document.getElementById("btn-page-prev");
    const btnNext = document.getElementById("btn-page-next");
    if (!tbody) return;

    const totalRecords = filteredResponses.length;
    const totalPages = Math.ceil(totalRecords / TABLE_PAGE_SIZE) || 1;

    if (currentTablePage > totalPages) currentTablePage = totalPages;
    if (currentTablePage < 1) currentTablePage = 1;

    if (countLabel) {
        countLabel.textContent = `${totalRecords} respuestas encontradas (de ${allResponses.length} en Google Sheets)`;
    }

    if (totalRecords === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 48px; color: var(--text-dim);">
                    <i class="fa-solid fa-inbox" style="font-size: 2rem; margin-bottom: 10px; display: block; opacity: 0.4;"></i>
                    No hay respuestas que mostrar con los filtros actuales.
                </td>
            </tr>
        `;
        if (paginationEl) paginationEl.style.display = "none";
        return;
    }

    if (paginationEl) paginationEl.style.display = "flex";

    const startIdx = (currentTablePage - 1) * TABLE_PAGE_SIZE;
    const endIdx = Math.min(startIdx + TABLE_PAGE_SIZE, totalRecords);
    const pageRecords = filteredResponses.slice(startIdx, endIdx);

    if (paginationInfo) {
        paginationInfo.innerHTML = `Mostrando <strong>${startIdx + 1} - ${endIdx}</strong> de <strong>${totalRecords}</strong> registros (Pág. ${currentTablePage} de ${totalPages})`;
    }

    if (btnPrev) btnPrev.disabled = currentTablePage <= 1;
    if (btnNext) btnNext.disabled = currentTablePage >= totalPages;

    if (paginationNumbers) {
        let pagesHtml = "";
        for (let p = 1; p <= totalPages; p++) {
            pagesHtml += `<button type="button" class="page-num-btn ${p === currentTablePage ? 'active' : ''}" onclick="goToTablePage(${p})">${p}</button>`;
        }
        paginationNumbers.innerHTML = pagesHtml;
    }

    const tableHtml = pageRecords.map(r => {
        const stars = parseInt(r.overallRating, 10) || 5;
        const starsHtml = `<span class="star-rating-cell">${stars} <i class="fa-solid fa-star"></i></span>`;

        // Torneo badges (permite 1 o 2 torneos)
        const tourList = (r.tournament || "General").split(/,\s*|\s*\+\s*/).map(s => s.trim()).filter(Boolean);
        const tourBadgesHtml = tourList.map(tName => {
            const tLower = tName.toLowerCase();
            let tClass = "pill-other";
            if (tLower.includes("smash")) tClass = "pill-smash";
            else if (tLower.includes("fc")) tClass = "pill-fc";
            else if (tLower.includes("mario")) tClass = "pill-mk";
            else if (tLower.includes("street")) tClass = "pill-sf";
            else if (tLower.includes("nba") || tLower.includes("valorant")) tClass = "pill-val";
            return `<span class="pill-tag ${tClass}" style="margin: 2px 2px 2px 0; display: inline-block;">${escapeHtml(tName)}</span>`;
        }).join(" ");

        // NPS badge
        const npsVal = parseInt(r.nps, 10);
        let npsBadge = `<span class="nps-badge nps-passive">N/A</span>`;
        if (!isNaN(npsVal)) {
            if (npsVal >= 9) npsBadge = `<span class="nps-badge nps-promoter">${npsVal} • Promotor</span>`;
            else if (npsVal >= 7) npsBadge = `<span class="nps-badge nps-passive">${npsVal} • Pasivo</span>`;
            else npsBadge = `<span class="nps-badge nps-detractor">${npsVal} • Detractor</span>`;
        }

        const rifasHtml = (r.rifasRating !== null && r.rifasRating !== undefined)
            ? `<span class="pill-tag pill-gold" style="font-weight: 700; font-size: 0.75rem;"><i class="fa-solid fa-gift"></i> ${r.rifasRating}/10</span>`
            : `<span style="color: var(--text-dim); font-size: 0.75rem;">-</span>`;

        const comments = [r.likedMost, r.suggestions].filter(Boolean).join(" • ");
        const commentPreview = comments.length > 60 ? comments.substring(0, 58) + "..." : (comments || "Sin comentarios");

        return `
            <tr>
                <td style="color: var(--text-muted); font-size: 0.75rem; white-space: nowrap;">${escapeHtml(r.dateFormatted || "Reciente")}</td>
                <td style="font-weight: 700; color: #ffffff;">${escapeHtml(r.gamertag || "Anónimo")}</td>
                <td style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.email || "-")}</td>
                <td>${tourBadgesHtml}</td>
                <td>${starsHtml}</td>
                <td style="font-size: 0.76rem; min-width: 145px; padding: 6px 10px;">
                    <div style="display: flex; flex-direction: column; gap: 3px; line-height: 1.3;">
                        <span style="display: flex; justify-content: space-between; gap: 6px;">
                            <span style="color: var(--text-muted);"><i class="fa-solid fa-clock" style="color: #a855f7; width: 14px;"></i> Puntualidad:</span>
                            <strong style="color: #f3f4f6;">${r.metricPunctuality || "-"}★</strong>
                        </span>
                        <span style="display: flex; justify-content: space-between; gap: 6px;">
                            <span style="color: var(--text-muted);"><i class="fa-solid fa-microchip" style="color: #06b6d4; width: 14px;"></i> Hardware:</span>
                            <strong style="color: #f3f4f6;">${r.metricHardware || "-"}★</strong>
                        </span>
                        <span style="display: flex; justify-content: space-between; gap: 6px;">
                            <span style="color: var(--text-muted);"><i class="fa-solid fa-user-shield" style="color: #10b981; width: 14px;"></i> Staff/Jueces:</span>
                            <strong style="color: #f3f4f6;">${r.metricStaff || "-"}★</strong>
                        </span>
                        <span style="display: flex; justify-content: space-between; gap: 6px;">
                            <span style="color: var(--text-muted);"><i class="fa-solid fa-volume-high" style="color: #f59e0b; width: 14px;"></i> Ambiente:</span>
                            <strong style="color: #f3f4f6;">${r.metricAtmosphere || "-"}★</strong>
                        </span>
                    </div>
                </td>
                <td>${rifasHtml}</td>
                <td>${npsBadge}</td>
                <td style="max-width: 260px; font-size: 0.78rem; color: var(--text-light); line-height: 1.4;" title="${escapeHtml(comments)}">
                    ${escapeHtml(commentPreview)}
                </td>
            </tr>
        `;
    }).join("");

    if (tbody.innerHTML !== tableHtml) {
        tbody.innerHTML = tableHtml;
    }
}

// Handlers de Paginación
window.changeTablePage = function(delta) {
    const totalPages = Math.ceil(filteredResponses.length / TABLE_PAGE_SIZE) || 1;
    const targetPage = currentTablePage + delta;
    if (targetPage >= 1 && targetPage <= totalPages) {
        currentTablePage = targetPage;
        renderTable();
    }
};

window.goToTablePage = function(page) {
    const totalPages = Math.ceil(filteredResponses.length / TABLE_PAGE_SIZE) || 1;
    if (page >= 1 && page <= totalPages) {
        currentTablePage = page;
        renderTable();
    }
};

// =========================================================================
// 9. EXPORTACIÓN A CSV / EXCEL
// =========================================================================
function exportAllCsv() {
    exportToCsv(allResponses, "SGF2026_Feedback_Oficial.csv");
}
window.exportAllCsv = exportAllCsv;

function exportFilteredCsv() {
    exportToCsv(filteredResponses, "SGF2026_Feedback_Filtrado.csv");
}
window.exportFilteredCsv = exportFilteredCsv;

function exportToCsv(dataList, filename) {
    if (!dataList || dataList.length === 0) {
        alert("No hay respuestas registradas para exportar.");
        return;
    }

    const headers = [
        "Fecha Registro", "GamerTag", "Email", "Torneo",
        "Calificación General", "Puntualidad", "Hardware y Setups",
        "Staff y Jueces", "Ambiente y Audio", "Gestión de Rifas (1-10)", "NPS",
        "Lo que más gustó", "Sugerencias y 2027"
    ];

    const rows = dataList.map(r => [
        `"${(r.dateFormatted || "").replace(/"/g, '""')}"`,
        `"${(r.gamertag || "").replace(/"/g, '""')}"`,
        `"${(r.email || "").replace(/"/g, '""')}"`,
        `"${(r.tournament || "").replace(/"/g, '""')}"`,
        r.overallRating || "",
        r.metricPunctuality || "",
        r.metricHardware || "",
        r.metricStaff || "",
        r.metricAtmosphere || "",
        (r.rifasRating !== null && r.rifasRating !== undefined) ? r.rifasRating : "",
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
// 10. UTILIDADES
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
