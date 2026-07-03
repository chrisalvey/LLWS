<#
.SYNOPSIS
  Pulls completed LLWS games from ESPN, resolves each team to our region labels,
  and updates data.js (games list + win-loss records only - never touches `bracket`).

.PARAMETER StartDate
  First date to check, format yyyyMMdd. Defaults to today.

.PARAMETER EndDate
  Last date to check, format yyyyMMdd. Defaults to StartDate.

.PARAMETER Test
  Dry run against a scratch copy of the repo files under scripts/test-output/
  instead of the real data.js / games-log.json. Use this to validate the
  pipeline (e.g. against real 2025 dates) without touching live data.

.EXAMPLE
  ./fetch-scores.ps1
  Check today's games and update data.js.

.EXAMPLE
  ./fetch-scores.ps1 -StartDate 20260819 -EndDate 20260830
  Backfill/catch up the whole tournament window.

.EXAMPLE
  ./fetch-scores.ps1 -StartDate 20250813 -EndDate 20250824 -Test
  Dry run against last year's real dates without touching live files.
#>
param(
    [string]$StartDate = (Get-Date -Format "yyyyMMdd"),
    [string]$EndDate = $StartDate,
    [switch]$Test
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$scriptsDir = $PSScriptRoot

if ($Test) {
    $testDir = Join-Path $scriptsDir "test-output"
    New-Item -ItemType Directory -Force -Path $testDir | Out-Null
    $dataJsPath = Join-Path $testDir "data.js"
    $gamesLogPath = Join-Path $testDir "games-log.json"
    $unresolvedPath = Join-Path $testDir "unresolved-teams.json"
    if (-not (Test-Path $dataJsPath)) { Copy-Item (Join-Path $root "data.js") $dataJsPath }
    Write-Host "[TEST MODE] Writing to $testDir instead of the real repo files." -ForegroundColor Yellow
} else {
    $dataJsPath = Join-Path $root "data.js"
    $gamesLogPath = Join-Path $scriptsDir "games-log.json"
    $unresolvedPath = Join-Path $scriptsDir "unresolved-teams.json"
}

# ---- Load region map -------------------------------------------------------
$regionMapRaw = Get-Content (Join-Path $scriptsDir "region-map.json") -Raw | ConvertFrom-Json
$regionMap = @{}
foreach ($prop in $regionMapRaw.PSObject.Properties) {
    if ($prop.Name -notlike "_*") { $regionMap[$prop.Name] = $prop.Value }
}
$sortedKeys = $regionMap.Keys | Sort-Object -Property Length -Descending

function Resolve-Region([string]$location) {
    foreach ($key in $sortedKeys) {
        if ($location -like "*$key") { return $regionMap[$key] }
    }
    return $null
}

# ---- Fetch ESPN scoreboard for each date -----------------------------------
$start = [datetime]::ParseExact($StartDate, "yyyyMMdd", $null)
$end = [datetime]::ParseExact($EndDate, "yyyyMMdd", $null)
$centralTz = [System.TimeZoneInfo]::FindSystemTimeZoneById("Central Standard Time")

$newGames = @()
$unresolvedSeen = @()

for ($d = $start; $d -le $end; $d = $d.AddDays(1)) {
    $dateStr = $d.ToString("yyyyMMdd")
    $url = "https://www.espn.com/little-league-world-series/scoreboard/_/date/$dateStr"
    Write-Host "Fetching $url"
    try {
        $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20
    } catch {
        Write-Warning "Failed to fetch $dateStr - $($_.Exception.Message)"
        continue
    }

    if ($resp.Content -notmatch "window\['__espnfitt__'\]\s*=\s*(\{.*?\});") {
        Write-Warning "No ESPN data blob found for $dateStr"
        continue
    }
    $obj = $Matches[1] | ConvertFrom-Json
    $evts = $obj.page.content.scoreboard.evts
    if (-not $evts) { continue }

    foreach ($evt in $evts) {
        if ($evt.status.description -ne "Final") { continue }

        $t1 = $evt.competitors[0]
        $t2 = $evt.competitors[1]
        $region1 = Resolve-Region $t1.location
        $region2 = Resolve-Region $t2.location

        if (-not $region1) { $unresolvedSeen += $t1.location }
        if (-not $region2) { $unresolvedSeen += $t2.location }
        if (-not $region1 -or -not $region2) { continue }

        $utcDate = [datetime]::Parse($evt.date, $null, [System.Globalization.DateTimeStyles]::AdjustToUniversal -bor [System.Globalization.DateTimeStyles]::AssumeUniversal)
        $ctDate = [System.TimeZoneInfo]::ConvertTimeFromUtc($utcDate, $centralTz)
        $dateLabel = $ctDate.ToString("ddd, MMM d - h:mm tt") + " CT"

        $gameType = ($evt.note -replace "^Little League Baseball World Series - ", "")
        if (-not $gameType) { $gameType = "Pool Play" }

        $winnerRegion = if ($t1.winner -eq $true) { $region1 } elseif ($t2.winner -eq $true) { $region2 } elseif ([int]$t1.runs -gt [int]$t2.runs) { $region1 } else { $region2 }

        $newGames += [PSCustomObject]@{
            espnId      = $evt.id
            date        = $dateLabel
            sortKey     = $ctDate.ToString("o")
            team1       = $region1
            team1Score  = [int]$t1.runs
            team2       = $region2
            team2Score  = [int]$t2.runs
            gameType    = $gameType
            winner      = $winnerRegion
        }
    }
}

# ---- Merge into games-log.json ---------------------------------------------
$existing = @()
if (Test-Path $gamesLogPath) {
    $raw = Get-Content $gamesLogPath -Raw
    if ($raw.Trim()) { $existing = @(ConvertFrom-Json $raw) }
}
$existingIds = $existing | ForEach-Object { $_.espnId }

$added = 0
foreach ($g in $newGames) {
    if ($existingIds -notcontains $g.espnId) {
        $existing += $g
        $added++
    }
}
$existing = @($existing | Sort-Object sortKey)

$existing | ConvertTo-Json -Depth 5 | Set-Content -Path $gamesLogPath -Encoding utf8
Write-Host "Added $added new completed game(s). Games log now has $($existing.Count) total." -ForegroundColor Green

# ---- Recompute per-region win-loss records ----------------------------------
$records = @{}
foreach ($g in $existing) {
    foreach ($region in @($g.team1, $g.team2)) {
        if (-not $records.ContainsKey($region)) { $records[$region] = @{ w = 0; l = 0 } }
    }
    if ($g.winner -eq $g.team1) {
        $records[$g.team1].w++
        $records[$g.team2].l++
    } else {
        $records[$g.team2].w++
        $records[$g.team1].l++
    }
}

# ---- Rewrite data.js: teamStatus{} block, preserving existing bracket values
# (Read/write via .NET UTF8 explicitly - PowerShell 5.1's Get-Content/Set-Content
# default encoding handling mangles the emoji and em-dashes in this file.)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$dataJs = [System.IO.File]::ReadAllText($dataJsPath, [System.Text.Encoding]::UTF8)

$bracketByRegion = @{}
foreach ($m in [regex]::Matches($dataJs, "'([A-Z\- ]+)':\s*\{\s*record:\s*'[^']*',\s*bracket:\s*'([^']*)'\s*\}")) {
    $bracketByRegion[$m.Groups[1].Value] = $m.Groups[2].Value
}
$regionOrder = [regex]::Matches($dataJs, "'([A-Z\- ]+)':\s*\{\s*record:") | ForEach-Object { $_.Groups[1].Value }

$teamStatusLines = foreach ($region in $regionOrder) {
    $rec = if ($records.ContainsKey($region)) { "$($records[$region].w)-$($records[$region].l)" } else { "0-0" }
    $bracket = if ($bracketByRegion.ContainsKey($region)) { $bracketByRegion[$region] } else { "Active" }
    "    '$region': { record: '$rec', bracket: '$bracket' },"
}
$teamStatusBlock = "const teamStatus = {`n" + ($teamStatusLines -join "`n") + "`n};"
$dataJs = [regex]::Replace($dataJs, "const teamStatus = \{[\s\S]*?\n\};", { param($m) $teamStatusBlock }, 1)

# ---- Rewrite data.js: games[] block ------------------------------------------
# `game` is a sequential label (Game 1, Game 2, ...) in chronological order -
# it is NOT the official Little League bracket game number, just a readable tag.
$i = 0
$gameLines = foreach ($g in $existing) {
    $i++
    "    { date: '$($g.date)', game: 'Game $i', team1: '$($g.team1)', team1Score: $($g.team1Score), team2: '$($g.team2)', team2Score: $($g.team2Score), gameType: '$($g.gameType)', winner: '$($g.winner)', espnId: '$($g.espnId)' },"
}
$gamesBlock = "const games = [`n" + ($gameLines -join "`n") + "`n];"
$dataJs = [regex]::Replace($dataJs, "const games = \[[\s\S]*?\n\];", { param($m) $gamesBlock }, 1)

# ---- Update lastUpdated timestamp -------------------------------------------
$stamp = (Get-Date).ToString("dddd, MMMM d, yyyy 'at' h:mm tt") + " (script run)"
$dataJs = [regex]::Replace($dataJs, "lastUpdated:\s*'[^']*'", { param($m) "lastUpdated: '$stamp'" }, 1)

[System.IO.File]::WriteAllText($dataJsPath, $dataJs, $utf8NoBom)
Write-Host "Updated $dataJsPath" -ForegroundColor Green

# ---- Unresolved teams --------------------------------------------------------
$unresolvedUnique = @($unresolvedSeen | Select-Object -Unique)
$unresolvedUnique | ConvertTo-Json | Set-Content -Path $unresolvedPath -Encoding utf8
if ($unresolvedUnique.Count -gt 0) {
    Write-Warning "UNRESOLVED teams (not added to data.js - add these to region-map.json):"
    $unresolvedUnique | ForEach-Object { Write-Warning "  - $_" }
} else {
    Write-Host "No unresolved teams." -ForegroundColor Green
}
