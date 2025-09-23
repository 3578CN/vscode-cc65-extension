const vscode = require('vscode');
const path = require('path');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  const output = vscode.window.createOutputChannel('cc65 编译器');
  const diagnostics = vscode.languages.createDiagnosticCollection('cc65');
  context.subscriptions.push(output, diagnostics);

  let disposable = vscode.commands.registerCommand('cc65.compileAsm', async (resource) => {
    try {
      let fileUri = null;
      if (resource && resource.fsPath) {
        fileUri = resource;
      } else {
        const editor = vscode.window.activeTextEditor;
        if (editor) fileUri = editor.document.uri;
      }

      if (!fileUri) {
        output.appendLine('未找到要编译的文件。请在资源管理器右键或打开文件后重试。');
        output.show(true);
        return;
      }

  if (path.extname(fileUri.fsPath).toLowerCase() !== '.asm') {
        output.appendLine('只支持 .asm 文件。');
        output.show(true);
        return;
      }

  // Read configuration from settings
  const config = vscode.workspace.getConfiguration('cc65');
  const workspaceFolders = vscode.workspace.workspaceFolders || [];
  const defaultCfg = workspaceFolders.length ? path.join(workspaceFolders[0].uri.fsPath, '.vscode', 'cc65.cfg') : '';
  const configuredCfg = config.get('cfgPath', '');
      let cfgPath = '';
      if (configuredCfg && configuredCfg.length) {
        cfgPath = configuredCfg;
      } else {
        // if not configured, still use default in workspace if present
        cfgPath = defaultCfg;
      }

      // If still empty, do not prompt; write warning and use workspace default if any
      if (!cfgPath) {
        output.appendLine('警告: 未配置 cc65.cfgPath，尝试使用工作区 .vscode/cc65.cfg 或不使用 -C。');
        cfgPath = defaultCfg;
      }

  const asmPath = fileUri.fsPath;
      const asmDir = path.dirname(asmPath);
      const asmBase = path.basename(asmPath, '.asm');
      const objFile = `${asmBase}.o`;
      const exeFile = `${asmBase}.exe`;
      // Use child_process to run compilers quietly and capture their output
      const cp = require('child_process');
      const fs = require('fs');

  const ca65cmd = config.get('ca65Path', 'ca65');
  const ld65cmd = config.get('ld65Path', 'ld65');
  const keepObj = config.get('keepObj', false);

      // resolve cfgPath relative to workspace if not absolute
      if (cfgPath && cfgPath.length && !path.isAbsolute(cfgPath)) {
        const ws = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders[0];
        if (ws) cfgPath = path.join(ws.uri.fsPath, cfgPath);
      }

      output.clear();
      diagnostics.delete(fileUri);
      output.appendLine(`编译: ${asmPath}`);

      // Helper to run a command and capture output
      function runCommand(cmd, args, options) {
        return new Promise((resolve) => {
          const child = cp.spawn(cmd, args, Object.assign({ cwd: asmDir, windowsHide: true }, options));
          let stdout = '';
          let stderr = '';
          child.stdout.on('data', (d) => { stdout += d.toString(); });
          child.stderr.on('data', (d) => { stderr += d.toString(); });
          child.on('close', (code) => resolve({ code, stdout, stderr }));
          child.on('error', (err) => resolve({ code: 1, stdout: '', stderr: err.message }));
        });
      }

  // Run ca65
  output.appendLine(`运行: ${ca65cmd} ${asmPath}`);
      const ca65Result = await runCommand(ca65cmd, [asmPath]);
      if (ca65Result.stdout) output.appendLine(ca65Result.stdout);
      if (ca65Result.stderr) output.appendLine(ca65Result.stderr);

      if (ca65Result.code !== 0) {
        output.appendLine('ca65 编译失败，返回码：' + ca65Result.code);
        output.show(true);
        return;
      }

      // Run ld65
      const ldArgs = [];
      if (cfgPath && cfgPath.length) {
        ldArgs.push('-C', cfgPath);
      }
      ldArgs.push(objFile, '-o', exeFile);
  output.appendLine(`运行: ${ld65cmd} ${ldArgs.join(' ')}`);
      const ld65Result = await runCommand(ld65cmd, ldArgs);
      if (ld65Result.stdout) output.appendLine(ld65Result.stdout);
      if (ld65Result.stderr) output.appendLine(ld65Result.stderr);

      if (ld65Result.code !== 0) {
        output.appendLine('ld65 链接失败，返回码：' + ld65Result.code);
        output.show(true);
        return;
      }

      // remove obj if requested
      if (!keepObj) {
        try { fs.unlinkSync(path.join(asmDir, objFile)); } catch (e) { /* ignore */ }
      }

  output.appendLine('编译成功。');
  output.show(false);

    } catch (err) {
      output.appendLine('编译过程中出错：' + err.message);
      output.show(true);
    }
  });

  context.subscriptions.push(disposable);
}

function quotePath(p) {
  if (!p) return '';
  // If path contains spaces, wrap with single quotes for PowerShell literal path
  if (/\s/.test(p)) return `'${p.replace(/'/g, "''")}'`;
  return p;
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
