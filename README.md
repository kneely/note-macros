# Note Macros

Heavily inspired by [Foam's](https://foambubble.github.io/foam/) [Daily Note](https://foambubble.github.io/foam/daily-notes) feature and [Jeff Hykin's](https://github.com/jeff-hykin/macro-commander) code.

# Intended Use

This extension was originally developed to go hand in hand with [Foam](https://foambubble.github.io/foam/).

>Foam is a personal knowledge management and sharing system inspired by Roam Research, built on Visual Studio Code and GitHub.

You theoretically could also use this with other Note Taking solutions with vscode.

# Installation

To install search note-macros in vscode or head to [note-macros](https://marketplace.visualstudio.com/items?itemName=NeelyInnovations.note-macros)

# Features

This extension was heavily inspired by Jeff Hykin's [macro-commander](https://github.com/jeff-hykin/macro-commander). In addition to the functionality mentioned below you are able to use macro-commander's [functionality](https://github.com/jeff-hykin/macro-commander#what-are-some-macro-examples).

## Create Custom Note Macros

Create your own custom macros by adding them to your `settings.json` (Code|File > Preferences > User Settings). A full example can be found at [settings.json](settings.json)

For example:

This macro creates a Weekly note in the Weekly note Directory.

```json
{
  "note-macros": {
    "Weekly": [
      {
        "type": "note",
        "directory": "Weekly",
        "extension": ".md",
        "name": "weekly-note",
        "date": "yyyy-mm-dd"
      },
    ]
  }
}
```

### Explanation of fields

```json
"type": "note"
```

If your macro does not execute check this field first. This field was introduced to separate the existing functionality of [macro-commander](https://github.com/jeff-hykin/macro-commander) and my work. In the future this field will also separate the [Zettelkasten](https://zettelkasten.de/posts/overview/) functionality.

```json
"directory": "Weekly"
```

The directory your note will be created.

```json
"extension": ".md",
```

The extension that will be used. If not supplied this will default to markdown but can be changed.

```json
"name": "weekly-note",
```

This will be the name of the note. Both the file name and note title will be effected by this. 

```json
"date": "yyyy-mm-dd"
```

This is the date format for your note. For additional formats please go to [dateFormat](https://github.com/felixge/node-dateformat#mask-options). **This will default to `yyyy-mm-dd`.**

Your macros can run any built-in VS Code action, and even actions from other extensions.
To see all the names of possible actions VS Code can run, see `Default Keyboard Shortcuts` (Code|File > Preferences > Keyboard Shortcuts)

## Add Keybindings to Run your Macros

in `keybindings.json` (Code|File > Preferences > Keyboard Shortcuts) add bindings to your macros:

```json
{
  "key": "ctrl+cmd+/",
  "command": "note-macros.Weekly"
}
```

Notice that `note-macros.my_macro_name` has to match what you named your macro.

## Executing Snippets As Part Of A Macro

> **Release 0.0.1 Snippets are not functioning correctly!** 
> 
> I am leaving this in here in case it works for someone else. If it works for you please open an [Issue](https://github.com/kneely/note-macros/issues) to let me know.

Macros can also execute any of your snippets which is super neat. Just insert the same text that you would normally type for the snippet, followed by the `insertSnippet` command:

```json
{"command": "type", "args": {"text": "mySnippetPrefixHere" }},
      "insertSnippet" 
```

```json
{
  "macros": {
    "Weekly": [
      {
        "type": "note",
        "directory": "Weekly",
        "extension": ".md",
        "name": "weekly-note",
        "date": "yyyy-W"
      }
    ],
    "doMySnippet": [
      { "command": "editor.action.insertSnippet", "args": ":daily" }
    ]
  }
}
```

## Run macro From command pallette

Simply use `Ctrl+P` or `Alt+P` depend on your os, and type `Note Macros: Run A Macro` then chose the macro you want to execute.

## Available Commands for Macros

To list all available commands for your macros use `Ctrl+P` or `Alt+P` depend on your os, and type `Macro Dev: List all the commands that can be used in macros` then chose the macro you want to execute.


# Roadmap

## Current Release
- [x] Creation of completely Custom Notes

## Next Release

- [ ] Fix snippet functionality.
- [ ] Creation of [Zettelkasten](https://zettelkasten.de/posts/overview/) notes

## Future

As of right now Custom Notes and Zettelkasten notes complete my initial vision of this extension. My new vision is for this extension to become a one stop shop for defining quick commands from `settings.json`. If you have an idea please open an [Issue](https://github.com/kneely/note-macros/issues) and we will discuss.

# Issues

This extension will be extensively used and tested on Windows and Linux. I do not have access to a MacOS machine. With that being said I cannot test on Mac. If you run into any issues on any environment please open an [Issue](https://github.com/kneely/note-macros/issues).

# Credit

This extension combines the my work with [Jani Eväkallio's](https://github.com/jevakallio) work and [Jeff Hykin's](https://github.com/jeff-hykin) work. My vision and code would not be possible without them.

# License

Note Macros is released under the [MIT License](https://github.com/kneely/note-macros/blob/master/LICENSE).