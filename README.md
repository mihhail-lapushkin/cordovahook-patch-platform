# cordovahook-patch-platform

![](https://badge.fury.io/js/cordovahook-patch-platform.svg)&nbsp;&nbsp;
![](https://david-dm.org/mihhail-lapushkin/cordovahook-patch-platform.png)

Cordova allows you to automate the process of modifying platform configuration files through [config-file](http://cordova.apache.org/docs/en/4.0.0/plugin_ref_spec.md.html#Plugin%20Specification_config_file_element) element in plugins. However, the provided functionality is quite limited: XML files and insertions only. You may want to modify non-XML files, replace values within files, add/delete files. This hook aims to provide declarative means of describing all possible modifications that you may want to do and thus releave you from doing any additional manual work on the newly added platform.

## How to install?
`npm install cordovahook-patch-platform --save`

## How to use inside hooks?
```
#!/usr/bin/env node
require('cordovahook-patch-platform');
```

## How to describe patches?
Patches live inside `patches` directory in your project root. As usual in Cordova, you create subfolders for each platform.

### `patches/<platform>/patches.json`
Here you describe your patches. The format is as follows:
```json
{
  "*": {
    "copy": {
      "<path-to-src-file-relative-to-this-folder>": "<path-to-dest-file-relative-to-platform-folder>",
      "...": "..."
    },
      
    "inject": {
      "<path-to-file-relative-to-platform-folder>": {
        "before": {
          "<string-before-which-the-contents-of-the-file-will-be-injected>": "<path-to-file-relative-to-this-folder>",
          "...": "..."
        },
        
        "after": {
          "<string-before-which-the-contents-of-the-file-will-be-injected>": "<path-to-file-relative-to-this-folder>",
          "...": "..."
        }
      }
    },
      
    "replace": {
      "<path-to-file-relative-to-platform-folder>": {
        "<string-to-look-for>": "<replacement-string>",
        "...": "..."
      }
    },
    
    "delete": {
      "files": [
        "<path-to-file-or-folder-relative-to-platform-folder>",
        "..."
      ],

      "lines": {
        "<path-to-file-relative-to-platform-folder>": [
          "<string-that-the-line-should-contain>",
          "..."
        ]
      }
    }
  },
  
  "<preference-name>:<preference-value>": {
    "...": {
    }
  },
  
  "...": {

  }
}
```
So, there are 5 types of patches currently supported:
* `copy` – Copying files or folders from patch directory to platform directory.
* `inject` – Inject contents of a file `before` or `after` some specific place inside a file in platform directory.
* `replace` – Replace strings inside a file in platform directory.
* `delete files` – Delete files or folders inside platform directory.
* `delete lines` – Delete lines containing specified string inside a file in platform directory.

Each such patch is defined inside a condition block. Conditions come from `config.xml` `preference` tags. They allow you to apply patches only when a certain `preference` `value` (case sensitive) is specified. For example, you may want to delete all Landscape splash screens if your app will only support Portrait.<br>
All patches that don't require a condition should be specified under `"*"`.

#### How to deal with iOS directories containing the name of your app?
Put `{{appName}}` inside your path. This will be resolved by the hook.

### `patches/<platform>/patches.js` (Optional)
This module will be called by the hook after applying patches from `patches.json`. Here you can do some custom patches that are not supported by the hook. The module will receive your app name (from `config.xml`) as a parameter.

## Example, please!
Refer to [howtouse](https://github.com/mihhail-lapushkin/cordovahook-patch-platform/tree/master/howtouse) folder to get an understanding of how to setup this hook in your project.

## Release History
 * **0.2.0 – 0.2.2** / 2015-02-08
   * Fixed a bug, which caused failure when `patches.json` was not defined for a platform.
   * Updated dependencies.
   * Some cleanups here and there.
 * **0.1.0** / 2014-12-26
   * First version.