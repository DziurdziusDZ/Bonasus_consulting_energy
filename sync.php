<?php
// Ustaw własny, trudny do odgadnięcia klucz
define('SYNC_TOKEN', 'Bonasus_TajnyKlucz_2026!#');

// Weryfikacja tokenu w adresie URL
if (!isset($_GET['token']) || $_GET['token'] !== SYNC_TOKEN) {
    http_response_code(403);
    die("<h1>403 Forbidden</h1><p>Brak uprawnień do wykonania synchronizacji.</p>");
}

$googleApiUrl = "https://script.google.com/macros/s/AKfycbwFaCg1DydMeT2nM36YsPve6OVeWemHPFcGsCHQIzTcO-ruypiAenudkQiJ1uu_2pqB/exec";

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
    $jsonTest = json_decode($response);
    if ($jsonTest !== null) {
        file_put_contents(__DIR__ . '/data.json', $response, LOCK_EX);
        echo "<h1>Sukces!</h1><p>Baza zsynchronizowana pomyślnie.</p>";
    } else {
        http_response_code(500);
        echo "<h1>Błąd</h1><p>Niepoprawny format danych JSON z Google.</p>";
    }
} else {
    http_response_code(502);
    echo "<h1>Błąd połączenia</h1><p>Kod HTTP: " . $httpCode . "</p>";
}
?>