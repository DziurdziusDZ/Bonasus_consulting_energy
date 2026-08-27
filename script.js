// TUTAJ WKLEJ SWÓJ LINK Z KOŃCÓWKĄ /exec
const GOOGLE_SHEET_API_URL = "https://script.google.com/macros/s/AKfycbwFaCglDydMeT2nM36YsPve6OVeWemHPFcGsCHQIzTcO-ruypiAenudkQiJ1uu_2pqB/exec";

// Bezpieczna funkcja pomocnicza do ustawiania tekstu (nie wywala błędu, gdy brak elementu)
function safeSetText(elementId, text) {
    const el = document.getElementById(elementId);
    if (el && text !== undefined && text !== null && text !== "") {
        el.innerText = text;
    }
}

async function loadContentFromSheet() {
    if (!GOOGLE_SHEET_API_URL || GOOGLE_SHEET_API_URL.includes("WKLEJ_TUTAJ")) {
        console.warn("⚠️ Brak wklejonego linku do Google Apps Script w script.js");
        return;
    }

    try {
        console.log("⏳ Pobieranie danych z Google Sheets...");
        const response = await fetch(GOOGLE_SHEET_API_URL, {
            method: "GET",
            mode: "cors"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ Dane pobrane pomyślnie:", data);

        // 1. UZUPEŁNIANIE POLI OGÓLNYCH (Hero + Kontakt)
        if (data.ogolne) {
            // Normalizacja kluczy (usunięcie spacji i zamiana na małe litery)
            const normalizedOgolne = {};
            Object.keys(data.ogolne).forEach(key => {
                normalizedOgolne[key.trim().toLowerCase()] = data.ogolne[key];
            });

            safeSetText("hero-badge", normalizedOgolne["hero_badge"]);
            safeSetText("hero-title", normalizedOgolne["hero_tytul"]);
            safeSetText("hero-desc", normalizedOgolne["hero_opis"]);
            safeSetText("contact-address", normalizedOgolne["kontakt_adres"]);
            safeSetText("contact-email", normalizedOgolne["kontakt_email"]);
            safeSetText("contact-phone", normalizedOgolne["kontakt_telefon"]);
        }

        // 2. RENDEROWANIE ZESPOŁU
        const teamContainer = document.getElementById("team-container");
        if (teamContainer && data.zespol && data.zespol.length > 0) {
            teamContainer.innerHTML = ""; // Czyścimy dane domyślne

            data.zespol.forEach(member => {
                const imie = member.imie || "Ekspert";
                const rola = member.rola || "";
                const opis = member.opis || "";
                const zdjecie = member.zdjecie || "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face";

                const card = document.createElement("article");
                card.className = "team-card";
                card.innerHTML = `
                    <div class="team-image-wrapper">
                        <img src="${zdjecie}" alt="${imie}" class="team-avatar">
                    </div>
                    <div class="team-info">
                        <h3>${imie}</h3>
                        ${rola ? `<span class="team-role">${rola}</span>` : ""}
                        <p>${opis}</p>
                    </div>
                `;
                teamContainer.appendChild(card);
            });
        }

        // 3. RENDEROWANIE USŁUG
        const servicesContainer = document.getElementById("services-container");
        if (servicesContainer && data.uslugi && data.uslugi.length > 0) {
            servicesContainer.innerHTML = ""; // Czyścimy dane domyślne

            data.uslugi.forEach(service => {
                const ikona = service.ikona || "⚡";
                const tytul = service.tytul || "Usługa";
                const opis = service.opis || "";
                const podpunkty = Array.isArray(service.podpunkty) ? service.podpunkty : [];

                const card = document.createElement("div");
                card.className = `service-card ${podpunkty.length > 0 ? "featured" : ""}`;

                let subitemsHtml = "";
                if (podpunkty.length > 0) {
                    subitemsHtml = `
                        <ul class="service-subitems">
                            ${podpunkty.map(item => `<li>${item}</li>`).join("")}
                        </ul>
                    `;
                }

                card.innerHTML = `
                    <div class="service-icon">${ikona}</div>
                    <h3>${tytul}</h3>
                    <p>${opis}</p>
                    ${subitemsHtml}
                `;
                servicesContainer.appendChild(card);
            });
        }

    } catch (error) {
        console.error("❌ Błąd przetwarzania danych ze skryptu:", error);
    }
}

// Uruchomienie natychmiast lub po załadowaniu drzewa DOM
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadContentFromSheet);
} else {
    loadContentFromSheet();
}