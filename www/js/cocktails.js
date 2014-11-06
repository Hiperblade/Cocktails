// ---

function Cocktail(id, description, classification, glass, alcoholicLevel, iba)
{
	var _id = id;
	var _description = description;
	var _classification = classification;
	var _glass = glass;
	var _alcoholicLevel = alcoholicLevel;
	var _iba = iba;

	var _info = "";
	var _technique = "";
	var _garnish = "";
	var _ingredients = { };
	
	var _addIngredient = function(id, quantity, unitMeasure)
	{
		_ingredients[id] = { Quantity: quantity, UnitMeasure: unitMeasure };
	}

	this.Id = function () { return _id; };
	this.Description = function () { return _description; };
	this.Classification = function () { return _classification; };
	this.Glass = function () { return _glass; };
	this.AlcoholicLevel = function() { return _alcoholicLevel; };
	this.Iba = function() { return _iba; };

	this.setInfo = function (technique, garnish, value) { _technique = technique; _garnish = garnish; _info = value; };
	this.Technique = function () { return _technique; };
	this.Garnish = function () { return _garnish; };
	this.Info = function () { return _info; };

	this.addIngredient = _addIngredient;
	this.getIngredients = function() { return _ingredients; };
}

function Book()
{
	var IMAGE_DIRECTORY = "img";
	var BASE_DIRECTORY = "cocktails";
	var IBA_FILE = BASE_DIRECTORY + "/iba.xml";
	var CUSTOM_FILE = BASE_DIRECTORY + "/custom.xml";

	var UNIT_MEASURE = { Cl: "", Fill: "fill", Pcs: "pcs", Splash: "spash", Spoon: "spoon", Drop: "drop" };

	var CLASSIFICATION = [ "Shot", "LongDrink", "AfterDinner", "BeforeDinner", "AllDay", "Refreshing", "Sparkling", "HotDrink" ];
	var GLASSES = { };
	var INGREDIENTS = { };

	var TECHNIQUES = [ "Build", "Layer", "Mix &amp; Pour", "Muddler", "Shake &amp; Strain", "Stir &amp; Strain" ];

	var ALCOHOLIC_LEVELS = [ "None", "Low", "Medium-Low", "Medium", "Medium-High", "High" ];

	var _cocktails = [];
	var _currentCocktail = null;

	var CONVERSION_TYPE = { CL: "CL", OZ: "OZ", OZQ: "OZQ" };
	var _conversionType = CONVERSION_TYPE.OZ;

	var _listFilter = null;
	var _listClassificationFilter = null;
	var _lastScrollPosition = 0;

	var _menuVisible = false;
	var _showingSettings = false;
	var _showingEditor = false;

	var TAG = {
		Glass: "Glass",
		Ingredient: "Ingredient",
		Cocktail: "Cocktail",
		Info: "Info",

		Id: "id",
		Description: "description",
		Image: "image",
		AlcoholicLevel: "alcoholicLevel",
		Classification: "classification",
		Technique: "technique",
		Garnish: "garnish",
		GlassType: "glass",
		Quantity: "quantity",
		UnitMeasure: "unit"
	};

	var _setImageDirectory = function(dir)
	{
		IMAGE_DIRECTORY = dir;
	}

	this.setImageDirectory = _setImageDirectory;

	var _getIngredientDescription = function(id)
	{
		if(INGREDIENTS[id])
		{
			return INGREDIENTS[id].Description;
		}
		return id;
	}

	var _getIngredientImage = function(id)
	{
		if(INGREDIENTS[id])
		{
			return INGREDIENTS[id].Image;
		}
		return "generic.jpg";
	}

	var _getGlassDescription = function(id)
	{
		if(GLASSES[id])
		{
			return GLASSES[id].Description;
		}
		return id;
	}

	var _getGlassImage = function(id)
	{
		if(GLASSES[id])
		{
			return GLASSES[id].Image;
		}
		return "generic.svg";
	}

	var _start = function()
	{
		System.existFile(IBA_FILE, _internalStart, function() {
			System.createDirectory(BASE_DIRECTORY, function() {
				System.getTextFile("iba.xml", function(xml){
					System.writeFile(IBA_FILE, xml, _internalStart);
				});
			});
		});
	}

	var _internalStart = function()
	{
		_loadData(IBA_FILE, true, function(){
			_loadData(CUSTOM_FILE, false, function(){
				_show();
			});
		});
	}

	var _addCocktail = function(value)
	{
		for(var i = 0; i < _cocktails.length; i++)
		{
			if(value.Description().toLowerCase() < _cocktails[i].Description().toLowerCase())
			{
				_cocktails.splice(i, 0, value);
				return;
			}
		}
		_cocktails.push(value);
	}

	var _loadDataFromXml = function(fileContent, iba)
	{
		var xmlDoc = fileContent;
		if(!xmlDoc.firstChild)
		{
			xmlDoc = new DOMParser().parseFromString(fileContent,'text/xml');
		}

		// Settings
		_loadSettings(xmlDoc);

		// Glasses
		var xPath = "/CocktailsData/Glasses";
		var nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
		var nodesParent;
		if(nodes)
		{
			nodesParent = nodes.iterateNext();
			if(nodesParent)
			{
				for(var i = 0; i < nodesParent.childNodes.length; i++)
				{
					if(nodesParent.childNodes[i].tagName == TAG.Glass)
					{
						GLASSES[nodesParent.childNodes[i].getAttribute(TAG.Id)] = { Description: nodesParent.childNodes[i].getAttribute(TAG.Description), Image: nodesParent.childNodes[i].getAttribute(TAG.Image) };
					}
				}
			}
		}

		// Ingredients
		xPath = "/CocktailsData/Ingredients";
		nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
		if(nodes)
		{
			nodesParent = nodes.iterateNext();
			if(nodesParent)
			{
				for(var i = 0; i < nodesParent.childNodes.length; i++)
				{
					if(nodesParent.childNodes[i].tagName == TAG.Ingredient)
					{
						INGREDIENTS[nodesParent.childNodes[i].getAttribute(TAG.Id)] = { Description: nodesParent.childNodes[i].getAttribute(TAG.Description), Image: nodesParent.childNodes[i].getAttribute(TAG.Image) };
					}
				}
			}
		}

		// Cocktails
		xPath = "/CocktailsData/Cocktails";
		nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
		if(nodes)
		{
			var tmp;
			nodesParent = nodes.iterateNext();
			if(nodesParent)
			{
				for(var i = 0; i < nodesParent.childNodes.length; i++)
				{
					if(nodesParent.childNodes[i].tagName == TAG.Cocktail)
					{
						tmp = new Cocktail(nodesParent.childNodes[i].getAttribute(TAG.Id), nodesParent.childNodes[i].getAttribute(TAG.Description), nodesParent.childNodes[i].getAttribute(TAG.Classification), nodesParent.childNodes[i].getAttribute(TAG.GlassType), nodesParent.childNodes[i].getAttribute(TAG.AlcoholicLevel), iba);
						for(var j = 0; j < nodesParent.childNodes[i].childNodes.length; j++)
						{
							if(nodesParent.childNodes[i].childNodes[j].tagName == TAG.Info)
							{
								tmp.setInfo(nodesParent.childNodes[i].childNodes[j].getAttribute(TAG.Technique), nodesParent.childNodes[i].childNodes[j].getAttribute(TAG.Garnish), nodesParent.childNodes[i].childNodes[j].textContent);
							}
							else if(nodesParent.childNodes[i].childNodes[j].tagName == TAG.Ingredient)
							{
								tmp.addIngredient(nodesParent.childNodes[i].childNodes[j].getAttribute(TAG.Id), nodesParent.childNodes[i].childNodes[j].getAttribute(TAG.Quantity), nodesParent.childNodes[i].childNodes[j].getAttribute(TAG.UnitMeasure) );
							}
						}
						_addCocktail(tmp);
					}
				}
			}
		}
	}

	var _loadData = function(fileName, iba, callback)
	{
		try
		{
			System.existFile(fileName, function()
			{
				System.readFile(fileName, function(fileContent)
				{
					_loadDataFromXml(fileContent, iba);
					Log.debug("LoadData: " + fileName + "\nTotal cocktails: " + _cocktails.length);
					if(callback)
					{
						callback();
					}
				});
			},
			function()
			{
				Log.debug("LoadData: " + fileName + " not exists!");
				if(callback)
				{
					callback();
				}
			});
		}
		catch(e)
		{
			Log.error("LoadData ERROR: " + e.message);
		}
	}

	var _resetFilter = function()
	{
		_listFilter = null;
		_listClassificationFilter = null;
		_lastScrollPosition = 0;
		_showList();
	}

	var _setFilter = function(value)
	{
		if(value == '')
		{
			value = null;
		}
		_listFilter = value;
		_lastScrollPosition = 0;
		_showListInternal();
	}

	var _setClassificationFilter = function(value)
	{
		if(value == '')
		{
			value = null;
		}
		_listClassificationFilter = value;
		_lastScrollPosition = 0;
		_showListInternal();
	}

	var _getList = function()
	{
		if(_listClassificationFilter != null || _listFilter != null)
		{
			var ret = [];
			for(var i = 0; i < _cocktails.length; i++)
			{
				if((_listFilter == null || _cocktails[i].Description().toLowerCase().indexOf(_listFilter.toLowerCase().trim()) != -1)
				&& (_listClassificationFilter == null || _cocktails[i].Classification() == _listClassificationFilter))
				{
					ret.push(_cocktails[i]);
				}
			}
			return ret;
		}
		else
		{
			return _cocktails;
		}
	}

	var _showList = function()
	{
		var listFilterValue = "";
		if(_listFilter)
		{
			listFilterValue = _listFilter;
		}

		var text = '';
		text += '<div id="applicationTitle" class="applicationTitle">Cocktails</div>';
		text += '<div class="Filter">';
		text += '<div class="FilterText"><input class="FilterControl" type="text" onkeyup="Book.setFilter(this.value);" value="' + listFilterValue + '"></input></div>';
		text += '<div class="FilterCombo"><select class="FilterControl" onChange="Book.setClassificationFilter(this.value);">';
		text +=  '<option value=""></option>';
		for(var i = 0; i < CLASSIFICATION.length; i++)
		{
			text +=  '<option value="' + CLASSIFICATION[i] + '"';
			if(CLASSIFICATION[i] == _listClassificationFilter)
			{
				text += ' selected';
			}
			text +=  '>' + CLASSIFICATION[i] + '</option>';
		}
		text += '</select></div>';
		text += '<div class="FilterButton"><img class="FilterControl" src="img/filter.svg" onClick="Book.resetFilter();"><img></div>';
		text += '</div>';
		text += '<div id="mainList">';
		text += '</div>';

		$("#mainPage").html(text);
		_showListInternal();
	}

	var _showListInternal = function()
	{
		var text = '';
		var cocktailsList = _getList();
		if(cocktailsList.length == 0)
		{
			$("#applicationTitle").html("Cocktails");
			text += '<div class="ListNoResults" onClick="Book.resetFilter();">No results.<div class="ListNoResultsInfo">(Tap here to remove the filter.)</div></div>';
		}
		else
		{
			$("#applicationTitle").html("" + cocktailsList.length + " Cocktails");
			for(var i = 0; i < cocktailsList.length; i++)
			{
				text += '<div class="Element" onclick="Book.setCurrentCocktail(\'' + cocktailsList[i].Id() + '\');">';
				text +=  '<div class="ElementName">' + cocktailsList[i].Description();
				if(cocktailsList[i].Iba())
				{
					text += '<div class="Iba"> (IBA)</div>';
				}
				text +=  '</div>';
				text +=  '<div class="ElementInfo">' + cocktailsList[i].Classification() + '</div>';
				text += '</div>';
			}
		}
		$("#mainList").html(text);
	}

	var _valueToUnit = function(value, unitMeasure)
	{
		switch(unitMeasure)
		{
			case UNIT_MEASURE.Cl:
				switch(_conversionType)
				{
					case CONVERSION_TYPE.OZQ:
						// intero
						var ret = Math.round(parseFloat(value) / 0.75);
						if(ret == 0)
						{
							return "&lt;1";
						}
						return ret.toString();
					case CONVERSION_TYPE.OZ:
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
				switch(_conversionType)
				{
					case CONVERSION_TYPE.CL:
						return 'cl'; 
					case CONVERSION_TYPE.OZ:
						return 'Oz';
					case CONVERSION_TYPE.OZQ:
						return '&frac14;Oz';
				}
			case UNIT_MEASURE.Fill:
				return "";
			default:
				return unitMeasure.toString();
		}
	}

	var _showCocktail = function()
	{
		if(_currentCocktail != null)
		{
			var text = '<div class="Container">';
			//
			text += '<div class="Cocktail">';
			text +=  '<div class="CocktailName" onClick="Book.backMenu()">' + _currentCocktail.Description();
			if(_currentCocktail.Iba())
			{
				text += '<div class="Iba"> (IBA)</div>';
			}
			text +=  '</div>';
			text +=  '<div><div class="Label">Classification: </div><div class="Value">' + _currentCocktail.Classification() + '</div></div>';
			text +=  '<div><div class="Label">AlcoholicLevel: </div><div class="Value">' + _currentCocktail.AlcoholicLevel() + '</div></div>';
			text +=  '<div class="Glass">';
			text +=   '<img class="GlassImage" src="' + IMAGE_DIRECTORY + '/' + _getGlassImage(_currentCocktail.Glass()) + '"/>';
			text +=   '<div class="GlassName">' + _getGlassDescription(_currentCocktail.Glass()) + '</div>';
			text +=  '</div>';
			text += '</div>';

			text += '<div class="CocktailInfo">';
			text += '<div><div class="Label">Technique: </div><div class="Value">' + _currentCocktail.Technique() + '</div></div>';
			text += '<div><div class="Label">Garnish: </div><div class="Value">' + _currentCocktail.Garnish() + '</div></div>';
			text += '<div>' + _currentCocktail.Info() + '</div>';
			text += '</div>';

			text += '<div class="Separator">Ingredients:</div>';

			text += '<div class="CocktailsIngredient">';
			var landscape = (CordovaApp.currentOrientation() == ScreenOrientation.LANDSCAPE);
			var ingredients = _currentCocktail.getIngredients();
			for(var ingredientId in ingredients)
			{
				text += '<div class="Ingredient';
				if(landscape)
				{
					text += ' IngredientLandScape';
				}
				text += '">';
				text +=  '<div class="IngredientImage"><img clas="bookImage" src="' + IMAGE_DIRECTORY + '/' + _getIngredientImage(ingredientId) + '" /></div>';
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
			$("#mainPage").html(text);
		}
	}

	var _showSettings = function()
	{
		var text = '<div class="applicationTitle">Settings</div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Principal unit measure: </div>';
		text += '<select class="EditorControl" onChange="Book.setUnitMeasure(this.value);">';

		if(_conversionType != CONVERSION_TYPE.CL)
		{
			text +=  '<option value="' + CONVERSION_TYPE.CL + '">cl</option>';
		}
		else
		{
			text +=  '<option value="' + CONVERSION_TYPE.CL + '" selected>cl</option>';
		}

		if(_conversionType != CONVERSION_TYPE.OZ)
		{
			text +=  '<option value="' + CONVERSION_TYPE.OZ + '">Oz</option>';
		}
		else
		{
			text +=  '<option value="' + CONVERSION_TYPE.OZ + '" selected>Oz</option>';
		}

		if(_conversionType != CONVERSION_TYPE.OZQ)
		{
			text +=  '<option value="' + CONVERSION_TYPE.OZQ + '">&frac14;Oz</option>';
		}
		else
		{
			text +=  '<option value="' + CONVERSION_TYPE.OZQ + '" selected>&frac14;Oz</option>';
		}

		text += '</select></div>';

		text += '<div class="Credits"><div class="applicationTitle">Credits</div>';
		text += '<img class="CreditsImage" src="img/credits.jpg" />';
		text += '<div class="CreditsInfo"><div>Giorgio Amadei</div><div><a href="http://cronacheartificiali.blogspot.it">cronacheartificiali.blogspot.it</a></div><div><a href="https://github.com/Hiperblade/Cocktails">github.com/Hiperblade/Cocktails</a></div></div>';
		text += '</div>';

		text += '</div>';
		$("#mainPage").html(text);
	};

	var _show = function()
	{
		if(_showingSettings == true)
		{
			_showSettings();
			$(window).scrollTop(0);
		}
		else if(_showingEditor == true)
		{
			_showEditor();
			$(window).scrollTop(0);
		}
		else if(_currentCocktail != null)
		{
			_showCocktail();
			$(window).scrollTop(0);
		}
		else
		{
			_showList();
			$(window).scrollTop(_lastScrollPosition);
		}
	}

	var _setCurrentCocktail = function(id)
	{
		_currentCocktail = null;
		for(var i = 0; i < _cocktails.length; i++)
		{
			if(_cocktails[i].Id() == id)
			{
				_lastScrollPosition = $(window).scrollTop();
				_currentCocktail = _cocktails[i];
				break;
			}
		}
		_show();
	}

	var _updateCustomData = function(callback)
	{
		if(System.supportFileSystem())
		{
			try
			{
				System.existFile(CUSTOM_FILE, function()
				{
					// leggo il file
					if(callback)
					{
						System.readFile(CUSTOM_FILE, function(fileContent)
						{
							var xmlDoc = fileContent;
							if(!xmlDoc.firstChild)
							{
								xmlDoc = new DOMParser().parseFromString(fileContent, 'text/xml');
							}
							System.writeFile(CUSTOM_FILE, new XMLSerializer().serializeToString(callback(xmlDoc).documentElement));
						});
					}
				},
				function()
				{
					// creo il file
					var xmlDoc = new DOMParser().parseFromString('<CocktailsData><Settings></Settings></CocktailsData>', 'text/xml');
					System.createDirectory(BASE_DIRECTORY, function() {
						if(callback)
						{
							System.writeFile(CUSTOM_FILE, new XMLSerializer().serializeToString(callback(xmlDoc).documentElement));
						}
						else
						{
							System.writeFile(CUSTOM_FILE, new XMLSerializer().serializeToString(xmlDoc.documentElement));
						}
					});
				});
			}
			catch(e)
			{
				Log.error("UpdateCustomData ERROR: " + e.message);
			}
		}
	}

	var _loadSettings = function(xmlDoc)
	{
		// legge dal file
		var xPath = "/CocktailsData/Settings";
		var nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
		var nodesParent;
		if(nodes)
		{
			nodesParent = nodes.iterateNext();
			if(nodesParent)
			{
				_conversionType = nodesParent.getAttribute("conversionType");
			}
		}
	}

	var _saveSettings = function()
	{
		//salva nel file
		_updateCustomData(function(xmlDoc){
			// modifico i dati
			var xPath = "/CocktailsData/Settings";
			var nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
			var nodesParent;
			if(nodes)
			{
				nodesParent = nodes.iterateNext();
				if(nodesParent)
				{
					nodesParent.setAttribute("conversionType", _conversionType);
				}
			}
			return xmlDoc;
		});
	}

	var _newCustomCocktail = function()
	{
		_currentCocktail = new Cocktail("", "", "AllDay", "Cocktail", "Higt", false);
	}

	var _showEditor = function()
	{
		// form di modifica
		var text = '<div class="applicationTitle">Edit Cocktail</div>';

		text += '<div class="EditorGroup"><div class="EditorLabel">Id: </div><input id="EditorId" class="EditorControl" value="' + _currentCocktail.Id() + '"></input></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Name: </div><input id="EditorDescription" class="EditorControl" value="' + _currentCocktail.Description() + '"></input></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Classification: </div><select id="EditorClassification" class="EditorControl">';
		for(var i = 0; i < CLASSIFICATION.length; i++)
		{
			text +=  '<option value="' + CLASSIFICATION[i] + '"';
			if(CLASSIFICATION[i] == _currentCocktail.Classification())
			{
				text += ' selected';
			}
			text +=  '>' + CLASSIFICATION[i] + '</option>';
		}
		text += '</select></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Glass: </div><select id="EditorGlass" class="EditorControl">';
		for(var glassId in GLASSES)
		{
			text +=  '<option value="' + glassId + '"';
			if(glassId == _currentCocktail.Glass())
			{
				text += ' selected';
			}
			text +=  '>' + GLASSES[glassId].Description + '</option>';
		}
		text += '</select></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">AlcoholicLevel: </div><select id="EditorAlcoholicLevel" class="EditorControl">';
		for(var i = 0; i < ALCOHOLIC_LEVELS.length; i++)
		{
			text +=  '<option value="' + ALCOHOLIC_LEVELS[i] + '"';
			if(ALCOHOLIC_LEVELS[i] == _currentCocktail.AlcoholicLevel())
			{
				text += ' selected';
			}
			text +=  '>' + ALCOHOLIC_LEVELS[i] + '</option>';
		}
		text += '</select></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Technique: </div><select id="EditorTechnique" class="EditorControl">';
		for(var i = 0; i < TECHNIQUES.length; i++)
		{
			text +=  '<option value="' + TECHNIQUES[i] + '"';
			if(TECHNIQUES[i] == _currentCocktail.Technique())
			{
				text += ' selected';
			}
			text +=  '>' + TECHNIQUES[i] + '</option>';
		}
		text += '</select></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Garnish: </div><input id="EditorGarnish" class="EditorControl" value="' + _currentCocktail.Garnish() + '"></input></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Info: </div><input id="EditorInfo" class="EditorControl" value="' + _currentCocktail.Info() + '"></input></div>';

		text += '<div id="EditorIngredients">';
		_EditorIngredientId = 0;
		var ingredients = _currentCocktail.getIngredients();
		for(var ingredientId in ingredients)
		{
			text += _createIngredientControl(ingredientId, ingredients[ingredientId]);
		}
		text += '</div>';
		text += '<div class="EditorSeparator"></div>';
		text += '<div class="EditorButton" onClick="Book.appendEditorIngredient();"><img class="EditorIngredientImage" src="img/add.svg"><img>Add ingredient</div>';
		$("#mainPage").html(text);
	}

	var _EditorIngredientId = 0;

	var _appendEditorIngredient = function()
	{
		$("#EditorIngredients").append($(_createIngredientControl("", { Quantity: 0, UnitMeasure: "" })));
	}

	var _removeEditorIngredient = function(id)
	{
		$("#EditorIngredient_" + id).remove();
	}

	var _createIngredientControl = function(ingredientId, ingredient)
	{
		_EditorIngredientId++;
		var text = '<div id="EditorIngredient_' + _EditorIngredientId + '" class="EditorIngredient">';
		text += '<div class="EditorSeparator"></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Ingredient: </div><select id="EditorIngredient_' + _EditorIngredientId + '_Id" class="EditorControl">';
		text +=  '<option value=""></option>';
		for(var id in INGREDIENTS)
		{
			text +=  '<option value="' + id + '"';
			if(id == ingredientId)
			{
				text += ' selected';
			}
			text +=  '>' + INGREDIENTS[id].Description + '</option>';
		}
		text += '</select></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">Quantity: </div><input id="EditorIngredient_' + _EditorIngredientId + '_Quantity" class="EditorControl" value="' + ingredient.Quantity + '"></input></div>';
		text += '<div class="EditorGroup"><div class="EditorLabel">UnitMeasure: </div><select id="EditorIngredient_' + _EditorIngredientId + '_UnitMeasure" class="EditorControl">';
		for(var unitId in UNIT_MEASURE)
		{
			text +=  '<option value="' + UNIT_MEASURE[unitId] + '"';
			if(unitId == ingredient.UnitMeasure)
			{
				text += ' selected';
			}
			text +=  '>' + unitId + '</option>';
		}
		text += '</select></div>';

		text += '<div class="EditorButton" onClick="Book.removeEditorIngredient(' + _EditorIngredientId + ');"><img class="EditorIngredientImage" src="img/delete.svg"><img>Delete</div>';
		text += '</div>';
		return text;
	}

	var _getCustomCocktail = function()
	{
		// recupera le informazioni dalla form di modifica
		var ret = new Cocktail($('#EditorId')[0].value, $('#EditorDescription')[0].value, $('#EditorClassification')[0].value, $('#EditorGlass')[0].value, $('#EditorAlcoholicLevel')[0].value);
		ret.setInfo($('#EditorTechnique')[0].value, $('#EditorGarnish')[0].value, $('#EditorInfo')[0].value);
		for(var i = 1; i <= _EditorIngredientId; i++)
		{
			ret.addIngredient($('#EditorIngredient_' + i + '_Id')[0].value,
				$('#EditorIngredient_' + i + '_Quantity')[0].value,
				$('#EditorIngredient_' + i + '_UnitMeasure')[0].value);
		}
		return ret;
	}

	var _saveCustomCocktail = function(cocktail)
	{
		_currentCocktail = cocktail;

		// salva nel file
		_updateCustomData(function(xmlDoc){
			// modifico i dati
			if(_removeCustomCocktail(cocktail.Id()))
			{
				xmlDoc = _deleteInternalCustomCocktail(xmlDoc, cocktail.Id());
			}
			_addCocktail(cocktail);

			var xPath = "/CocktailsData/Cocktails";
			var nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
			var nodesParent;
			if(nodes)
			{
				nodesParent = nodes.iterateNext();
				if(!nodesParent)
				{
					nodesParent = xmlDoc.createElement("Cocktails");
					xmlDoc.documentElement.appendChild(nodesParent);
				}
				var newCocktail = xmlDoc.createElement(TAG.Cocktail);
				newCocktail.setAttribute(TAG.Id, cocktail.Id());
				newCocktail.setAttribute(TAG.Description, cocktail.Description());
				newCocktail.setAttribute(TAG.Classification, cocktail.Classification());
				newCocktail.setAttribute("glass", cocktail.Glass());
				newCocktail.setAttribute(TAG.AlcoholicLevel, cocktail.AlcoholicLevel());

				var newCocktailInfo = xmlDoc.createElement(TAG.Info);
				newCocktailInfo.setAttribute(TAG.Technique, cocktail.Technique());
				newCocktailInfo.setAttribute(TAG.Garnish, cocktail.Garnish());
				newCocktailInfo.textContent = cocktail.Info();
				newCocktail.appendChild(newCocktailInfo);

				var ingredients = cocktail.getIngredients();
				for(var ingredientId in ingredients)
				{
					var newCocktailIngredient = xmlDoc.createElement(TAG.Ingredient);
					newCocktailIngredient.setAttribute(TAG.Id, ingredientId);
					newCocktailIngredient.setAttribute(TAG.Quantity, ingredients[ingredientId].Quantity);
					newCocktailIngredient.setAttribute(TAG.UnitMeasure, ingredients[ingredientId].UnitMeasure);
					newCocktail.appendChild(newCocktailIngredient);
				}
				nodesParent.appendChild(newCocktail);
			}
			return xmlDoc;
		});
	}

	var _deleteInternalCustomCocktail = function(xmlDoc, cocktailId)
	{
		// modifico i dati
		var xPath = "/CocktailsData/Cocktails";
		var nodes = xmlDoc.evaluate(xPath, xmlDoc, null, XPathResult.ANY_TYPE, null);
		var nodesParent;
		if(nodes)
		{
			nodesParent = nodes.iterateNext();
			if(nodesParent)
			{
				for(var i = 0; i < nodesParent.childNodes.length; i++)
				{
					if(nodesParent.childNodes[i].tagName == TAG.Cocktail)
					{
						if(nodesParent.childNodes[i].getAttribute(TAG.Id) == cocktailId)
						{
							nodesParent.removeChild(nodesParent.childNodes[i]);
							break;
						}
					}
				}
			}
		}
		return xmlDoc;
	}

	var _removeCustomCocktail = function(cocktailId)
	{
		for(var i = 0; i < _cocktails.length; i++)
		{
			if(_cocktails[i].Id() == cocktailId)
			{
				_cocktails.splice(i, 1);
				return true;
			}
		}
		return false;
	}

	var _deleteCustomCocktail = function(cocktailId)
	{
		if(_removeCustomCocktail(cocktailId))
		{
			_currentCocktail = null;

			// cancella dal file
			_updateCustomData(function(xmlDoc){
				// modifico i dati
				return _deleteInternalCustomCocktail(xmlDoc, cocktailId);
			});
		}
	}

	/*
	var _toScreenPosition = function(value)
	{
		var width = window.outerWidth;
		return Math.round(value * width / 100);
	}
	*/

	var _getMenuButtons = function()
	{
		if(_showingSettings == true)
		{
			return [ { Command: "SAVE", Image: "img/save.svg", Text: "Save" } ];
		}
		else if(_showingEditor == true)
		{
			return [ { Command: "SAVE", Image: "img/save.svg", Text: "Save" },
			     { Command: "CANCEL", Image: "img/cancel.svg", Text: "Cancel" } ];
		}
		else if(_currentCocktail != null)
		{
			if(_currentCocktail.Iba() == true)
			{
				return [ { Command: "SETTINGS", Image: "img/settings.svg", Text: "Settings" },
				     { Command: "ADD", Image: "img/add.svg", Text: "Add New Cocktail" } ];
			}
			else
			{
				return [ { Command: "SETTINGS", Image: "img/settings.svg", Text: "Settings" },
				     { Command: "ADD", Image: "img/add.svg", Text: "Add New Cocktail" },
				     { Command: "EDIT", Image: "img/edit.svg", Text: "Edit Cocktail" },
				     { Command: "DELETE", Image: "img/delete.svg", Text: "Delete Cocktail" } ];
			}
		}
		else
		{
			return [ { Command: "SETTINGS", Image: "img/settings.svg", Text: "Settings" },
			     { Command: "ADD", Image: "img/add.svg", Text: "Add New Cocktail" } ];
		}
	};

	var _showMenu = function()
	{
		var menuButtons = _getMenuButtons();

		if((_menuVisible == false) && (menuButtons.length > 0))
		{
			var text = '';
			for(var i = 0; i < menuButtons.length; i++)
			{
				text += '<div class="menuButton" onclick="Book.pressButton(\'' + menuButtons[i].Command + '\');">' +
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
		switch(button)
		{
			case "SETTINGS":
				_showingSettings = true;
				_show();
				break;
			case "ADD":
				_newCustomCocktail();
				_showingEditor = true;
				_show();
				break;
			case "EDIT":
				_showingEditor = true;
				_show();
				break;
			case "DELETE":
				_deleteCustomCocktail(_currentCocktail.Id());
				_show();
				break;
			case "SAVE":
				if(_showingSettings == true)
				{
					_saveSettings();
					_showingSettings = false;
				}
				else if(_showingEditor == true)
				{

					_saveCustomCocktail(_getCustomCocktail());
					_showingEditor = false;
				}
				_show();
				break;
			case "CANCEL":
				if(_currentCocktail.Id() == "")
				{
					_currentCocktail = null;
				}
				_showingEditor = false;
				_show();
				break;
		}
	};

	var _backMenu = function()
	{
		if(_menuVisible)
		{
			_hideMenu();
			return true;
		}
		else if(_showingSettings == true)
		{
			_showingSettings = false;
			_show();
			return true;
		}
		else if(_showingEditor == true)
		{
			_currentCocktail = null;
			_showingEditor = false;
			_show();
			return true;
		}
		else if(_currentCocktail != null)
		{
			_currentCocktail = null;
			_show();
			return true;
		}
		return false;
	}

	var _onOrientationChange = function()
	{
		_show();
	}

	this.setUnitMeasure = function(value) { _conversionType = value; };
	this.setCurrentCocktail  = _setCurrentCocktail;
	this.show = _show;
	this.showMenu = _showMenu;
	this.hideMenu = _hideMenu;
	this.pressButton = _pressButton;
	this.onOrientationChange = _onOrientationChange;
	this.backMenu = _backMenu;
	this.start = _start;
	this.setFilter = _setFilter;
	this.setClassificationFilter = _setClassificationFilter;
	this.resetFilter = _resetFilter;
	this.appendEditorIngredient = _appendEditorIngredient;
	this.removeEditorIngredient = _removeEditorIngredient;
}

Book = new Book();
