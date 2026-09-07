<?php
// Prywatny klucz autoryzacji synchronizacji
define('SYNC_TOKEN', 'Bonasus2026_Sync!#');

// Weryfikacja obecności i poprawności tokenu w linku URL
if (!isset($_GET['token']) || $_GET['token'] !== SYNC_TOKEN) {
    http_response_code(403);
    die("<h1>403 Forbidden</h1><p>Brak uprawnień do wykonania synchronizacji bazy.</p>");
}

// URL do wdrożonej aplikacji Google Apps Script
$googleApiUrl = "https://script.google.com/macros/s/AKfycbwFaCg1DydMeT2nM36YsPve6OVeWemHPFcGsCHQIzTcO-ruypiAenudkQiJ1uu_2pqB/exec";

// Bezpieczne pobranie z obsługą przekierowań Google
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $googleApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($response)) {
    // Sprawdzenie poprawności pobranego formatu JSON
    $jsonTest = json_decode($response);
    if ($jsonTest !== null) {
        file_put_contents(__DIR__ . '/data.json', $response, LOCK_EX);
        echo "<h1>Sukces!</h1><p>Baza data.json została pomyślnie zaktualizowana danymi z Arkusza Google.</p>";
    } else {
        http_response_code(500);
        echo "<h1>Błąd danych</h1><p>Otrzymana z Google odpowiedź nie jest poprawnym formatem JSON.</p>";
    }
} else {
    http_response_code(502);
    echo "<h1>Błąd połączenia</h1><p>Nie udało się połączyć z Google Apps Script. Kod błędu HTTP: " . $httpCode . "</p>";
}
?>