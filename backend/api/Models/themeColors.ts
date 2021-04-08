export class ThemeColors {
  constructor(
    public editorBackground?: HSLColor,
    public editorForeground?: HSLColor,
    public foreground?: HSLColor,
    public activityBarBackground?: HSLColor,
    public activityBarForeground?: HSLColor,
    public sideBarBackground?: HSLColor,
    public sideBarForeground?: HSLColor,
    public editorGroupHeaderNoTabsBackground?: HSLColor,
    public editorGroupHeaderTabsBackground?: HSLColor,
    public statusBarBackground?: HSLColor,
    public statusBarForeground?: HSLColor,
    public titleBarActiveBackground?: HSLColor,
    public titleBarActiveForeground?: HSLColor,
    public menuForeground?: HSLColor,
    public menuBackground?: HSLColor,
    public terminalBackground?: HSLColor,
    public terminalForeground?: HSLColor,
    public buttonBackground?: HSLColor,
    public buttonForeground?: HSLColor
  ) { }
}

export class HSLColor {
  constructor(
    public h: number,
    public s: number,
    public l: number
  ) { }
}





