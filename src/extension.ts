import {
  workspace,
  Uri,
  window,
  Selection,
} from 'vscode';
import { join, dirname } from 'path';
import fs = require('fs');

var dateFormat = require('dateformat');
const vscode = require('vscode');
let disposables: any[] = [];
const docConfig = { tab: '  ', eol: '\r\n' };

function activate(context: { subscriptions: any[] }) {
  loadNotesMacro(context);

  context.subscriptions.push(
    vscode.commands.registerCommand('note-macros.execute', async () => {
      vscode.window.showQuickPick(getQPList()).then((selection: any) => {
        if (selection) {
          vscode.commands.executeCommand(`note-macros.${selection}`);
        }
      });
    })
  );

  vscode.workspace.onDidChangeConfiguration(
    (e: { affectsConfiguration: (arg0: string) => any }) => {
      if (e.affectsConfiguration('note-macros.list')) {
        disposeNotesMacro();
        loadNotesMacro(context);
      }
    }
  );
}

/**
 * [getSettings description]
 *
 * @return  {[type]}  [return description]
 */
function getSettings() {
  return vscode.workspace.getConfiguration('note-macros');
}

/**
 * [getnote-macrosList description]
 *
 * @return  array  macro names list
 */
function getNotesMacroList() {
  let ignore = ['has', 'get', 'update', 'inspect'];

  return Object.keys(getSettings().get('list')).filter(
    (prop) => ignore.indexOf(prop) < 0
  );
}

/**
 * [getQPList description]
 *
 * @return  {[type]}  [return description]
 */
function getQPList() {
  let list = getNotesMacroList();
  let allow = getSettings().get('qp-allow');
  let ignore = getSettings().get('qp-ignore');

  if (allow.length) {
    list = list.filter((item) => allow.indexOf(item) > 0);
  }

  if (ignore.length) {
    list = list.filter((item) => ignore.indexOf(item) < 0);
  }

  return list;
}

/**
 * [executeDelayCommand description]
 *
 * @param   {[type]}  action  [action description]
 *
 * @return  {[type]}          [return description]
 */
function executeDelayCommand(time: number) {
  return new Promise((resolve) => setTimeout(() => resolve(), time));
}

/**
 * [executeCommandTimesOther description]
 *
 * @param   {[type]}  command  [command description]
 * @param   {[type]}  args     [args description]
 *
 * @return  {[type]}           [return description]
 */
async function executeCommandTimesOther(
  command: any,
  otherCmnd: string | number
) {
  const settings = getSettings().get('list');
  let range = settings[otherCmnd].length;

  for (const index of Array(range)) {
    await vscode.commands.executeCommand(command);
  }
}

/**
 * [executeCommandRepeat description]
 *
 * @param   {[type]}  command  [command description]
 * @param   {[type]}  repeat   [repeat description]
 *
 * @return  {[type]}           [return description]
 */
async function executeCommandRepeat(command: any, times: any) {
  for (const index of Array(times)) {
    await vscode.commands.executeCommand(`note-macros.${command}`);
  }
}

/**
 * [executeCommand description]
 *
 * @param   {[type]}  action  [action description]
 *
 * @return  {[type]}          [return description]
 */
function executeCommand(action: { command: any; args: any }) {
  if (typeof action === 'object') {
    let command = action.command;
    let args = action.args;

    if (command === '$delay') {
      return executeDelayCommand(args.delay);
    }

    if (args.hasOwnProperty('command')) {
      return executeCommandTimesOther(command, args.command);
    } else if (args.hasOwnProperty('times')) {
      return executeCommandRepeat(command, args.times);
    }

    return vscode.commands.executeCommand(command, args);
  }

  return vscode.commands.executeCommand(action);
}

/**
 * [loadnote-macros description]
 *
 * @param   {[type]}  context  [context description]
 *
 * @return  {[type]}           [return description]
 */
function loadNotesMacro(context: { subscriptions: any }) {
  const settings = getSettings().get('list');

  openNote();

  getNotesMacroList().forEach((name) => {
    const disposable = vscode.commands.registerCommand(
      `note-macros.${name}`,
      () => {
        return settings[name].reduce(
          (promise: Promise<any>, action: any) =>
            promise.then(() => executeCommand(action)),
          Promise.resolve()
        );
      }
    );

    context.subscriptions.push(disposable);
    disposables.push(disposable);
  });
}

async function openNote() {
  const configuration = getSettings().get('list');

  const notePath = getnotePath();

  const isNew = await createDailyNoteIfNotExists();
  await focusDailyNote(notePath, isNew);
}

function getnotePath() {
  //const rootDirectory: string = ${workspace}.uri.fsPath;
  const dailyNoteDirectory: string = getSettings().get('directory') ?? '.';
  const dailyNoteFilename = getDailyNoteFileName();

  return join(dailyNoteDirectory, dailyNoteFilename);
}

function getDailyNoteFileName(): string {
  const filenameFormat: string = getSettings().get('filenameFormat');
  const fileExtension: string = getSettings().get('fileExtension');

  const today = currentDate();

  const fileName: string = join(today, filenameFormat, fileExtension);

  return fileName;
}

function currentDate() {
  const now = new Date();
  const format: string = dateFormat(now, getSettings().get('dateFormat'));

  return format;
}

async function createDailyNoteIfNotExists() {
  const notePath = getnotePath();

  if (await pathExists(notePath)) {
    return false;
  }

  createDailyNoteDirectoryIfNotExists();

  const titleFormat: string =
    getSettings().get('titleFormat') ?? getSettings().get('filenameFormat');

  await fs.promises.writeFile(
    notePath,
    `# ${currentDate}${titleFormat}${docConfig.eol}${docConfig.eol}`
  );

  return true;
}

async function createDailyNoteDirectoryIfNotExists() {
  const notePath = getnotePath();
  const dailyNoteDirectory = dirname(notePath);

  if (!(await pathExists(dailyNoteDirectory))) {
    await fs.promises.mkdir(dailyNoteDirectory, { recursive: true });
  }
}

async function focusDailyNote(notePath: string, isNewNote: boolean) {
  const document = await workspace.openTextDocument(Uri.file(notePath));
  const editor = await window.showTextDocument(document);

  // Move the cursor to end of the file
  if (isNewNote) {
    const { lineCount } = editor.document;
    const { range } = editor.document.lineAt(lineCount - 1);
    editor.selection = new Selection(range.end, range.end);
  }
}

async function pathExists(path: string) {
  return fs.promises
    .access(path, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false);
}

/**
 * [disposenote-macros description]
 *
 * @return  {[type]}  [return description]
 */
function disposeNotesMacro() {
  for (let disposable of disposables) {
    disposable.dispose();
  }
}

function deactivate() {}

exports.deactivate = deactivate;
exports.activate = activate;
