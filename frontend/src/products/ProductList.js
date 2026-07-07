import React, { useState, useEffect } from "react";
import Product from "./Product";

// 1. CÂY DANH MỤC SIDEBAR BÊN TRÁI
const menuCategories = [
  { id: "PC_ChuyenDung", name: "PC Chuyên Dụng" },
  { id: "PC_Gaming", name: "PC Gaming, Học Tập" },
  { id: "PC_VanPhong", name: "PC Văn Phòng" },
  { id: "Laptop", name: "Laptop - Notebook" },
  { id: "LinhKien", name: "Linh Kiện Máy Tính" },
  { id: "ManHinh", name: "Màn Hình Máy Tính" },
  { id: "GamingGear", name: "Gaming Gear" },
  { id: "PhuKien", name: "Phụ kiện & Dụng cụ" }
];

// 2. KHO DỮ LIỆU CHUẨN 100 SẢN PHẨM CÔNG NGHỆ KHỚP VỚI CÁC CỘT TRÊN MEGA MENU
export const mockProductsFromMySQL = [
  // ================= CỘT 1: HỆ THỐNG PC (20 Sản phẩm) =================
  // PC Gaming (category: "PC_Gaming", brand: "Khac")
  { id: 1, name: "PC Gaming Shark i5 13400F | RTX 4060 | 16GB RAM", price: 18500000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 10 },
  { id: 2, name: "PC Gaming Shark Ultra i7 14700F | RTX 4070 Ti", price: 34500000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 5 },
  { id: 3, name: "PC Gaming Đồ Họa Đua Xe AMD Ryzen 5 7600 | RX 6700XT", price: 19900000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 8 },
  { id: 4, name: "PC Đồ Họa Chuyên Nghiệp Dual Xeon E5 2696v4 | 64GB RAM", price: 15500000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 0 },
  { id: 5, name: "PC Render 3D & AI Ryzen 9 7900X | RTX 4060 Ti 16G", price: 28900000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 12 },
  { id: 6, name: "PC Gaming Shark Entry i3 12100F | GTX 1650 Giá Rẻ", price: 9900000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 15 },
  { id: 7, name: "PC Gaming Streamer Intel i5 14400F | RTX 4060 White", price: 21500000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 5 },
  { id: 8, name: "PC Gaming Esport Ryzen 5 5600X | GTX 1660 Super", price: 12800000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 10 },
  { id: 9, name: "PC Đồ Họa Kiến Trúc Intel i7 13700K | 32GB RAM", price: 27900000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 0 },
  { id: 10, name: "PC Custom WaterCooling i9 14900KS | RTX 4090", price: 95000000, category: "PC_Gaming", brand: "Khac", image_url: "", percent_off: 5 },
  
  // PC Văn Phòng (category: "PC_VanPhong")
  { id: 11, name: "PC Văn Phòng Intel Core i3 12100 | 8GB RAM | SSD 256GB", price: 6500000, category: "PC_VanPhong", brand: "Intel", image_url: "", percent_off: 0 },
  { id: 12, name: "PC Văn Phòng Đột Phá Intel Core i5 12400 | 16GB RAM", price: 8900000, category: "PC_VanPhong", brand: "Intel", image_url: "", percent_off: 5 },
  { id: 13, name: "PC Văn Phòng Trọn Bộ HP Pro Tower Intel Core i3", price: 9500000, category: "PC_VanPhong", brand: "Khac", image_url: "", percent_off: 0 },
  { id: 14, name: "PC Slim Siêu Nhỏ Gọn Intel Core i5 11400 DeskMini", price: 8200000, category: "PC_VanPhong", brand: "Intel", image_url: "", percent_off: 10 },
  { id: 15, name: "PC Slim Mini ASUS ExpertCenter Intel Core i5", price: 11200000, category: "PC_VanPhong", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 16, name: "PC Văn Phòng Dell OptiPlex Intel i5 Cực Bền Bỉ", price: 12500000, category: "PC_VanPhong", brand: "Khac", image_url: "", percent_off: 7 },
  { id: 17, name: "PC Văn Phòng Kế Toán Intel i3 14100 | 16GB RAM", price: 8700000, category: "PC_VanPhong", brand: "Intel", image_url: "", percent_off: 4 },
  { id: 18, name: "PC Văn Phòng Lenovo ThinkCentre Neo 50t Intel i5", price: 13900000, category: "PC_VanPhong", brand: "Khac", image_url: "", percent_off: 0 },
  { id: 19, name: "PC Slim Chuẩn ITX Intel i5 13400 | H610M-ITX", price: 11800000, category: "PC_VanPhong", brand: "Intel", image_url: "", percent_off: 5 },
  { id: 20, name: "PC Văn Phòng Giá Rẻ Intel Pentium Gold G7400", price: 4800000, category: "PC_VanPhong", brand: "Intel", image_url: "", percent_off: 10 },

  // ================= CỘT 2: LAPTOP - NOTEBOOK (20 Sản phẩm) =================
  // Asus Vivobook & Gaming (category: "Laptop", brand: "Asus")
  { id: 21, name: "Laptop Asus Vivobook 14 X1404ZA Intel Core i5", price: 14290000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 5 },
  { id: 22, name: "Laptop Asus Vivobook 15 X1504ZA Intel Core i3", price: 10990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 23, name: "Laptop Asus Vivobook S 14 OLED Intel Core Ultra 5", price: 20990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 7 },
  { id: 24, name: "Laptop Gaming Asus TUF A15 AMD Ryzen 7 | RTX 4050", price: 22500000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 10 },
  { id: 25, name: "Laptop ROG Strix G16 Intel Core i7 | RTX 4060", price: 34990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 5 },
  { id: 26, name: "Laptop Asus Zenbook 14 OLED Intel Core Ultra 7", price: 28990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 27, name: "Laptop Asus Vivobook 16 X1605VA Intel Core i7", price: 18490000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 8 },
  { id: 28, name: "Laptop ROG Zephyrus G14 OLED Ryzen 9 | RTX 4070", price: 48990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 5 },
  { id: 29, name: "Laptop Asus ExpertBook B1 Intel Core i5 Văn Phòng", price: 13990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 12 },
  { id: 30, name: "Laptop Gaming Asus ROG Flow X13 Màn Hình Cảm Ứng", price: 39990000, category: "Laptop", brand: "Asus", image_url: "", percent_off: 0 },
  
  // Apple MacBook (category: "Laptop", brand: "Apple")
  { id: 31, name: "Laptop MacBook Air M2 8GB / 256GB Chính Hãng", price: 24990000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 0 },
  { id: 32, name: "Laptop MacBook Air M3 16GB / 512GB Mới Nhất", price: 32490000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 6 },
  { id: 33, name: "Laptop MacBook Pro 14 inch M3 Pro 18GB / 512GB", price: 49990000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 4 },
  { id: 34, name: "Laptop MacBook Pro 16 inch M3 Max 36GB / 1TB", price: 85990000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 0 },
  { id: 35, name: "Laptop MacBook Air M1 8GB / 256GB Golden Edition", price: 18490000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 15 },
  { id: 36, name: "Laptop MacBook Pro 14 inch M3 8GB / 512GB Space Gray", price: 39990000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 5 },
  { id: 37, name: "Laptop MacBook Air M3 8GB / 256GB Màn Hình 13 inch", price: 27490000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 0 },
  { id: 38, name: "Laptop MacBook Pro 16 inch M3 Pro 36GB / 512GB Silver", price: 69990000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 3 },
  { id: 39, name: "Laptop MacBook Air M2 16GB / 512GB Cấu Hình Cao", price: 30990000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 8 },
  { id: 40, name: "Laptop MacBook Pro 14 inch M2 Max (Hàng Trưng Bày)", price: 45000000, category: "Laptop", brand: "Apple", image_url: "", percent_off: 20 },

  // ================= CỘT 3: LINH KIỆN PHẦN CỨNG (30 Sản phẩm) =================
  // CPU Intel Core (category: "LinhKien", brand: "Intel")
  { id: 41, name: "CPU Intel Core i5-14600K (Up To 5.3GHz, 14 Nhân 20 Luồng)", price: 8490000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 8 },
  { id: 42, name: "CPU Intel Core i7-14700K (Up To 5.6GHz, 20 Nhân 28 Luồng)", price: 11250000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 5 },
  { id: 43, name: "CPU Intel Core i9-14900K (Up To 6.0GHz, 24 Nhân 32 Luồng)", price: 14890000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 10 },
  { id: 44, name: "CPU Intel Core i3-12100F (Up To 4.3GHz, 4 Nhân 8 Luồng)", price: 1950000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 0 },
  { id: 45, name: "CPU Intel Core i5-12400F (Up To 4.4GHz, 6 Nhân 12 Luồng)", price: 3250000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 12 },
  { id: 46, name: "CPU Intel Core i5-13400F Tray (6 P-Core + 4 E-Core)", price: 4650000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 5 },
  { id: 47, name: "CPU Intel Core i7-13700K Toàn Diện Đồ Họa", price: 9290000, category: "LinhKien", brand: "Intel", image_url: "", percent_off: 0 },
  
  // CPU AMD Ryzen (category: "LinhKien", brand: "AMD")
  { id: 48, name: "CPU AMD Ryzen 5 7600X (Up To 5.3GHz, 6 Nhân 12 Luồng)", price: 6150000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 12 },
  { id: 49, name: "CPU AMD Ryzen 7 7800X3D (Vua Chơi Game Siêu Cấp)", price: 10500000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 0 },
  { id: 50, name: "CPU AMD Ryzen 9 7950X (Up To 5.7GHz, 16 Nhân 32 Luồng)", price: 15200000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 5 },
  { id: 51, name: "CPU AMD Ryzen 5 5600X (Up To 4.6GHz, 6 Nhân 12 Luồng)", price: 3650000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 15 },
  { id: 52, name: "CPU AMD Ryzen 7 5700X (Up To 4.6GHz, 8 Nhân 16 Luồng)", price: 4890000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 10 },
  { id: 53, name: "CPU AMD Ryzen 5 7500F Giá Rẻ Không Tích Hợp iGPU", price: 4150000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 0 },
  { id: 54, name: "CPU AMD Ryzen 9 7900X3D Bộ Nhớ Đệm V-Cache Lớn", price: 12900000, category: "LinhKien", brand: "AMD", image_url: "", percent_off: 7 },

  // Bo Mạch Chủ - Mainboard (category: "LinhKien", brand)
  { id: 55, name: "Mainboard ASUS ROG STRIX B760-F GAMING WIFI", price: 5890000, category: "LinhKien", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 56, name: "Mainboard ASUS TUF GAMING B760M-PLUS WIFI", price: 3950000, category: "LinhKien", brand: "Asus", image_url: "", percent_off: 5 },
  { id: 57, name: "Mainboard MSI MAG B650 TOMAHAWK WIFI (AMD AM5)", price: 5450000, category: "LinhKien", brand: "MSI", image_url: "", percent_off: 5 },
  { id: 58, name: "Mainboard MSI PRO H610M-E DDR4 Văn Phòng", price: 1850000, category: "LinhKien", brand: "MSI", image_url: "", percent_off: 0 },
  { id: 59, name: "Mainboard GIGABYTE B760M AORUS ELITE AX", price: 4250000, category: "LinhKien", brand: "Khac", image_url: "", percent_off: 8 },

  // VGA - Card Đồ Họa (category: "LinhKien", brand)
  { id: 60, name: "Card Màn Hình ASUS Dual GeForce RTX 4060 EVO 8GB", price: 8990000, category: "LinhKien", brand: "Asus", image_url: "", percent_off: 10 },
  { id: 61, name: "Card Màn Hình ROG Strix GeForce RTX 4070 Ti SUPER 16G", price: 26500000, category: "LinhKien", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 62, name: "Card Màn Hình MSI GeForce RTX 3060 Ventus 2X 12G OC", price: 7490000, category: "LinhKien", brand: "MSI", image_url: "", percent_off: 12 },
  { id: 63, name: "Card Màn Hình MSI GeForce RTX 4090 SUPRIM X 24G", price: 56900000, category: "LinhKien", brand: "MSI", image_url: "", percent_off: 5 },
  { id: 64, name: "Card Màn Hình GIGABYTE GeForce RTX 4060 Ti Eagle 8G", price: 11350000, category: "LinhKien", brand: "Khac", image_url: "", percent_off: 0 },

  // RAM Máy Tính (category: "LinhKien", brand)
  { id: 65, name: "RAM Corsair Vengeance LPX 16GB (2x8GB) DDR4 3200MHz", price: 1150000, category: "LinhKien", brand: "Corsair", image_url: "", percent_off: 15 },
  { id: 66, name: "RAM Corsair Vengeance RGB 32GB (2x16GB) DDR5 6000MHz", price: 3250000, category: "LinhKien", brand: "Corsair", image_url: "", percent_off: 5 },
  { id: 67, name: "RAM Samsung DDR4 8GB 3200MHz Cho Máy Văn Phòng", price: 550000, category: "LinhKien", brand: "Samsung", image_url: "", percent_off: 0 },
  { id: 68, name: "RAM Laptop Samsung DDR5 16GB 4800MHz Siêu Tốc Băng Thông", price: 1350000, category: "LinhKien", brand: "Samsung", image_url: "", percent_off: 0 },

  // Ổ Cứng SSD / HDD (category: "LinhKien", brand)
  { id: 69, name: "Ổ Cứng SSD Samsung 990 PRO 1TB NVMe M.2 PCIe Gen4", price: 2850000, category: "LinhKien", brand: "Samsung", image_url: "", percent_off: 7 },
  { id: 70, name: "Ổ Cứng SSD Samsung 980 500GB NVMe M.2 Tốc Độ Cao", price: 1450000, category: "LinhKien", brand: "Samsung", image_url: "", percent_off: 0 },

  // ================= CỘT 4: MÀN HÌNH MÁY TÍNH (15 Sản phẩm) =================
  // Màn Hình Gaming MSI (category: "ManHinh", brand: "MSI")
  { id: 71, name: "Màn Hình Gaming MSI Optix G241V E2 24 inch IPS 75Hz", price: 3290000, category: "ManHinh", brand: "MSI", image_url: "", percent_off: 12 },
  { id: 72, name: "Màn Hình Gaming MSI G274F 27 inch Fast IPS 180Hz G-Sync", price: 4690000, category: "ManHinh", brand: "MSI", image_url: "", percent_off: 10 },
  { id: 73, name: "Màn Hình Cong Gaming MSI Optix G32C4 32 inch 165Hz", price: 6890000, category: "ManHinh", brand: "MSI", image_url: "", percent_off: 5 },
  { id: 74, name: "Màn Hình Đồ Họa Cận Cao Cấp MSI Modern MD271UL 4K IPS", price: 7990000, category: "ManHinh", brand: "MSI", image_url: "", percent_off: 0 },
  { id: 75, name: "Màn Hình Portable MSI Optix MAG162V Di Động Cực Tiện", price: 4500000, category: "ManHinh", brand: "MSI", image_url: "", percent_off: 5 },
  
  // Màn Hình Đồ Họa ProArt & Samsung (category: "ManHinh", brand)
  { id: 76, name: "Màn Hình Đồ Họa ASUS ProArt PA248QV 24 inch IPS FHD", price: 5190000, category: "ManHinh", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 77, name: "Màn Hình Chuyên Đồ Họa ASUS ProArt PA279CV 27 inch 4K IPS", price: 9990000, category: "ManHinh", brand: "Asus", image_url: "", percent_off: 5 },
  { id: 78, name: "Màn Hình Văn Phòng Samsung S31C 24 inch IPS 75Hz", price: 2350000, category: "ManHinh", brand: "Samsung", image_url: "", percent_off: 15 },
  { id: 79, name: "Màn Hình Thông Minh Samsung Smart Monitor M5 32 inch FHD", price: 5490000, category: "ManHinh", brand: "Samsung", image_url: "", percent_off: 0 },
  { id: 80, name: "Màn Hình Gaming Cao Cấp Samsung Odyssey G7 2K 240Hz", price: 11990000, category: "ManHinh", brand: "Samsung", image_url: "", percent_off: 8 },
  { id: 81, name: "Màn Hình Văn Phòng ASUS VY249HE 24 inch Bảo Vệ Mắt", price: 2790000, category: "ManHinh", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 82, name: "Màn Hình Đồ Họa ASUS ProArt PA329CV Siêu Lớn 32 inch 4K", price: 17900000, category: "ManHinh", brand: "Asus", image_url: "", percent_off: 0 },
  { id: 83, name: "Màn Hình UltraWide Samsung LC34G55T Cong 2K 165Hz", price: 8900000, category: "ManHinh", brand: "Samsung", image_url: "", percent_off: 10 },
  { id: 84, name: "Màn Hình Kinh Doanh MSI Pro MP223 21.5 inch Tiết Kiệm", price: 1950000, category: "ManHinh", brand: "MSI", image_url: "", percent_off: 0 },
  { id: 85, name: "Màn Hình Đồ Họa Cao Cấp ViewSonic VP2756 2K IPS Pantone", price: 6990000, category: "ManHinh", brand: "Khac", image_url: "", percent_off: 5 },

  // ================= CỘT 5: GAMING GEAR & PHỤ KIỆN (15 Sản phẩm) =================
  // Chuột Không Dây Logitech (category: "GamingGear", brand: "Logitech")
  { id: 86, name: "Chuột Không Dây Logitech MX Master 3S Ergonomic Cao Cấp", price: 2350000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 5 },
  { id: 87, name: "Chuột Gaming Không Dây Logitech G Pro X Superlight 2", price: 3590000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 10 },
  { id: 88, name: "Chuột Quốc Dân Gaming Logitech G102 Lightsync RGB", price: 390000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 0 },
  { id: 89, name: "Chuột Không Dây Văn Phòng Logitech G304 LightSpeed", price: 790000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 12 },
  { id: 90, name: "Chuột Không Dây Silent Logitech M331 Yên Tĩnh Tuyệt Đối", price: 350000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 0 },
  
  // Bàn Phím Cơ ROG Strix & Gear Khác (category: "GamingGear", brand)
  { id: 91, name: "Bàn Phím Cơ ASUS ROG Strix Scope RX Red Switch Chống Nước", price: 3150000, category: "GamingGear", brand: "Asus", image_url: "", percent_off: 20 },
  { id: 92, name: "Bàn Phím Cơ ASUS ROG Azoth Wireless 75% Custom Cao Cấp", price: 5490000, category: "GamingGear", brand: "Asus", image_url: "", percent_off: 5 },
  { id: 93, name: "Bàn Phím Cơ Corsair K70 RGB PRO Cherry MX Red Switch", price: 3890000, category: "GamingGear", brand: "Corsair", image_url: "", percent_off: 15 },
  { id: 94, name: "Bàn Phím Cơ Corsair K63 Wireless Nhỏ Gọn Tenkeyless", price: 2450000, category: "GamingGear", brand: "Corsair", image_url: "", percent_off: 10 },
  { id: 95, name: "Bàn Phím Cơ ASUS TUF Gaming K3 Phím Cơ Giá Rẻ Siêu Bền", price: 1690000, category: "GamingGear", brand: "Asus", image_url: "", percent_off: 0 },
  
  // Tai Nghe & Nguồn Máy Tính (category: "GamingGear", brand)
  { id: 96, name: "Tai Nghe Chụp Tai Sony WH-1000XM5 Chống Ồn Cao Cấp", price: 6990000, category: "GamingGear", brand: "Khac", image_url: "", percent_off: 15 },
  { id: 97, name: "Nguồn Máy Tính Corsair CV750 750W 80 Plus Bronze", price: 1750000, category: "GamingGear", brand: "Corsair", image_url: "", percent_off: 0 },
  { id: 98, name: "Nguồn Máy Tính Corsair RM850e 850W 80 Plus Gold ATX 3.0", price: 3150000, category: "GamingGear", brand: "Corsair", image_url: "", percent_off: 8 },
  { id: 99, name: "Tai Nghe Gaming Logitech G435 Lightspeed Siêu Nhẹ", price: 1590000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 10 },
  { id: 100, name: "Loa Máy Tính Logitech Z407 Bluetooth Có Loa Trầm Đỉnh Cao", price: 2190000, category: "GamingGear", brand: "Logitech", image_url: "", percent_off: 5 }
];

function ProductList({ category, setCategory, brand, setBrand }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [priceRange, setPriceRange] = useState("");
  const [currentPage, setCurrentPage] = useState(0); 
  const productsPerPage = 8; 

  const filterMockData = () => {
    const filtered = mockProductsFromMySQL.filter((item) => {
      const matchCategory = category === "" || item.category === category;
      const matchBrand = brand === "" || item.brand === brand;
      
      let matchPrice = true;
      if (priceRange === "duoi10") matchPrice = item.price < 10000000;
      else if (priceRange === "10den20") matchPrice = item.price >= 10000000 && item.price <= 20000000;
      else if (priceRange === "tren20") matchPrice = item.price > 20000000;

      return matchCategory && matchBrand && matchPrice;
    });

    setFilteredProducts(filtered);
    setCurrentPage(0); 
  };

  useEffect(() => {
    filterMockData();
  }, [category, brand, priceRange]);

  const indexOfLastProduct = (currentPage + 1) * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProductsToShow = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  return (
    <div className="container-fluid mt-4 mb-5 px-4">
      
      {/* BỘ LỌC NGANG */}
      <div className="row mb-4">
        <div className="col-12">
          <h4 className="fw-bold text-uppercase mb-3" style={{ borderLeft: "5px solid #000080", paddingLeft: "10px", color: "#000" }}>
            Tất cả sản phẩm
          </h4>
          <p className="text-muted mb-2">Bộ lọc sản phẩm</p>
          
          <div className="d-flex gap-3">
            <select className="form-select w-auto shadow-sm" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
              <option value="">Chọn mức giá</option>
              <option value="duoi10">Dưới 10 triệu</option>
              <option value="10den20">Từ 10 - 20 triệu</option>
              <option value="tren20">Trên 20 triệu</option>
            </select>

            <select className="form-select w-auto shadow-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Loại</option>
              {menuCategories.map(menu => (
                <option key={menu.id} value={menu.id}>{menu.name}</option>
              ))}
            </select>

            <select className="form-select w-auto shadow-sm" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Thương hiệu</option>
              <option value="Apple">Apple</option>
              <option value="Asus">Asus</option>
              <option value="Samsung">Samsung</option>
              <option value="Intel">Intel</option>
              <option value="AMD">AMD</option>
              <option value="MSI">MSI</option>
              <option value="Logitech">Logitech</option>
              <option value="Corsair">Corsair</option>
            </select>
          </div>
        </div>
      </div>

      <div className="row">
        {/* SIDEBAR TRÁI */}
        <div className="col-md-3 mb-4">
          <div className="card shadow-sm border-0 rounded-0">
            <div className="list-group list-group-flush">
              <button
                type="button"
                className={`list-group-item list-group-item-action fw-bold py-2 ${category === "" ? "text-primary" : "text-dark"}`}
                onClick={() => { setCategory(""); setBrand(""); }}
              >
                Tất cả sản phẩm
              </button>
              
              {menuCategories.map((menu) => (
                <button
                  key={menu.id}
                  type="button"
                  className={`list-group-item list-group-item-action border-0 py-1 d-flex justify-content-between align-items-center ${category === menu.id ? "text-primary fw-bold" : "text-muted"}`}
                  onClick={() => { setCategory(menu.id); setBrand(""); }}
                  style={{ fontSize: "15px" }}
                >
                  <span>{menu.name}</span>
                  <small>›</small>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* LƯỚI SẢN PHẨM */}
        <div className="col-md-9 d-flex flex-column justify-content-between">
          <div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {currentProductsToShow.length > 0 ? (
                currentProductsToShow.map((item) => (
                  <Product key={item.id} data={item} />
                ))
              ) : (
                <div className="col-12 text-center mt-5">
                  <p className="text-muted fs-5">Không có sản phẩm nào khớp với bộ lọc của bạn.</p>
                </div>
              )}
            </div>
          </div>

          {/* DẤU CHẤM TRÒN PHÂN TRANG */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-2 mt-5">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentPage(index)}
                  style={{
                    width: index === currentPage ? "30px" : "10px",
                    height: "10px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: index === currentPage ? "#000080" : "#cccccc",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  title={`Trang ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
