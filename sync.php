<?php
define('SYNC_TOKEN', 'b4bc8cba98a587dd933aeaf203528ebd05fd825e0c23cfb617cd53f7360f0d431def7e2d0d5484f33efb21baed209dadba43b45bcf79f9510fcb61e7bc1852081595574ee508c40c3a1588da36ad299ed3b21706c714923d16cfe36d6c7297fd2e825d7fe804494e31902f56380a5a009621453ec92043a00e6d164807240ceb9f9f24fea6c64032bd7ccf1eba58b928c700595ed522402c820f5da3ca621bf3');


// dalsza część skryptu pobierająca z Google...
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