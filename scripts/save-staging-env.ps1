# Saves the staging Supabase credentials to .env.local.staging-backup so the
# project can be switched between staging and production without re-fetching
# keys every time.
#
#   .\scripts\save-staging-env.ps1
#
# Get the two values from:
#   npx supabase projects api-keys --project-ref ehzrroohsmwdkebezhiy
#
# Afterwards, switch environments with:
#   Copy-Item .env.local.staging-backup .env.local -Force   # -> staging
#   Copy-Item .env.local.prod-backup    .env.local -Force   # -> production
#
# Both backup files are covered by the .env*backup* rule in .gitignore.

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$source = Join-Path $root '.env.local'
$target = Join-Path $root '.env.local.staging-backup'

if (-not (Test-Path $source)) {
    throw "No .env.local found at $source"
}

Write-Host 'Staging project: ehzrroohsmwdkebezhiy' -ForegroundColor Cyan
$publishable = Read-Host 'Staging publishable key'
$secret      = Read-Host 'Staging secret key'

if ([string]::IsNullOrWhiteSpace($publishable) -or [string]::IsNullOrWhiteSpace($secret)) {
    throw 'Both keys are required.'
}

# Keep every non-Supabase setting from the current file (Stripe, Gemini, Maps,
# and so on) and replace only the connection lines.
$pattern = '^(NEXT_PUBLIC_SUPABASE_URL|SUPABASE_URL|NEXT_PUBLIC_SUPABASE_ANON_KEY|SUPABASE_ANON_KEY|NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)='
$kept = Get-Content $source | Where-Object { $_ -notmatch $pattern }

$out = $kept + @(
    'NEXT_PUBLIC_SUPABASE_URL=https://ehzrroohsmwdkebezhiy.supabase.co',
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=$publishable",
    "SUPABASE_SECRET_KEY=$secret"
)

# WriteAllLines gives UTF-8 without a BOM; Set-Content would prepend one and
# break the first variable for dotenv readers.
[System.IO.File]::WriteAllLines($target, $out)

Write-Host "Wrote $target" -ForegroundColor Green
Write-Host 'Switch to staging with: Copy-Item .env.local.staging-backup .env.local -Force'
