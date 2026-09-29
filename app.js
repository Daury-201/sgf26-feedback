/**
 * Students Gaming Festival 2026 (SGF 2026)
 * Encuesta Oficial de Experiencia y Satisfacción (Feedback Microsite)
 * 
 * Lógica interactiva del formulario, cálculo de progreso en tiempo real,
 * animación de estrellas y NPS, validaciones y envío (Google Sheets / LocalStorage).
 */

// =========================================================================
// CONFIGURACIÓN DE CONEXIÓN (GOOGLE SHEETS WEBHOOK)
// =========================================================================
const GOOGLE_SHEETS_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbyZ13BhWqpeBJ-vIhJ0U8iAxQJbTSXunhOvqhhk0pune6b3OiRFgG7D-H5PDaf8bebQow/exec"; 

const LOCAL_STORAGE_KEY = "sgf26_feedback_submissions_v1";

// =========================================================================
// ESTADO Y REFERENCIAS DEL DOM
// =========================================================================
const form = document.getElementById("feedback-form");
const successView = document.getElementById("success-view");
const btnSubmit = document.getElementById("btn-submit");
const progressFill = document.getElementById("progress-fill");
const progressPercentText = document.getElementById("progress-percent-text");
const progressStepText = document.getElementById("progress-step-text");
const toastEl = document.getElementById("survey-toast");

// Campos de entrada
const inpGamertag = document.getElementById("inp-gamertag");
const inpEmail = document.getElementById("inp-email");
const inpSelectedGame = document.getElementById("inp-selected-game");
const inpOverallRating = document.getElementById("inp-overall-rating");
const inpNps = document.getElementById("inp-nps");
const inpLikedMost = document.getElementById("inp-liked-most");
const inpSuggestions = document.getElementById("inp-suggestions");

// Rating feedback badge y textos
const ratingBadge = document.getElementById("rating-feedback-label");
const starButtons = document.querySelectorAll("#stars-overall .star-btn");
const gameCardOptions = document.querySelectorAll(".game-card-option");
const segmentedButtons = document.querySelectorAll(".segmented-rating button");
const npsButtons = document.querySelectorAll("#nps-bar button");

const RATING_TEXTS = {
    1: "💀 1/5 - Deficiente (Pudo ser mucho mejor)",
    2: "⚠️ 2/5 - Regular (Aspectos clave a pulir)",
    3: "🎮 3/5 - Bueno (Buena experiencia competitiva)",
    4: "🔥 4/5 - ¡Muy Bueno! (Gran nivel y organización)",
    5: "👑 5/5 - ¡LEGENDARIO! (Experiencia inolvidable)"
};

let currentHoveredStar = 0;
let selectedStarValue = 0;

// =========================================================================
// FUNCIONES GLOBALES DE INTERACCIÓN DIRECTA (INLINE ONCLICK HANDLERS)
// =========================================================================
window.selectGameCard = function(el) {
    document.querySelectorAll(".game-card-option").forEach(c => c.classList.remove("selected"));
    el.classList.add("selected");
    const gameName = el.getAttribute("data-game-name") || "";
    const inp = document.getElementById("inp-selected-game");
    if (inp) inp.value = gameName;
    clearError("err-game");
    updateProgress();
};

window.selectStar = function(val) {
    const parsed = parseInt(val, 10) || 0;
    selectedStarValue = parsed;
    window.selectedStarValue = parsed;
    const inp = document.getElementById("inp-overall-rating");
    if (inp) inp.value = parsed;
    renderStars(parsed, true);
    clearError("err-overall");
    updateProgress();
};

window.hoverStar = function(val) {
    renderStars(parseInt(val, 10) || 0, false);
};

window.leaveStar = function() {
    renderStars(selectedStarValue || window.selectedStarValue || 0, false);
};

window.selectMetric = function(btn, metricName, val) {
    const container = btn.closest(".segmented-rating");
    if (container) {
        container.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    }
    btn.classList.add("active");
    const hiddenInp = document.getElementById(`inp-metric-${metricName}`);
    if (hiddenInp) hiddenInp.value = val;
    updateProgress();
};

window.selectNps = function(btn, val) {
    const bar = document.getElementById("nps-bar");
    if (bar) {
        bar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    }
    btn.classList.add("active");
    const inp = document.getElementById("inp-nps");
    if (inp) inp.value = val;
    updateProgress();
};

window.selectRifas = function(btn, val) {
    const bar = document.getElementById("rifas-bar");
    if (bar) {
        bar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
    }
    btn.classList.add("active");
    const inp = document.getElementById("inp-rifas-rating");
    if (inp) inp.value = val;
    clearError("err-rifas");
    updateProgress();
};

function initRifasBar() {
    const bar = document.getElementById("rifas-bar");
    if (bar) {
        bar.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            const val = btn.getAttribute("data-rifas");
            window.selectRifas(btn, val);
        });
    }
}

// =========================================================================
// INICIALIZACIÓN A PRUEBA DE FALLOS
// =========================================================================
function initAll() {
    checkExistingSubmission();
    initUrlParams();
    initGameSelector();
    initStarRating();
    initSegmentedRatings();
    initRifasBar();
    initNpsBar();
    initInputListeners();
    updateProgress();
}

function checkExistingSubmission() {
    const params = new URLSearchParams(window.location.search);
    const emailParam = (params.get("email") || params.get("correo") || "").toLowerCase().trim();
    const isSubmitted = localStorage.getItem("sgf26_user_feedback_submitted") === "true";
    const isEmailSubmittedLocally = emailParam && localStorage.getItem("sgf26_submitted_email_" + emailParam) === "true";

    if (isSubmitted || isEmailSubmittedLocally) {
        const savedTag = localStorage.getItem("sgf26_submitted_gamertag") || params.get("gamertag") || "Competidor";
        const savedGame = localStorage.getItem("sgf26_submitted_game") || "";
        showSuccessView({ gamertag: savedTag, tournament: savedGame }, false);
        return;
    }

    // Verificación remota en tiempo real: Si abrió el link en otro dispositivo o ventana privada, consultar Google Sheets
    if (emailParam && GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.trim().length > 10) {
        fetch(`${GOOGLE_SHEETS_WEBHOOK_URL}?checkEmail=${encodeURIComponent(emailParam)}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.alreadySubmitted) {
                    localStorage.setItem("sgf26_user_feedback_submitted", "true");
                    localStorage.setItem("sgf26_submitted_email_" + emailParam, "true");
                    const tag = params.get("gamertag") || "Competidor";
                    showSuccessView({ gamertag: tag, tournament: "" }, false);
                }
            })
            .catch(() => {});
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAll);
} else {
    initAll();
}

// =========================================================================
// 1. AUTO-RELLENO POR PARÁMETROS URL (?email=...&gamertag=...&game=...)
// =========================================================================
function initUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    // Gamertag / Alias
    const tag = params.get("gamertag") || params.get("tag") || params.get("alias") || params.get("player");
    if (tag && inpGamertag) {
        inpGamertag.value = decodeURIComponent(tag.trim());
    }

    // Email (si viene por parámetro en el enlace de correo, queda fijado y protegido)
    const email = params.get("email") || params.get("correo");
    if (email && inpEmail) {
        const cleanEmail = decodeURIComponent(email.trim());
        inpEmail.value = cleanEmail;
        inpEmail.setAttribute("readonly", "true");
        inpEmail.style.opacity = "0.85";
        inpEmail.style.borderColor = "rgba(168, 85, 247, 0.6)";
        inpEmail.title = "Correo de participante verificado oficialmente";
    }

    // Torneo / Juego
    const game = params.get("game") || params.get("torneo");
    if (game) {
        const normalizedGame = game.toLowerCase().trim();
        const cards = document.querySelectorAll(".game-card-option");
        const targetOption = Array.from(cards).find(opt => {
            const key = (opt.getAttribute("data-game-key") || "").toLowerCase();
            return key === normalizedGame || key.includes(normalizedGame) || normalizedGame.includes(key);
        });

        if (targetOption) {
            selectGameOption(targetOption);
        }
    }
}

// =========================================================================
// 2. SELECTOR DE JUEGOS / TORNEOS (DELEGACIÓN + LISTENER DIRECTO)
// =========================================================================
function initGameSelector() {
    const grid = document.getElementById("game-select-grid");
    if (grid) {
        grid.addEventListener("click", (e) => {
            const card = e.target.closest(".game-card-option");
            if (!card) return;
            selectGameOption(card);
            clearError("err-game");
            updateProgress();
        });
    }

    const cards = document.querySelectorAll(".game-card-option");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            selectGameOption(card);
            clearError("err-game");
            updateProgress();
        });
    });
}

function selectGameOption(targetCard) {
    const cards = document.querySelectorAll(".game-card-option");
    cards.forEach(c => c.classList.remove("selected"));
    targetCard.classList.add("selected");
    const gameName = targetCard.getAttribute("data-game-name") || "";
    const inp = document.getElementById("inp-selected-game");
    if (inp) inp.value = gameName;
}

// =========================================================================
// 3. ESTRELLAS NEÓN DE CALIFICACIÓN GENERAL (ESTABLE SIN JITTER)
// =========================================================================
function initStarRating() {
    const starsContainer = document.getElementById("stars-overall");
    if (!starsContainer) return;

    // Delegación de clic inmediata
    starsContainer.addEventListener("click", (e) => {
        const btn = e.target.closest(".star-btn");
        if (!btn) return;
        const val = parseInt(btn.getAttribute("data-value"), 10);
        window.selectStar(val);
    });

    const stars = starsContainer.querySelectorAll(".star-btn");
    stars.forEach(btn => {
        const val = parseInt(btn.getAttribute("data-value"), 10);
        btn.addEventListener("mouseenter", () => {
            window.hoverStar(val);
        });
    });

    starsContainer.addEventListener("mouseleave", () => {
        window.leaveStar();
    });
}

function renderStars(activeCount, isClick = false) {
    const count = parseInt(activeCount, 10) || 0;
    const stars = document.querySelectorAll("#stars-overall .star-btn");
    stars.forEach(btn => {
        const val = parseInt(btn.getAttribute("data-value"), 10);
        const icon = btn.querySelector("i");
        if (val <= count) {
            btn.classList.add("active");
            if (icon) {
                icon.style.setProperty("color", "#f59e0b", "important");
                icon.style.setProperty("filter", "drop-shadow(0 0 16px rgba(245, 158, 11, 0.95)) drop-shadow(0 0 28px rgba(245, 158, 11, 0.5))", "important");
                icon.style.setProperty("transform", "scale(1.15)", "important");
                if (isClick) {
                    icon.style.animation = "none";
                    void icon.offsetWidth;
                    icon.style.animation = `starPop 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${(val - 1) * 0.06}s forwards`;
                }
            }
        } else {
            btn.classList.remove("active");
            if (icon) {
                icon.style.setProperty("color", "rgba(255, 255, 255, 0.16)", "important");
                icon.style.setProperty("filter", "none", "important");
                icon.style.setProperty("transform", "scale(1)", "important");
                icon.style.animation = "none";
            }
        }
    });

    const badge = document.getElementById("rating-feedback-label");
    if (badge) {
        if (count > 0 && RATING_TEXTS[count]) {
            badge.textContent = RATING_TEXTS[count];
            badge.classList.add("active");
            badge.style.setProperty("border-color", "#f59e0b", "important");
            badge.style.setProperty("color", "#fef08a", "important");
            badge.style.setProperty("background", "rgba(245, 158, 11, 0.15)", "important");
            badge.style.setProperty("box-shadow", "0 0 15px rgba(245, 158, 11, 0.4)", "important");
        } else {
            badge.textContent = "Selecciona de 1 a 5 estrellas";
            badge.classList.remove("active");
            badge.style.removeProperty("border-color");
            badge.style.removeProperty("color");
            badge.style.removeProperty("background");
            badge.style.removeProperty("box-shadow");
        }
    }
}
window.renderStars = renderStars;

// =========================================================================
// 4. RATINGS SEGMENTADOS (LOGÍSTICA 1-5)
// =========================================================================
function initSegmentedRatings() {
    const grid = document.querySelector(".metrics-grid");
    if (grid) {
        grid.addEventListener("click", (e) => {
            const btn = e.target.closest(".segmented-rating button");
            if (!btn) return;
            const container = btn.closest(".segmented-rating");
            if (!container) return;
            const metricName = container.getAttribute("data-name");
            const hiddenInp = document.getElementById(`inp-metric-${metricName}`);
            container.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            if (hiddenInp) {
                hiddenInp.value = btn.getAttribute("data-val");
            }
            updateProgress();
        });
    }
}

// =========================================================================
// 5. SELECTOR NET PROMOTER SCORE (NPS 0-10)
// =========================================================================
function initNpsBar() {
    const bar = document.getElementById("nps-bar");
    if (bar) {
        bar.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (!btn) return;
            bar.querySelectorAll("button").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const npsVal = btn.getAttribute("data-nps");
            const inp = document.getElementById("inp-nps");
            if (inp) inp.value = npsVal;
            updateProgress();
        });
    }
}

// =========================================================================
// 6. ESCUCHA DE INPUTS Y CÁLCULO DE PROGRESO
// =========================================================================
function initInputListeners() {
    if (inpGamertag) {
        inpGamertag.addEventListener("input", () => {
            clearError("err-gamertag");
            updateProgress();
        });
    }
    if (inpLikedMost) {
        inpLikedMost.addEventListener("input", () => {
            clearError("err-liked");
            updateProgress();
        });
    }
    if (inpSuggestions) {
        inpSuggestions.addEventListener("input", () => {
            clearError("err-suggestions");
            updateProgress();
        });
    }
}

function updateProgress() {
    let score = 0;
    const maxScore = 8; // Exactamente 8 pasos obligatorios

    // 1. GamerTag completado (Paso 1)
    if (inpGamertag && inpGamertag.value.trim().length >= 2) score += 1;

    // 2. Torneo seleccionado (Paso 1)
    if (inpSelectedGame && inpSelectedGame.value.trim().length > 0) score += 1;

    // 3. Rating General de estrellas (Paso 2)
    if (selectedStarValue > 0) score += 1;

    // 4. Métricas de logística (las 4 evaluadas) (Paso 3)
    const metricsFilled = [
        document.getElementById("inp-metric-punctuality")?.value,
        document.getElementById("inp-metric-hardware")?.value,
        document.getElementById("inp-metric-staff")?.value,
        document.getElementById("inp-metric-atmosphere")?.value
    ].filter(Boolean).length;
    if (metricsFilled >= 4) score += 1;

    // 5. Gestión de Rifas (1-10) (Paso 4)
    const inpRifas = document.getElementById("inp-rifas-rating");
    if (inpRifas && inpRifas.value !== "") score += 1;

    // 6. NPS (0-10) (Paso 5)
    if (inpNps && inpNps.value !== "") score += 1;

    // 7. Pregunta 1 obligatoria: Qué más gustó (Paso 6)
    if (inpLikedMost && inpLikedMost.value.trim().length >= 2) score += 1;

    // 8. Pregunta 2 obligatoria: Mejoras o 2027 (Paso 6)
    if (inpSuggestions && inpSuggestions.value.trim().length >= 2) score += 1;

    const percentage = Math.min(100, Math.round((score / maxScore) * 100));

    // Actualizar barra de progreso con relleno completo al 100%
    if (progressFill) {
        progressFill.style.width = `${percentage}%`;
        if (percentage === 100) {
            progressFill.style.background = "linear-gradient(90deg, #10b981, #06b6d4, #a855f7)";
            progressFill.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.85)";
        } else {
            progressFill.style.background = "linear-gradient(90deg, #7c3aed, #a855f7, #06b6d4)";
            progressFill.style.boxShadow = "0 0 10px rgba(168, 85, 247, 0.8)";
        }
    }
    if (progressPercentText) progressPercentText.textContent = `${percentage}%`;

    // Mensaje de etapa dinámico
    if (progressStepText) {
        if (percentage === 0) progressStepText.textContent = "Comienza la encuesta";
        else if (percentage < 25) progressStepText.textContent = "Paso 1: Identidad y Torneo";
        else if (percentage < 40) progressStepText.textContent = "Paso 2: Calificación General";
        else if (percentage < 60) progressStepText.textContent = "Paso 3: Métricas de Calidad";
        else if (percentage < 75) progressStepText.textContent = "Paso 4: Gestión de Rifas";
        else if (percentage < 90) progressStepText.textContent = "Paso 5: Recomendación (NPS)";
        else if (percentage < 100) progressStepText.textContent = "Paso 6: Completa tus comentarios";
        else progressStepText.textContent = "¡100% Completado! Listo para enviar";
    }
}

// =========================================================================
// 7. ENVÍO Y VALIDACIÓN DEL FORMULARIO
// =========================================================================
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Validaciones obligatorias
        let hasErrors = false;
        let firstErrorElement = null;

        // Validar GamerTag
        const tag = inpGamertag ? inpGamertag.value.trim() : "";
        if (!tag) {
            showError("err-gamertag", "Por favor ingresa tu GamerTag o nombre.");
            if (!firstErrorElement) firstErrorElement = inpGamertag;
            hasErrors = true;
        }

        // Validar Torneo
        const game = inpSelectedGame ? inpSelectedGame.value.trim() : "";
        if (!game) {
            showError("err-game", "Selecciona el torneo o tu rol en el SGF 2026.");
            if (!firstErrorElement) firstErrorElement = document.getElementById("game-select-grid");
            hasErrors = true;
        }

        // Validar Calificación General (Estrellas)
        if (!selectedStarValue || selectedStarValue === 0) {
            showError("err-overall", "Por favor califica el evento con las estrellas neón.");
            if (!firstErrorElement) firstErrorElement = document.getElementById("stars-overall");
            hasErrors = true;
        }

        // Validar Gestión de Rifas (1-10)
        const inpRifas = document.getElementById("inp-rifas-rating");
        const rifasVal = inpRifas ? inpRifas.value.trim() : "";
        if (!rifasVal) {
            showError("err-rifas", "Por favor califica del 1 al 10 la manera en que se gestionaron las rifas.");
            if (!firstErrorElement) firstErrorElement = document.getElementById("section-rifas");
            hasErrors = true;
        }

        // Validar Pregunta 1: Qué más gustó (Obligatoria)
        const liked = inpLikedMost ? inpLikedMost.value.trim() : "";
        if (!liked || liked.length < 2) {
            showError("err-liked", "Por favor cuéntanos qué fue lo que más te gustó de esta edición.");
            if (!firstErrorElement) firstErrorElement = inpLikedMost;
            hasErrors = true;
        }

        // Validar Pregunta 2: Sugerencias o mejoras 2027 (Obligatoria)
        const suggestions = inpSuggestions ? inpSuggestions.value.trim() : "";
        if (!suggestions || suggestions.length < 2) {
            showError("err-suggestions", "Por favor déjanos tus sugerencias o mejoras para 2027.");
            if (!firstErrorElement) firstErrorElement = inpSuggestions;
            hasErrors = true;
        }

        if (hasErrors) {
            if (firstErrorElement) {
                firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
            }
            showToast("⚠️ Completa los campos requeridos marcados en rojo.", "error");
            return;
        }

        // Obtener identidad (cargada por URL param si se envió por correo, o predeterminada)
        const finalTag = tag || "Competidor SGF";
        const email = (inpEmail && inpEmail.value.trim()) ? inpEmail.value.trim() : "";

        // Preparar Payload oficial
        const ticketId = generateTicketId();
        const payload = {
            id: ticketId,
            timestamp: new Date().toISOString(),
            dateFormatted: new Intl.DateTimeFormat('es-DO', { dateStyle: 'full', timeStyle: 'short' }).format(new Date()),
            gamertag: finalTag,
            email: email,
            tournament: game,
            overallRating: selectedStarValue,
            metricPunctuality: document.getElementById("inp-metric-punctuality")?.value || "N/A",
            metricHardware: document.getElementById("inp-metric-hardware")?.value || "N/A",
            metricStaff: document.getElementById("inp-metric-staff")?.value || "N/A",
            metricAtmosphere: document.getElementById("inp-metric-atmosphere")?.value || "N/A",
            rifasRating: rifasVal,
            nps: inpNps?.value || "N/A",
            likedMost: inpLikedMost?.value.trim() || "",
            suggestions: inpSuggestions?.value.trim() || "",
            userAgent: navigator.userAgent
        };

        // Mostrar estado de carga en el botón
        setSubmittingState(true);

        try {
            // 1. Guardar localmente siempre (garantiza respaldo inmediato)
            saveSubmissionLocally(payload);

            // 2. Bloquear repetición de encuesta en este equipo/navegador y por correo
            localStorage.setItem("sgf26_user_feedback_submitted", "true");
            localStorage.setItem("sgf26_submitted_gamertag", finalTag);
            localStorage.setItem("sgf26_submitted_game", game);
            if (email) {
                localStorage.setItem("sgf26_submitted_email_" + email.toLowerCase(), "true");
            }

            // 3. Enviar a Google Sheets Webhook si está configurado
            if (GOOGLE_SHEETS_WEBHOOK_URL && GOOGLE_SHEETS_WEBHOOK_URL.trim().length > 10) {
                try {
                    await fetch(GOOGLE_SHEETS_WEBHOOK_URL, {
                        method: "POST",
                        mode: "no-cors",
                        headers: { 
                            "Content-Type": "text/plain;charset=utf-8" 
                        },
                        body: JSON.stringify(payload)
                    });
                } catch (netErr) {
                    console.warn("Webhook falló en segundo plano, guardado localmente:", netErr);
                }
            }

            // 4. Breve transición suave
            await new Promise(resolve => setTimeout(resolve, 600));

            // 5. Mostrar pantalla de éxito con celebración
            showSuccessView(payload, true);
            triggerCelebrationConfetti();
            showToast("🎉 ¡Tus respuestas fueron registradas exitosamente!", "success");

        } catch (err) {
            console.error("Error en envío:", err);
            showToast("Hubo un detalle al enviar, pero tus datos se respaldaron en el navegador.", "warning");
            showSuccessView(payload, true);
        } finally {
            setSubmittingState(false);
        }
    });
}

function setSubmittingState(isSubmitting) {
    if (!btnSubmit) return;
    const btnText = btnSubmit.querySelector(".btn-text");
    const btnLoader = btnSubmit.querySelector(".btn-loader");

    btnSubmit.disabled = isSubmitting;
    if (isSubmitting) {
        if (btnText) btnText.style.display = "none";
        if (btnLoader) btnLoader.style.display = "inline-flex";
    } else {
        if (btnText) btnText.style.display = "inline-block";
        if (btnLoader) btnLoader.style.display = "none";
    }
}

// =========================================================================
// 8. PANTALLA DE ÉXITO Y REGISTRO ÚNICO CONFIRMADO
// =========================================================================
function showSuccessView(data, scroll = true) {
    if (form) form.style.display = "none";
    const heroCard = document.querySelector(".survey-hero-card");
    if (heroCard) heroCard.style.display = "none";

    if (successView) {
        successView.style.display = "block";
        if (scroll) {
            successView.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    }

    const tagDisplay = document.getElementById("success-gamertag-display");
    if (tagDisplay && data && data.gamertag) {
        tagDisplay.textContent = data.gamertag;
    }

    // Actualizar progreso a 100% definitivo
    if (progressFill) {
        progressFill.style.width = "100%";
        progressFill.style.background = "linear-gradient(90deg, #10b981, #06b6d4, #a855f7)";
        progressFill.style.boxShadow = "0 0 15px rgba(16, 185, 129, 0.85)";
    }
    if (progressPercentText) progressPercentText.textContent = "100%";
    if (progressStepText) progressStepText.textContent = "Encuesta Confirmada";
}

function resetSurvey() {
    if (form) {
        form.reset();
        form.style.display = "block";
    }
    const heroCard = document.querySelector(".survey-hero-card");
    if (heroCard) heroCard.style.display = "block";

    if (successView) successView.style.display = "none";

    selectedStarValue = 0;
    renderStars(0);
    ratingBadge.textContent = "Selecciona de 1 a 5 estrellas";
    ratingBadge.classList.remove("active");

    gameCardOptions.forEach(c => c.classList.remove("selected"));
    segmentedButtons.forEach(b => b.classList.remove("active"));
    npsButtons.forEach(b => b.classList.remove("active"));

    window.scrollTo({ top: 0, behavior: "smooth" });
    updateProgress();
}

function fallbackCopy(text) {
    const tempInput = document.createElement("input");
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
        document.execCommand("copy");
        showToast(`Código copiado: ${text}`, "info");
    } catch (e) {
        showToast("No se pudo copiar automáticamente.", "error");
    }
    document.body.removeChild(tempInput);
}

// =========================================================================
// 9. PERSISTENCIA LOCAL (LOCALSTORAGE)
// =========================================================================
function saveSubmissionLocally(record) {
    try {
        const stored = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        stored.unshift(record);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stored));
    } catch (e) {
        console.warn("No se pudo almacenar en localStorage", e);
    }
}

// Función auxiliar para administradores: ver respuestas en consola escribiendo sgfGetSubmissions()
window.sgfGetSubmissions = function() {
    try {
        const data = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        console.table(data);
        return data;
    } catch (e) {
        return [];
    }
};

// =========================================================================
// 10. UTILIDADES, ERRORES, TOAST Y CONFETTI
// =========================================================================
function generateTicketId() {
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString(16).toUpperCase();
    const randomNum = Math.floor(100 + Math.random() * 900);
    return `#SGF26-FB-${randomHex}${randomNum}`;
}

function showError(msgId, message) {
    const el = document.getElementById(msgId);
    if (el) {
        if (message) el.textContent = message;
        el.classList.add("visible");
    }
}

function clearError(msgId) {
    const el = document.getElementById(msgId);
    if (el) {
        el.classList.remove("visible");
    }
}

function showToast(text, type = "info") {
    if (!toastEl) return;
    toastEl.textContent = text;
    toastEl.className = `survey-toast show ${type}`;

    setTimeout(() => {
        toastEl.className = "survey-toast";
    }, 3800);
}

function triggerCelebrationConfetti() {
    if (typeof confetti === "function") {
        // Disparo dual épico desde los extremos
        confetti({
            particleCount: 70,
            spread: 60,
            origin: { x: 0.15, y: 0.7 },
            colors: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#ffffff']
        });
        setTimeout(() => {
            confetti({
                particleCount: 70,
                spread: 60,
                origin: { x: 0.85, y: 0.7 },
                colors: ['#a855f7', '#06b6d4', '#ec4899', '#f59e0b', '#ffffff']
            });
        }, 150);
        setTimeout(() => {
            confetti({
                particleCount: 100,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#a855f7', '#06b6d4', '#10b981', '#f59e0b']
            });
        }, 350);
    }
}
