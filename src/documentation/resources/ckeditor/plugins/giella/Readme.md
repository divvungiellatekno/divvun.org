# Giella CKEditor Plugin

This plugin is based on the SCAYT plugin for CKEditor (by webspellchecker.net), but uses a custom server and hfst-ospell for spell checking.

## Install

This bascially follows the [instructions](http://docs.ckeditor.com/#!/guide/dev_plugins) to manually install a CKEditor plugin (automatic installation only works for plugins that are in the CKEditor Add-ons Repository).

1. Copy the directory that contains this Readme file to your CKEditor plugin directory (and rename it to 'giella' if necessary). The plugin contents should the be in `ckeditor/plugins/giella/`.
2. Enable the plugin by adding it to `CKEDITOR.config.extraPlugins` and adjust its settings (see below).

## Plugin Settings

Assuming `CKEDITOR` is the instance of CKEditor you want to enable the giella plugin for.

```js
// Activate customized 'giella' plugin. If you have other (extra) plugins, you can separate them with a comma (e.g, `'giella,other_plugin,third_plugin'`).
CKEDITOR.config.extraPlugins = 'giella';
CKEDITOR.config.giella_multiLanguageMode = true;

// Set the URLs for the server giella should use. Replace `domain.tld` with the actual domain the server is accessible on.
CKEDITOR.config.giella_servicePath = "http://domain.tld/spellcheck31/script/ssrv.cgi";
CKEDITOR.config.giella_srcUrl = "/spellcheck/lf/giella3/ckgiella/ckgiella.js";
```
