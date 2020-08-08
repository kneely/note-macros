# Note Macros

Heavily inspired by [Foam's](https://foambubble.github.io/foam/) [Daily Note](https://foambubble.github.io/foam/daily-notes) feature and [ctf0/macros](https://github.com/ctf0/macros) code.

# Intended Use

This extension was originally developed to go hand in hand with [Foam](https://foambubble.github.io/foam/).

>Foam is a personal knowledge management and sharing system inspired by Roam Research, built on Visual Studio Code and GitHub.

You theoretically could also use this with other Note Taking solutions with vscode.

# Features

## Create Custom Note Macros

Create your own custom macros by adding them to your `settings.json` (Code|File > Preferences > User Settings)

For example:

```json
"Weekly": [
      {
        "directory": "Weekly",
        "filenameFormat": "Week-of",
        "fileExtension": "md",
        "titleFormat": "Weekly Notes",
        "dateFormat": "yyyy-mm-dd"
      }
```

This macro creates a Weekly note in the Weekly note Directory.

Your macros can run any built-in VS Code action, and even actions from other extensions.
To see all the names of possible actions VS Code can run, see `Default Keyboard Shortcuts` (Code|File > Preferences > Keyboard Shortcuts)

Give your macros names that briefly describe what they do.

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

Macros can also execute any of your snippets which is super neat. Just insert the same text that you would normally type for the snippet, followed by the `insertSnippet` command:

```json
{"command": "type", "args": {"text": "mySnippetPrefixHere" }},
      "insertSnippet" 
```

```json
{
  "note-macros.list": {
    "Weekly": [
      {
        "directory": "Weekly",
        "filenameFormat": "'Week-of'-yyyy-mm-dd",
        "fileExtension": "md",
        "titleFormat": "'Journal Entry, ' dddd, mmmm d"
      },
      {"command": "type", "args": {"text": "mySnippetPrefixHere" }},
      "insertSnippet"  
    ]
  }
}
```

## Run macro From command pallette

Simply use `Ctrl+P` or `Alt+P` depend on your os, and type `Note Macros:Execute` then chose the macro you want to execute.

## In/Ex-clude Commands From The Quick Picker "allow take precedence over ignore"

```json
{
  "note-macros.list": {
    "Weekly": [
      {
        "directory": "Weekly",
        "filenameFormat": "'Week-of'-yyyy-mm-dd",
        "fileExtension": "md",
        "titleFormat": "'Journal Entry, ' dddd, mmmm d"
      },
      { "command": "type", "args": { "text": "mySnippetPrefixHere" } },
      "insertSnippet"
    ],
    "Quarterly": [
      {
        "directory": "Quarterly",
        "filenameFormat": "'Quarter-of'-yyyy-mm-dd",
        "fileExtension": "md",
        "titleFormat": "'Journal Entry, ' dddd, mmmm d"
      }
    ]
  },
  "note-macros.qp-allow": ["Weekly"],
  "note-macros.qp-ignore": ["Quarterly"]
}
```
# Roadmap

## Current Release
- [x] Creation of completely Custom Notes

## Next Release

- [ ] Creation of [Zettelkasten](https://zettelkasten.de/posts/overview/) notes

## Future

As of right now Custom Notes and Zettelkasten notes complete my initial vision of this extension. My new vision is for this extension to become a one stop shop for defining quick commands from `settings.json`. If you have an idea please open an [Issue](https://github.com/kneely/note-macros/issues) and we will discuss.

# Issues

This extension will be extensively used and tested on Windows and Linux. I do not have access to a MacOS machine. With that being said I cannot test on Mac. If you run into any issues on any environment please open an [Issue](https://github.com/kneely/note-macros/issues).

# Credit

This extension combines the my work with [Jani Eväkallio's](https://github.com/jevakallio) work and [ctf0's](https://github.com/ctf0) work. My vision and code would not be possible without their vision and code.

# License

Note Macros is released under the MIT License.