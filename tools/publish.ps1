# Publishes the site: refreshes the ?v= version on CSS/JS links (so browsers don't use old cached files),
# then commits and pushes to GitHub. GitHub Pages updates a minute or two later.
# Usage: powershell -ExecutionPolicy Bypass -File tools\publish.ps1 "what changed"
param([string]$Message = "Update site")

$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding $false
$v = Get-Date -Format "yyyyMMddHHmm"
foreach ($name in "index.html", "gallery.html") {
  $f = Join-Path $root $name
  $t = [IO.File]::ReadAllText($f, $utf8)
  $t = [regex]::Replace($t, '((?:href|src)="(?:assets/[\w.]+|config\.js|photos\.js))(\?v=\w+)?"', { param($m) $m.Groups[1].Value + "?v=$v" + '"' })
  [IO.File]::WriteAllText($f, $t, $utf8)
}
Set-Location $root
git add -A
git commit -m $Message
git push
Write-Host "Pushed (version $v). The site updates in 1-2 minutes."
