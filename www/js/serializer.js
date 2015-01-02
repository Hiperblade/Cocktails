// ---

function SerializerConstructor()
{
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

	var BASE_DIRECTORY = "Cocktails";
	var IBA_FILE = "iba.xml";
	var CUSTOM_FILE = "custom.xml";
	
	var _data;
	var _settings;

	var _start = function(callback)
	{
		_data = new CocktailsData();
		_settings = new CocktailsSettings();
		
		System.createIfNotExists(BASE_DIRECTORY, IBA_FILE, function(){ _internalStart(callback); });
	}

	var _internalStart = function(callback)
	{
		_loadData(BASE_DIRECTORY + "/" + IBA_FILE, true, function(){
			_loadData(BASE_DIRECTORY + "/" + CUSTOM_FILE, false, function(){
				for(var i = 0; i < _data.Cocktails().length; i++)
				{
					if(_data.Cocktails()[i].hasVariant())
					{
						_data.addVariantOf(_data.Cocktails()[i].getBaseCocktail(), _data.Cocktails()[i].Id());
					}
				}
				if(callback)
				{
					callback(_data);
				}
			});
		});
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
						_data.Glasses()[nodesParent.childNodes[i].getAttribute(TAG.Id)] = { Description: nodesParent.childNodes[i].getAttribute(TAG.Description), Image: nodesParent.childNodes[i].getAttribute(TAG.Image) };
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
						_data.Ingredients()[nodesParent.childNodes[i].getAttribute(TAG.Id)] = { Description: nodesParent.childNodes[i].getAttribute(TAG.Description), Image: nodesParent.childNodes[i].getAttribute(TAG.Image) };
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

						var baseCocktail = nodesParent.childNodes[i].getAttribute("variantOf");
						if(baseCocktail)
						{
							tmp.setBaseCocktail(baseCocktail);
						}

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
						_data.addCocktail(tmp);
					}
				}
			}
		}
	}

	var _loadData = function(fileName, iba, callback)
	{
		_initializeSettings();
		try
		{
			System.existFile(fileName, function()
			{
				System.readFile(fileName, function(fileContent)
				{
					_loadDataFromXml(fileContent, iba);
					Log.debug("LoadData: " + fileName + "\nTotal cocktails: " + _data.Cocktails().length);
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

	var _updateCustomData = function(callback)
	{
		if(System.supportFileSystem())
		{
			try
			{
				System.existFile(BASE_DIRECTORY + "/" + CUSTOM_FILE, function(fileEntry)
				{
					// leggo il file
					if(callback)
					{
						System.renameFile(BASE_DIRECTORY + "/" + CUSTOM_FILE, BASE_DIRECTORY + "/Old_" + CUSTOM_FILE, function()
						{
							System.readFile(BASE_DIRECTORY + "/Old_" + CUSTOM_FILE, function(fileContent)
							{
								var xmlDoc = fileContent;
								if(!xmlDoc.firstChild)
								{
									xmlDoc = new DOMParser().parseFromString(fileContent, 'text/xml');
								}
								var data = new XMLSerializer().serializeToString(callback(xmlDoc).documentElement);
								System.writeFile(BASE_DIRECTORY + "/" + CUSTOM_FILE, data, function() {
									System.deleteFile(BASE_DIRECTORY + "/Old_" + CUSTOM_FILE);
								});
							});
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
							System.writeFile(BASE_DIRECTORY + "/" + CUSTOM_FILE, new XMLSerializer().serializeToString(callback(xmlDoc).documentElement));
						}
						else
						{
							System.writeFile(BASE_DIRECTORY + "/" + CUSTOM_FILE, new XMLSerializer().serializeToString(xmlDoc.documentElement));
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

	var _initializeSettings = function()
	{
		_settings.ConversionType = BASE_UNIT_MEASURE.CL;
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
				var newValue = nodesParent.getAttribute("conversionType");
				if(newValue)
				{
					_settings.ConversionType = nodesParent.getAttribute("conversionType");
				}
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
					nodesParent.setAttribute("conversionType", _settings.ConversionType);
				}
			}
			return xmlDoc;
		});
	}

	var _saveCustomCocktail = function(cocktail)
	{
		// salva nel file
		_updateCustomData(function(xmlDoc){
			// modifico i dati
			if(_removeCustomCocktail(cocktail.Id()))
			{
				xmlDoc = _deleteInternalCustomCocktail(xmlDoc, cocktail.Id());
			}
			_data.addCocktail(cocktail);

			if(cocktail.getBaseCocktail())
			{
				_data.addVariantOf(cocktail.getBaseCocktail(), cocktail.Id());
			}

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
				newCocktail.setAttribute("variantOf", cocktail.getBaseCocktail());
				
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
		for(var i = 0; i < _data.Cocktails().length; i++)
		{
			if(_data.Cocktails()[i].Id() == cocktailId)
			{
				_data.Cocktails().splice(i, 1);
				return true;
			}
		}
		return false;
	}

	var _deleteCustomCocktail = function(cocktailId)
	{
		if(_removeCustomCocktail(cocktailId))
		{
			// cancella dal file
			_updateCustomData(function(xmlDoc){
				// modifico i dati
				return _deleteInternalCustomCocktail(xmlDoc, cocktailId);
			});
		}
	}
		
	this.start = _start;
	this.getData = function() { return _data; };
	
	this.getSettings = function() { return _settings; };
	this.saveSettings = _saveSettings;
	
	this.saveCustomCocktail = _saveCustomCocktail;
	this.deleteCustomCocktail = _deleteCustomCocktail;
}

Serializer = new SerializerConstructor();
