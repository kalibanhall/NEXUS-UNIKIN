$files = @(
    @{ Path = 'C:\Users\kason\Downloads\tickets\Receipts\proforma_invoice.pdf'; Date = [DateTime]'2026-02-10 09:27:41' },
    @{ Path = 'C:\Users\kason\Downloads\tickets\Receipts\Receipt-2238-2878.pdf'; Date = [DateTime]'2026-02-04 14:05:18' }
)

foreach ($f in $files) {
    [System.IO.File]::SetCreationTime($f.Path, $f.Date)
    [System.IO.File]::SetLastWriteTime($f.Path, $f.Date)
    [System.IO.File]::SetLastAccessTime($f.Path, $f.Date)
    Write-Host "OK: $($f.Path) -> $($f.Date)"
}
