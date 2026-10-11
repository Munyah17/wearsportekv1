$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

function New-Icon([int]$size, [string]$path, [int]$padPct = 0) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias
  $g.Clear([System.Drawing.Color]::FromArgb(10, 10, 11))
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(200, 241, 106))
  $font = New-Object System.Drawing.Font("Segoe UI", [float]($size * 0.32), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = [System.Drawing.StringAlignment]::Center
  $fmt.LineAlignment = [System.Drawing.StringAlignment]::Center
  $rect = New-Object System.Drawing.RectangleF(0, ([int]($size * $padPct / 100) - $size * 0.02), $size, $size)
  $g.DrawString("WS", $font, $brush, $rect, $fmt)
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "wrote $path"
}

New-Item -ItemType Directory -Force -Path 'assets', 'public/icons' | Out-Null
New-Icon 1024 'assets/icon.png'
New-Icon 48 'assets/favicon.png'
New-Icon 192 'public/icons/icon-192.png'
New-Icon 512 'public/icons/icon-512.png'
New-Icon 512 'public/icons/maskable-512.png' 8
Write-Output "done"
