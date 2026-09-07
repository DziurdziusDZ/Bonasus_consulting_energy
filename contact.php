<?php
header('Content-Type: application/json; charset=utf-8');

// Odbiorcy wiadomości na serwerze
$recipients = "jkoczab@bonasusenergy.pl, wpacholczyk@bonasusenergy.pl";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // 1. Zabezpieczenie Honeypot (niewidoczne pole na boty)
    if (!empty($_POST['b_check_trap'])) {
        // Bot wypełnił pułapkę - udajemy sukces, ale nic nie wysyłamy
        echo json_encode(['status' => 'success', 'message' => 'Dziękujemy! Wiadomość została wysłana.']);
        exit;
    }

    // 2. Pobranie i sanityzacja danych wejściowych
    $name    = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $email   = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    // 3. Walidacja pól wymaganych
    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Wypełnij wszystkie wymagane pola (Imię, E-mail, Treść).']);
        exit;
    }

    // Ochrona przed zbyt długimi ciągami znaków
    if (strlen($message) > 4000 || strlen($name) > 120) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Wiadomość przekracza dopuszczalny limit znaków.']);
        exit;
    }

    // 4. Przygotowanie tematu i treści wiadomości
    $cleanSubject = $subject ? $subject : "Formularz kontaktowy bonasusenergy.pl";
    $mailSubject = "=?UTF-8?B?" . base64_encode("Nowe zapytanie: " . $cleanSubject) . "?=";

    $mailBody = "Otrzymano nową wiadomość z formularza na stronie bonasusenergy.pl:\n\n";
    $mailBody .= "--------------------------------------------------\n";
    $mailBody .= "Nadawca: " . $name . "\n";
    $mailBody .= "E-mail:  " . $email . "\n";
    $mailBody .= "Temat:   " . ($subject ? $subject : "Brak") . "\n";
    $mailBody .= "Data:    " . date("Y-m-d H:i:s") . "\n";
    $mailBody .= "--------------------------------------------------\n\n";
    $mailBody .= "Treść wiadomości:\n" . $message . "\n";

    // 5. Nagłówki pocztowe
    $headers = [
        'From' => 'Bonasus Energy <kontakt@bonasusenergy.pl>',
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion(),
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8'
    ];

    // 6. Wysłanie wiadomości
    if (mail($recipients, $mailSubject, $mailBody, $headers)) {
        echo json_encode(['status' => 'success', 'message' => 'Dziękujemy! Twoja wiadomość została pomyślnie wysłana. Skontaktujemy się wkrótce.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Wystąpił błąd serwera pocztowego. Napisz bezpośrednio na kontakt@bonasusenergy.pl.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Niedozwolona metoda żądania.']);
}
?>