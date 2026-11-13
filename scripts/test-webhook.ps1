param(
    [string]$Url = "https://mustrain.app.n8n.cloud/webhook/lead-intake",
    [string]$Secret = ""
)

function Get-HmacSha256Hex([string]$data, [string]$key) {
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($key)
    $hashBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($data))
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "   BATTERIE DE TESTS DU WORKFLOW LEAD PIPELINE (n8n Cloud)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Yellow
Write-Host "URL Cible: $Url`n"

# Test 1: Signature absente
Write-Host "--- TEST 1 : Signature absente (Attendu: 401) ---" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Body '{"name":"Karim","email":"karim@test.dz","message":"Demande de devis"}' -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "SUCCES : Rejet 401 Unauthorized (signature absente)" -ForegroundColor Green
    } else {
        Write-Host "CODE RECU : $code" -ForegroundColor Red
    }
}

# Test 2: Signature fausse
Write-Host "`n--- TEST 2 : Signature fausse (Attendu: 401) ---" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=invalidhash999" } -Body '{"name":"Karim","email":"karim@test.dz","message":"Demande de devis"}' -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "SUCCES : Rejet 401 Unauthorized (signature invalide)" -ForegroundColor Green
    } else {
        Write-Host "CODE RECU : $code" -ForegroundColor Red
    }
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
    Write-Host "`n[NOTE] Pour exécuter les tests 3 à 6 (requêtes signées), passez le paramètre -Secret <VOTRE_SECRET_HMAC>" -ForegroundColor Yellow
    Write-Host "Exemple: .\test-webhook.ps1 -Secret 'monSecretLongEtAleatoire'" -ForegroundColor Yellow
    exit 0
}

# Test 3: Lead valide signé
Write-Host "`n--- TEST 3 : Lead valide et signe (Attendu: 202 Accepted) ---" -ForegroundColor Cyan
$validBody = '{"name":"Karim Benali","email":"karim.benali@startup.dz","country":"DZ","phone":"+213550123456","message":"Bonjour, nous souhaitons un devis urgent pour la mise en place d un pipeline d automatisation n8n et IA."}'
$sig = Get-HmacSha256Hex -data $validBody -key $Secret

try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$sig" } -Body $validBody -ContentType "application/json"
    if ($r.StatusCode -eq 202) {
        Write-Host "SUCCES : 202 Accepted reçu !" -ForegroundColor Green
        Write-Host "Reponse : $($r.Content)"
    } else {
        Write-Host "Status reçu : $($r.StatusCode)" -ForegroundColor Yellow
        Write-Host "Reponse : $($r.Content)"
    }
} catch {
    Write-Host "ERREUR : $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Meme lead deuxieme fois (Idempotence)
Write-Host "`n--- TEST 4 : Meme lead renvoye (Attendu: 200 Duplicate) ---" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$sig" } -Body $validBody -ContentType "application/json"
    if ($r.StatusCode -eq 200 -and $r.Content -like "*duplicate*") {
        Write-Host "SUCCES : 200 Duplicate détecté !" -ForegroundColor Green
        Write-Host "Reponse : $($r.Content)"
    } else {
        Write-Host "Status reçu : $($r.StatusCode)" -ForegroundColor Yellow
        Write-Host "Reponse : $($r.Content)"
    }
} catch {
    Write-Host "ERREUR : $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Corps modifie apres signature (Tampering)
Write-Host "`n--- TEST 5 : Corps modifie apres signature (Attendu: 401) ---" -ForegroundColor Cyan
$tamperedBody = '{"name":"Hacker","email":"karim.benali@startup.dz","country":"DZ","phone":"+213550123456","message":"Bonjour, nous souhaitons un devis urgent..."}'
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$sig" } -Body $tamperedBody -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "SUCCES : Rejet 401 Unauthorized (altération détectée)" -ForegroundColor Green
    } else {
        Write-Host "CODE RECU : $code" -ForegroundColor Red
    }
}

# Test 6: Donnees invalides (email jeteable ou message trop court)
Write-Host "`n--- TEST 6 : Donnees invalides (Attendu: 400 Bad Request) ---" -ForegroundColor Cyan
$invalidBody = '{"name":"","email":"bad@tempmail.com","message":"court"}'
$sigInvalid = Get-HmacSha256Hex -data $invalidBody -key $Secret
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$sigInvalid" } -Body $invalidBody -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 400) {
        Write-Host "SUCCES : Rejet 400 Bad Request (données invalides)" -ForegroundColor Green
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Reponse : $($reader.ReadToEnd())"
    } else {
        Write-Host "CODE RECU : $code" -ForegroundColor Red
    }
}

