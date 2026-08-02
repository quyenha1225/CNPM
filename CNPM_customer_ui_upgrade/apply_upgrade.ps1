param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot
)

$ErrorActionPreference = "Stop"
$PatchRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$FrontendRoot = Join-Path $ProjectRoot "frontend"

if (-not (Test-Path $FrontendRoot)) {
  throw "Không tìm thấy thư mục frontend tại: $FrontendRoot"
}

$files = @(
  "src/context/CartContext.js",
  "src/cart/Cart.js",
  "src/cart/cart.css",
  "src/payment/Payment.js",
  "src/payment/Payment.css",
  "src/products/Product.js",
  "src/products/ProductCatalogV2.css",
  "src/products/detail/ProductDetail.js",
  "src/products/detail/ProductDetail.css"
)

foreach ($relativePath in $files) {
  $source = Join-Path (Join-Path $PatchRoot "frontend") $relativePath
  $target = Join-Path $FrontendRoot $relativePath
  $targetDirectory = Split-Path -Parent $target

  New-Item -ItemType Directory -Force -Path $targetDirectory | Out-Null

  if (Test-Path $target) {
    Copy-Item $target "$target.before-customer-ui-upgrade" -Force
  }

  Copy-Item $source $target -Force
  Write-Host "Đã cập nhật: $relativePath"
}

$productListPath = Join-Path $FrontendRoot "src/products/ProductList.js"

if (Test-Path $productListPath) {
  $content = Get-Content $productListPath -Raw

  if ($content -notmatch 'ProductCatalogV2\.css') {
    $content = $content -replace 'import Product from "\.\/Product";', 'import Product from "./Product";`r`nimport "./ProductCatalogV2.css";'
  }

  $content = $content -replace 'Dữ liệu được lọc và phân trang trực tiếp từ backend\.', 'Khám phá sản phẩm chính hãng theo nhu cầu, thương hiệu và ngân sách của bạn.'

  Set-Content -Path $productListPath -Value $content -Encoding UTF8
  Write-Host "Đã vá import CSS và nội dung ProductList.js"
}

Write-Host ""
Write-Host "Hoàn tất. Hãy dừng frontend rồi chạy lại npm start." -ForegroundColor Green
