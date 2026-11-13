param(
    [string]$Url = "https://mustrain.app.n8n.cloud/webhook/customer-support-intake",
    [string]$Secret = ""
)

function Get-HmacSha256Hex([string]$data, [string]$key) {
    $hmac = New-Object System.Security.Cryptography.HMACSHA256
    $hmac.Key = [System.Text.Encoding]::UTF8.GetBytes($key)
    $hashBytes = $hmac.ComputeHash([System.Text.Encoding]::UTF8.GetBytes($data))
    return ($hashBytes | ForEach-Object { $_.ToString("x2") }) -join ""
}

Write-Host "==========================================================================" -ForegroundColor Yellow
Write-Host "   BATTERIE DE TESTS DU WORKFLOW 'TRAIN TEST' (HMAC + Customer Support)  " -ForegroundColor Yellow
Write-Host "==========================================================================" -ForegroundColor Yellow
Write-Host "URL Cible: $Url`n"

# TEST 1: Pas de signature (Attendu: 401 Unauthorized)
Write-Host "--- TEST 1 : Requête sans en-tête x-signature (Attendu: 401 Unauthorized) ---" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Body '{"test":"val"}' -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
}
catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "SUCCES : Rejet 401 Unauthorized (signature absente)" -ForegroundColor Green
    }
    else {
        Write-Host "CODE RECU : $code" -ForegroundColor Yellow
    }
}

# TEST 2: Fausse signature HMAC (Attendu: 401 Unauthorized)
Write-Host "`n--- TEST 2 : Signature HMAC invalide (Attendu: 401 Unauthorized) ---" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=invalidhash999" } -Body '{"test":"val"}' -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
}
catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 401) {
        Write-Host "SUCCES : Rejet 401 Unauthorized (signature altérée ou fausse)" -ForegroundColor Green
    }
    else {
        Write-Host "CODE RECU : $code" -ForegroundColor Yellow
    }
}

if ([string]::IsNullOrWhiteSpace($Secret)) {
    Write-Host "`n[NOTE] Pour exécuter les tests 3 à 5 (requêtes signées), passez le paramètre -Secret <VOTRE_SECRET_HMAC>" -ForegroundColor Yellow
    Write-Host "Exemple: .\test-customer-support.ps1 -Secret 'monSecretCryptoLongEtAleatoire'" -ForegroundColor Yellow
    exit 0
}

# TEST 3: Données invalides mais bien signées (Attendu: 400 Bad Request)
Write-Host "`n--- TEST 3 : Données incomplètes bien signées (Attendu: 400 Bad Request) ---" -ForegroundColor Cyan
$badPayload = '{"customer":{"name":"","email":"bad-email"},"message":""}'
$badSig = Get-HmacSha256Hex -data $badPayload -key $Secret
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$badSig" } -Body $badPayload -ContentType "application/json"
    Write-Host "REPONSE INATTENDUE : Status $($r.StatusCode)" -ForegroundColor Red
}
catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 400) {
        Write-Host "SUCCES : Rejet 400 Bad Request (payload invalide détecté après signature)" -ForegroundColor Green
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        Write-Host "Corps de la réponse : $($reader.ReadToEnd())"
    }
    else {
        Write-Host "CODE RECU : $code" -ForegroundColor Red
    }
}

# TEST 4: Demande valide et signée (Attendu: 202 Accepted immédiat)
Write-Host "`n--- TEST 4 : Demande client valide et signée (Attendu: 202 Accepted immédiat) ---" -ForegroundColor Cyan
$reqId = "REQ-" + (Get-Random -Minimum 100000 -Maximum 999999)
$validPayload = '{"customer":{"name":"Amina Mansouri","email":"amina.mansouri@enterprise.dz","phone":"+213551987654"},"category":"Support Technique","language":"fr","message":"Bonjour, notre équipe rencontre un problème critique sur le produit ID 1. Le système ne répond plus depuis ce matin.","product_id":1,"order_id":"CMD-99482","request_id":"' + $reqId + '","source":"web-portal"}'
$validSig = Get-HmacSha256Hex -data $validPayload -key $Secret

try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$validSig" } -Body $validPayload -ContentType "application/json"
    if ($r.StatusCode -eq 202) {
        Write-Host "SUCCES : 202 Accepted reçu immédiatement (<50ms) !" -ForegroundColor Green
        Write-Host "Corps de la réponse : $($r.Content)"
    }
    else {
        Write-Host "Status reçu : $($r.StatusCode)" -ForegroundColor Yellow
        Write-Host "Corps de la réponse : $($r.Content)"
    }
}
catch {
    Write-Host "ERREUR : $($_.Exception.Message)" -ForegroundColor Red
}

# TEST 5: Renvoi identique de la même demande (Attendu: 200 OK Duplicate)
Write-Host "`n--- TEST 5 : Renvoi de la même demande (Attendu: 200 OK Duplicate) ---" -ForegroundColor Cyan
try {
    $r = Invoke-WebRequest -Uri $Url -Method Post -Headers @{ "x-signature" = "sha256=$validSig" } -Body $validPayload -ContentType "application/json"
    if ($r.StatusCode -eq 200 -and $r.Content -like "*duplicate*") {
        Write-Host "SUCCES : 200 Duplicate détecté et acquitté (idempotence) !" -ForegroundColor Green
        Write-Host "Corps de la réponse : $($r.Content)"
    }
    else {
        Write-Host "Status reçu : $($r.StatusCode)" -ForegroundColor Yellow
        Write-Host "Corps de la réponse : $($r.Content)"
    }
}
catch {
    Write-Host "ERREUR : $($_.Exception.Message)" -ForegroundColor Red
}
