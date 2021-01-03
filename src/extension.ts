import { workspace, Uri, Selection } from "vscode";
import fs = require("fs");
import dateFormat = require("dateformat");
import { execSync } from "child_process";

/* eslint-disable eqeqeq */
const { window } = require("vscode");
const vscode = require("vscode");

//
// globals
//
let activeContext: any;
let disposables: any[] = [];
let macros: any = {};
let invalidMacroNames = ["has", "get", "update", "inspect"];

//
// register commands
//

// create a command for running macros by name
vscode.commands.registerCommand("note-macro.run", async () => {
  let macroNames = Object.keys(macros).filter(
    (each) => macros[each] instanceof Array
  );
  let result = await window.showQuickPick(macroNames);
  executeMacro(result);
});

// command that helps with creating new macros
vscode.commands.registerCommand(
  "note-macro.list-builtin-commands",
  async () => {
    let commands = await vscode.commands.getCommands();
    let result = await window.showQuickPick(commands);
    if (result != null) {
      await vscode.commands.executeCommand(result);
    }
  }
);

//
// helpers
//

// see https://stackoverflow.com/questions/3446170/escape-string-for-use-in-javascript-regex
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function flushEventStack() {
  // this is a sleep timer for 0 seconds, which sounds dumb
  // the reason it's useful is because it puts a function on the BOTTOM of the javascript event stack
  // and then we wait for it to occur
  // this means runs all of the already-scheduled things to occur
  // which is ideal because it makes pop ups and other events happen in a more sequential/timely order
  return new Promise((r) => setTimeout(r, 0));
}

//
// on first load
//
exports.activate = function activate(context: any) {
  loadMacros(context);
  activeContext = context;
  // whenever settings is changed
  vscode.workspace.onDidChangeConfiguration(() => {
    // dispose of macros
    for (let disposable of disposables) {
      disposable.dispose();
    }
    // reload them
    loadMacros(activeContext);
  });
};

exports.deactivate = function deactivate() {};

//
// create macros from settings
//
function loadMacros(context: { subscriptions: any[] }) {
  // get the macros from the settings file
  macros = vscode.workspace.getConfiguration("note-macros");

  // look at each macro
  for (const name in macros) {
    // skip the things that are not arrays
    if (!(macros[name] instanceof Array)) {
      continue;
    }
    // register each one as a command
    const disposable = vscode.commands.registerCommand(
      `note-macros.${name}`,
      () => executeMacro(name)
    );
    context.subscriptions.push(disposable);
    disposables.push(disposable);
  }
}

async function executeMacro(name: string) {
  // iterate over every action in the macro
  for (const action of macros[name]) {
    console.log(`action is:`, action);

    // if its a string assume its a command
    if (typeof action == "string") {
      await vscode.commands.executeCommand(action);
      await flushEventStack();
      // otherwise check if its an object
    } else if (action instanceof Object) {
      //
      // Check if its a javascript macro
      //
      if (typeof action.javascript == "string") {
        await eval(`(async()=>{${action.javascript}})()`);
        await flushEventStack();
        continue;
        // if its an array, convert the array to a string
      } else if (action.javascript instanceof Array) {
        let javacsriptAction = action.javascript.join("\n");
        await eval(`(async()=>{${javacsriptAction}})()`);
        await flushEventStack();
        continue;
      }
      //
      // Check for injections
      //
      let replacements = [];
      let actionCopy = JSON.parse(JSON.stringify(action));
      if (action.injections) {
        for (let eachInjection of action.injections) {
          //
          // Compute the value the user provided
          //
          let value = eval(eachInjection.withResultOf);
          if (value instanceof Promise) {
            value = await value;
          }
          value = `${value}`;
          //
          // replace it in the arguments
          //
          let replacer = (name: string) => {
            if (typeof name == "string") {
              return name.replace(
                RegExp(escapeRegExp(eachInjection.replace), "g"),
                value
              );
            }
            return name;
          };
          for (let eachKey in actionCopy.args) {
            // if its a string value, then perform a replacement
            // TODO, this is currently shallow, it should probably be recursive
            if (typeof actionCopy.args[eachKey] == "string") {
              actionCopy.args[eachKey] = replacer(actionCopy.args[eachKey]);
            }
          }

          // convert arrays to strings
          let hiddenConsole = actionCopy.hiddenConsole;
          if (hiddenConsole instanceof Array) {
            hiddenConsole = hiddenConsole.join("\n");
          }
          if (typeof hiddenConsole == "string") {
            hiddenConsole += "\n";
          }

          // replace it in the console command
          actionCopy.hiddenConsole = replacer(hiddenConsole);
        }
      }
      //
      // run the command
      //
      actionCopy.hiddenConsole && execSync(actionCopy.hiddenConsole);
      actionCopy.command &&
        (await vscode.commands.executeCommand(
          actionCopy.command,
          actionCopy.args
        ));
      // Get Note Directory
      function noteDirectory() {
        if (typeof action.directory == "string") {
          return action.directory;
        } 
      }
      // Get File Extension
      function noteExtension() {
        if (typeof action.extension == "string") {
          return action.extension;
        } else {
          return ".md";
        }
      }
      // Get Indexing Enabled status
      function indexing() {
        if (typeof action.indexing == "boolean") {
          return action.indexing;
        } else {
          return false;
        }
      }
      // Get Index File name
      function indexFileName() {
        if (typeof action.indexFile == "string") {
          return action.indexFile;
        } else {
          return "index.md"
        }
      }

      //Get Date Format
      function dateFormatted() {
        if (typeof action.date == "string") {
          const now = new Date();
          return dateFormat(now, action.date);
        } else {
          const now = new Date();
          return dateFormat(now, "yyyy-mm-dd");
        }
      }

      function noteFileNameWithoutExtension() {
        if (typeof action.name == "string") {
          return `${dateFormatted()}-${action.name}`
        }
      }

      function noteFileName() {
        return `${noteFileNameWithoutExtension()}${noteExtension()}`;
      }

      function notePath() {
        const rootDir = vscode.workspace.rootPath;
        const noteDir = noteDirectory();

        return `${rootDir}/${noteDir}`;
      }

      function newNote() {
        return `${notePath()}/${noteFileName()}`;
      }

      function newIndex() {
        return `${notePath()}/${indexFileName()}`;
      }

      async function createNoteIfNotExists() {
        if (await pathExists()) {
          return false;
        }

        await createNoteDirectoryIfNotExists();

        await fs.promises.writeFile(newNote(), `# ${noteFileName()}`);
        return true;
      }

      async function updateIndexIfEnabled() {
        if !indexing() {
          return false;
        }
        await createNoteDirectoryIfNotExists();

        await fs.promises.appendFile(newIndex(), `- [[${noteFileNameWithoutExtension()}]]`)
      }

      async function createNoteDirectoryIfNotExists() {
        if (!(await pathExists())) {
          await fs.promises.mkdir(notePath(), { recursive: true });
        }
      }

      async function focusNote() {
        const document = await workspace.openTextDocument(Uri.file(newNote()));
        const editor = await window.showTextDocument(document);

        // Move the cursor to end of the file
        const { lineCount } = editor.document;
        const { range } = editor.document.lineAt(lineCount - 1);
        editor.selection = new Selection(range.end, range.end);
      }

      async function pathExists() {
        const path = newNote();
        return fs.promises
          .access(path, fs.constants.F_OK)
          .then(() => true)
          .catch(() => false);
      }

      if (action.type === "note") {
        await createNoteIfNotExists();
        await focusNote();
        await vscode.commands.executeCommand(action);
        console.log(`Completed openNote`);
        await flushEventStack();
      }
    }
  }
}
