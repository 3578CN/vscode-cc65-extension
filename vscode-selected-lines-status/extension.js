const vscode = require('vscode');

/** @param {vscode.ExtensionContext} context */
function activate(context) {
  const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 10000);
  statusBarItem.command = 'selectedLinesStatus.showCount';
  context.subscriptions.push(statusBarItem);

  function updateSelectionCount() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      statusBarItem.hide();
      return;
    }

    const selections = editor.selections;
    if (!selections || selections.length === 0) {
      statusBarItem.hide();
      return;
    }

    let totalLines = 0;
    for (const sel of selections) {
      // inclusive line count
      const start = sel.start.line;
      const end = sel.end.line;
      totalLines += Math.abs(end - start) + 1;
    }

    if (totalLines > 0) {
      statusBarItem.text = `已选择行数: ${totalLines}`;
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  }

  // update when selection or active editor changes
  context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateSelectionCount));
  context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateSelectionCount));

  // command to show quick info
  const disposable = vscode.commands.registerCommand('selectedLinesStatus.showCount', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showInformationMessage('没有打开的编辑器');
      return;
    }
    const selections = editor.selections;
    let totalLines = 0;
    for (const sel of selections) {
      totalLines += Math.abs(sel.end.line - sel.start.line) + 1;
    }
    vscode.window.showInformationMessage(`已选择行数: ${totalLines}`);
  });

  context.subscriptions.push(disposable);

  // initial update
  updateSelectionCount();
}

function deactivate() {}

module.exports = {
  activate,
  deactivate
};
