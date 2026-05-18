param(
  [switch]$DryRun,
  [switch]$SkipGeneratedAt
)

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$vaultRoot = Split-Path -Parent $PSScriptRoot
$logDir = Join-Path $vaultRoot "备份索引\运行日志"
$indexDir = Join-Path $vaultRoot "备份索引"
$sourcesRoot = Join-Path $vaultRoot "来源索引"

$sources = @(
  @{
    Name = "HanakoVault"
    Path = "D:\小柯 Ke\HanakoVault"
    Purpose = "AI 助手、Agent、调教、日记与流程记录（不含对话记录）"
  },
  @{
    Name = "小柯自媒体Vault"
    Path = "D:\小柯 Ke\小柯自媒体Vault"
    Purpose = "公众号、自媒体、选题、内容生产"
  },
  @{
    Name = "小柯日常Vault"
    Path = "D:\小柯 Ke\小柯日常Vault"
    Purpose = "生活学习、普通需求、灵感"
  }
)

$excludeDirs = @(".git", ".obsidian", ".trash", ".logs", "node_modules", "对话记录", "conversations")
$excludeFiles = @(
  "Thumbs.db",
  ".DS_Store",
  "API密钥库.md",
  "*密钥*",
  "*密码*",
  "*token*",
  "*secret*",
  "*credential*",
  "*凭据*"
)

function Ensure-Dir {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path -Force | Out-Null
  }
}

Ensure-Dir -Path $logDir
Ensure-Dir -Path $indexDir
Ensure-Dir -Path $sourcesRoot

$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$logPath = Join-Path $logDir ("backup-" + $stamp + ".log")

function Write-Log {
  param([string]$Text)
  $line = "[{0}] {1}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss"), $Text
  $line | Tee-Object -FilePath $logPath -Append
}

function Set-TextFileWithRetry {
  param(
    [string]$Path,
    [System.Collections.Generic.List[string]]$Lines
  )

  $tmp = $Path + ".tmp"
  for ($i = 1; $i -le 5; $i++) {
    try {
      Set-Content -LiteralPath $tmp -Value $Lines -Encoding UTF8
      Move-Item -LiteralPath $tmp -Destination $Path -Force
      return
    } catch {
      if ($i -eq 5) {
        throw
      }
      Start-Sleep -Milliseconds (250 * $i)
    }
  }
}

function Test-SameTextFile {
  param(
    [string]$Path,
    [System.Collections.Generic.List[string]]$Lines
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    return $false
  }
  $old = Get-Content -LiteralPath $Path -Raw -Encoding UTF8
  $new = ($Lines -join [Environment]::NewLine) + [Environment]::NewLine
  return ($old -eq $new)
}

function Invoke-RobocopyBackup {
  param(
    [string]$Source,
    [string]$Destination
  )

  Ensure-Dir -Path $Destination
  $args = @(
    $Source,
    $Destination,
    "/E",
    "/R:1",
    "/W:1",
    "/FFT",
    "/XJ",
    "/DCOPY:DAT",
    "/COPY:DAT",
    "/XD"
  ) + $excludeDirs + @(
    "/XF"
  ) + $excludeFiles + @(
    "/NFL",
    "/NDL",
    "/NP"
  )

  if ($DryRun) {
    $args += "/L"
  }

  & robocopy @args | Tee-Object -FilePath $logPath -Append | Out-Null
  $rc = $LASTEXITCODE
  if ($rc -ge 8) {
    throw "robocopy failed: $Source -> $Destination (exit=$rc)"
  }
  if ($DryRun) {
    Write-Log ("DRYRUN preview: {0} -> {1} (exit={2})" -f $Source, $Destination, $rc)
  } else {
    Write-Log ("OK copied: {0} -> {1} (exit={2})" -f $Source, $Destination, $rc)
  }
}

function Get-BackupStats {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    return [pscustomobject]@{ Files = 0; Markdown = 0; MB = 0 }
  }

  $files = Get-ChildItem -LiteralPath $Path -Recurse -File -Force -ErrorAction SilentlyContinue
  $fileCount = ($files | Measure-Object).Count
  $markdownCount = ($files | Where-Object { $_.Extension -eq ".md" } | Measure-Object).Count
  $bytes = ($files | Measure-Object Length -Sum).Sum
  if (-not $bytes) { $bytes = 0 }

  [pscustomobject]@{
    Files = $fileCount
    Markdown = $markdownCount
    MB = [math]::Round(($bytes / 1MB), 2)
  }
}

function Write-TotalIndex {
  param([array]$Rows)

  $indexPath = Join-Path $indexDir "总索引.md"
  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("# 黑曜石Vault 总索引")
  $lines.Add("")
  if (-not $SkipGeneratedAt) {
    $lines.Add(("生成时间：{0}" -f (Get-Date -Format "yyyy-MM-dd HH:mm:ss")))
    $lines.Add("")
  }
  if ($DryRun) {
    $lines.Add("> 当前是 DryRun，只预览，不写入备份文件。")
    $lines.Add("")
  }
  $lines.Add("## 来源概览")
  $lines.Add("")
  $lines.Add("| 来源 | 用途 | 文件数 | Markdown | 大小 MB | 备份位置 |")
  $lines.Add("| --- | --- | ---: | ---: | ---: | --- |")
  foreach ($row in $Rows) {
    $lines.Add(("| {0} | {1} | {2} | {3} | {4} | [[来源索引/{0}]] |" -f $row.Name, $row.Purpose, $row.Files, $row.Markdown, $row.MB))
  }
  $lines.Add("")
  $lines.Add("## 最近修改的 Markdown")
  $lines.Add("")
  foreach ($row in $Rows) {
    $target = Join-Path $sourcesRoot $row.Name
    $lines.Add(("### {0}" -f $row.Name))
    $lines.Add("")
    if (Test-Path -LiteralPath $target) {
      $recent = Get-ChildItem -LiteralPath $target -Recurse -File -Filter "*.md" -Force -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 20
      foreach ($file in $recent) {
        $rel = $file.FullName.Substring($vaultRoot.Length + 1).Replace("\", "/")
        $lines.Add(("- [[{0}]] - {1}" -f $rel, $file.LastWriteTime.ToString("yyyy-MM-dd HH:mm:ss")))
      }
    }
    $lines.Add("")
  }
  $lines.Add("## 维护规则")
  $lines.Add("")
  $lines.Add("- 本脚本只复制，不删除备份库里的旧文件。")
  $lines.Add("- 对话记录目录不再进入循环备份，避免错误对话和重复对话被反复刷新。")
  $lines.Add("- `.obsidian` 配置不在这里同步，由 VaultSyncHub 管理。")
  $lines.Add("- GitHub 只做历史备份，不当实时同步工具。")
  $lines.Add("- 明显的密钥、密码、token、凭据文件不会进入总备份。")

  if (-not $DryRun) {
    if (-not (Test-SameTextFile -Path $indexPath -Lines $lines)) {
      Set-TextFileWithRetry -Path $indexPath -Lines $lines
    }
  }
}
Write-Log ("Start Obsidian record backup. VaultRoot={0}; DryRun={1}" -f $vaultRoot, $DryRun)

$rows = @()
foreach ($source in $sources) {
  $src = [string]$source.Path
  $dst = Join-Path $sourcesRoot ([string]$source.Name)

  if (-not (Test-Path -LiteralPath $src)) {
    Write-Log ("SKIP missing source: {0}" -f $src)
    continue
  }

  Invoke-RobocopyBackup -Source $src -Destination $dst
  $stats = Get-BackupStats -Path $dst
  $rows += [pscustomobject]@{
    Name = [string]$source.Name
    Purpose = [string]$source.Purpose
    Files = $stats.Files
    Markdown = $stats.Markdown
    MB = $stats.MB
  }
}

Write-TotalIndex -Rows $rows
Write-Log "Backup finished."

