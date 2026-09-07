// Konfiguracja ścieżki do lokalnego pliku bazy na serwerze
const DATA_URL = "./data.json";

// Stan globalny dla kafelków usług
let servicesList = [];
let activeServiceIndex = null;

// Funkcja pomocnicza do bezpiecznego wpisywania tekstu
function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el && text !== undefined && text !== null && text !== "") {
        el.innerText = text;
    }
}

// 1. RENDEROWANIE ZAWARTOŚCI STRONY
function renderAllContent(data) {
    if (!data) return;

    // A. DANE OGÓLNE (HERO + KONTAKT)
    if (data.ogolne) {
        const normalized = {};
        Object.keys(data.ogolne).forEach(k => normalized[k.trim().toLowerCase()] = data.ogolne[k]);

        safeSetText("hero-badge", normalized["hero_badge"]);
        safeSetText("hero-title", normalized["hero_tytul"]);
        safeSetText("hero-desc", normalized["hero_opis"]);
        safeSetText("contact-address", normalized["kontakt_adres"]);
        safeSetText("contact-email", normalized["kontakt_email"]);
        safeSetText("contact-phone", normalized["kontakt_telefon"]);

        const emailLink = document.getElementById("contact-email");
        if (emailLink && normalized["kontakt_email"]) {
            emailLink.href = `mailto:${normalized["kontakt_email"]}`;
        }
    }

    // B. ZESPÓŁ
    const teamContainer = document.getElementById("team-container");
    if (teamContainer && data.zespol && data.zespol.length > 0) {
        teamContainer.innerHTML = "";
        data.zespol.forEach(member => {
            const card = document.createElement("article");
            card.className = "team-card";
            card.innerHTML = `
                <div class="team-image-wrapper">
                    <img src="${member.zdjecie || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face'}" alt="${member.imie}" class="team-avatar">
                </div>
                <div class="team-info">
                    <h3>${member.imie}</h3>
                    ${member.rola ? `<span class="team-role">${member.rola}</span>` : ""}
                    <p>${member.opis}</p>
                </div>
            `;
            teamContainer.appendChild(card);
        });
    }

    // C. USŁUGI (STABILNA SIATKA ZE SPOTLIGHTEM NA GÓRZE)
    const servicesContainer = document.getElementById("services-container");
    if (servicesContainer && data.uslugi && data.uslugi.length > 0) {
        servicesList = data.uslugi;
        servicesContainer.innerHTML = "";

        servicesList.forEach((service, index) => {
            const ikona = service.ikona || "zap";
            const tytul = service.tytul || "Usługa";
            const krotkiOpis = service.krotki_opis || service.opis || "";

            // Obsługa zarówno wektora Lucide, jak i klasycznego emoji
            const iconHtml = (ikona.length > 2)
                ? `<i data-lucide="${ikona}"></i>`
                : `<span>${ikona}</span>`;

            const card = document.createElement("div");
            card.className = "service-card";
            card.id = `service-card-${index}`;
            card.setAttribute("onclick", `selectService(${index})`);

            card.innerHTML = `
                <div class="service-top">
                    <div class="service-icon">${iconHtml}</div>
                    <span class="service-indicator">↗</span>
                </div>
                <h3>${tytul}</h3>
                <p class="service-short-desc">${krotkiOpis}</p>
            `;
            servicesContainer.appendChild(card);
        });
    }

    // Inicjalizacja ikon Lucide po wyrenderowaniu znaczników
    if (window.lucide) {
        lucide.createIcons();
    }
}

// 2. OBSŁUGA WYBORU I PODGLĄDU USŁUGI W GÓRNYM PANELU
function selectService(index) {
    const previewPanel = document.getElementById("service-preview-panel");

    // Jeśli kliknięto w już otwartą usługę, zwiń panel
    if (activeServiceIndex === index) {
        closeServicePreview();
        return;
    }

    // Usuń wyszarzenie z poprzednio aktywnej karty
    if (activeServiceIndex !== null) {
        const prevCard = document.getElementById(`service-card-${activeServiceIndex}`);
        if (prevCard) prevCard.classList.remove("is-selected");
    }

    activeServiceIndex = index;
    const service = servicesList[index];

    // Wyszarz aktualnie wybraną kartę w dolnej siatce
    const currentCard = document.getElementById(`service-card-${index}`);
    if (currentCard) currentCard.classList.add("is-selected");

    // Przygotuj listę podpunktów
    const podpunkty = Array.isArray(service.podpunkty) ? service.podpunkty : [];
    let subitemsHtml = "";
    if (podpunkty.length > 0) {
        subitemsHtml = `
            <ul class="preview-subitems">
                ${podpunkty.map(item => `<li>${item}</li>`).join("")}
            </ul>
        `;
    }

    const ikona = service.ikona || "zap";
    const iconHtml = (ikona.length > 2)
        ? `<i data-lucide="${ikona}"></i>`
        : `<span>${ikona}</span>`;

    // Uzupełnij treść górnego panelu
    previewPanel.innerHTML = `
        <button class="preview-close-btn" onclick="closeServicePreview()" title="Zamknij szczegóły">&times;</button>
        <div class="preview-left">
            <div class="preview-icon">${iconHtml}</div>
            <h3>${service.tytul}</h3>
            <p>${service.krotki_opis || ""}</p>
        </div>
        <div class="preview-right">
            <h4>Szczegóły oferty</h4>
            ${service.pelny_opis ? `<p class="preview-full-desc">${service.pelny_opis}</p>` : ""}
            ${subitemsHtml}
        </div>
    `;

    previewPanel.style.display = "grid";

    // Przelicz nową ikonę w panelu
    if (window.lucide) {
        lucide.createIcons();
    }

    // Płynne dosunięcie widoku do panelu
    previewPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

// ZAMYKANIE PODGLĄDU USŁUGI
function closeServicePreview() {
    const previewPanel = document.getElementById("service-preview-panel");
    if (previewPanel) previewPanel.style.display = "none";

    if (activeServiceIndex !== null) {
        const currentCard = document.getElementById(`service-card-${activeServiceIndex}`);
        if (currentCard) currentCard.classList.remove("is-selected");
        activeServiceIndex = null;
    }
}

// 3. POBIERANIE DANYCH Z LOKALNEGO PLIKU JSON
async function loadData() {
    try {
        const response = await fetch(DATA_URL + "?v=" + new Date().getTime());
        if (!response.ok) throw new Error("Błąd HTTP: " + response.status);
        const data = await response.json();
        renderAllContent(data);
    } catch (error) {
        console.error("Błąd wczytywania bazy data.json:", error);
    }
}

// 4. OBSŁUGA PLIKÓW COOKIE I BANERA ZGODY
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) + expires + "; path=/; SameSite=Lax";
}

function initCookieBanner() {
    const banner = document.getElementById("cookie-banner");
    if (!banner) return;

    const savedConsent = getCookie("bonasus_consent") || localStorage.getItem("bonasus_consent");

    if (!savedConsent) {
        setTimeout(() => {
            banner.style.display = "block";
            setTimeout(() => banner.classList.add("visible"), 50);
        }, 800);
    }

    const acceptBtn = document.getElementById("btn-cookie-accept");
    if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
            setCookie("bonasus_consent", "all", 365);
            localStorage.setItem("bonasus_consent", "all");
            hideCookieBanner(banner);
        });
    }

    const rejectBtn = document.getElementById("btn-cookie-reject");
    if (rejectBtn) {
        rejectBtn.addEventListener("click", () => {
            setCookie("bonasus_consent", "essential", 365);
            localStorage.setItem("bonasus_consent", "essential");
            hideCookieBanner(banner);
        });
    }
}

function hideCookieBanner(banner) {
    banner.classList.remove("visible");
    setTimeout(() => {
        banner.style.display = "none";
    }, 350);
}

// 5. INICJALIZACJA I OBSŁUGA FORMULARZA KONTAKTOWEGO
document.addEventListener("DOMContentLoaded", () => {
    loadData();
    initCookieBanner();

    const contactForm = document.getElementById("contact-form");
    const feedbackBox = document.getElementById("form-feedback");
    const submitBtn = document.getElementById("btn-submit");

    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const originalBtnText = submitBtn.innerText;
            submitBtn.innerText = "Wysyłanie...";
            submitBtn.disabled = true;
            feedbackBox.className = "form-feedback";
            feedbackBox.innerText = "";

            const formData = new FormData(contactForm);

            try {
                const response = await fetch("contact.php", {
                    method: "POST",
                    body: formData
                });

                const result = await response.json();

                if (response.ok && result.status === "success") {
                    feedbackBox.className = "form-feedback success";
                    feedbackBox.innerText = result.message;
                    contactForm.reset();
                } else {
                    feedbackBox.className = "form-feedback error";
                    feedbackBox.innerText = result.message || "Wystąpił błąd podczas wysyłania.";
                }
            } catch (error) {
                feedbackBox.className = "form-feedback error";
                feedbackBox.innerText = "Nie udało się połączyć z serwerem pocztowym.";
            } finally {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
});