@echo off
setlocal EnableDelayedExpansion
chcp 65001 >nul 2>&1

:: ============================================================
::  DRUCKER-TAUSCH SKRIPT
::  Anleitung: Folgende drei Zeilen anpassen, dann speichern
:: ============================================================

set "ALTER_DRUCKER=HIER_ALTEN_DRUCKERNAMEN_EINTRAGEN"
set "NEUER_DRUCKER=HIER_NEUEN_DRUCKERNAMEN_EINTRAGEN"
set "IT_SKRIPT=\\server\pfad\install.bat"

:: ============================================================
::  Admin-Rechte prüfen – bei Bedarf UAC-Abfrage starten
:: ============================================================
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Administratorrechte werden benoetigt.
    echo Das Fenster startet sich jetzt neu mit Admin-Abfrage...
    timeout /t 2 /nobreak >nul
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~f0\"' -Verb RunAs"
    exit /b
)

:: ============================================================
::  Platzhalter-Prüfung
:: ============================================================
if "%ALTER_DRUCKER%"=="HIER_ALTEN_DRUCKERNAMEN_EINTRAGEN" (
    echo FEHLER: Bitte zuerst die Druckernamen im Skript eintragen^^!
    echo Oeffne die .bat-Datei mit einem Texteditor und passe die
    echo ersten drei Variablen an.
    pause
    exit /b 1
)

echo.
echo ============================================================
echo   DRUCKER-TAUSCH - Behoerde
echo ============================================================
echo   Alter Drucker : %ALTER_DRUCKER%
echo   Neuer Drucker : %NEUER_DRUCKER%
echo   IT-Skript     : %IT_SKRIPT%
echo ============================================================
echo.
echo Weiter mit beliebiger Taste - oder STRG+C zum Abbrechen...
pause >nul

:: ============================================================
::  SCHRITT 1: Fehlerhaften Drucker entfernen
:: ============================================================
echo.
echo [1/3] Entferne fehlerhaften Drucker: %ALTER_DRUCKER%
powershell -NoProfile -Command ^
    "Remove-Printer -Name '%ALTER_DRUCKER%' -ErrorAction Stop" ^
    2>nul
if %errorLevel% equ 0 (
    echo      OK - Drucker wurde entfernt.
) else (
    echo      HINWEIS: Drucker war bereits entfernt oder Name nicht gefunden.
    echo      Das Skript wird trotzdem fortgesetzt.
)

:: ============================================================
::  SCHRITT 2: IT-Installationsskript ausfuehren
:: ============================================================
echo.
echo [2/3] Starte IT-Installationsskript...
echo      Pfad: %IT_SKRIPT%

if not exist "%IT_SKRIPT%" (
    echo FEHLER: IT-Skript nicht erreichbar: %IT_SKRIPT%
    echo Bitte Netzwerkverbindung und Pfad pruefen.
    pause
    exit /b 1
)

call "%IT_SKRIPT%"
if %errorLevel% neq 0 (
    echo FEHLER: IT-Skript wurde mit Fehlercode %errorLevel% beendet.
    echo Bitte IT-Abteilung kontaktieren.
    pause
    exit /b 1
)
echo      OK - IT-Skript abgeschlossen.

:: ============================================================
::  SCHRITT 3: Fach 2 als Standard am neuen Drucker einstellen
:: ============================================================
echo.
echo [3/3] Stelle Fach 2 am neuen Drucker ein: %NEUER_DRUCKER%

:: Kurz warten, falls der Drucker noch registriert wird
timeout /t 5 /nobreak >nul

powershell -NoProfile -Command ^
    "Set-PrintConfiguration -PrinterName '%NEUER_DRUCKER%' -PaperSource Lower" ^
    2>nul
if %errorLevel% equ 0 (
    echo      OK - Fach 2 wurde als Standard eingestellt.
) else (
    echo      HINWEIS: Fach 2 konnte nicht automatisch gesetzt werden.
    echo      Bitte Druckereigenschaften manuell oeffnen und Fach 2 waehlen.
)

:: ============================================================
::  Fertig
:: ============================================================
echo.
echo ============================================================
echo   Fertig^^! Drucker getauscht und Fach 2 konfiguriert.
echo ============================================================
echo.
pause
