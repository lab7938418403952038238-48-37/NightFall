#Requires AutoHotkey v2.0
#SingleInstance Force
#Include core\WebViewToo.ahk
#Include bitmaps\Gdip_All.ahk
#Include core\Gdip_ImageSearch.ahk
#Include core\QPC.ahk
#Include core\Roblox.ahk
#Include core\Move.ahk

global NightfallWindow := 0
global ConfigPath := A_ScriptDir "\NightFall.ini"
global BaseMovespeed := Number(IniRead(ConfigPath, "Player", "MoveSpeed", "32.20"))
global HastyGuards := false
global GiftedHasty := false
global offsetY := 0
global BeesCount := Number(IniRead(ConfigPath, "Player", "Bees", "25"))
global HiveSlot := Number(IniRead(ConfigPath, "Player", "HiveSlot", "1"))
global CaptureInterval := Number(IniRead(ConfigPath, "Scanner", "CaptureInterval", "2"))
global MacroState := "idle"
global GatherConfig := {
    Field: IniRead(ConfigPath, "Gather", "Field", ""),
    Pattern: IniRead(ConfigPath, "Gather", "Pattern", ""),
    Region: IniRead(ConfigPath, "Gather", "Region", "Bottom Left"),
    Camera: IniRead(ConfigPath, "Gather", "Camera", "Default"),
    Capacity: Number(IniRead(ConfigPath, "Gather", "Capacity", "100")),
    Minutes: Number(IniRead(ConfigPath, "Gather", "Minutes", "30"))
}

WebViewSettings := {DllPath: A_ScriptDir "\\core\\" (A_PtrSize = 8 ? "64bit" : "32bit") "\\WebView2Loader.dll"}
NightfallWindow := WebViewGui("+Resize -Caption", "NIGHTFALL",, WebViewSettings)
NightfallWindow.OnEvent("Close", (*) => ExitApp())
NightfallWindow.Navigate("GUI/index.html")
NightfallWindow.AddCallbackToScript("NightfallStart", NightfallStart)
NightfallWindow.AddCallbackToScript("NightfallStop", NightfallStop)
NightfallWindow.AddCallbackToScript("NightfallClose", NightfallClose)
NightfallWindow.AddCallbackToScript("NightfallReload", NightfallReload)
NightfallWindow.AddCallbackToScript("NightfallMinimize", NightfallMinimize)
NightfallWindow.AddCallbackToScript("NightfallMaximize", NightfallMaximize)
NightfallWindow.AddCallbackToScript("NightfallSetMoveSpeed", NightfallSetMoveSpeed)
NightfallWindow.AddCallbackToScript("NightfallSaveSettings", NightfallSaveSettings)
NightfallWindow.AddCallbackToScript("NightfallGetSettings", NightfallGetSettings)
NightfallWindow.AddCallbackToScript("NightfallCalibrateCamera", NightfallCalibrateCamera)
NightfallWindow.AddCallbackToScript("NightfallGetFields", NightfallGetFields)
NightfallWindow.AddCallbackToScript("NightfallGetPatterns", NightfallGetPatterns)
NightfallWindow.AddCallbackToScript("NightfallSaveGather", NightfallSaveGather)
NightfallWindow.Show("w1120 h760")
WinSetTransparent(191, NightfallWindow.Hwnd)
OnExit(NightfallCleanup)

F1::NightfallStart()
F2::NightfallStop()
F3::NightfallClose()
F4::NightfallReload()

NightfallStart(*) {
    global MacroState, BaseMovespeed
    if (MacroState = "running")
        return
    if !GetRobloxHWND() {
        MacroState := "idle"
        NightfallNotify("status", "idle", "Roblox was not found. Open Roblox before starting.")
        return
    }
    BaseMovespeed := Number(IniRead(A_ScriptDir "\NightFall.ini", "Player", "MoveSpeed", "32.20"))
    calibration := NightfallCameraCalibrationCheck()
    MacroState := "ready"
    NightfallNotify("status", "idle", "Roblox detected. " calibration)
}

NightfallStop(*) {
    global MacroState
    Send "{w up}{a up}{s up}{d up}{Space up}{RButton up}"
    MacroState := "idle"
    NightfallNotify("status", "stopped", "Stopped; all held movement inputs released.")
}
NightfallClose(*) {
    NightfallStop()
    ExitApp()
}
NightfallReload(*) => Reload()
NightfallMinimize(*) {
    global NightfallWindow
    try WinMinimize("ahk_id " NightfallWindow.Hwnd)
}
NightfallMaximize(*) {
    global NightfallWindow
    try {
        if WinGetMinMax("ahk_id " NightfallWindow.Hwnd) = 1
            WinRestore("ahk_id " NightfallWindow.Hwnd)
        else
            WinMaximize("ahk_id " NightfallWindow.Hwnd)
    }
}
NightfallSetMoveSpeed(WebView, value) {
    global BaseMovespeed, ConfigPath
    speed := Max(0, Min(50, Number(value)))
    BaseMovespeed := speed
    IniWrite(Format("{:.2f}", speed), ConfigPath, "Player", "MoveSpeed")
    return Format("{:.2f}", speed)
}
NightfallSaveSettings(WebView, bees, hive, speed, capture) {
    global BeesCount, HiveSlot, CaptureInterval, BaseMovespeed, ConfigPath
    BeesCount := Max(1, Min(50, Integer(bees)))
    HiveSlot := Max(1, Min(6, Integer(hive)))
    BaseMovespeed := Max(0, Min(50, Number(speed)))
    CaptureInterval := Max(1, Min(60, Integer(capture)))
    IniWrite(BeesCount, ConfigPath, "Player", "Bees")
    IniWrite(HiveSlot, ConfigPath, "Player", "HiveSlot")
    IniWrite(Format("{:.2f}", BaseMovespeed), ConfigPath, "Player", "MoveSpeed")
    IniWrite(CaptureInterval, ConfigPath, "Scanner", "CaptureInterval")
    return "saved"
}
NightfallGetSettings(*) {
    global BeesCount, HiveSlot, BaseMovespeed, CaptureInterval, GatherConfig
    return BeesCount "|" HiveSlot "|" Format("{:.2f}", BaseMovespeed) "|" CaptureInterval "|" GatherConfig.Capacity "|" GatherConfig.Minutes
}
NightfallCalibrateCamera(*) => NightfallCameraCalibrationCheck()
NightfallCameraCalibrationCheck() {
    if !GetRobloxHWND()
        return "Roblox not detected; camera calibration was skipped."
    return "Roblox detected. Automatic sensitivity measurement is not implemented yet; no value was guessed."
}
NightfallGetFields(*) {
    fields := Map()
    pathsDir := A_ScriptDir "\paths"
    Loop Files, pathsDir "\gtf-*.ahk", "F" {
        name := SubStr(A_LoopFileName, 5, -4)
        fields[StrLower(name)] := name
    }
    result := ""
    for key, name in fields {
        if FileExist(pathsDir "\fth-" name ".ahk")
            result .= name Chr(10)
    }
    return RTrim(result, Chr(10))
}
NightfallGetPatterns(*) {
    patternsDir := A_ScriptDir "\pattens"
    result := ""
    Loop Files, patternsDir "\*.ahk", "F"
        result .= A_LoopFileName Chr(10)
    return RTrim(result, Chr(10))
}
NightfallSaveGather(WebView, field, pattern, region, camera, capacity, minutes) {
    global GatherConfig, ConfigPath
    GatherConfig.Field := field
    GatherConfig.Pattern := pattern
    GatherConfig.Region := region
    GatherConfig.Camera := camera
    GatherConfig.Capacity := Max(1, Min(100, Number(capacity)))
    GatherConfig.Minutes := Max(1, Min(120, Number(minutes)))
    for key, value in Map("Field", field, "Pattern", pattern, "Region", region, "Camera", camera, "Capacity", GatherConfig.Capacity, "Minutes", GatherConfig.Minutes)
        IniWrite(value, ConfigPath, "Gather", key)
    return "saved"
}
NightfallNotify(type, status, detail) {
    global NightfallWindow
    if !IsObject(NightfallWindow)
        return
    safeStatus := StrReplace(status, "'", "")
    safeDetail := StrReplace(StrReplace(detail, "\", "\\"), "'", "\'")
    try NightfallWindow.ExecuteScriptAsync("window.nightfallReceive({type:'" type "',status:'" safeStatus "',detail:'" safeDetail "'})")
}
NightfallCleanup(*) => Send("{w up}{a up}{s up}{d up}{Space up}{RButton up}")
