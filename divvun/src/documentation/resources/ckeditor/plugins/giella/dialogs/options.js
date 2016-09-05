/*
Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
For licensing, see LICENSE.html or http://ckeditor.com/license
*/

CKEDITOR.dialog.add( 'giellaDialog', function( editor ) {
	var giella_instance =  editor.giella;

	var aboutTabDefinition = '<div id="divvun_logo"><img src="' + giella_instance.getLogo() + '" style="width: 30%"/></div>' +
				'<p>' + giella_instance.getLocal('version') + giella_instance.getVersion() + '</p>' +
				'<p>' + giella_instance.getLocal('text_copyrights') + '</p>';

	var doc = CKEDITOR.document;

	var optionGenerator = function() {
		var giella_instance_ = editor.giella,
			applicationConfig = giella_instance.getApplicationConfig(),
			optionArrayUiCheckboxes = [],
			optionLocalizationList = {
				"ignore-all-caps-words" 		: "label_allCaps",
				"ignore-domain-names" 			: "label_ignoreDomainNames",
				"ignore-words-with-mixed-cases" : "label_mixedCase",
				"ignore-words-with-numbers" 	: "label_mixedWithDigits"
			};

		for(var option in applicationConfig) {

			var checkboxConfig = {
				type: "checkbox"
			};

			checkboxConfig.id  = option;
			checkboxConfig.label  = giella_instance.getLocal(optionLocalizationList[option]);

			optionArrayUiCheckboxes.push(checkboxConfig);
		}

		return optionArrayUiCheckboxes;
	};

	var languageModelState = {
		isChanged : function() {
			return (this.newLang === null || this.currentLang === this.newLang) ? false : true;
		},
		currentLang: giella_instance.getLang(),
		newLang: null,
		reset: function() {
			this.currentLang = giella_instance.getLang();
			this.newLang = null;
		},
		id: 'lang'
	};

	var generateDialogTabs = function(tabsList, editor) {
		var tabs = [],
			uiTabs = editor.config.giella_uiTabs;

		if(!uiTabs) {
			return tabsList;
		} else {
			for(var i in uiTabs) {
				(uiTabs[i] == 1) && tabs.push(tabsList[i]);
			}

			tabs.push(tabsList[tabsList.length - 1]);
		}

		return tabs;
	};

	var dialogTabs = [{
		id : 'options',
		label : giella_instance.getLocal('tab_options'),
		onShow: function() {
			// console.log("tab show");
		},
		elements : [
			{
				type: 'vbox',
				id: 'giellaOptions',
				children: optionGenerator(),
				onShow: function() {
					var optionsTab = this.getChild(),
						giella_instance =  editor.giella;
					for(var i = 0; i < this.getChild().length; i++) {
						this.getChild()[i].setValue(giella_instance.getApplicationConfig()[this.getChild()[i].id]);
					}

				}
			}

		]
	},
	{
		id : 'langs',
		label : giella_instance.getLocal('tab_languages'),
		elements : [
			{
				id: "leftLangColumn",
				type: 'vbox',
				align: 'left',
				widths: ['100'],
				children: [
					{
						type: 'html',
						id: 'langBox',
						style: 'overflow: hidden; white-space: normal;margin-bottom:15px;',
						html: '<div><div style="float:left;width:45%;margin-left:5px;" id="left-col-' + editor.name + '"></div><div style="float:left;width:45%;margin-left:15px;" id="right-col-' + editor.name + '"></div></div>',
						onShow: function() {
							var giella_instance =  editor.giella;
							var lang = giella_instance.getLang(),
								prefix_id = "giellaLang_",
								radio = doc.getById(prefix_id + editor.name + '_' + lang);

							radio.$.checked = true;
						}
					},
					{
						type: 'html',
						id: 'graytLanguagesHint',
						html: '<div style="margin:5px auto; width:95%;white-space:normal;" id="' + editor.name + 'graytLanguagesHint"><span style="width:10px;height:10px;display: inline-block; background:#02b620;vertical-align:top;margin-top:2px;"></span> - This languages are supported by Grammar As You Type(GRAYT).</div>',
						onShow: function() {
							var graytLanguagesHint = doc.getById(editor.name + 'graytLanguagesHint');

							if (!editor.config.grayt_autoStartup) {
								graytLanguagesHint.$.style.display = 'none';
							}
						}
					}
				]
			}
		]
	},
	{
		id : 'dictionaries',
		label : giella_instance.getLocal('tab_dictionaries'),
		elements : [
			{
				type: 'vbox',
				id: 'rightCol_col__left',
				children: [
					{
						type: 'html',
						id: 'dictionaryNote',
						html: ''
					},
					{
						type: 'text',
						id: 'dictionaryName',
						label: giella_instance.getLocal('label_fieldNameDic') || 'Dictionary name',
						onShow: function(data) {
							var dialog = data.sender,
								giella_instance = editor.giella;

							// IE7 specific fix
							setTimeout(function() {
								// clear dictionaryNote field
								dialog.getContentElement("dictionaries", "dictionaryNote").getElement().setText('');

								// restore/clear dictionaryName field
								if(giella_instance.getUserDictionaryName() != null && giella_instance.getUserDictionaryName() != '') {
									dialog.getContentElement("dictionaries", "dictionaryName").setValue(giella_instance.getUserDictionaryName());
								}
							}, 0);
						}
					},
					{
						type: 'hbox',
						id: 'notExistDic',
						align: 'left',
						style: 'width:auto;',
						widths: [ '50%', '50%' ],
						children: [
							{
								type: 'button',
								id: 'createDic',
								label: giella_instance.getLocal('btn_createDic'),
								title: giella_instance.getLocal('btn_createDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										self = dialogDefinition,
										giella_instance = editor.giella,
										name = dialog.getContentElement("dictionaries", "dictionaryName").getValue();

									giella_instance.createUserDictionary(name, function(response) {
										if(!response.error) {
											self.toggleDictionaryButtons.call(dialog, true);
										}
										response.dialog = dialog;
										response.command = "create";
										response.name = name;
										editor.fire("giellaUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "create";
										error.name = name;
										editor.fire("giellaUserDictionaryActionError", error);
									});
								}
							},
							{
								type: 'button',
								id: 'restoreDic',
								label: giella_instance.getLocal('btn_restoreDic'),
								title: giella_instance.getLocal('btn_restoreDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										giella_instance = editor.giella,
										self = dialogDefinition,
										name = dialog.getContentElement("dictionaries", "dictionaryName").getValue();

									giella_instance.restoreUserDictionary(name, function(response) {
										response.dialog = dialog;
										if(!response.error) {
											self.toggleDictionaryButtons.call(dialog, true);
										}
										response.command = "restore";
										response.name = name;
										editor.fire("giellaUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "restore";
										error.name = name;
										editor.fire("giellaUserDictionaryActionError", error);
									});
								}
							}
						]
					},
					{
						type: 'hbox',
						id: 'existDic',
						align: 'left',
						style: 'width:auto;',
						widths: [ '50%', '50%' ],
						children: [
							{
								type: 'button',
								id: 'removeDic',
								label: giella_instance.getLocal('btn_deleteDic'),
								title: giella_instance.getLocal('btn_deleteDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										giella_instance = editor.giella,
										self = dialogDefinition,
										dictionaryNameField = dialog.getContentElement("dictionaries", "dictionaryName"),
										name = dictionaryNameField.getValue();

									giella_instance.removeUserDictionary(name, function(response) {
										dictionaryNameField.setValue("");
										if(!response.error) {
											self.toggleDictionaryButtons.call(dialog, false);
										}
										response.dialog = dialog;
										response.command = "remove";
										response.name = name;
										editor.fire("giellaUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "remove";
										error.name = name;
										editor.fire("giellaUserDictionaryActionError", error);
									});
								}
							},
							{
								type: 'button',
								id: 'renameDic',
								label: giella_instance.getLocal('btn_renameDic'),
								title: giella_instance.getLocal('btn_renameDic'),
								onClick: function() {
									var dialog = this.getDialog(),
										giella_instance = editor.giella,
										name = dialog.getContentElement("dictionaries", "dictionaryName").getValue();

									giella_instance.renameUserDictionary(name, function(response) {
										response.dialog = dialog;
										response.command = "rename";
										response.name = name;
										editor.fire("giellaUserDictionaryAction", response);
									}, function(error) {
										error.dialog = dialog;
										error.command = "rename";
										error.name = name;
										editor.fire("giellaUserDictionaryActionError", error);
									});
								}
							}
						]
					},
					{
						type: 'html',
						id: 'dicInfo',
						html: '<div id="dic_info_editor1" style="margin:5px auto; width:95%;white-space:normal;">' + giella_instance.getLocal('text_descriptionDic')  + '</div>'
					}
				]
			}
		]
	},
	{
		id : 'about',
		label : giella_instance.getLocal('tab_about'),
		elements : [
			{
				type : 'html',
				id : 'about',
				style : 'margin: 5px 5px;',
				html : '<div><div id="giella_about_">' +
						aboutTabDefinition +
						'</div></div>'
			}
		]
	}];

	editor.on("giellaUserDictionaryAction", function(event) {
		var UILib = GIELLA.prototype.UILib,
			dialog = event.data.dialog,
			dictionaryNote = dialog.getContentElement("dictionaries", "dictionaryNote").getElement(),
			giella_instance =  event.editor.giella,
			messageTemplate;

		if(event.data.error === undefined) {

			// success message
			messageTemplate = giella_instance.getLocal("message_success_" + event.data.command + "Dic");
			messageTemplate = messageTemplate.replace('%s', event.data.name);
			dictionaryNote.setText(messageTemplate);
			UILib.css(dictionaryNote.$, {color: 'blue'});
		} else {

			// error message
			if(event.data.name === '') {

				// empty dictionary name
				dictionaryNote.setText(giella_instance.getLocal('message_info_emptyDic'));
			} else {
				messageTemplate = giella_instance.getLocal("message_error_" + event.data.command + "Dic");
				messageTemplate = messageTemplate.replace('%s', event.data.name);
				dictionaryNote.setText(messageTemplate);
			}
			UILib.css(dictionaryNote.$, {color: 'red'});

			if(giella_instance.getUserDictionaryName() != null && giella_instance.getUserDictionaryName() != '') {
				dialog.getContentElement("dictionaries", "dictionaryName").setValue(giella_instance.getUserDictionaryName());
			} else {
				dialog.getContentElement("dictionaries", "dictionaryName").setValue("");
			}
		}
	});

	editor.on("giellaUserDictionaryActionError", function(event) {
		var UILib = GIELLA.prototype.UILib,
			dialog = event.data.dialog,
			dictionaryNote = dialog.getContentElement("dictionaries", "dictionaryNote").getElement(),
			giella_instance =  event.editor.giella,
			messageTemplate;

		if(event.data.name === '') {

			// empty dictionary name
			dictionaryNote.setText(giella_instance.getLocal('message_info_emptyDic'));
		} else {
			messageTemplate = giella_instance.getLocal("message_error_" + event.data.command + "Dic");
			messageTemplate = messageTemplate.replace('%s', event.data.name);
			dictionaryNote.setText(messageTemplate);
		}
		UILib.css(dictionaryNote.$, {color: 'red'});


		if(giella_instance.getUserDictionaryName() != null && giella_instance.getUserDictionaryName() != '') {
			dialog.getContentElement("dictionaries", "dictionaryName").setValue(giella_instance.getUserDictionaryName());
		} else {
			dialog.getContentElement("dictionaries", "dictionaryName").setValue("");
		}

	});

	var plugin = CKEDITOR.plugins.giella;

	var dialogDefinition = {
		title:          giella_instance.getLocal('text_title'),
		resizable:      CKEDITOR.DIALOG_RESIZE_BOTH,
		minWidth: 		340,
		minHeight: 		260,
		onLoad: function() {
			if(editor.config.giella_uiTabs[1] == 0) {
				return;
			}

			var dialog = this,
				self = dialogDefinition,
				langBoxes = self.getLangBoxes.call(dialog);

			langBoxes.getParent().setStyle("white-space", "normal");

			//dialog.data = editor.fire( 'giellaDialog', {} );
			self.renderLangList(langBoxes);

			var giella_instance = editor.giella;

			this.definition.minWidth = this.getSize().width;
			this.resize(this.definition.minWidth, this.definition.minHeight);
		},
		onCancel: function() {
			languageModelState.reset();
		},
		onHide: function() {
			editor.unlockSelection();
		},
		onShow: function() {
			editor.fire("giellaDialogShown", this);

			if(editor.config.giella_uiTabs[2] == 0) {
				return;
			}

			var giella_instance = editor.giella,
				self = dialogDefinition,
				dialog = this,
				dictionaryNameField = dialog.getContentElement("dictionaries", "dictionaryName"),
				existance = dialog.getContentElement("dictionaries", "existDic").getElement().getParent(),
				notExistance = dialog.getContentElement("dictionaries", "notExistDic").getElement().getParent();

			existance.hide();
			notExistance.hide();

			if(giella_instance.getUserDictionaryName() != null && giella_instance.getUserDictionaryName() != '') {
				dialog.getContentElement("dictionaries", "dictionaryName").setValue(giella_instance.getUserDictionaryName());
				existance.show();
			} else {
				dictionaryNameField.setValue("");
				notExistance.show();
			}
		},
		onOk: function() {
			var dialog = this,
				self = dialogDefinition,
				giella_instance =  editor.giella,
				giellaOptions = dialog.getContentElement("options", "giellaOptions"),
				changedOptions = self.getChangedOption.call(dialog);

			giella_instance.commitOption({ changedOptions: changedOptions });
		},
		toggleDictionaryButtons: function(exist) {
			var existance = this.getContentElement("dictionaries", "existDic").getElement().getParent(),
				notExistance = this.getContentElement("dictionaries", "notExistDic").getElement().getParent();

			if(exist) {
				existance.show();
				notExistance.hide();
			} else {
				existance.hide();
				notExistance.show();
			}

		},
		getChangedOption: function() {
			var changedOption = {};

			if(editor.config.giella_uiTabs[0] == 1) {
				var dialog = this,
					giellaOptions = dialog.getContentElement("options", "giellaOptions").getChild();

				for(var i = 0; i < giellaOptions.length; i++) {
					if(giellaOptions[i].isChanged()) {
						changedOption[giellaOptions[i].id] = giellaOptions[i].getValue();
					}
				}
			}

			if(languageModelState.isChanged()) {
				changedOption[languageModelState.id] = editor.config.giella_sLang = languageModelState.currentLang = languageModelState.newLang;
			}

			return changedOption;
		},
		buildRadioInputs: function(key, value, isSupportedByGrayt) {
			var divContainer = new CKEDITOR.dom.element( 'div' ),
				doc = CKEDITOR.document,
				id = "giellaLang_" + editor.name + '_' + value,
				radio = CKEDITOR.dom.element.createFromHtml( '<input id="' +
					id + '" type="radio" ' +
					' value="' + value + '" name="giella_lang" />' ),

				radioLabel = new CKEDITOR.dom.element( 'label' ),
				giella_instance = editor.giella;

			divContainer.setStyles({
				"white-space": "normal",
				'position': 'relative',
				'padding-bottom': '2px'
			});

			radio.on( 'click', function(data) {
				languageModelState.newLang = data.sender.getValue();
			});

			radioLabel.appendText(key);
			radioLabel.setAttribute("for", id);

			if(isSupportedByGrayt && editor.config.grayt_autoStartup) {
				radioLabel.setStyles({
					'color': '#02b620'
				});
			}

			divContainer.append(radio);
			divContainer.append(radioLabel);

			if(value === giella_instance.getLang()) {
				radio.setAttribute("checked", true);
				radio.setAttribute('defaultChecked', 'defaultChecked');
			}

			return divContainer;
		},
		renderLangList: function(langBoxes) {
			var dialog = this,
				leftCol = langBoxes.find('#left-col-' + editor.name).getItem(0),
				rightCol = langBoxes.find('#right-col-' + editor.name).getItem(0),
				giellaLangList = giella_instance.getGiellaLangList(),
				graytLangList = giella_instance.getGraytLangList(),
				mergedLangList = {},
				sortable = [],
				counter = 0,
				isSupportedByGrayt = false,
				half, lang;

			for(lang in giellaLangList.ltr) {
				mergedLangList[lang] = giellaLangList.ltr[lang];
			}

			for(lang in giellaLangList.rtl) {
				mergedLangList[lang] = giellaLangList.rtl[lang];
			}

			// sort alphabetically lang list
			for(lang in mergedLangList) {
				sortable.push([lang, mergedLangList[lang]]);
			}
			sortable.sort(function(a, b) {
				var result = 0;
				if(a[1] > b[1]) {
					result = 1;
				} else if(a[1] < b[1]) {
					result = -1;
				}
				return result;
			});
			mergedLangList = {};
			for(var i = 0; i < sortable.length; i++) {
				mergedLangList[sortable[i][0]] = sortable[i][1];
			}

			half = Math.round(sortable.length / 2);

			for(lang in mergedLangList) {
				counter++;
				isSupportedByGrayt = (lang in graytLangList.ltr) || (lang in graytLangList.rtl);
				dialog.buildRadioInputs(mergedLangList[lang], lang, isSupportedByGrayt).appendTo(counter <= half ? leftCol : rightCol);
			}
		},
		getLangBoxes: function() {
			var dialog = this,
				langboxes = dialog.getContentElement("langs", "langBox").getElement();

			return langboxes;
		},
		contents: generateDialogTabs(dialogTabs, editor)
	};

	return dialogDefinition;
});
