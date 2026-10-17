@echo off
REM Deploys GasDost Build 27 to gasdostbpcl-deliveryapp-v4.netlify.app
REM Needs Node.js on this computer (https://nodejs.org - the "LTS" button).
REM Keep this file private: it can update your site.
cd /d "%~dp0"
where npx >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js is not installed. Install it from https://nodejs.org ^(LTS^), then double-click DEPLOY.bat again.
  echo.
  pause
  exit /b 1
)
echo Uploading GasDost Build 27 to Netlify. This takes 1-3 minutes, please wait...
call npx -y @netlify/mcp@latest --site-id 48a35b4d-7100-4a24-85ea-08012bd6db2c --proxy-path "https://netlify-mcp.netlify.app/proxy/eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..Ge3z1hK7hmCySjrI.DhMQbjX2guMs9HhsQQjVlOIJsKL_xqh2JwYKYYgKzMLZEsj4npPpFuTv6znGLccrfPRno315dW1xkp8VLIDDG5bfE9jCNsdX2zZC0mouNKfzQQzXrfYXqlH_qh8bGDdE3r345CHChWYm9H9o3uk3DJkL23DGl3_7zNKaNaBE81HnZOQ7funIR3pBKusvcmo1CpTmIrNDgMRgUpUfyqWe-Uzxa_ckwg3-vCRBn1YMhufuOIs6f1col3r_6JwEQDcYpnnRbgC_d5m3-3nckK-18OPot4mRBMF0x1PAw6I2hnMoYL8nemg9kJiIxhMLP-4fA6jV7ZZbbnb5xa-ycYEXZnniRFLvvjwEkItYJ0J_zCqWun_4a8DlVYawRUNijbzq1-jDeL_scwkjWbNlErkQjoYCowA.7q-nUIbaczDTXPy3bjeHJQ"
echo.
echo Finished. Copy everything above and send it to Claude.
pause
