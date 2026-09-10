<?php
header('Content-Type: application/json; charset=utf-8');

// Odbiorcy wiadomości (oddzieleni przecinkiem)
$recipients = "jkoczab@bonasusenergy.pl, wpacholczyk@bonasusenergy.pl";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    // 1. Ochrona Honeypot - boty wypełniają ukryte pola automatycznie
    if (!empty($_POST['b_check_trap'])) {
        // Udajemy sukces, ale nic nie wysyłamy na skrzynki
        echo json_encode(['status' => 'success', 'message' => 'Dziękujemy! Wiadomość została pomyślnie wysłana.']);
        exit;
    }

    // 2. Pobranie i oczyszczenie danych z formularza
    $name    = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $email   = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $subject = filter_input(INPUT_POST, 'subject', FILTER_SANITIZE_FULL_SPECIAL_CHARS);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS);

    if (!$name || !$email || !$message) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Wypełnij wszystkie wymagane pola (Imię, E-mail, Treść).']);
        exit;
    }

    // Limit długości zabezpieczający przed atakami przeciążeniowymi
    if (strlen($message) > 4000 || strlen($name) > 120) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Wiadomość przekracza dopuszczalną długość.']);
        exit;
    }

    // 3. Przygotowanie tematu i treści maila
    $mailSubject = "Nowe zapytanie ze strony: " . ($subject ? $subject : "Formularz kontaktowy");
    
    $mailBody = "Otrzymano nową wiadomość z formularza na stronie bonasusenergy.pl:\n\n";
    $mailBody .= "--------------------------------------------------\n";
    $mailBody .= "Od: " . $name . "\n";
    $mailBody .= "E-mail: " . $email . "\n";
    $mailBody .= "Temat: " . ($subject ? $subject : "Brak") . "\n";
    $mailBody .= "--------------------------------------------------\n\n";
    $mailBody .= "Treść wiadomości:\n" . $message . "\n";

    // 4. Nagłówki pocztowe
    $headers = [
        'From' => 'Formularz Bonasus <kontakt@bonasusenergy.pl>',
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion(),
        'MIME-Version' => '1.0',
        'Content-Type' => 'text/plain; charset=UTF-8'
    ];

    // 5. Wysłanie wiadomości przez serwer home.pl
    if (mail($recipients, "=?UTF-8?B?" . base64_encode($mailSubject) . "?=", $mailBody, $headers)) {
        echo json_encode(['status' => 'success', 'message' => 'Dziękujemy! Wiadomość została pomyślnie wysłana. Skontaktujemy się wkrótce.']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Błąd serwera podczas wysyłania. Spróbuj ponownie później lub napisz bezpośrednio na maila.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Niedozwolona metoda żądania.']);
}
?>