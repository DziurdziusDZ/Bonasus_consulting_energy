<?php
// Prywatny klucz zabezpieczający synchronizację
define('SYNC_TOKEN', '5310437716543674777621799615747295318016148980568628758200329347726111300290150431457918765954674688');

// Weryfikacja tokenu w adresie URL
if (!isset($_GET['token']) || $_GET['token'] !== SYNC_TOKEN) {
    http_response_code(403);
    die("<h1>403 Forbidden</h1><p>Brak uprawnien do wykonania synchronizacji.</p>");
}

// Adres URL aplikacji Google Apps Script
$googleApiUrl = "https://script.google.com/macros/s/AKfycbwSrCFjM7Rlan6Mhgk5wkFyrDIRPI9vj5sIvG36mRgFzFjdeBwBO_Na3io5ILyT1ecD/exec";

// Pobieramy dane za pomocą cURL z obsługą przekierowań Google
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $googleApiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 && !empty($response)) {
    // Sprawdzamy poprawność formatu JSON
    $jsonTest = json_decode($response);
    if ($jsonTest !== null) {
        file_put_contents(__DIR__ . '/data.json', $response);
        echo "<h1>Sukces!</h1><p>Dane z Arkusza Google zostały pomyślnie zsynchronizowane i zapisane w data.json na serwerze.</p>";
    } else {
        echo "<h1>Blad!</h1><p>Otrzymana odpowiedź nie jest poprawnym formatem JSON.</p>";
    }
} else {
    echo "<h1>Blad pobierania!</h1><p>Kod HTTP: " . $httpCode . "</p>";
}
?>