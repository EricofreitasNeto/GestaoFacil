$ErrorActionPreference = 'Stop'

function Invoke-Api {
  param(
    [string]$BaseUrl,
    [string]$Path,
    [string]$Method = 'GET',
    [hashtable]$Headers = @{},
    [object]$Body = $null
  )
  $uri = "$BaseUrl$Path"
  $json = $null
  if ($Body -ne $null) { $json = ($Body | ConvertTo-Json -Depth 10) }
  try {
    $resp = Invoke-WebRequest -Uri $uri -Method $Method -Headers $Headers -Body $json -ContentType 'application/json' -ErrorAction Stop
    return [pscustomobject]@{ StatusCode = $resp.StatusCode; Body = ($resp.Content | ConvertFrom-Json) }
  } catch [System.Net.WebException] {
    $resp = $_.Exception.Response
    if ($resp -and $resp.StatusCode) {
      $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
      $content = $reader.ReadToEnd()
      $parsed = $null
      try { $parsed = $content | ConvertFrom-Json } catch { $parsed = $content }
      return [pscustomobject]@{ StatusCode = [int]$resp.StatusCode; Body = $parsed }
    }
    throw
  }
}

$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { 'http://localhost:3000' }
Write-Host "BaseUrl: $BaseUrl"

# 1) Register or login as admin
$email = "admin.teste+uniq@exemplo.com"
$password = "123456"

Write-Host "[Auth] Registrando usuário de teste (se não existir)..."
$reg = Invoke-Api -BaseUrl $BaseUrl -Path '/auth/register' -Method 'POST' -Body @{ nome='Admin Test'; cargo='admin'; email=$email; telefone='85999999999'; password=$password; confirmPassword=$password }
if ($reg.StatusCode -eq 201) { Write-Host "[Auth] Registrado com sucesso" }
elseif ($reg.StatusCode -eq 409) { Write-Host "[Auth] Usuário já existe (OK)" }
else { Write-Host "[Auth] Aviso: status $($reg.StatusCode) ao registrar" }

Write-Host "[Auth] Fazendo login..."
$login = Invoke-Api -BaseUrl $BaseUrl -Path '/auth/login' -Method 'POST' -Body @{ email=$email; password=$password }
if ($login.StatusCode -ne 200) { throw "Falha ao logar: $($login.StatusCode) $($login.Body)" }
$token = $login.Body.token
$auth = @{ Authorization = "Bearer $token" }
Write-Host "[Auth] Token obtido"

$ts = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()

# 2) Cliente: criar, duplicar (409), soft delete e recriar (201)
$clienteNome = "ClienteTeste_$ts"
# Generate a unique CNPJ per run (format: 00.000.000/0000-00)
function New-Cnpj() {
  $digits = -join (1..14 | ForEach-Object { Get-Random -Minimum 0 -Maximum 10 })
  $d = $digits.ToCharArray()
  return "{0}{1}.{2}{3}{4}.{5}{6}{7}/{8}{9}{10}{11}-{12}{13}" -f $d[0],$d[1],$d[2],$d[3],$d[4],$d[5],$d[6],$d[7],$d[8],$d[9],$d[10],$d[11],$d[12],$d[13]
}
$cnpj = New-Cnpj

Write-Host "[Cliente] Criando $clienteNome..."
$c1 = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/clientes' -Method 'POST' -Headers $auth -Body @{ nome=$clienteNome; cnpj=$cnpj; contatos='teste@exemplo.com' }
if ($c1.StatusCode -ne 201) { throw "Cliente criar falhou: $($c1.StatusCode) $($c1.Body)" }
$clienteId = $c1.Body.id
Write-Host "[Cliente] OK id=$clienteId"

Write-Host "[Cliente] Tentando duplicar por nome... (espera 409)"
$cDupNome = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/clientes' -Method 'POST' -Headers $auth -Body @{ nome=$clienteNome; cnpj='98.765.432/0001-10'; contatos='dup1@ex.com' }
if ($cDupNome.StatusCode -ne 409) { throw "Esperava 409 por nome duplicado, veio $($cDupNome.StatusCode)" } else { Write-Host "[Cliente] 409 por nome (OK)" }

Write-Host "[Cliente] Tentando duplicar por CNPJ... (espera 409)"
$cDupCnpj = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/clientes' -Method 'POST' -Headers $auth -Body @{ nome="${clienteNome}_2"; cnpj=$cnpj; contatos='dup2@ex.com' }
if ($cDupCnpj.StatusCode -ne 409) { throw "Esperava 409 por CNPJ duplicado, veio $($cDupCnpj.StatusCode)" } else { Write-Host "[Cliente] 409 por CNPJ (OK)" }

Write-Host "[Cliente] Soft delete..."
$cDel = Invoke-Api -BaseUrl $BaseUrl -Path "/v1/clientes/$clienteId" -Method 'DELETE' -Headers $auth
if ($cDel.StatusCode -ne 200) { throw "Cliente delete falhou: $($cDel.StatusCode) $($cDel.Body)" } else { Write-Host "[Cliente] Deletado (OK)" }

Write-Host "[Cliente] Recriando mesmo nome/CNPJ após soft delete... (espera 201)"
$cRe = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/clientes' -Method 'POST' -Headers $auth -Body @{ nome=$clienteNome; cnpj=$cnpj; contatos='re@ex.com' }
if ($cRe.StatusCode -ne 201) { throw "Esperava 201 na recriação, veio $($cRe.StatusCode)" } else { Write-Host "[Cliente] Recriado (OK) id=$($cRe.Body.id)" }

# 3) Ativo: criar e duplicar numeroSerie (409)
$ns = "NS$ts"
Write-Host "[Ativo] Criando ativo com numeroSerie=$ns..."
$a1 = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/ativos' -Method 'POST' -Headers $auth -Body @{ nome="AtivoTeste_$ts"; numeroSerie=$ns; status='ativo' }
if ($a1.StatusCode -ne 201) { throw "Ativo criar falhou: $($a1.StatusCode) $($a1.Body)" } else { Write-Host "[Ativo] OK id=$($a1.Body.id)" }

Write-Host "[Ativo] Tentando duplicar numeroSerie... (espera 409)"
$aDup = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/ativos' -Method 'POST' -Headers $auth -Body @{ nome="AtivoDup_$ts"; numeroSerie=$ns; status='ativo' }
if ($aDup.StatusCode -ne 409) { throw "Esperava 409 por numeroSerie duplicado, veio $($aDup.StatusCode)" } else { Write-Host "[Ativo] 409 por numeroSerie (OK)" }

# 4) Tipo de Serviço (se rota existir): criar e duplicar
try {
  Write-Host "[TipoServico] Criando tipo..."
  $tNome = "Tipo_$ts"
  $t1 = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/tipos-servico' -Method 'POST' -Headers $auth -Body @{ nome=$tNome; descricao='Teste'; ativo=$true }
  if ($t1.StatusCode -eq 201) {
    Write-Host "[TipoServico] OK id=$($t1.Body.id)"
    $tDup = Invoke-Api -BaseUrl $BaseUrl -Path '/v1/tipos-servico' -Method 'POST' -Headers $auth -Body @{ nome=$tNome; descricao='Dup' }
    if ($tDup.StatusCode -eq 409) { Write-Host "[TipoServico] 409 por nome (OK)" } else { Write-Host "[TipoServico] Aviso: esperado 409, veio $($tDup.StatusCode)" }
  } else {
    Write-Host "[TipoServico] Aviso: criação retornou $($t1.StatusCode) — rota pode não estar registrada"
  }
} catch { Write-Host "[TipoServico] Pulado: $_" }

# 5) Usuário: tentar duplicar e-mail via /auth/register
Write-Host "[Usuario] Tentando registrar e-mail duplicado... (espera 409)"
$uDup = Invoke-Api -BaseUrl $BaseUrl -Path '/auth/register' -Method 'POST' -Body @{ nome='Outro'; cargo='admin'; email=$email; telefone='85999990000'; password=$password; confirmPassword=$password }
if ($uDup.StatusCode -eq 409) { Write-Host "[Usuario] 409 por e-mail (OK)" } else { Write-Host "[Usuario] Aviso: esperado 409, veio $($uDup.StatusCode)" }

Write-Host "\nTodos os testes executados."
