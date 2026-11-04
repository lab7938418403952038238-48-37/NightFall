; NIGHTFALL GDI capture helpers used by core/Move.ahk.
; These wrappers expose the Win32 GDI calls expected by DetectMovespeed().

CreateCompatibleDC(hdc := 0) {
    return DllCall("gdi32\CreateCompatibleDC", "ptr", hdc, "ptr")
}

CreateDIBSection(width, height, hdc := 0) {
    bi := Buffer(40, 0)
    NumPut("UInt", 40, bi, 0)
    NumPut("Int", width, bi, 4)
    NumPut("Int", -height, bi, 8)
    NumPut("UShort", 1, bi, 12)
    NumPut("UShort", 32, bi, 14)
    NumPut("UInt", 0, bi, 16)
    NumPut("UInt", width * height * 4, bi, 20)
    bits := 0
    return DllCall("gdi32\CreateDIBSection", "ptr", hdc, "ptr", bi, "uint", 0, "ptr*", &bits, "ptr", 0, "uint", 0, "ptr")
}

SelectObject(hdc, object) {
    return DllCall("gdi32\SelectObject", "ptr", hdc, "ptr", object, "ptr")
}

DeleteObject(object) {
    return DllCall("gdi32\DeleteObject", "ptr", object, "int")
}

DeleteDC(hdc) {
    return DllCall("gdi32\DeleteDC", "ptr", hdc, "int")
}

BitBlt(dest, x, y, width, height, source, sourceX, sourceY, raster := 0x00CC0020) {
    return DllCall("gdi32\BitBlt", "ptr", dest, "int", x, "int", y, "int", width, "int", height, "ptr", source, "int", sourceX, "int", sourceY, "uint", raster, "int")
}

GetDC(hwnd := 0) {
    return DllCall("user32\GetDC", "ptr", hwnd, "ptr")
}

ReleaseDC(hdc, hwnd := 0) {
    return DllCall("user32\ReleaseDC", "ptr", hwnd, "ptr", hdc, "int")
}
