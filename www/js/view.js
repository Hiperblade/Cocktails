// ---

function ViewConstructor()
{
	var IMAGE_DIRECTORY = "img";

	var _filter = new CocktailsFilter();
	var _lastScrollPosition = 0;
	var _editorIngredientId = 0;
	var _menuVisible = false;

	var _setHtml = function(id, text)
	{
		$(id).hide();
		$(id).html(text);
		$(id).get(0).offsetHeight; // no need to store this anywhere, the reference is enough
		$(id).show();
	}
	
	var _getIngredientDescription = function(id)
	{
		if(Controller.getData().Ingredients[id])
		{
			return Controller.getData().Ingredients[id].Description;
		}
		return id;
	}

	var _getIngredientImage = function(id)
	{
		if(Controller.getData().Ingredients[id])
		{
			return IMAGE_DIRECTORY + '/' + "ingredients/" + Controller.getData().Ingredients[id].Image;
		}
		return IMAGE_DIRECTORY + '/' + "ingredients/generic.png";
	}

	var _getGlassDescription = function(id)
	{
		if(Controller.getData().Glasses[id])
		{
			return Controller.getData().Glasses[id].Description;
		}
		return id;
	}

	var _getGlassImage = function(id)
	{
		if(Controller.getData().Glasses[id])
		{
			return IMAGE_DIRECTORY + '/' + "glass/" + Controller.getData().Glasses[id].Image;
		}
		return IMAGE_DIRECTORY + '/' + "glass/generic.svg";
	}
	
	var _showList = function()
	{
		var listFilterValue = "";
		if(_filter.DescriptionLike)
		{
			listFilterValue = _filter.DescriptionLike;
		}

		var text = '';
		text += '<div id="applicationTitle" class="applicationTitle">Cocktails</div>';
		text += '<div class="Filter">';
		text += '<div class="FilterText"><input class="FilterControl" type="text" onkeyup="View.setFilter(this.value);" value="' + listFilterValue + '"></input></div>';
		text += '<div class="FilterCombo"><select class="FilterControl" onChange="View.setClassificationFilter(this.value);">';
		text +=  '<option value=""></option>';
		for(var i = 0; i < CLASSIFICATION.length; i++)
		{
			text +=  '<option value="' + CLASSIFICATION[i] + '"';
			if(CLASSIFICATION[i] == _filter.Classification)
			{
				text += ' selected';
			}
			text +=  '>' + CLASSIFICATION[i] + '</option>';
		}
		text += '</select></div>';
		text += '<div class="FilterButton"><img class="FilterControl" src="img/filter.svg" onClick="View.resetFilter();"><img></div>';
		text += '</div>';
		text += '<div id="mainList">';
		text += '</div>';

		_setHtml('#mainPage', text);
		_showListInternal();
		
		System.setScrollTop(_lastScrollPosition);
	}

	var _showListInternal = function()
	{
		var text = '';
		var cocktailsList = Controller.getList(_filter);
		if(cocktailsList.length == 0)
		{
			$("#applicationTitle").html("Cocktails");
			text += '<div class="ListNoResults" onClick="View.resetFilter();">No results.<div class="ListNoResultsInfo">(Tap here to remove the filter.)</div></div>';
		}
		else
		{
			$("#applicationTitle").html("" + cocktailsList.length + " Cocktails");
			for(var i = 0; i < cocktailsList.length; i++)
			{
				text += '<div class="Element" onclick="View.setCurrentCocktail(\'' + cocktailsList[i].Id() + '\');">';
				text +=  '<div class="ElementName">' + cocktailsList[i].Description();
				if(cocktailsList[i].Iba())
				{
					text += '<div class="Iba"> (IBA)</div>';
				}
				if(cocktailsList[i].hasVariant())
				{
					text += '<div class="Iba"> (*)</div>';
				}
				text +=  '</div>';
				text +=  '<div class="ElementInfo">' + cocktailsList[i].Classification() + '</div>';
				text += '</div>';
			}
		}
		_setHtml('#mainList', text);
	}

	var _valueToUnit = function(value, unitMeasure)
	{
		switch(unitMeasure)
		{
			case UNIT_MEASURE.Cl:
				switch(Controller.getSettings('BaseUnitMeasure'))
				{
					case BASE_UNIT_MEASURE.OZQ:
						// intero
						var ret = Math.round(parseFloat(value) / 0.75);
						if(ret == 0)
						{
							return "&lt;1";
						}
						return ret.toString();
					case BASE_UNIT_MEASURE.OZ:
						// frazionario
						var ret = Math.round(parseFloat(value) / 0.75);
						if(ret == 0)
						{
							return "&lt;&frac14;";
						}

						var tmp = "";
						if(parseInt(ret / 4) > 0)
						{
							tmp += parseInt(ret / 4).toString();
							if(ret % 4 > 0)
							{
								tmp += " ";
							}
						}

						if(ret % 4 == 1)
						{
							tmp += "&frac14;";
						}
						else if(ret % 4 == 2)
						{
							tmp += "&frac12;";
						}
						else if(ret % 4 == 3)
						{
							tmp += "&frac34;";
						}

						return tmp;
					default:
						// decimale
						return value.toString();
				}
			case UNIT_MEASURE.Fill:
				// speciale
				return "fill";
			case UNIT_MEASURE.Pcs:
				// frazionario
				var ret = Math.round(parseFloat(value) / 0.25);
				if(ret == 0)
				{
					return "&lt;&frac14;";
				}

				var tmp = "";
				if(parseInt(ret / 4) > 0)
				{
					tmp += parseInt(ret / 4).toString();
					if(ret % 4 > 0)
					{
						tmp += " ";
					}
				}

				if(ret % 4 == 1)
				{
					tmp += "&frac14;";
				}
				else if(ret % 4 == 2)
				{
					tmp += "&frac12;";
				}
				else if(ret % 4 == 3)
				{
					tmp += "&frac34;";
				}
				return tmp;
			case UNIT_MEASURE.Splash:
			case UNIT_MEASURE.Spoon:
			case UNIT_MEASURE.Drop:
				// intero
				var ret = Math.round(parseFloat(value));
				if(ret == 0)
				{
					return "&lt;1";
				}
				return ret.toString();
			default:
				// decimale
				return value.toString();
		}
	}

	var _unitMeasureDescription = function(unitMeasure)
	{
		switch(unitMeasure)
		{
			case UNIT_MEASURE.Cl:
				// Cl, Oz or 1/4Oz
				switch(Controller.getSettings('BaseUnitMeasure'))
				{
					case BASE_UNIT_MEASURE.CL:
						return 'cl'; 
					case BASE_UNIT_MEASURE.OZ:
						return 'Oz';
					case BASE_UNIT_MEASURE.OZQ:
						return '&frac14;Oz';
				}
			case UNIT_MEASURE.Fill:
				return "";
			default:
				return unitMeasure.toString();
		}
	}

	var _showCocktail = function(cocktail)
	{
		if(cocktail != null)
		{
			var text = '<div class="Container">';
			//
			text += '<div class="Cocktail">';
			text +=  '<div class="CocktailNameBox">';
			text +=  '<div class="CocktailName" onClick="View.backMenu()">' + cocktail.Description();
			if(cocktail.Iba())
			{
				text += '<div class="Iba"> (IBA)</div>';
			}
			if(cocktail.hasVariant())
			{
				text += '<div class="Iba"> (*)</div>';
			}
			text +=  '</div>';
			var nextVariant = Controller.getNextVariantOf(cocktail.getBaseCocktail(), cocktail.Id());
			if(nextVariant)
			{
				text += '<div class="CocktailVariant" onClick="Controller.setCurrentCocktail(\'' + nextVariant + '\')"><img class="CocktailVariantIcon" src="img/edit.svg"><img>' + '' + '</div>';
			}
			text +=  '</div>';
			
			text +=  '<div><div class="Label">Classification: </div><div class="Value">' + cocktail.Classification() + '</div></div>';
			text +=  '<div><div class="Label">AlcoholicLevel: </div><div class="Value">' + cocktail.AlcoholicLevel() + '</div></div>';
			text +=  '<div class="Glass">';
			text +=   '<img class="GlassImage" src="' + _getGlassImage(cocktail.Glass()) + '"/>';
			text +=   '<div class="GlassName">' + _getGlassDescription(cocktail.Glass()) + '</div>';
			text +=  '</div>';
			text +=  '<div><div class="Label">Technique: </div><div class="Value">' + cocktail.Technique() + '</div></div>';
			text +=  '<div><div class="Label">Garnish: </div><div class="Value">' + cocktail.Garnish() + '</div></div>';
			
			text +=  '<div class="CocktailInfo">' + cocktail.Info() + '</div>';
			text +=  '<div>Ingredients:</div>';
			text += '</div>';

			text += '<div class="CocktailsIngredient">';
			var landscape = (CordovaApp.currentOrientation() == ScreenOrientation.LANDSCAPE);
			var ingredients = cocktail.getIngredients();
			for(var ingredientId in ingredients)
			{
				text += '<div class="Ingredient';
				if(landscape)
				{
					text += ' IngredientLandScape';
				}
				text += '">';
				text +=  '<div class="IngredientImage"><img clas="IngredientImg" src="' + _getIngredientImage(ingredientId) + '" /></div>';
				text +=  '<div class="IngredientName">' + _getIngredientDescription(ingredientId) + '</div>';
				if(ingredients[ingredientId].UnitMeasure)
				{
					text += '<div class="IngredientUnitMeasure">' + _unitMeasureDescription(ingredients[ingredientId].UnitMeasure) + '</div>';
					text += '<div class="IngredientQuantity IngredientQuantityNoCL">' + _valueToUnit(ingredients[ingredientId].Quantity, ingredients[ingredientId].UnitMeasure) + '</div>';
				}
				else
				{
					text += '<div class="IngredientUnitMeasure">' + _unitMeasureDescription(UNIT_MEASURE.Cl) + '</div>';
					text += '<div class="IngredientQuantity">' + _valueToUnit(ingredients[ingredientId].Quantity, UNIT_MEASURE.Cl) + '</div>';
				}
				text += '</div>';
			}
			text += '</div>';
			//
			text += '</div>';
			_setHtml('#mainPage', text);
			
			System.setScrollTop(0);
		}
	}

	var _setCurrentCocktail = function(id)
	{
		var oldPosition = System.getScrollTop();
		if(Controller.setCurrentCocktail(id))
		{
			_lastScrollPosition = oldPosition;
		}
	}
	
	var _showSettings = function(settings)
	{
		var text = '<div class="applicationTitle">Settings</div>';
		text += '<div class="EditorGroup"><div class="SettingsLabel">Principal unit measure: </div>';
		text += '<select class="SettingsControl" onChange="Controller.setSettings(\'UnitMeasure\', this.value);">';

		if(settings.UnitMeasure != BASE_UNIT_MEASURE.CL)
		{
			text +=  '<option value="' + BASE_UNIT_MEASURE.CL + '">cl</option>';
		}
		else
		{
			text +=  '<option value="' + BASE_UNIT_MEASURE.CL + '" selected>cl</option>';
		}

		if(settings.UnitMeasure != BASE_UNIT_MEASURE.OZ)
		{
			text +=  '<option value="' + BASE_UNIT_MEASURE.OZ + '">Oz</option>';
		}
		else
		{
			text +=  '<option value="' + BASE_UNIT_MEASURE.OZ + '" selected>Oz</option>';
		}

		if(settings.UnitMeasure != BASE_UNIT_MEASURE.OZQ)
		{
			text +=  '<option value="' + BASE_UNIT_MEASURE.OZQ + '">&frac14;Oz</option>';
		}
		else
		{
			text +=  '<option value="' + BASE_UNIT_MEASURE.OZQ + '" selected>&frac14;Oz</option>';
		}

		text += '</select></div>';

		text += '<div class="Credits"><div class="applicationTitle">Credits</div>';
		text += '<div><img class="CreditsPhoto" src="img/credits.jpg" />';
		text += '<div class="CreditsInfo"><div>Giorgio Amadei</div><div><a href="http://cronacheartificiali.blogspot.it">cronacheartificiali.blogspot.it</a></div></div></div>';
		text += '<div><img class="CreditsImage" src="img/OpenSource.svg" />';
		text += '<div class="CreditsInfo"><div>Open Source code on GitHub</div><div><a href="https://github.com/Hiperblade/Cocktails">github.com/Hiperblade/Cocktails</a></div></div></div>';
		text += '<div><img class="CreditsImage" src="img/IBA.png" />';
		text += '<div class="CreditsInfo"><div>International Bartenders Association</div><div><a href="http://www.iba-world.com/">http://www.iba-world.com/</a></div></div></div>';
		text += '</div>';

		text += '</div>';
		_setHtml('#mainPage', text);
		
		System.setScrollTop(0);
	};

	var _showEditor = function(cocktail)
	{
		var text = '<div class="Cocktail">';
		text += '<div class="EditorSplit"></div>';
		text +=  '<input type="hidden" id="EditorId" value="' + cocktail.Id() + '"></input>';
		text +=  '<div class="EditorCocktailName"><input class="EditorIngredientControl" id="EditorDescription" onkeyup="View.validateInputString(\'EditorDescription\')" value="' + _escapeToString(cocktail.Description()) + '"></input></div>';

		text += '<div>';
		text += '<div class="SettingsLabel">';
		text +=  '<div>Variant of: </div>';
		text +=  '<div>Classification: </div>';
		text +=  '<div>AlcoholicLevel: </div>';
		text +=  '<div>Technique: </div>';
		text +=  '<div>Garnish: </div>';
		text += '</div>';
		text += '<div class="SettingsControl">';

		var data = Controller.getData();
		if(cocktail.Id())
		{
			text += '<div><input class="EditorControl" type="hidden" id="EditorVariantOf"  value="' + cocktail.getBaseCocktail() + '" />';
			for(var i = 0; i < data.Cocktails.length; i++)
			{
				if(data.Cocktails[i].Id() == cocktail.getBaseCocktail())
				{
					text += data.Cocktails[i].Description();
					break;
				}
			}
			text += '</div>';
		}
		else
		{
			text += '<div><select class="EditorControl" id="EditorVariantOf">';
			text +=  '<option value=""></option>';
			for(var i = 0; i < data.Cocktails.length; i++)
			{
				text +=  '<option value="' + data.Cocktails[i].Id() + '"';
				if(data.Cocktails[i].Id() == cocktail.getBaseCocktail())
				{
					text += ' selected';
				}
				text +=  '>' + data.Cocktails[i].Description() + '</option>';
			}
			text += '</select></div>';
		}

		text +=  '<div><select class="EditorControl" id="EditorClassification">';
		for(var i = 0; i < CLASSIFICATION.length; i++)
		{
			text +=  '<option value="' + CLASSIFICATION[i] + '"';
			if(CLASSIFICATION[i] == cocktail.Classification())
			{
				text += ' selected';
			}
			text +=  '>' + CLASSIFICATION[i] + '</option>';
		}
		text +=  '</select></div>';

		text +=  '<div><select class="EditorControl" id="EditorAlcoholicLevel">';
		for(var i = 0; i < ALCOHOLIC_LEVELS.length; i++)
		{
			text +=  '<option value="' + ALCOHOLIC_LEVELS[i] + '"';
			if(ALCOHOLIC_LEVELS[i] == cocktail.AlcoholicLevel())
			{
				text += ' selected';
			}
			text +=  '>' + ALCOHOLIC_LEVELS[i] + '</option>';
		}
		text +=  '</select></div>';

		text +=  '<div><select class="EditorControl" id="EditorTechnique">';
		for(var i = 0; i < TECHNIQUES.length; i++)
		{
			text +=  '<option value="' + TECHNIQUES[i] + '"';
			if(TECHNIQUES[i] == cocktail.Technique())
			{
				text += ' selected';
			}
			text +=  '>' + TECHNIQUES[i] + '</option>';
		}
		text +=  '</select></div>';

		text +=  '<div><input class="EditorControl" id="EditorGarnish" onkeyup="View.validateInputString(\'EditorGarnish\')" value="' + _escapeToString(cocktail.Garnish()) + '"></input></div>';

		text +=  '</div>';

		text += '</div>';

		text +=  '<div class="Glass EditorGlass">';
		text +=   '<img class="GlassImage" id="EditorGlassImage" src="' + _getGlassImage(cocktail.Glass()) + '"/>';
		text +=   '<div class="GlassName"><select id="EditorGlass" onChange="View.setEditorGlassImage(this.value);">';
		for(var glassId in data.Glasses)
		{
			text +=  '<option value="' + glassId + '"';
			if(glassId == cocktail.Glass())
			{
				text += ' selected';
			}
			text +=  '>' + data.Glasses[glassId].Description + '</option>';
		}
		text += '</select></div>';
		text +=  '</div>';

		text += '<div><textarea class="EditorIngredientControl" id="EditorInfo" onkeyup="View.validateInputString(\'EditorInfo\')">' + _escapeToString(cocktail.Info()) + '</textarea></div>';
		text += '<div>Ingredients:</div>';
		text += '</div>';

		text += '<div id="EditorIngredients" class="CocktailsIngredient">';
		_editorIngredientId = 0;
		var ingredients = cocktail.getIngredients();
		for(var ingredientId in ingredients)
		{
			text += _createIngredientControl(ingredientId, ingredients[ingredientId]);
		}
		text += '</div>';
		text += '<div class="EditorSeparator"></div>';
		text += '<div class="EditorButton" onClick="View.appendEditorIngredient();"><img class="EditorButtonImage" src="img/add.svg"><img>Add ingredient</div>';
		//
		text += '</div>';
		_setHtml('#mainPage', text);
		
		System.setScrollTop(0);
	}

	var _appendEditorIngredient = function()
	{
		$("#EditorIngredients").append($(_createIngredientControl("", { Quantity: 0, UnitMeasure: "" })));
	}

	var _removeEditorIngredient = function(id)
	{
		$("#EditorIngredient_" + id).remove();
	}
	
	var _setEditorGlassImage = function(value)
	{
		$("#EditorGlassImage").attr("src", _getGlassImage(value));
	}
	
	var _setEditorIngredientImage = function(id, value)
	{
		$("#EditorIngredientImage_" + id).attr("src", _getIngredientImage(value));
	}

	var _validateInputNumber = function(id)
	{
		var editor = $("#" + id)[0];
		var key = editor.value[editor.value.length - 1];
		if(key == '.')
		{
			if(editor.value.indexOf(".") == editor.value.length - 1)
			{
				return;
			}
		}
		else if($.inArray(key, ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']) > -1)
		{
			return;
		}
		editor.value = editor.value.substring(0, editor.value.length - 1);
	}

	var _validateInputString = function(id)
	{
		var editor = $("#" + id)[0];
		var key = editor.value[editor.value.length - 1];
		var cc = key.charCodeAt(0);
		if((cc > 47 && cc < 58) || (cc > 64 && cc < 91) || (cc > 96 && cc < 123))
        {
			return;
		}
		else if($.inArray(key, ['*', '-', '+', '/', ',', '.', ';', ':', ' ', '=', '(', ')', '?', '!', '%', '\'', '"', '&', '<', '>']) > -1)
		{
			return;
		}
		editor.value = editor.value.substring(0, editor.value.length - 1);
	}
	
	var _escapeToString = function(value)
	{
		// gestione caratteri speciali escape
		value = value.replace("&#38;", "&");
		value = value.replace("&#60;", "<");
		value = value.replace("&#62;", ">");
		value = value.replace("&#39;", "'");
		value = value.replace("&#34;", "\"");
		return value;
	}

	var _escapeFromString = function(value)
	{
		// gestione caratteri speciali escape
		value = value.replace("&", "&#38;");
		value = value.replace("<", "&#60;");
		value = value.replace(">", "&#62;");
		value = value.replace("'", "&#39;");
		value = value.replace("\"", "&#34;");
		return value;
	}
	
	var _createIngredientControl = function(ingredientId, ingredient)
	{
		_editorIngredientId++;
		var text = '<div id="EditorIngredient_' + _editorIngredientId + '"';
		if(CordovaApp.currentOrientation() == ScreenOrientation.LANDSCAPE)
		{
			text += ' class="IngredientLandScape"';
		}
		text += '>';
		text += '<div class="Ingredient">';
		text += '<div class="EditorSeparator"></div>';
		text +=  '<div class="EditorIngredientRigth">';
		text +=   '<div class="EditorIngredientImage"><img id="EditorIngredientImage_' + _editorIngredientId + '" class="IngredientImg" src="' + _getIngredientImage(ingredientId) + '" /></div>';
		text +=   '<div class="IngredientName"><select class="EditorIngredientControl" id="EditorIngredient_' + _editorIngredientId + '_Id" onChange="View.setEditorIngredientImage(' + _editorIngredientId + ', this.value);">';
		text +=   '<option value=""></option>';
		var data = Controller.getData();
		for(var id in data.Ingredients)
		{
			text +=  '<option value="' + id + '"';
			if(id == ingredientId)
			{
				text += ' selected';
			}
			text +=  '>' + data.Ingredients[id].Description + '</option>';
		}
		text +=  '</select></div>';

		var quantity = ingredient.Quantity;
		if(quantity == 0)
		{
			quantity = "";
		}
		text +=  '<div class="EditorIngredientQuantity"><input class="EditorIngredientControl" id="EditorIngredient_' + _editorIngredientId + '_Quantity" value="' + quantity +
				'" onkeyup="View.validateInputNumber(\'EditorIngredient_' + _editorIngredientId + '_Quantity\')"></input></div>';
		text +=  '<div class="EditorIngredientUnitMeasure"><select id="EditorIngredient_' + _editorIngredientId + '_UnitMeasure">';
		for(var unitId in UNIT_MEASURE)
		{
			text +=  '<option value="' + UNIT_MEASURE[unitId] + '"';
			if(unitId == ingredient.UnitMeasure)
			{
				text += ' selected';
			}
			text +=  '>' + unitId + '</option>';
		}
		text +=   '</select></div>';
		text +=  '</div>';
		text += '</div>';
		text += '<div class="EditorButton" onClick="View.removeEditorIngredient(' + _editorIngredientId + ');"><img class="EditorButtonImage" src="img/delete.svg"><img>Delete</div>';
		text += '</div>';
		return text;
	}

	var _getEditorCustomCocktail = function()
	{
		// recupera le informazioni dalla form di modifica
		var id = $('#EditorId')[0].value;
		var description = _escapeFromString($('#EditorDescription')[0].value);
		var baseCocktail = $('#EditorVariantOf')[0].value;
		if(!Boolean(id))
		{
			id = description.replace(/\s/g, '');
			
			if(baseCocktail)
			{
				_addVariantOf(baseCocktail, id);
			}
		}
		var ret = new Cocktail(id, description, $('#EditorClassification')[0].value, $('#EditorGlass')[0].value, $('#EditorAlcoholicLevel')[0].value);
		ret.setBaseCocktail(baseCocktail);
		ret.setInfo($('#EditorTechnique')[0].value, _escapeFromString($('#EditorGarnish')[0].value), _escapeFromString($('#EditorInfo')[0].value));

		for(var i = 1; i <= _editorIngredientId; i++)
		{
			ret.addIngredient($('#EditorIngredient_' + i + '_Id')[0].value,
				$('#EditorIngredient_' + i + '_Quantity')[0].value,
				$('#EditorIngredient_' + i + '_UnitMeasure')[0].value);
		}
		return ret;
	}
	
	var _showMenu = function()
	{
		var menuButtons = Controller.getMenuButtons();

		if((_menuVisible == false) && (menuButtons.length > 0))
		{
			var text = '';
			for(var i = 0; i < menuButtons.length; i++)
			{
				text += '<div class="menuButton" onclick="View.pressButton(\'' + menuButtons[i].Command + '\');">' +
					'<img class="menuImage" src="' + menuButtons[i].Image + '"></img>' +
					'<div class="menuText">' + menuButtons[i].Text + '</div>' +
				'</div>';
			}
			var bookMenu = $("#bookMenu");
			bookMenu.html(text);
	
			$("#bookMenuBackground").removeClass("hide");
			bookMenu.removeClass("hide");
	
			_menuVisible = true;
		}
	};
	
	var _hideMenu = function()
	{
		if(_menuVisible)
		{
			$("#bookMenu").addClass("hide");
			$("#bookMenuBackground").addClass("hide");
			_menuVisible = false;
			return true;
		}
		return false;
	};
	
	var _pressButton = function(button)
	{
		_hideMenu();
		Controller.execute(button);
	}

	var _backMenu = function()
	{
		if(_menuVisible)
		{
			_hideMenu();
			return true;
		}
		return Controller.back();
	}
	
	var _resetFilter = function()
	{
		_filter.DescriptionLike = null;
		_filter.Classification = null;
		_lastScrollPosition = 0;
		_showList();
	}

	var _setFilter = function(value)
	{
		if(value == '')
		{
			value = null;
		}
		_filter.DescriptionLike = value;
		_lastScrollPosition = 0;
		_showListInternal();
	}

	var _setClassificationFilter = function(value)
	{
		if(value == '')
		{
			value = null;
		}
		_filter.Classification = value;
		_lastScrollPosition = 0;
		_showListInternal();
	}
	
	var _onOrientationChange = function()
	{
		var landscape = (CordovaApp.currentOrientation() == ScreenOrientation.LANDSCAPE);
		if(landscape)
		{
			$('.Ingredient').addClass('IngredientLandScape');
		}
		else
		{
			$('.Ingredient').removeClass('IngredientLandScape');
		}
	}

	this.start = function(){ Controller.start(); };
	// list and filter
	this.showList = _showList;
	this.setFilter = _setFilter;
	this.setClassificationFilter = _setClassificationFilter;
	this.resetFilter = _resetFilter;
	// cocktail
	this.showCocktail = _showCocktail;
	this.setCurrentCocktail = _setCurrentCocktail;
	// settings
	this.showSettings = _showSettings;
	// editor
	this.showEditor = _showEditor;
	this.appendEditorIngredient = _appendEditorIngredient;
	this.removeEditorIngredient = _removeEditorIngredient;
	this.setEditorGlassImage = _setEditorGlassImage;
	this.setEditorIngredientImage = _setEditorIngredientImage;
	this.validateInputNumber = _validateInputNumber;
	this.validateInputString = _validateInputString;
	this.getEditorCustomCocktail = _getEditorCustomCocktail;
	// menù
	this.showMenu = _showMenu;
	this.hideMenu = _hideMenu;
	this.pressButton = _pressButton;
	this.backMenu = _backMenu;
	this.onOrientationChange = _onOrientationChange;
}

View = new ViewConstructor();
