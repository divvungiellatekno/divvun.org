'use strict';
CKEDITOR.plugins.add('giella', {

	//requires : ['menubutton', 'dialog'],
	requires: 'menubutton,dialog',
	lang: 'af,ar,bg,bn,bs,ca,cs,cy,da,de,el,en-au,en-ca,en-gb,en,eo,es,et,eu,fa,fi,fo,fr-ca,fr,gl,gu,he,hi,hr,hu,is,it,ja,ka,km,ko,lt,lv,mk,mn,ms,nb,nl,no,pl,pt-br,pt,ro,ru,sk,sl,sr-latn,sr,sv,th,tr,ug,uk,vi,zh-cn,zh', // %REMOVE_LINE_CORE%
	icons: 'giella', // %REMOVE_LINE_CORE%
	hidpi: true, // %REMOVE_LINE_CORE%
	tabToOpen : null,
	dialogName: 'giellaDialog',
	init: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.giella;

		this.bindEvents(editor);
		this.parseConfig(editor);
		this.addRule(editor);

		// source mode
		CKEDITOR.dialog.add(this.dialogName, CKEDITOR.getUrl(this.path + 'dialogs/options.js'));
		// end source mode

		this.addMenuItems(editor);
		var config = editor.config,
			lang = editor.lang.giella,
			env = CKEDITOR.env;

		editor.ui.add('Giella', CKEDITOR.UI_MENUBUTTON, {
			label : lang.text_title,
			title : ( editor.plugins.wsc ? editor.lang.wsc.title : lang.text_title ),
			// GIELLA doesn't work in IE Compatibility Mode and IE (8 & 9) Quirks Mode
			modes : {wysiwyg: !(env.ie && ( env.version < 8 || env.quirks ) ) },
			toolbar: 'spellchecker,20',
			refresh: function() {
				var buttonState = editor.ui.instances.Giella.getState();

				// check if giella is created
				if(editor.giella) {
					// check if giella is enabled
					if(plugin.state.giella[editor.name]) {
						buttonState = CKEDITOR.TRISTATE_ON;
					} else {
						buttonState = CKEDITOR.TRISTATE_OFF;
					}
				}

				editor.fire('giellaButtonState', buttonState);
			},
			onRender: function() {
				var that = this;

				editor.on('giellaButtonState', function(ev) {
					if(typeof ev.data !== undefined) {
						that.setState(ev.data);
					}
				});
			},
			onMenu : function() {
				var giellaInstance = editor.giella;

				editor.getMenuItem('giellaToggle').label = editor.lang.giella[(giellaInstance ? plugin.state.giella[editor.name] : false) ? 'btn_disable' : 'btn_enable'];

				// If UI tab is disabled we shouldn't show menu item
				var menuDefinition = {
					giellaToggle  : CKEDITOR.TRISTATE_OFF,
					giellaOptions : giellaInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					giellaLangs   : giellaInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					giellaDict    : giellaInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					giellaAbout   : giellaInstance ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED,
					WSC          : editor.plugins.wsc ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED
				};

				if(!editor.config.giella_uiTabs[0]) {
					delete menuDefinition.giellaOptions;
				}

				if(!editor.config.giella_uiTabs[1]) {
					delete menuDefinition.giellaLangs;
				}

				if(!editor.config.giella_uiTabs[2]) {
					delete menuDefinition.giellaDict;
				}

				return menuDefinition;
			}
		});

		// If the 'contextmenu' plugin is loaded, register the listeners.
		if(editor.contextMenu && editor.addMenuItems) {
			editor.contextMenu.addListener(function(element, selection) {
				var giellaInstance = editor.giella,
					result, selectionNode;

				if(giellaInstance) {
					selectionNode = giellaInstance.getSelectionNode();

					// GIELLA shouldn't build context menu if instance isnot created or word is without misspelling or grammar problem
					if(selectionNode) {
						var items = self.menuGenerator(editor, selectionNode);

						giellaInstance.showBanner('.' + editor.contextMenu._.definition.panel.className.split(' ').join(' .'));
						result = items;
					}
				}

				return result;
			});

			editor.contextMenu._.onHide = CKEDITOR.tools.override(editor.contextMenu._.onHide, function(org) {
				return function() {
					var giellaInstance = editor.giella;

					if(giellaInstance) {
						giellaInstance.hideBanner();
					}

					return org.apply(this);
				};
			});
		}
	},
	addMenuItems: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.giella,
			graytGroups = ['grayt_description', 'grayt_suggest', 'grayt_control'],
			menuGroup = 'giellaButton';

		editor.addMenuGroup(menuGroup);

		var items_order = editor.config.giella_contextMenuItemsOrder.split('|');

		for(var pos = 0 ; pos < items_order.length ; pos++) {
			items_order[pos] = 'giella_' + items_order[pos];
		}
		items_order = graytGroups.concat(items_order);

		if(items_order && items_order.length) {
			for(var pos = 0 ; pos < items_order.length ; pos++) {
				editor.addMenuGroup(items_order[pos], pos - 10);
			}
		}

		editor.addCommand( 'giellaToggle', {
			exec: function(editor) {
				var giellaInstance = editor.giella;

				plugin.state.giella[editor.name] = !plugin.state.giella[editor.name];

				if(plugin.state.giella[editor.name] === true) {
					if(!giellaInstance) {
						plugin.createGiella(editor);
					}
				} else {
					if(giellaInstance) {
						plugin.destroy(editor);
					}
				}
			}
		} );

		editor.addCommand( 'giellaAbout', {
			exec: function(editor) {
				var giellaInstance = editor.giella;

				giellaInstance.tabToOpen = 'about';
				editor.lockSelection();
				editor.openDialog(self.dialogName);
			}
		} );

		editor.addCommand( 'giellaOptions', {
			exec: function(editor) {
				var giellaInstance = editor.giella;

				giellaInstance.tabToOpen = 'options';
				editor.lockSelection();
				editor.openDialog(self.dialogName);
			}
		} );

		editor.addCommand( 'giellaLangs', {
			exec: function(editor) {
				var giellaInstance = editor.giella;

				giellaInstance.tabToOpen = 'langs';
				editor.lockSelection();
				editor.openDialog(self.dialogName);
			}
		} );

		editor.addCommand( 'giellaDict', {
			exec: function(editor) {
				var giellaInstance = editor.giella;

				giellaInstance.tabToOpen = 'dictionaries';
				editor.lockSelection();
				editor.openDialog(self.dialogName);
			}
		} );

		var uiMenuItems = {
			giellaToggle: {
				label : editor.lang.giella.btn_enable,
				group : menuGroup,
				command: 'giellaToggle'
			},
			giellaAbout: {
				label : editor.lang.giella.btn_about,
				group : menuGroup,
				command: 'giellaAbout'
			},
			giellaOptions: {
				label : editor.lang.giella.btn_options,
				group : menuGroup,
				command: 'giellaOptions'
			},
			giellaLangs: {
				label : editor.lang.giella.btn_langs,
				group : menuGroup,
				command: 'giellaLangs'
			},
			giellaDict: {
				label : editor.lang.giella.btn_dictionaries,
				group : menuGroup,
				command: 'giellaDict'
			}
		};

		if(editor.plugins.wsc) {
			uiMenuItems.WSC = {
				label : editor.lang.wsc.toolbar,
				group : menuGroup,
				onClick: function() {
					var inlineMode = (editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE),
						plugin = CKEDITOR.plugins.giella,
						giellaInstance = editor.giella,
						text = inlineMode ? editor.container.getText() : editor.document.getBody().getText();

					text = text.replace(/\s/g, '');

					if(text) {
						if(giellaInstance && plugin.state.giella[editor.name] && giellaInstance.setMarkupPaused) {
							giellaInstance.setMarkupPaused(true);
						}

						editor.lockSelection();
						editor.execCommand('checkspell');
					} else {
						alert('Nothing to check!');
					}
				}
			}
		}

		editor.addMenuItems(uiMenuItems);
	},
	bindEvents: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.giella,
			inline_mode = (editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE);

		var giellaDestroy = function() {
			plugin.destroy(editor);
		};

		/*
		 * Dirty fix for placeholder drag&drop
		 * Should be fixed with next release
		 */
		/*
		editor.on('drop', function(evt) {
			var dropRange = evt.data.dropRange;
			var b = dropRange.createBookmark(true);
			editor.giella.removeMarkupInSelectionNode({ selectionNode: evt.data.target.$, forceBookmark: false });
			dropRange.moveToBookmark(b);

			evt.data.dropRange = dropRange;
			return evt;
		}, this, null, 0); // We should be sure that we modify dropRange before CKEDITOR.plugins.clipboard calls
		*/

		var contentDomReady = function() {
			// The event is fired when editable iframe node was reinited so we should restart our service
			if (plugin.state.giella[editor.name] && !editor.readOnly && !editor.giella) {
				plugin.createGiella(editor);
			}
		};

		var addMarkupStateHandlers = function() {
			var editable = editor.editable();

			editable.attachListener( editable, 'focus', function( evt ) {
				if( CKEDITOR.plugins.giella && !editor.giella ) {
					setTimeout(contentDomReady, 0); // we need small timeout in order to correctly set initial 'focused' option value in GIELLA core
				}

				var pluginStatus = CKEDITOR.plugins.giella && CKEDITOR.plugins.giella.state.giella[editor.name] && editor.giella,
					selectedElement, ranges, textLength, range;

				if((inline_mode ? true : pluginStatus) && editor._.savedSelection) {
					selectedElement = editor._.savedSelection.getSelectedElement();
					ranges = !selectedElement && editor._.savedSelection.getRanges();

					for(var i = 0; i < ranges.length; i++) {
						range = ranges[i];
						// we need to check type of node value in order to avoid error in IE when accessing 'nodeValue' property
						if(typeof range.startContainer.$.nodeValue === 'string') {
							textLength = range.startContainer.getText().length;
							if(textLength < range.startOffset || textLength < range.endOffset) {
								editor.unlockSelection(false);
							}
						}
					}
				}
			}, this, null, -10 );	// priority "-10" is set to call GIELLA CKEDITOR.editor#unlockSelection before CKEDITOR.editor#unlockSelection call
		};

		var contentDomHandler = function() {
			if(inline_mode) {

				if (!editor.config.giella_inlineModeImmediateMarkup) {
					/*
					 * Give an opportunity to CKEditor to perform all needed updates
					 * and only after that call 'giellaDestroy' method (#72725)
					 */
					editor.on('blur', function () { setTimeout( giellaDestroy, 0 ); } );
					editor.on('focus', contentDomReady);

					// We need to check if editor has focus(created) right now.
					// If editor is active - make attempt to create giella
					if(editor.focusManager.hasFocus) {
						contentDomReady();
					}

				} else {
					contentDomReady();
				}

			} else {
				contentDomReady();
			}

			addMarkupStateHandlers();

			/*
			 * 'mousedown' handler handle widget selection (click on widget). To
			 * fix the issue when widget#wrapper referenced to element which can
			 * be broken after markup.
			 */
			var editable = editor.editable();
			editable.attachListener(editable, 'mousedown', function( evt ) {
				var target = evt.data.getTarget();
				var widget = editor.widgets && editor.widgets.getByElement( target );
				if ( widget ) {
					widget.wrapper = target.getAscendant( function( el ) {
						return el.hasAttribute( 'data-cke-widget-wrapper' )
					}, true );
				}
			}, this, null, -10); // '-10': we need to be shure that widget#wrapper updated before any other calls
		};

		editor.on('contentDom', contentDomHandler);

		editor.on('beforeCommandExec', function(ev) {
			var giellaInstance = editor.giella,
				selectedLangElement = null,
				forceBookmark = false,
				removeMarkupInsideSelection = true;

			// TODO: after switching in source mode not recreate GIELLA instance, try to just rerun markuping to don't make requests to server
			if(ev.data.name in plugin.options.disablingCommandExec && editor.mode == 'wysiwyg') {
				if(giellaInstance) {
					plugin.destroy(editor);
					editor.fire('giellaButtonState', CKEDITOR.TRISTATE_DISABLED);
				}
			} else if(	ev.data.name === 'bold' || ev.data.name === 'italic' || ev.data.name === 'underline' ||
						ev.data.name === 'strike' || ev.data.name === 'subscript' || ev.data.name === 'superscript' ||
						ev.data.name === 'enter' || ev.data.name === 'cut' || ev.data.name === 'language') {
				if(giellaInstance) {
					if(ev.data.name === 'cut') {
						removeMarkupInsideSelection = false;
						// We need to force bookmark before we remove our markup.
						// Otherwise we will get issues with cutting text via context menu.
						forceBookmark = true;
					}

					// We need to remove all GIELLA markup from 'lang' node before it will be deleted.
					// We need to remove GIELLA markup from selected text before creating 'lang' node as well.
					if(ev.data.name === 'language') {
						selectedLangElement = editor.plugins.language.getCurrentLangElement(editor);
						selectedLangElement = selectedLangElement && selectedLangElement.$;
						// We need to force bookmark before we remove our markup.
						// Otherwise we will get issues with cutting text via language plugin menu.
						forceBookmark = true;
					}

					editor.fire('reloadMarkupGiella', {
						removeOptions: {
							removeInside: removeMarkupInsideSelection,
							forceBookmark: forceBookmark,
							selectionNode: selectedLangElement
						},
						timeout: 0
					});
				}
			}
		});

		editor.on('beforeSetMode', function(ev) {
			var giellaInstance;
			// needed when we use:
			// CKEDITOR.instances.editor_ID.setMode("source")
			// CKEDITOR.instances.editor_ID.setMode("wysiwyg")
			// can't be implemented in editor.on('mode', function(ev) {});
			if (ev.data == 'source') {
				giellaInstance = editor.giella;
				if(giellaInstance) {
					plugin.destroy(editor);
					editor.fire('giellaButtonState', CKEDITOR.TRISTATE_DISABLED);
				}

				// remove custom data from body, to prevent waste properties showing in IE8
				if(editor.document) { //GitHub #84 : make sure that document exists(e.g. when startup mode set to 'source')
					editor.document.getBody().removeAttribute('_jquid');
				}
			}
		});

		editor.on('afterCommandExec', function(ev) {
			if(editor.mode == 'wysiwyg' && (ev.data.name == 'undo' || ev.data.name == 'redo')) {
				setTimeout(function() {
					var giellaInstance = editor.giella,
						giellaLangList = giellaInstance && giellaInstance.getGiellaLangList();

					/*
					 * Checks GIELLA initialization of LangList. To prevent immediate
					 * markup which is triggered by 'startSpellCheck' event.
					 * E.g.: Drop into inline CKEDITOR with giella_autoStartup = true;
					 */
					if (!giellaLangList || !(giellaLangList.ltr && giellaLangList.rtl)) return;

					giellaInstance.fire('startSpellCheck, startGrammarCheck');
				}, 250);
			}
		});

		// handle readonly changes
		editor.on('readOnly', function(ev) {
			var giellaInstance;

			if(ev) {
				giellaInstance = editor.giella;

				if(ev.editor.readOnly === true) {
					if(giellaInstance) {
						giellaInstance.fire('removeMarkupInDocument', {});
					}
				} else {
					if(giellaInstance) {
						giellaInstance.fire('startSpellCheck, startGrammarCheck');
					} else if(ev.editor.mode == 'wysiwyg' && plugin.state.giella[ev.editor.name] === true) {
						plugin.createGiella(editor);
						ev.editor.fire('giellaButtonState', CKEDITOR.TRISTATE_ON);
					}
				}
			}
		});

		// we need to destroy GIELLA before CK editor will be completely destroyed
		editor.on('beforeDestroy', giellaDestroy);

		//#9439 after SetData method fires contentDom event and GIELLA create additional instanse
		// This way we should destroy GIELLA on setData event when contenteditable Iframe was re-created
		editor.on('setData', function() {
			giellaDestroy();

			// in inline mode SetData does not fire contentDom event
			if(editor.elementMode == CKEDITOR.ELEMENT_MODE_INLINE || editor.plugins.divarea) {
				contentDomHandler();
			}
		}, this, null, 50);

		/*
		 * Main entry point to react on changes in document
		 */
		editor.on('reloadMarkupGiella', function(ev) {
			var removeOptions = ev.data && ev.data.removeOptions,
				timeout = ev.data && ev.data.timeout;

			/*
			 * Perform removeMarkupInSelectionNode and 'startSpellCheck' fire
			 * asynchroniosly and keep CKEDITOR flow as expected
			 */
			setTimeout(function() {
				var giellaInstance = editor.giella,
					giellaLangList = giellaInstance && giellaInstance.getGiellaLangList();

				/*
				 * Checks GIELLA initialization of LangList. To prevent immediate
				 * markup which is triggered by 'startSpellCheck' event.
				 * E.g.: Drop into inline CKEDITOR with giella_autoStartup = true;
				 */
				if (!giellaLangList || !(giellaLangList.ltr && giellaLangList.rtl)) return;

				/*
				 * CKEditor can keep \u200B character in document (with selection#selectRanges)
				 * we need to take care about that. For this case we fire
				 * 'keydown' [left arrow], what will trigger 'removeFillingChar' on Webkit
				 * to cleanup the document
				 */
				editor.document.fire( 'keydown', new CKEDITOR.dom.event( { keyCode: 37 } ) );

				/* trigger remove markup with 'startSpellCheck' */
				giellaInstance.removeMarkupInSelectionNode(removeOptions);
				giellaInstance.fire('startSpellCheck, startGrammarCheck');
			}, timeout || 0 );
		});

		// Reload spell-checking for current word after insertion completed.
		editor.on('insertElement', function() {
			// IE bug: we need wait here to make sure that focus is returned to editor, and we can store the selection before we proceed with markup
			editor.fire('reloadMarkupGiella', {removeOptions: {forceBookmark: true}});
		}, this, null, 50);

		editor.on('insertHtml', function() {
			editor.fire('reloadMarkupGiella');
		}, this, null, 50);

		editor.on('insertText', function() {
			editor.fire('reloadMarkupGiella');
		}, this, null, 50);

		// The event is listening to open necessary dialog tab
		editor.on('giellaDialogShown', function(ev) {
			var dialog = ev.data,
				giellaInstance = editor.giella;

			dialog.selectPage(giellaInstance.tabToOpen);
		});
	},
	parseConfig: function(editor) {
		var plugin = CKEDITOR.plugins.giella;

		// preprocess config for backward compatibility
		plugin.replaceOldOptionsNames(editor.config);

		// Checking editor's config after initialization
		if(typeof editor.config.giella_autoStartup !== 'boolean') {
			editor.config.giella_autoStartup = false;
		}
		plugin.state.giella[editor.name] = editor.config.giella_autoStartup;

		if(typeof editor.config.grayt_autoStartup !== 'boolean') {
			editor.config.grayt_autoStartup = false;
		}
		if(typeof editor.config.giella_inlineModeImmediateMarkup !== 'boolean') {
			editor.config.giella_inlineModeImmediateMarkup = false;
		}
		plugin.state.grayt[editor.name] = editor.config.grayt_autoStartup;

		if(!editor.config.giella_contextCommands) {
			editor.config.giella_contextCommands = 'ignore|ignoreall|add';
		}

		if(!editor.config.giella_contextMenuItemsOrder) {
			editor.config.giella_contextMenuItemsOrder = 'suggest|moresuggest|control';
		}

		if(!editor.config.giella_sLang) {
			editor.config.giella_sLang = 'en_US';
		}

		if(editor.config.giella_maxSuggestions === undefined || typeof editor.config.giella_maxSuggestions != 'number' || editor.config.giella_maxSuggestions < 0) {
			editor.config.giella_maxSuggestions = 5;
		}

		if(editor.config.giella_minWordLength === undefined || typeof editor.config.giella_minWordLength != 'number' || editor.config.giella_minWordLength < 1) {
			editor.config.giella_minWordLength = 4;
		}

		if(editor.config.giella_customDictionaryIds === undefined || typeof editor.config.giella_customDictionaryIds !== 'string') {
			editor.config.giella_customDictionaryIds = '';
		}

		if(editor.config.giella_userDictionaryName === undefined || typeof editor.config.giella_userDictionaryName !== 'string') {
			editor.config.giella_userDictionaryName = null;
		}

		if(typeof editor.config.giella_uiTabs === 'string' && editor.config.giella_uiTabs.split(',').length === 3) {
			var giella_uiTabs = [], _tempUITabs = [];
			editor.config.giella_uiTabs = editor.config.giella_uiTabs.split(',');

			CKEDITOR.tools.search(editor.config.giella_uiTabs, function(value) {
				if (Number(value) === 1 || Number(value) === 0) {
					_tempUITabs.push(true);
					giella_uiTabs.push(Number(value));
				} else {
					_tempUITabs.push(false);
				}
			});

			if (CKEDITOR.tools.search(_tempUITabs, false) === null) {
				editor.config.giella_uiTabs = giella_uiTabs;
			} else {
				editor.config.giella_uiTabs = [1,1,1];
			}

		} else {
			editor.config.giella_uiTabs = [1,1,1];
		}

		if(typeof editor.config.giella_serviceProtocol != 'string') {
			editor.config.giella_serviceProtocol = null;
		}

		if(typeof editor.config.giella_serviceHost != 'string') {
			editor.config.giella_serviceHost = null;
		}

		if(typeof editor.config.giella_servicePort != 'string') {
			editor.config.giella_servicePort = null;
		}

		if(typeof editor.config.giella_servicePath != 'string') {
			editor.config.giella_servicePath = null;
		}

		if(!editor.config.giella_moreSuggestions) {
			editor.config.giella_moreSuggestions = 'on';
		}

		if(typeof editor.config.giella_customerId !== 'string') {
			editor.config.giella_customerId = '1:WvF0D4-UtPqN1-43nkD4-NKvUm2-daQqk3-LmNiI-z7Ysb4-mwry24-T8YrS3-Q2tpq2';
		}

		if(typeof editor.config.giella_srcUrl !== 'string') {
			var protocol = document.location.protocol;
			protocol = protocol.search(/https?:/) != -1 ? protocol : 'http:';

			editor.config.giella_srcUrl = protocol + '//divvun.no:3000/spellcheck31/lf/giella3/ckgiella/ckgiella.js';
		}

		if(typeof CKEDITOR.config.giella_handleCheckDirty !== 'boolean') {
			CKEDITOR.config.giella_handleCheckDirty = true;
		}

		if(typeof CKEDITOR.config.giella_handleUndoRedo !== 'boolean') {
			/* set default as 'true' */
			CKEDITOR.config.giella_handleUndoRedo = true;
		}
		/* checking 'undo' plugin, if no disable GIELLA handler */
		CKEDITOR.config.giella_handleUndoRedo = CKEDITOR.plugins.undo ? CKEDITOR.config.giella_handleUndoRedo : false;

		if(typeof editor.config.giella_multiLanguageMode !== 'boolean') {
			editor.config.giella_multiLanguageMode = false;
		}

		if(typeof editor.config.giella_multiLanguageStyles !== 'object') {
			editor.config.giella_multiLanguageStyles = {};
		}

		if(editor.config.giella_ignoreAllCapsWords && typeof editor.config.giella_ignoreAllCapsWords !== 'boolean') {
			editor.config.giella_ignoreAllCapsWords = false;
		}

		if(editor.config.giella_ignoreDomainNames && typeof editor.config.giella_ignoreDomainNames !== 'boolean') {
			editor.config.giella_ignoreDomainNames = false;
		}

		if(editor.config.giella_ignoreWordsWithMixedCases && typeof editor.config.giella_ignoreWordsWithMixedCases !== 'boolean') {
			editor.config.giella_ignoreWordsWithMixedCases = false;
		}

		if(editor.config.giella_ignoreWordsWithNumbers && typeof editor.config.giella_ignoreWordsWithNumbers !== 'boolean') {
			editor.config.giella_ignoreWordsWithNumbers = false;
		}

		if( editor.config.giella_disableOptionsStorage ) {
			var userOptions = CKEDITOR.tools.isArray( editor.config.giella_disableOptionsStorage ) ? editor.config.giella_disableOptionsStorage : ( typeof editor.config.giella_disableOptionsStorage === 'string' ) ? [ editor.config.giella_disableOptionsStorage ] : undefined,
				availableValue = [ 'all', 'options', 'lang', 'ignore-all-caps-words', 'ignore-domain-names', 'ignore-words-with-mixed-cases', 'ignore-words-with-numbers'],
				valuesOption = ['lang', 'ignore-all-caps-words', 'ignore-domain-names', 'ignore-words-with-mixed-cases', 'ignore-words-with-numbers'],
				search = CKEDITOR.tools.search,
				indexOf = CKEDITOR.tools.indexOf;

			var isValidOption = function( option ) {
				return !!search( availableValue, option );
			};

			var makeOptionsToStorage = function( options ) {
				var retval = [];

				for (var i = 0; i < options.length; i++) {
					var value = options[i],
						isGroupOptionInUserOptions = !!search( options, 'options' );

					if( !isValidOption( value ) || isGroupOptionInUserOptions && !!search( valuesOption, function( val ) { if( val === 'lang' ) { return false; } } ) ) {
						return;
					}

					if( !!search( valuesOption, value ) ) {
						valuesOption.splice( indexOf( valuesOption, value ), 1 );
					}

					if(  value === 'all' || isGroupOptionInUserOptions && !!search( options, 'lang' )) {
						return [];
					}

					if( value === 'options' ) {
						valuesOption = [ 'lang' ];
					}
				}

				retval = retval.concat( valuesOption );

				return retval;
			};

			editor.config.giella_disableOptionsStorage = makeOptionsToStorage( userOptions );
		}
	},
	addRule: function(editor) {
		var plugin = CKEDITOR.plugins.giella,
			dataProcessor = editor.dataProcessor,
			htmlFilter = dataProcessor && dataProcessor.htmlFilter,
			pathFilters = editor._.elementsPath && editor._.elementsPath.filters,
			dataFilter = dataProcessor && dataProcessor.dataFilter,
			removeFormatFilter = editor.addRemoveFormatFilter,
			pathFilter = function(element) {
				var giellaInstance = editor.giella;

				if( giellaInstance && (element.hasAttribute(plugin.options.data_attribute_name) || element.hasAttribute(plugin.options.problem_grammar_data_attribute)) ) {
					return false;
				}
			},
			removeFormatFilterTemplate = function(element) {
				var giellaInstance = editor.giella,
					result = true;

				if( giellaInstance && (element.hasAttribute(plugin.options.data_attribute_name) || element.hasAttribute(plugin.options.problem_grammar_data_attribute)) ) {
					result = false;
				}

				return result;
			};

		if(pathFilters) {
			pathFilters.push(pathFilter);
		}

		if(dataFilter) {
			var dataFilterRules = {
				elements: {
					span: function(element) {

						var giellaState = element.hasClass(plugin.options.misspelled_word_class) && element.attributes[plugin.options.data_attribute_name],
							graytState = element.hasClass(plugin.options.problem_grammar_class) && element.attributes[plugin.options.problem_grammar_data_attribute];

						if(plugin && (giellaState || graytState)) {
							delete element.name;
						}

						return element;
					}
				}
			};

			dataFilter.addRules(dataFilterRules);
		}

		if (htmlFilter) {
			var htmlFilterRules = {
				elements: {
					span: function(element) {

						var giellaState = element.hasClass(plugin.options.misspelled_word_class) && element.attributes[plugin.options.data_attribute_name],
							graytState = element.hasClass(plugin.options.problem_grammar_class) && element.attributes[plugin.options.problem_grammar_data_attribute];

						if(plugin && (giellaState || graytState)) {
							delete element.name;
						}

						return element;
					}
				}
			};

			htmlFilter.addRules(htmlFilterRules);
		}

		if(removeFormatFilter) {
			removeFormatFilter.call(editor, removeFormatFilterTemplate);
		}
	},
	giellaMenuDefinition: function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.giella,
			giella_instance =  editor.giella;

		return {
			giella: {
				giella_ignore: {
					label:  giella_instance.getLocal('btn_ignore'),
					group : 'giella_control',
					order : 1,
					exec: function(editor) {
						var giellaInstance = editor.giella;
						giellaInstance.ignoreWord();
					}
				},
				giella_ignoreall: {
					label : giella_instance.getLocal('btn_ignoreAll'),
					group : 'giella_control',
					order : 2,
					exec: function(editor) {
						var giellaInstance = editor.giella;
						giellaInstance.ignoreAllWords();
					}
				},
				giella_add: {
					label : giella_instance.getLocal('btn_addWord'),
					group : 'giella_control',
					order : 3,
					exec : function(editor) {
						var giellaInstance = editor.giella;

						// @TODO: We need to add set/restore bookmark logic to 'addWordToUserDictionary' method inside dictionarymanager.
						// Timeout is used as tmp fix for IE9, when after hitting 'Add word' menu item, document container was blurred.
						setTimeout(function() {
							giellaInstance.addWordToUserDictionary();
						}, 10);
					}
				},
				giella_option: {
					label : giella_instance.getLocal('btn_options'),
					group : 'giella_control',
					order : 4,
					exec: function(editor) {
						var giellaInstance = editor.giella;

						giellaInstance.tabToOpen = 'options';
						editor.lockSelection();
						editor.openDialog(self.dialogName);
					},
					verification: function(editor) {
						return (editor.config.giella_uiTabs[0] == 1) ? true : false;
					}
				},
				giella_language: {
					label : giella_instance.getLocal('btn_langs'),
					group : 'giella_control',
					order : 5,
					exec: function(editor) {
						var giellaInstance = editor.giella;

						giellaInstance.tabToOpen = 'langs';
						editor.lockSelection();
						editor.openDialog(self.dialogName);
					},
					verification: function(editor) {
						return (editor.config.giella_uiTabs[1] == 1) ? true : false;
					}
				},
				giella_dictionary: {
					label : giella_instance.getLocal('btn_dictionaries'),
					group : 'giella_control',
					order : 6,
					exec: function(editor) {
						var giellaInstance = editor.giella;

						giellaInstance.tabToOpen = 'dictionaries';
						editor.lockSelection();
						editor.openDialog(self.dialogName);
					},
					verification: function(editor) {
						return (editor.config.giella_uiTabs[2] == 1) ? true : false;
					}
				},
				giella_about: {
					label : giella_instance.getLocal('btn_about'),
					group : 'giella_control',
					order : 7,
					exec: function(editor) {
						var giellaInstance = editor.giella;

						giellaInstance.tabToOpen = 'about';
						editor.lockSelection();
						editor.openDialog(self.dialogName);
					}
				}
			},
			grayt: {
				grayt_problemdescription: {
					label : 'Grammar problem description',
					group : 'grayt_description', // look at addMenuItems method for further info
					order : 1,
					state : CKEDITOR.TRISTATE_DISABLED,
					exec: function(editor) {}
				},
				grayt_ignore: {
					label : giella_instance.getLocal('btn_ignore'),
					group : 'grayt_control',
					order : 2,
					exec: function(editor) {
						var giellaInstance = editor.giella;

						giellaInstance.ignorePhrase();
					}
				}
			}
		};
	},
	buildSuggestionMenuItems: function(editor, suggestions, isGiellaNode) {
		var self = this,
			itemList = {},
			subItemList = {},
			replaceKeyName = isGiellaNode ? 'word' : 'phrase',
			updateEventName = isGiellaNode ? 'startGrammarCheck' : 'startSpellCheck',
			plugin = CKEDITOR.plugins.giella,
			giella_instance = editor.giella;

		if(suggestions.length > 0 && suggestions[0] !== 'no_any_suggestions') {

			if(isGiellaNode) {
				// build GIELLA suggestions
				for(var i = 0; i < suggestions.length; i++) {

					var commandName = 'giella_suggest_' + CKEDITOR.plugins.giella.suggestions[i].replace(' ', '_');

					editor.addCommand(commandName, self.createCommand(CKEDITOR.plugins.giella.suggestions[i], replaceKeyName, updateEventName));

					if(i < editor.config.giella_maxSuggestions) {

						// mainSuggestions
						editor.addMenuItem(commandName, {
							label: suggestions[i],
							command: commandName,
							group: 'giella_suggest',
							order: i + 1
						});

						itemList[commandName] = CKEDITOR.TRISTATE_OFF;

					} else {

						// moreSuggestions
						editor.addMenuItem(commandName, {
							label: suggestions[i],
							command: commandName,
							group: 'giella_moresuggest',
							order: i + 1
						});

						subItemList[commandName] = CKEDITOR.TRISTATE_OFF;

						if(editor.config.giella_moreSuggestions === 'on') {

							editor.addMenuItem('giella_moresuggest', {
								label : giella_instance.getLocal('btn_moreSuggestions'),
								group : 'giella_moresuggest',
								order : 10,
								getItems : function() {
									return subItemList;
								}
							});

							itemList['giella_moresuggest'] = CKEDITOR.TRISTATE_OFF;
						}
					}
				}
			} else {
				// build GRAYT suggestions
				for(var i = 0; i < suggestions.length; i++) {
					var commandName = 'grayt_suggest_' + CKEDITOR.plugins.giella.suggestions[i].replace(' ', '_');

					editor.addCommand(commandName, self.createCommand(CKEDITOR.plugins.giella.suggestions[i], replaceKeyName, updateEventName));

					// mainSuggestions
					editor.addMenuItem(commandName, {
						label: suggestions[i],
						command: commandName,
						group: 'grayt_suggest',
						order: i + 1
					});

					itemList[commandName] = CKEDITOR.TRISTATE_OFF;
				}
			}
		} else {
			var noSuggestionsCommand = 'no_giella_suggest';
			itemList[noSuggestionsCommand] = CKEDITOR.TRISTATE_DISABLED;

			editor.addCommand(noSuggestionsCommand, {
				exec: function() {

				}
			});

			editor.addMenuItem(noSuggestionsCommand, {
				label : giella_instance.getLocal('btn_noSuggestions') || noSuggestionsCommand,
				command: noSuggestionsCommand,
				group : 'giella_suggest',
				order : 0
			});
		}

		return itemList;
	},
	menuGenerator: function(editor, selectionNode) {
		var self = this,
			giellaInstance = editor.giella,
			menuItems = this.giellaMenuDefinition(editor),
			itemList = {},
			allowedOption = editor.config.giella_contextCommands.split('|'),
			lang = selectionNode.getAttribute(giellaInstance.getLangAttribute()) || giellaInstance.getLang(),
			word, grammarPhrase, isGiellaNode, isGrammarNode, problemDescriptionText;


		isGiellaNode = giellaInstance.isGiellaNode(selectionNode);
		isGrammarNode = giellaInstance.isGraytNode(selectionNode);

		if(isGiellaNode) {
			// we clicked giella misspelling
			// get suggestions
			menuItems = menuItems.giella;

			word = selectionNode.getAttribute(giellaInstance.getGiellaNodeAttributeName());

			giellaInstance.fire('getSuggestionsList', {
				lang: lang,
				word: word
			});

			itemList = this.buildSuggestionMenuItems(editor, CKEDITOR.plugins.giella.suggestions, isGiellaNode);
		} else if(isGrammarNode) {
			// we clicked grammar problem
			// get suggestions
			menuItems = menuItems.grayt;
			grammarPhrase = selectionNode.getAttribute(giellaInstance.getGraytNodeAttributeName());

			// setup grammar problem description
			problemDescriptionText = giellaInstance.getProblemDescriptionText(grammarPhrase, lang);
			if(menuItems.grayt_problemdescription && problemDescriptionText) {
				menuItems.grayt_problemdescription.label = problemDescriptionText;
			}

			giellaInstance.fire('getGrammarSuggestionsList', {
				lang: lang,
				phrase: grammarPhrase
			});

			itemList = this.buildSuggestionMenuItems(editor, CKEDITOR.plugins.giella.suggestions, isGiellaNode);
		}

		if(isGiellaNode && editor.config.giella_contextCommands == 'off') {
			return itemList;
		}

		for(var key in menuItems) {
			if(isGiellaNode && CKEDITOR.tools.indexOf(allowedOption, key.replace('giella_', '')) == -1 && editor.config.giella_contextCommands != 'all') {
				continue;
			}

			if(typeof menuItems[key].state != 'undefined') {
				itemList[key] = menuItems[key].state;
			} else {
				itemList[key] = CKEDITOR.TRISTATE_OFF;
			}

			// delete item from context menu if its state isn't verified as allowed
			if(typeof menuItems[key].verification === 'function' && !menuItems[key].verification(editor)) {
				// itemList[key] = (menuItems[key].verification(editor)) ? CKEDITOR.TRISTATE_OFF : CKEDITOR.TRISTATE_DISABLED;
				delete itemList[key];
			}

			editor.addCommand(key, {
				exec: menuItems[key].exec
			});

			editor.addMenuItem(key, {
				label : editor.lang.giella[menuItems[key].label] || menuItems[key].label,
				command: key,
				group : menuItems[key].group,
				order : menuItems[key].order
			});
		}

		return itemList;
	},
	createCommand: function(suggestion, replaceKeyName, updateEventName) {
		return {
			exec: function(editor) {
				var giellaInstance = editor.giella,
					eventObject = {};

				eventObject[replaceKeyName] = suggestion;
				giellaInstance.replaceSelectionNode(eventObject);

				// we need to remove grammar markup from selection node if we just performed replace action for misspelling
				if(updateEventName === 'startGrammarCheck') {
					giellaInstance.removeMarkupInSelectionNode({grammarOnly: true});
				}
				// for grayt problem replacement we need to fire 'startSpellCheck'
				// for giella misspelling replacement we need to fire 'startGrammarCheck'
				giellaInstance.fire(updateEventName);
			}
		};
	}
});

CKEDITOR.plugins.giella = {
	state: {
		giella: {},
		grayt: {}
	},
	suggestions: [],
	loadingHelper: {
		loadOrder: []
	},
	isLoading: false,
	options: {
		disablingCommandExec: {
			source: true,
			newpage: true,
			templates: true
		},
		data_attribute_name: 'data-giella-word',
		misspelled_word_class: 'giella-misspell-word',
		problem_grammar_data_attribute: 'data-grayt-phrase',
		problem_grammar_class: 'gramm-problem'
	},
	backCompatibilityMap: {
		'giella_service_protocol': 'giella_serviceProtocol',
		'giella_service_host'  : 'giella_serviceHost',
		'giella_service_port'  : 'giella_servicePort',
		'giella_service_path'  : 'giella_servicePath',
		'giella_customerid'    : 'giella_customerId'
	},
	replaceOldOptionsNames: function(config) {
		for(var key in config) {
			if(key in this.backCompatibilityMap) {
				config[this.backCompatibilityMap[key]] = config[key];
				delete config[key];
			}
		}
	},
	createGiella : function(editor) {
		var self = this,
			plugin = CKEDITOR.plugins.giella;

		this.loadGiellaLibrary(editor, function(_editor) {
			var textContainer = _editor.window && _editor.window.getFrame() || _editor.editable();

			// Do not create GIELLA if there is no text container for usage
			if(!textContainer) {
				plugin.state.giella[_editor.name] = false;
				return;
			}

			var giellaInstanceOptions = {
				lang 				: _editor.config.giella_sLang,
				container 			: textContainer.$,
				customDictionary 	: _editor.config.giella_customDictionaryIds,
				userDictionaryName 	: _editor.config.giella_userDictionaryName,
				localization 		: _editor.langCode,
				customer_id 		: _editor.config.giella_customerId,
				debug 				: _editor.config.giella_debug,
				data_attribute_name : self.options.data_attribute_name,
				misspelled_word_class: self.options.misspelled_word_class,
				problem_grammar_data_attribute: self.options.problem_grammar_data_attribute,
				problem_grammar_class: self.options.problem_grammar_class,
				'options-to-restore':  _editor.config.giella_disableOptionsStorage,
				focused 			: _editor.editable().hasFocus, // #30260 we need to set focused=true if CKEditor is focused before GIELLA initialization
				ignoreElementsRegex : _editor.config.giella_elementsToIgnore,
				minWordLength 		: _editor.config.giella_minWordLength,
				multiLanguageMode 	: _editor.config.giella_multiLanguageMode,
				multiLanguageStyles	: _editor.config.giella_multiLanguageStyles,
				graytAutoStartup	: plugin.state.grayt[_editor.name]
			};

			if(_editor.config.giella_serviceProtocol) {
				giellaInstanceOptions['service_protocol'] = _editor.config.giella_serviceProtocol;
			}

			if(_editor.config.giella_serviceHost) {
				giellaInstanceOptions['service_host'] = _editor.config.giella_serviceHost;
			}

			if(_editor.config.giella_servicePort) {
				giellaInstanceOptions['service_port'] = _editor.config.giella_servicePort;
			}

			if(_editor.config.giella_servicePath) {
				giellaInstanceOptions['service_path'] = _editor.config.giella_servicePath;
			}

			//predefined options
			if(typeof _editor.config.giella_ignoreAllCapsWords === 'boolean') {
				giellaInstanceOptions['ignore-all-caps-words'] = _editor.config.giella_ignoreAllCapsWords;
			}

			if(typeof _editor.config.giella_ignoreDomainNames === 'boolean') {
				giellaInstanceOptions['ignore-domain-names'] = _editor.config.giella_ignoreDomainNames;
			}

			if(typeof _editor.config.giella_ignoreWordsWithMixedCases === 'boolean') {
				giellaInstanceOptions['ignore-words-with-mixed-cases'] = _editor.config.giella_ignoreWordsWithMixedCases;
			}

			if(typeof _editor.config.giella_ignoreWordsWithNumbers === 'boolean') {
				giellaInstanceOptions['ignore-words-with-numbers'] = _editor.config.giella_ignoreWordsWithNumbers;
			}

			var giellaInstance = new GIELLA.CKGIELLA(giellaInstanceOptions, function() {
					// success callback
				}, function() {
					// error callback
				}),
				wordsPrefix = 'word_';

			giellaInstance.subscribe('suggestionListSend', function(data) {
				// TODO: 1. Maybe store suggestions for specific editor
				// TODO: 2. Fix issue with suggestion duplicates on on server
				//CKEDITOR.plugins.giella.suggestions = data.suggestionList;
				var _wordsCollection = {},
					_suggestionList =[];

				for (var i = 0; i < data.suggestionList.length; i++) {
					if (!_wordsCollection[wordsPrefix + data.suggestionList[i]]) {
						_wordsCollection[wordsPrefix + data.suggestionList[i]] = data.suggestionList[i];
						_suggestionList.push(data.suggestionList[i]);
					}
				}

				CKEDITOR.plugins.giella.suggestions = _suggestionList;
			});

			// if selection has changed programmatically by GIELLA we need to react appropriately
			giellaInstance.subscribe('selectionIsChanged', function(data) {
				var selection = _editor.getSelection();

				if(selection.isLocked) {
					_editor.lockSelection();
				}
			});

			giellaInstance.subscribe('graytStateChanged', function(data) {
				plugin.state.grayt[_editor.name] = data.state;
			});

			_editor.giella = giellaInstance;

			_editor.fire('giellaButtonState', _editor.readOnly ? CKEDITOR.TRISTATE_DISABLED : CKEDITOR.TRISTATE_ON);
		});
	},
	destroy: function(editor) {
		if(editor.giella) {
			editor.giella.destroy();
		}

		delete editor.giella;
		editor.fire('giellaButtonState', CKEDITOR.TRISTATE_OFF);
	},
	loadGiellaLibrary: function(editor, callback) {
		var self = this,
			date,
			timestamp,
			giellaUrl;

		// no need to process load requests from same editor as it can cause bugs with
		// loading ckgiella app due to subsequent calls of some events
		// need to be before 'if' statement, because of timing issue in CKEDITOR.scriptLoader
		// when callback executing is delayed for a few milliseconds, and giella can be created twise
		// on one instance
		if(this.loadingHelper[editor.name]) return;

		if(typeof window.GIELLA === 'undefined' || typeof window.GIELLA.CKGIELLA !== 'function') {

			// add onLoad callbacks for editors while GIELLA is loading
			this.loadingHelper[editor.name] = callback;
			this.loadingHelper.loadOrder.push(editor.name);

			//creating unique timestamp for GIELLA URL
			date = new Date();
			timestamp = date.getTime();
			giellaUrl = editor.config.giella_srcUrl;

			//if there already implemented timstamp for scayr_srcURL use it, if not use our timestamp
			giellaUrl = giellaUrl + (giellaUrl.indexOf('?') >= 0 ? '' : '?' + timestamp);

			if (!this.loadingHelper.ckgiellaLoading) {
				CKEDITOR.scriptLoader.load(giellaUrl, function(success) {
					var editorName;

					if ( success ) {
						CKEDITOR.fireOnce('giellaReady');

						for(var i = 0; i < self.loadingHelper.loadOrder.length; i++) {
							editorName = self.loadingHelper.loadOrder[i];

							if(typeof self.loadingHelper[editorName] === 'function') {
								self.loadingHelper[editorName](CKEDITOR.instances[editorName]);
							}

							delete self.loadingHelper[editorName];
						}
						self.loadingHelper.loadOrder = [];
					}
				});
				this.loadingHelper.ckgiellaLoading = true;
			}


		} else if(window.GIELLA && typeof window.GIELLA.CKGIELLA === 'function') {
			CKEDITOR.fireOnce('giellaReady');

			if(!editor.giella) {
				if(typeof callback === 'function') {
					callback(editor);
				}
			}
		}
	}
};

CKEDITOR.on('dialogDefinition', function(dialogDefinitionEvent) {
	var dialogName = dialogDefinitionEvent.data.name,
		dialogDefinition = dialogDefinitionEvent.data.definition,
		dialog = dialogDefinition.dialog;

	if (dialogName === 'giellaDialog') {
		dialog.on('cancel', function(cancelEvent) {
			return false;
		}, this, null, -1);
	}

	if ( dialogName === 'checkspell' ) {
		dialog.on( 'cancel', function( cancelEvent ) {
			var editor = cancelEvent.sender && cancelEvent.sender.getParentEditor(),
				plugin = CKEDITOR.plugins.giella,
				giellaInstance = editor.giella;

			if ( giellaInstance && plugin.state.giella[ editor.name ] && giellaInstance.setMarkupPaused ) {
				giellaInstance.setMarkupPaused( false );
			}

			editor.unlockSelection();
		}, this, null, -2 ); // we need to call cancel callback before WSC plugin
	}

	if (dialogName === 'link') {
		dialog.on('ok', function(okEvent) {
			var editor = okEvent.sender && okEvent.sender.getParentEditor();

			if(editor) {
				setTimeout(function() {
					editor.fire('reloadMarkupGiella', {
						removeOptions: {
							removeInside: true,
							forceBookmark: true
						},
						timeout: 0
					});
				}, 0);
			}
		});
	}
});

CKEDITOR.on('giellaReady', function() {

	// Override editor.checkDirty method avoid CK checkDirty functionality to fix GIELLA issues with incorrect checkDirty behavior.
	if(CKEDITOR.config.giella_handleCheckDirty === true) {
		var editorCheckDirty = CKEDITOR.editor.prototype;

		editorCheckDirty.checkDirty = CKEDITOR.tools.override(editorCheckDirty.checkDirty, function(org) {

			return function() {
				var retval = null,
					pluginStatus = CKEDITOR.plugins.giella && CKEDITOR.plugins.giella.state.giella[this.name] && this.giella,
					giellaInstance = this.giella;

				if(!pluginStatus) {
					retval = org.call(this);
				} else {
					retval = (this.status == 'ready');

					if (retval) {
						var currentData = giellaInstance.removeMarkupFromString(this.getSnapshot()),
							prevData = giellaInstance.removeMarkupFromString(this._.previousValue);

						retval = (retval && (prevData !== currentData))
					}
				}

				return retval;
			};
		});

		editorCheckDirty.resetDirty = CKEDITOR.tools.override(editorCheckDirty.resetDirty, function(org) {
			return function() {
				var pluginStatus = CKEDITOR.plugins.giella && CKEDITOR.plugins.giella.state.giella[this.name] && this.giella,
					giellaInstance = this.giella;//CKEDITOR.plugins.giella.getGiella(this);

				if(!pluginStatus) {
					org.call(this);
				} else {
					this._.previousValue = giellaInstance.removeMarkupFromString(this.getSnapshot());
				}
			};
		});
	}

	if (CKEDITOR.config.giella_handleUndoRedo === true) {
		var undoImagePrototype = CKEDITOR.plugins.undo.Image.prototype;

		// add backword compatibility for CKEDITOR 4.2. method equals was repleced on other method
		var equalsContentMethodName = (typeof undoImagePrototype.equalsContent == "function") ? 'equalsContent' : 'equals';

		undoImagePrototype[equalsContentMethodName] = CKEDITOR.tools.override(undoImagePrototype[equalsContentMethodName], function(org) {
			return function(otherImage) {
				var pluginState = CKEDITOR.plugins.giella && CKEDITOR.plugins.giella.state.giella[otherImage.editor.name] && otherImage.editor.giella,
					giellaInstance = otherImage.editor.giella,
					thisContents = this.contents,
					otherContents = otherImage.contents,
					retval = null;

				// Making the comparison based on content without GIELLA word markers.
				if(pluginState) {
					this.contents = giellaInstance.removeMarkupFromString(thisContents) || '';
					otherImage.contents = giellaInstance.removeMarkupFromString(otherContents) || '';
				}

				var retval = org.apply(this, arguments);

				this.contents = thisContents;
				otherImage.contents = otherContents;

				return retval;
			};
		});
	}
});

/**
 * Automatically enables GIELLA on editor startup. When set to `true`, this option turns on GIELLA automatically
 * after loading the editor.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_autoStartup = true;
 *
 * @cfg {Boolean} [giella_autoStartup=false]
 * @member CKEDITOR.config
 */

/**
 * Enables Grammar As You Type (GRAYT) on GIELLA startup. When set to `true`, this option turns on GRAYT automatically
 * after GIELLA started.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.grayt_autoStartup = true;
 *
 * @since 4.5.6
 * @cfg {Boolean} [grayt_autoStartup=false]
 * @member CKEDITOR.config
 */

/**
 * Enables GIELLA initialization when inline CKEditor is not focused. When set to `true`, GIELLA markup is
 * displayed in both inline editor states, focused and unfocused, so the GIELLA instance is not destroyed.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		 config.giella_inlineModeImmediateMarkup = true;
 *
 * @since 4.5.6
 * @cfg {Boolean} [giella_inlineModeImmediateMarkup=false]
 * @member CKEDITOR.config
 */

/**
 * Defines the number of GIELLA suggestions to show in the main context menu.
 * Possible values are:
 *
 * * `0` (zero) &ndash; No suggestions are shown in the main context menu. All
 *     entries will be listed in the "More Suggestions" sub-menu.
 * * Positive number &ndash; The maximum number of suggestions to show in the context
 *     menu. Other entries will be shown in the "More Suggestions" sub-menu.
 * * Negative number &ndash; Five suggestions are shown in the main context menu. All other
 *     entries will be listed in the "More Suggestions" sub-menu.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 * Examples:
 *
 *		// Display only three suggestions in the main context menu.
 *		config.giella_maxSuggestions = 3;
 *
 *		// Do not show the suggestions directly.
 *		config.giella_maxSuggestions = 0;
 *
 * @cfg {Number} [giella_maxSuggestions=5]
 * @member CKEDITOR.config
 */

/**
 * Defines the minimum length of words that will be collected from the editor content for spell checking.
 * Possible value is any positive number.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 * Examples:
 *
 *		// Set the minimum length of words that will be collected from editor text.
 *		config.giella_minWordLength = 5;
 *
 * @cfg {Number} [giella_minWordLength=4]
 * @member CKEDITOR.config
 */

/**
 * Sets the customer ID for GIELLA. Used for hosted users only. Required for migration from free
 * to trial or paid versions.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Load GIELLA using my customer ID.
 *		config.giella_customerId  = 'your-encrypted-customer-id';
 *
 * @cfg {String} [giella_customerId='1:WvF0D4-UtPqN1-43nkD4-NKvUm2-daQqk3-LmNiI-z7Ysb4-mwry24-T8YrS3-Q2tpq2']
 * @member CKEDITOR.config
 */

/**
 * Enables and disables the "More Suggestions" sub-menu in the context menu.
 * Possible values are `'on'` and `'off'`.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Disables the "More Suggestions" sub-menu.
 *		config.giella_moreSuggestions = 'off';
 *
 * @cfg {String} [giella_moreSuggestions='on']
 * @member CKEDITOR.config
 */

/**
 * Customizes the display of GIELLA context menu commands ("Add Word", "Ignore",
 * "Ignore All", "Options", "Languages", "Dictionaries" and "About").
 * This must be a string with one or more of the following
 * words separated by a pipe character (`'|'`):
 *
 * * `off` &ndash; Disables all options.
 * * `all` &ndash; Enables all options.
 * * `ignore` &ndash; Enables the "Ignore" option.
 * * `ignoreall` &ndash; Enables the "Ignore All" option.
 * * `add` &ndash; Enables the "Add Word" option.
 * * `option` &ndash; Enables the "Options" menu item.
 * * `language` &ndash; Enables the "Languages" menu item.
 * * `dictionary` &ndash; Enables the "Dictionaries" menu item.
 * * `about` &ndash; Enables the "About" menu item.
 *
 * Please note that availability of the "Options", "Languages" and "Dictionaries" items
 * also depends on the {@link CKEDITOR.config#giella_uiTabs} option.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 * Example:
 *
 *		// Show only "Add Word" and "Ignore All" in the context menu.
 *		config.giella_contextCommands = 'add|ignoreall';
 *
 * @cfg {String} [giella_contextCommands='ignore|ignoreall|add']
 * @member CKEDITOR.config
 */

/**
 * Sets the default spell checking language for GIELLA. Possible values are:
 * `'en_US'`, `'en_GB'`, `'pt_BR'`, `'da_DK'`,
 * `'nl_NL'`, `'en_CA'`, `'fi_FI'`, `'fr_FR'`,
 * `'fr_CA'`, `'de_DE'`, `'el_GR'`, `'it_IT'`,
 * `'nb_NO'`, `'pt_PT'`, `'es_ES'`, `'sv_SE'`.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Sets GIELLA to German.
 *		config.giella_sLang = 'de_DE';
 *
 * @cfg {String} [giella_sLang='en_US']
 * @member CKEDITOR.config
 */

/**
 * Customizes the GIELLA dialog and GIELLA toolbar menu to show particular tabs and items.
 * This setting must contain a `1` (enabled) or `0`
 * (disabled) value for each of the following entries, in this precise order,
 * separated by a comma (`','`): `'Options'`, `'Languages'`, and `'Dictionary'`.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Hides the "Languages" tab.
 *		config.giella_uiTabs = '1,0,1';
 *
 * @cfg {String} [giella_uiTabs='1,1,1']
 * @member CKEDITOR.config
 */

/**
 * Sets the protocol for the WebSpellChecker service (`ssrv.cgi`) full path.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Defines the protocol for the WebSpellChecker service (ssrv.cgi) path.
 *		config.giella_serviceProtocol = 'https';
 *
 * @cfg {String} [giella_serviceProtocol='http']
 * @member CKEDITOR.config
 */

/**
 * Sets the host for the WebSpellChecker service (`ssrv.cgi`) full path.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Defines the host for the WebSpellChecker service (ssrv.cgi) path.
 *		config.giella_serviceHost = 'my-host';
 *
 * @cfg {String} [giella_serviceHost='svc.webspellchecker.net']
 * @member CKEDITOR.config
 */

/**
 * Sets the port for the WebSpellChecker service (`ssrv.cgi`) full path.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Defines the port for the WebSpellChecker service (ssrv.cgi) path.
 *		config.giella_servicePort = '2330';
 *
 * @cfg {String} [giella_servicePort='80']
 * @member CKEDITOR.config
 */

/**
 * Sets the path to the WebSpellChecker service (`ssrv.cgi`).
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		// Defines the path to the WebSpellChecker service (ssrv.cgi).
 *		config.giella_servicePath = 'my-path/ssrv.cgi';
 *
 * @cfg {String} [giella_servicePath='spellcheck31/script/ssrv.cgi']
 * @member CKEDITOR.config
 */

/**
 * Sets the URL to GIELLA core. Required to switch to the licensed version of GIELLA.
 *
 * Refer to [GIELLA documentation](http://wiki.webspellchecker.net/doku.php?id=migration:hosredfreetolicensedck)
 * for more details.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_srcUrl = "http://my-host/spellcheck/lf/giella/giella.js";
 *
 * @cfg {String} [giella_srcUrl='//svc.webspellchecker.net/spellcheck31/lf/giella3/ckgiella/ckgiella.js']
 * @member CKEDITOR.config
 */

/**
 * Links GIELLA to custom dictionaries. This is a string containing the dictionary IDs
 * separated by commas (`','`). Available only for the licensed version.
 *
 * Refer to [GIELLA documentation](http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:customdictionaries:licensed)
 * for more details.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_customDictionaryIds = '3021,3456,3478';
 *
 * @cfg {String} [giella_customDictionaryIds='']
 * @member CKEDITOR.config
 */

/**
 * Activates a User Dictionary in GIELLA. The user
 * dictionary name must be used. Available only for the licensed version.
 *
 * Refer to [GIELLA documentation](http://wiki.webspellchecker.net/doku.php?id=installationandconfiguration:userdictionaries)
 * for more details.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_userDictionaryName = 'MyDictionary';
 *
 * @cfg {String} [giella_userDictionaryName='']
 * @member CKEDITOR.config
 */

/**
 * Defines the order of GIELLA context menu items by groups.
 * This must be a string with one or more of the following
 * words separated by a pipe character (`'|'`):
 *
 * * `suggest` &ndash; The main suggestion word list.
 * * `moresuggest` &ndash; The "More suggestions" word list.
 * * `control` &ndash; GIELLA commands, such as "Ignore" and "Add Word".
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 * Example:
 *
 *		config.giella_contextMenuItemsOrder = 'moresuggest|control|suggest';
 *
 * @cfg {String} [giella_contextMenuItemsOrder='suggest|moresuggest|control']
 * @member CKEDITOR.config
 */

/**
 * If set to `true`, it overrides the {@link CKEDITOR.editor#checkDirty checkDirty} functionality of CKEditor
 * to fix GIELLA issues with incorrect `checkDirty` behavior. If set to `false`,
 * it provides better performance on big preloaded text.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_handleCheckDirty = 'false';
 *
 * @cfg {String} [giella_handleCheckDirty='true']
 * @member CKEDITOR.config
 */

/**
 * Configures undo/redo behavior of GIELLA in CKEditor.
 * If set to `true`, it overrides the undo/redo functionality of CKEditor
 * to fix GIELLA issues with incorrect undo/redo behavior. If set to `false`,
 * it provides better performance on text undo/redo.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_handleUndoRedo = 'false';
 *
 * @cfg {String} [giella_handleUndoRedo='true']
 * @member CKEDITOR.config
 */

/**
 * Enables the "Ignore All-Caps Words" option by default.
 * You may need to {@link CKEDITOR.config#giella_disableOptionsStorage disable option storing} for this setting to be
 * effective because option storage has a higher priority.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_ignoreAllCapsWords = true;
 *
 * @since 4.5.6
 * @cfg {Boolean} [giella_ignoreAllCapsWords=false]
 * @member CKEDITOR.config
 */

/**
 * Enables the "Ignore Domain Names" option by default.
 * You may need to {@link CKEDITOR.config#giella_disableOptionsStorage disable option storing} for this setting to be
 * effective because option storage has a higher priority.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_ignoreDomainNames = true;
 *
 * @since 4.5.6
 * @cfg {Boolean} [giella_ignoreDomainNames=false]
 * @member CKEDITOR.config
 */

/**
 * Enables the "Ignore Words with Mixed Case" option by default.
 * You may need to {@link CKEDITOR.config#giella_disableOptionsStorage disable option storing} for this setting to be
 * effective because option storage has a higher priority.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_ignoreWordsWithMixedCases = true;
 *
 * @since 4.5.6
 * @cfg {Boolean} [giella_ignoreWordsWithMixedCases=false]
 * @member CKEDITOR.config
 */

/**
 * Enables the "Ignore Words with Numbers" option by default.
 * You may need to {@link CKEDITOR.config#giella_disableOptionsStorage disable option storing} for this setting to be
 * effective because option storage has a higher priority.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_ignoreWordsWithNumbers = true;
 *
 * @since 4.5.6
 * @cfg {Boolean} [giella_ignoreWordsWithNumbers=false]
 * @member CKEDITOR.config
 */

/**
 * Disables storing of GIELLA options between sessions. Option storing will be turned off after a page refresh.
 * The following settings can be used:
 *
 * * `'options'` &ndash; Disables storing of all GIELLA Ignore options.
 * * `'ignore-all-caps-words'` &ndash; Disables storing of the "Ignore All-Caps Words" option.
 * * `'ignore-domain-names'` &ndash; Disables storing of the "Ignore Domain Names" option.
 * * `'ignore-words-with-mixed-cases'` &ndash; Disables storing of the "Ignore Words with Mixed Case" option.
 * * `'ignore-words-with-numbers'` &ndash; Disables storing of the "Ignore Words with Numbers" option.
 * * `'lang'` &ndash; Disables storing of the GIELLA spell check language.
 * * `'all'` &ndash; Disables storing of all GIELLA options.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 * Example:
 *
 *		// Disabling one option.
 *		config.giella_disableOptionsStorage = 'all';
 *
 *		// Disabling several options.
 *  	config.giella_disableOptionsStorage = ['lang', 'ignore-domain-names', 'ignore-words-with-numbers'];
 *
 *
 * @cfg {String|Array} [giella_disableOptionsStorage = '']
 * @member CKEDITOR.config
 */

/**
 * Specifies the names of tags that will be skipped while spell checking. This is a string containing tag names
 * separated by commas (`','`). Please note that the `'style'` tag would be added to specified tags list.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_elementsToIgnore = 'del,pre';
 *
 * @cfg {String} [giella_elementsToIgnore='style']
 * @member CKEDITOR.config
 */

/**
 * Enables multi-language support in GIELLA. If set to `true`, turns on GIELLA multi-language support after loading the editor.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 *		config.giella_multiLanguageMode = true;
 *
 * @cfg {Boolean} [giella_multiLanguageMode=false]
 * @member CKEDITOR.config
 */

/**
 * Defines additional styles for misspellings for specified languages. Styles will be applied only if
 * the {@link CKEDITOR.config#giella_multiLanguageMode} option is set to `true` and the [Language](http://ckeditor.com/addon/language)
 * plugin is included and loaded in the editor. By default, all misspellings will still be underlined with the red waveline.
 *
 * Read more in the [documentation](#!/guide/dev_spellcheck) and see the [SDK sample](http://sdk.ckeditor.com/samples/spellchecker.html).
 *
 * Example:
 *
 *		// Display misspellings in French language with green color and underlined with red waveline.
 *		config.giella_multiLanguageStyles = {
 *			'fr': 'color: green'
 *		};
 *
 *		// Display misspellings in Italian language with green color and underlined with red waveline
 *		// and German misspellings with red color only.
 *		config.giella_multiLanguageStyles = {
 *			'it': 'color: green',
 *			'de': 'background-image: none; color: red'
 *		};
 *
 * @cfg {Object} [giella_multiLanguageStyles = {}]
 * @member CKEDITOR.config
 */
