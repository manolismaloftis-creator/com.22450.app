# setup-git-repo.ps1
# Ρύθμιση Git repo για Codemagic iOS build
# Χρήση: .\setup-git-repo.ps1 -RepoUrl "https://github.com/YOUR_USER/YOUR_REPO.git"

param(
    [Parameter(Mandatory=$true)]
    [string]$RepoUrl
)

$ErrorActionPreference = "Stop"
$ProjectRoot = "C:\Users\manol\Desktop\22450\project\com.22450.app"
$ParentDir = "C:\Users\manol\Desktop\22450"
$RepoDir = Join-Path $ParentDir "com.22450.app-repo"

Write-Host "=== Git repo setup για Codemagic ===" -ForegroundColor Cyan
Write-Host "Repo URL: $RepoUrl"
Write-Host ""

# 1. Clone
Write-Host "[1/5] Clone repo..." -ForegroundColor Yellow
if (Test-Path $RepoDir) {
    Write-Host "  Φάκελος $RepoDir υπάρχει ήδη. Διαγραφή..." -ForegroundColor Gray
    Remove-Item -Path $RepoDir -Recurse -Force
}
Set-Location $ParentDir
git clone $RepoUrl com.22450.app-repo
Set-Location $RepoDir

# 2. Robocopy (μεταφορά project χωρίς node_modules, .idea, dist)
Write-Host ""
Write-Host "[2/5] Μεταφορά αρχείων με robocopy (αποκλεισμός: node_modules, .idea, dist)..." -ForegroundColor Yellow
robocopy $ProjectRoot $RepoDir /E /XD node_modules .idea dist build .gradle /NFL /NDL /NJH /NJS
if ($LASTEXITCODE -ge 8) {
    throw "Robocopy απέτυχε με exit code $LASTEXITCODE"
}
# Robocopy exit: 1-7 = success (κάποια files copied), 8+ = error
# Χρησιμοποιούμε /NFL /NDL /NJH /NJS για λιγότερο output

# 3. npm ci & build & cap sync
Write-Host ""
Write-Host "[3/5] npm ci..." -ForegroundColor Yellow
npm ci
Write-Host ""
Write-Host "[4/5] npm run build & cap sync..." -ForegroundColor Yellow
npm run build
npx cap sync android
npx cap sync ios

# 4. Git add, commit, push
Write-Host ""
Write-Host "[5/5] Git commit & push..." -ForegroundColor Yellow
git status
git add .
git status
git commit -m "ios: prepare for codemagic build"
git push

Write-Host ""
Write-Host "=== Ολοκληρώθηκε! ===" -ForegroundColor Green
Write-Host "Το repo είναι έτοιμο για Codemagic: $RepoDir"
