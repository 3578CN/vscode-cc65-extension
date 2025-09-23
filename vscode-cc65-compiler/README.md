# cc65 编译器扩展

在资源管理器中右键 `.asm` 文件，选择 “编译此文件” 来使用 cc65 工具链（`ca65` + `ld65`）编译。

使用说明（Windows + PowerShell）:

- 确保 `ca65` 和 `ld65` 在系统 PATH 中可用。
- 推荐在工作区创建 `.vscode/cc65.cfg` 链接脚本，或在弹窗中输入绝对路径。
- 右键 `.asm` 文件，点击 `编译此文件`，结果会在名为 `cc65-Assembler` 的 PowerShell 终端中显示。

注意：该扩展只是调用外部命令，不会修改工作区其它文件。错误与输出请查看终端。

安装与测试（开发者在本地测试）:

- 在 VS Code 中打开工作区根目录（例如 `d:\Git代码\6502`）。
- 在命令面板运行 `Developer: Reload Window` 以加载未打包的扩展，或使用 `F5` 以扩展开发主机方式运行。
- 确保 `ca65` 和 `ld65` 在环境变量 `PATH` 中可用（或在 PowerShell 中直接可执行）。
- 在工作区创建 `.vscode\cc65.cfg` 链接脚本，或在首次编译时输入完整路径。
- 右键点击任意 `.asm` 文件，选择 `编译此文件`，查看 `cc65-Assembler` 终端输出。

示例命令（PowerShell）：

```powershell
ca65 test.asm
ld65 -C ..\.vscode\cc65.cfg test.o -o test.exe
Remove-Item test.o
```

配置（可选）:

在 VS Code 设置中可以配置默认值，从而避免每次选择：

- 打开用户或工作区设置（`File -> Preferences -> Settings`），搜索 `cc65`，或直接编辑 `.vscode/settings.json`。
- 支持的设置项：
	- `cc65.cfgPath`: 默认链路脚本路径（相对或绝对），示例：`.vscode/cc65.cfg` 或 `D:\some\cc65.cfg`
	- `cc65.ca65Path`: `ca65` 可执行或命令（默认 `ca65`）
	- `cc65.ld65Path`: `ld65` 可执行或命令（默认 `ld65`）
	- `cc65.keepObj`: 是否保留 `.o` 中间文件（布尔，默认 `false`）

示例 `.vscode/settings.json`:

```json
{
	"cc65.cfgPath": ".vscode/cc65.cfg",
	"cc65.ca65Path": "ca65",
	"cc65.ld65Path": "ld65",
	"cc65.keepObj": false
}
```

输出查看与错误处理

- 扩展会将 `ca65` / `ld65` 的 stdout 和 stderr 写入名为 `cc65 Compiler` 的 Output 面板（`View -> Output` 然后从右上角下拉选择）。
- 仅显示编译器的输出；如任一步骤返回非零退出码，扩展会弹出错误提示并在 Output 面板中显示详细信息。
- 若想保留中间 `.o` 文件，请在设置中将 `cc65.keepObj` 设为 `true`。
