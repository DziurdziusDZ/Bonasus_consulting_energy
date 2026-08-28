// Ścieżka lokalna do pliku na serwerze
const DATA_URL = "./data.json";

function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el && text !== undefined && text !== null && text !== "") {
        el.innerText = text;
    }
}

function renderAllContent(data) {
    if (!data) return;

    // 1. DANE OGÓLNE
    if (data.ogolne) {
        const normalized = {};
        Object.keys(data.ogolne).forEach(k => normalized[k.trim().toLowerCase()] = data.ogolne[k]);

        safeSetText("hero-badge", normalized["hero_badge"]);
        safeSetText("hero-title", normalized["hero_tytul"]);
        safeSetText("hero-desc", normalized["hero_opis"]);
        safeSetText("contact-address", normalized["kontakt_adres"]);
        safeSetText("contact-email", normalized["kontakt_email"]);
        safeSetText("contact-phone", normalized["kontakt_telefon"]);
    }

    // 2. ZESPÓŁ
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

    // 3. USŁUGI (ROZSZERZANE KARTY)
    const servicesContainer = document.getElementById("services-container");
    if (servicesContainer && data.uslugi && data.uslugi.length > 0) {
        servicesContainer.innerHTML = "";
        data.uslugi.forEach(service => {
            const ikona = service.ikona || "⚡";
            const tytul = service.tytul || "Usługa";
            const krotkiOpis = service.krotki_opis || service.opis || "";
            const pelnyOpis = service.pelny_opis || "";
            const podpunkty = Array.isArray(service.podpunkty) ? service.podpunkty : [];

            let subitemsHtml = "";
            if (podpunkty.length > 0) {
                subitemsHtml = `
                    <ul class="service-subitems">
                        ${podpunkty.map(item => `<li>${item}</li>`).join("")}
                    </ul>
                `;
            }

            const card = document.createElement("div");
            card.className = "service-card";
            card.setAttribute("onclick", "toggleServiceCard(this)");

            card.innerHTML = `
                <div class="service-main">
                    <div class="service-top">
                        <div class="service-icon">${ikona}</div>
                        <span class="expand-indicator" title="Rozwiń">+</span>
                    </div>
                    <h3>${tytul}</h3>
                    <p class="service-short-desc">${krotkiOpis}</p>
                </div>
                <div class="service-extra">
                    ${pelnyOpis ? `<p class="service-full-desc">${pelnyOpis}</p>` : ""}
                    ${subitemsHtml}
                </div>
            `;
            servicesContainer.appendChild(card);
        });
    }
}

async function loadData() {
    try {
        const response = await fetch(DATA_URL + "?v=" + new Date().getTime()); // Parametr ?v zapobiega trzymaniu starego cache
        if (!response.ok) throw new Error("HTTP " + response.status);
        const data = await response.json();
        renderAllContent(data);
    } catch (error) {
        console.error("Błąd ładowania data.json:", error);
    }
}

function toggleServiceCard(clickedCard) {
    const isAlreadyOpen = clickedCard.classList.contains("expanded");

    // Zamykamy wszystkie inne karty
    document.querySelectorAll(".service-card.expanded").forEach(card => {
        card.classList.remove("expanded");
    });

    // Jeśli kliknięta nie była wcześniej otwarta, otwieramy ją i delikatnie centrujemy widok
    if (!isAlreadyOpen) {
        clickedCard.classList.add("expanded");
        
        // Płynne dosunięcie widoku do góry sekcji usług
        const servicesSection = document.getElementById("uslugi");
        if (servicesSection) {
            const topOffset = servicesSection.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: topOffset, behavior: "smooth" });
        }
    }
}

// ==========================================================================
// START PO ZAŁADOWANIU STRONY (DANE + FORMULARZ)
// ==========================================================================
document.addEventListener("DOMContentLoaded", () => {
    // 1. Ładowanie danych z pliku JSON
    loadData();

    // 2. Obsługa wysyłania formularza kontaktowego na maila
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