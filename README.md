# Lmaobox TF2 Console Extension

[![GitHub followers](https://img.shields.io/github/followers/titaniummachine1?style=social)](https://github.com/titaniummachine1)
[![GitHub stars](https://img.shields.io/github/stars/titaniummachine1/Lmaobox_Console_Debugger?style=social)](https://github.com/titaniummachine1/Lmaobox_Console_Debugger)
[![GitHub issues](https://img.shields.io/github/issues/titaniummachine1/Lmaobox_Console_Debugger)](https://github.com/titaniummachine1/Lmaobox_Console_Debugger/issues)
[![GitHub license](https://img.shields.io/github/license/titaniummachine1/Lmaobox_Console_Debugger)](https://github.com/titaniummachine1/Lmaobox_Console_Debugger/blob/main/LICENSE)

> VS Code Extension to manage TF2 servers via RCON commands..

---

## Features

- **Manage TF2 Servers**: Issue RCON commands to your TF2 server from within VS Code.
- **Set RCON Credentials**: Easily set your RCON password and IP address using extension commands.
- **Console Logging**: View TF2 console output in real-time inside VS Code.

> Note: To fully utilize this extension, TF2 must be configured with the appropriate launch options and network settings. See the instructions below.

## Installation

You can install this extension from the [Visual Studio Marketplace](https://marketplace.visualstudio.com/) or directly via VS Code.

```bash
ext install titaniummachine1.lmaobox-tf2-console
```

## Requirements

### TF2 Launch Options

To ensure that TF2 is ready for remote console connections, you need to add the following launch options:

```
-condebug -conclearlog -usercon -g15
```

- `-condebug`: Enables console logging, which the extension uses to capture output.
- `-conclearlog`: Clears the log file each time TF2 starts, preventing old logs from being read.
- `-usercon`: Enables user control over the console (required for remote control).
- `-g15`: Sets a higher net channel simulation limit to improve performance when issuing RCON commands.

Add these launch options in Steam:
1. Right-click on **Team Fortress 2** in your Steam Library.
2. Select **Properties**.
3. Under the **General** tab, find **Launch Options**.
4. Add the above options.

### Autoexec.cfg Configuration

You also need to configure TF2 to allow remote connections. Add the following lines to your `autoexec.cfg` file:

```
host_thread_mode 1
host_thread_mode 0
ip 0.0.0.0
rcon_password 123456789
net_start
```

- `host_thread_mode`: Enables multithreading for better performance.
- `ip 0.0.0.0`: Binds the server to all available IP addresses.
- `rcon_password`: Sets your RCON password (you should change this to something secure).
- `net_start`: Starts the network interface for accepting RCON commands.

If you are using **mastercomfig** (a popular TF2 performance config), place the `autoexec.cfg` in the `override` folder to ensure it is not overwritten by the default config files.

1. Go to your TF2 installation directory (`Steam\steamapps\common\Team Fortress 2\tf\custom\mastercomfig\cfg\override`).
2. Create the file `autoexec.cfg` or place your custom version here.

## Extension Settings

This extension contributes the following settings:

- `tf2Console.rconPassword`: Set the RCON password for connecting to the TF2 server.
- `tf2Console.rconIP`: Set the IP address of your TF2 server.
- `tf2Console.clearConsoleOnStart`: Automatically clear the console log when starting a new session.

## Commands

This extension adds several commands to VS Code. You can access these via the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on macOS):

- **Open TF2 Console**: Opens a console view in VS Code that captures output from the TF2 server.
- **Set RCON Password**: Set your RCON password to authenticate commands.
- **Set RCON IP Address**: Set the IP address of the TF2 server.

## Known Issues

- Logs from TF2 may not immediately appear if `-condebug` is not enabled in the TF2 launch options.
- Ensure that the `autoexec.cfg` is correctly configured; otherwise, the RCON connection may fail.

## Release Notes

### 1.0.0

Initial release of the TF2 RCON Console extension.

## Contributions

You are welcome to contribute to this repository! Feel free to fork the repository and submit pull requests with enhancements, bug fixes, or other improvements.

---

## Metrics

[![GitHub last commit](https://img.shields.io/github/last-commit/titaniummachine1/Lmaobox_Console_Debugger)](https://github.com/titaniummachine1/Lmaobox_Console_Debugger/commits/main)
[![Total Downloads](https://img.shields.io/visual-studio-marketplace/d/titaniummachine1.lmaobox-tf2-console)](https://marketplace.visualstudio.com/items?itemName=titaniummachine1.lmaobox-tf2-console)
[![GitHub repo size](https://img.shields.io/github/repo-size/titaniummachine1/Lmaobox_Console_Debugger)](https://github.com/titaniummachine1/Lmaobox_Console_Debugger)
[![GitHub contributors](https://img.shields.io/github/contributors/titaniummachine1/Lmaobox_Console_Debugger)](https://github.com/titaniummachine1/Lmaobox_Console_Debugger/graphs/contributors)

---

**Enjoy!**