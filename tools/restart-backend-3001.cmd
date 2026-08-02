@echo off
setlocal

echo [1/3] Tim tien trinh dang chiem port 3001...
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
  echo Dang dung PID %%P...
  taskkill /PID %%P /F >nul 2>&1
)

echo [2/3] Xoa build cu...
if exist dist rmdir /s /q dist

echo [3/3] Khoi dong backend...
npm run start:dev

endlocal
