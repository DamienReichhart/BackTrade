@echo off
setlocal enabledelayedexpansion

rem ------------------------------------------------------------
rem Dukascopy download runner
rem Usage:
rem   run.bat [INSTRUMENT] [FROM] [TO] [TIMEFRAME] [FORMAT] [OUTDIR]
rem Examples:
rem   run.bat btcusd 2019-01-13 2019-01-14 m1 csv download
rem   run.bat xauusd 2020-01-01 2020-01-10 m5 csv data
rem ------------------------------------------------------------

rem Resolve script directory and switch to it
set SCRIPT_DIR=%~dp0
pushd "%SCRIPT_DIR%" >nul 2>&1

rem Defaults
set INSTRUMENT=%~1
if "%INSTRUMENT%"=="" set INSTRUMENT=btcusd
set DATE_FROM=%~2
if "%DATE_FROM%"=="" set DATE_FROM=2019-01-13
set DATE_TO=%~3
if "%DATE_TO%"=="" set DATE_TO=2019-01-14
set TIMEFRAME=%~4
if "%TIMEFRAME%"=="" set TIMEFRAME=m1
set FORMAT=%~5
if "%FORMAT%"=="" set FORMAT=csv
set OUTDIR=%~6
if "%OUTDIR%"=="" set OUTDIR=download

rem Help
if /I "%~1"=="-h" goto :help
if /I "%~1"=="--help" goto :help
if /I "%~1"=="/?" goto :help

rem Check prerequisites
where node >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo         Download from https://nodejs.org and try again.
  goto :eof
)
where npx >nul 2>&1
if errorlevel 1 (
  echo [ERROR] npx was not found in PATH. Ensure Node.js 8+ is installed.
  goto :eof
)

rem Prepare output directory
if not exist "%OUTDIR%" (
  mkdir "%OUTDIR%" 2>nul
  if errorlevel 1 (
    echo [ERROR] Failed to create output directory: "%OUTDIR%"
    goto :eof
  )
)

rem Timestamped log file
for /f "tokens=1-5 delims=/:. " %%a in ("%date% %time%") do set TS=%%c-%%a-%%b_%%d%%e
set LOG_FILE=%OUTDIR%\dukascopy_%INSTRUMENT%_%DATE_FROM%_%DATE_TO%_%TIMEFRAME%_%TS%.log

echo [INFO] Instrument  = %INSTRUMENT%
echo [INFO] From        = %DATE_FROM%
echo [INFO] To          = %DATE_TO%
echo [INFO] Timeframe   = %TIMEFRAME%
echo [INFO] Format      = %FORMAT%
echo [INFO] Output dir  = %OUTDIR%
echo [INFO] Log file    = %LOG_FILE%

rem Run download (non-interactive)
echo [INFO] Starting download...
call npx --yes dukascopy-node -i %INSTRUMENT% -from %DATE_FROM% -to %DATE_TO% -t %TIMEFRAME% -f %FORMAT% -d "%OUTDIR%" 1>>"%LOG_FILE%" 2>&1
set EXIT_CODE=%ERRORLEVEL%

if %EXIT_CODE% NEQ 0 (
  echo [ERROR] Download failed with exit code %EXIT_CODE%. See log: "%LOG_FILE%"
  goto :end
)

echo [SUCCESS] Download completed. See files in "%OUTDIR%". Log: "%LOG_FILE%"
goto :end

:help
echo.
echo Usage: %~n0 [INSTRUMENT] [FROM] [TO] [TIMEFRAME] [FORMAT] [OUTDIR]
echo   INSTRUMENT  Required symbol, default: btcusd
echo   FROM        Start date YYYY-MM-DD, default: 2019-01-13
echo   TO          End date YYYY-MM-DD, default: 2019-01-14
echo   TIMEFRAME   m1, m5, m15, h1, etc. Default: m1
echo   FORMAT      csv or json. Default: csv
echo   OUTDIR      Output directory. Default: download
echo.
echo Example:
echo   %~n0 xauusd 2020-01-01 2020-01-10 m5 csv data
goto :end

:end
popd >nul 2>&1
endlocal