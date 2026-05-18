param(
  [Parameter(Mandatory = $true)]
  [string]$EntryText,

  [string]$Date = (Get-Date -Format "yyyy-MM-dd"),
  [string]$Title = "Codex 日记",
  [string]$Marker = ""
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$text = $EntryText.Trim()
if (-not $text) {
  throw "EntryText is empty."
}

$dayNames = @("星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六")
$dateObject = [datetime]::ParseExact($Date, "yyyy-MM-dd", [Globalization.CultureInfo]::InvariantCulture)
$weekDay = $dayNames[[int]$dateObject.DayOfWeek]

if (-not $Marker) {
  $safeTitle = ($Title -replace "[^\p{L}\p{Nd}]+", "-").Trim("-")
  if (-not $safeTitle) { $safeTitle = "codex" }
  $Marker = "$Date-$safeTitle"
}

$markerLine = "<!-- codex-diary:$Marker -->"
$time = Get-Date -Format "HH:mm"

$targets = @(
  @{
    Name = "HanakoVault"
    File = "D:\小柯 Ke\HanakoVault\日记\$Date.md"
  },
  @{
    Name = "小柯自媒体Vault"
    File = "D:\小柯 Ke\小柯自媒体Vault\00 - 每日笔记\$Date.md"
  },
  @{
    Name = "小柯日常Vault"
    File = "D:\小柯 Ke\小柯日常Vault\00 - 每日笔记\$Date.md"
  }
)

function Ensure-ParentDir {
  param([string]$Path)
  $parent = Split-Path -Parent $Path
  if (-not (Test-Path -LiteralPath $parent)) {
    New-Item -ItemType Directory -Path $parent -Force | Out-Null
  }
}

function New-DailyFile {
  param([string]$Path)

  $lines = @(
    "---",
    "title: `"$Date`"",
    "date: $Date",
    "tags: [日记]",
    "status: 进行中",
    "---",
    "",
    "# $Date $weekDay",
    ""
  )
  Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
}

foreach ($target in $targets) {
  $path = [string]$target.File
  Ensure-ParentDir -Path $path

  if (-not (Test-Path -LiteralPath $path)) {
    New-DailyFile -Path $path
  }

  $existing = Get-Content -LiteralPath $path -Raw -Encoding UTF8
  if ($existing -like "*$markerLine*") {
    Write-Output ("SKIP existing marker: {0}" -f $target.Name)
    continue
  }

  $section = @(
    "",
    $markerLine,
    "## $time | $Title",
    "",
    $text,
    ""
  )
  Add-Content -LiteralPath $path -Value $section -Encoding UTF8
  Write-Output ("OK diary appended: {0} -> {1}" -f $target.Name, $path)
}

