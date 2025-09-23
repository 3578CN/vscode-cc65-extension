# 行数选择计数

在 VS Code 状态栏显示当前编辑器中你选择的总行数（支持多选）。

使用方法：

- 在 VS Code 中打开此扩展目录 `d:\Git代码\6502\vscode-selected-lines-status`。
- 打开终端，执行 `npm install`（可选，当前实现不依赖外部包）。
- 按 `F5` 在 Extension Development Host 中运行扩展。
- 在 Extension Development Host 中打开一个文件并选择文本，状态栏右侧会显示 `行: N`。
- 点击状态栏或在命令面板运行命令 `显示已选择行数` 会弹出信息框显示已选择的行数。

开发说明：

- 主文件为 `extension.js`，入口命令为 `selectedLinesStatus.showCount`。
- 状态栏项在没有选区或没有打开编辑器时会自动隐藏。

兼容性与注意事项：

- 该扩展使用 JavaScript 编写，无需编译步骤。
- 若需要打包发布，请参考 VS Code 官方扩展打包文档。

关于按 F5 弹出调试器选择的问题：

- 当你按 `F5` 时，VS Code 如果没有 `.vscode/launch.json` 或默认调试配置，会弹出“选择调试器”对话。
- 我已为你创建一个建议的 `launch.json` 文件以直接使用 `VS Code 扩展开发`（文件路径：`.vscode/launch.json`）。

如何使用：

1. 确保你已在 VS Code 中打开 `d:\Git代码\6502\vscode-selected-lines-status`。
2. 若之前弹出选择器，选择 `Run Extension`（或在侧边栏运行视图中选择 `Run Extension` 配置）。
3. 按 `F5`，VS Code 会使用该配置直接启动 Extension Development Host。

如果你没有 `npm: watch` 脚本（本项目当前不需要），可以删除 `preLaunchTask` 行或把它改为一个空任务。示例如下的简化 `launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "extensionHost",
      "request": "launch",
      "name": "Run Extension",
      "runtimeExecutable": "${execPath}",
      "args": ["--extensionDevelopmentPath=${workspaceFolder}"]
    }
  ]
}
```
