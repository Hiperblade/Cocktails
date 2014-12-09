// ---

function ControllerConstructor()
{
	var _filter = new CocktailsFilter();
	var _currentCocktail = null;

	var _showingSettings = false;
	var _showingEditor = false;

	var _start = function()
	{
		Serializer.start( function(){ View.showList(); } );
	}
	
	var _getNextVariantOf = function(baseCocktail, cocktail)
	{
		if(!Boolean(baseCocktail))
		{
		
			if(!Serializer.getData().Variants()[cocktail])
			{
				return null;
			}
			else
			{
				return Serializer.getData().Variants()[cocktail][0];
			}
		}

		var index = Serializer.getData().Variants()[baseCocktail].indexOf(cocktail);
		if(index < Serializer.getData().Variants()[baseCocktail].length - 1)
		{
			return Serializer.getData().Variants()[baseCocktail][index + 1];
		}
		else
		{
			return baseCocktail;
		}
	}

	var _getList = function(filter)
	{
		var data = Serializer.getData();
		if(filter)
		{
			_filter = filter;
		}
		if(filter.Classification != null || filter.DescriptionLike != null)
		{
			var ret = [];
			for(var i = 0; i < data.Cocktails().length; i++)
			{
				if((_filter.DescriptionLike == null || data.Cocktails()[i].Description().toLowerCase().indexOf(_filter.DescriptionLike.toLowerCase().trim()) != -1)
				&& (_filter.Classification == null || data.Cocktails()[i].Classification() == _filter.Classification))
				{
					ret.push(data.Cocktails()[i]);
				}
			}
			return ret;
		}
		else
		{
			return data.Cocktails();
		}
	}

	var _setCurrentCocktail = function(id)
	{
		if(Boolean(id))
		{
			var data = Serializer.getData();
			for(var i = 0; i < data.Cocktails().length; i++)
			{
				if(data.Cocktails()[i].Id() == id)
				{
					var ret = false;
					if(_currentCocktail == null)
					{
						ret = true;
					}
					_currentCocktail = data.Cocktails()[i];
					View.showCocktail(_currentCocktail);
					return ret;
				}
			}
		}
		else
		{
			_currentCocktail = null;
			View.showList();
		}
	}
	
	var _addVariantOf = function(baseCocktail, variant)
	{
		var data = Serializer.getData();
		data.addVariantOf(baseCocktail, variant);
	}
	
	var _getMenuButtons = function()
	{
		if(_showingSettings == true)
		{
			return [ { Command: "SAVE", Image: "img/save.svg", Text: "Save" },
				 { Command: "CANCEL", Image: "img/cancel.svg", Text: "Cancel" } ];
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
	}
	
	var _execute = function(cmd)
	{
		switch(cmd)
		{
			case "SETTINGS":
				_showingSettings = true;
				View.showSettings(Serializer.getSettings());
				break;
			case "ADD":
				_showingEditor = true;
				var newCocktail;
				if(_currentCocktail)
				{
					newCocktail = _currentCocktail.clone();
					if(_currentCocktail.getBaseCocktail())
					{
						newCocktail.setBaseCocktail(_currentCocktail.getBaseCocktail());
					}
					else
					{
						newCocktail.setBaseCocktail(_currentCocktail.Id());
					}
				}
				else
				{
					newCocktail = new Cocktail("", "", "AllDay", "Cocktail", "Higt", false);
				}
				View.showEditor(newCocktail);
				break;
			case "EDIT":
				_showingEditor = true;
				View.showEditor(_currentCocktail);
				break;
			case "DELETE":
				Serializer.deleteCustomCocktail(_currentCocktail.Id());
				_currentCocktail = null;
				View.showList();
				break;
			case "SAVE":
				if(_showingSettings == true)
				{
					_showingSettings = false;
					Serializer.saveSettings();
					if(_currentCocktail != null)
					{
						View.showCocktail(_currentCocktail);
					}
					else
					{
						View.showList();
					}
				}
				else if(_showingEditor == true)
				{
					_showingEditor = false;
					_currentCocktail = View.getEditorCustomCocktail();
					Serializer.saveCustomCocktail(_currentCocktail);
					View.showCocktail(_currentCocktail);
				}
				break;
			case "CANCEL":
				if(_showingSettings == true)
				{
					_showingSettings = false;
					if(_currentCocktail != null)
					{
						View.showCocktail(_currentCocktail);
					}
					else
					{
						View.showList();
					}
				}
				else if(_currentCocktail.Id() == "")
				{
					_showingEditor = false;
					_currentCocktail = null;
					View.showList();
				}
				break;
		}
	}
	
	var _back = function()
	{
		if(_showingSettings == true)
		{
			_showingSettings = false;
			if(_currentCocktail != null)
			{
				View.showCocktail(_currentCocktail);
			}
			else
			{
				View.showList();
			}
			return true;
		}
		else if(_showingEditor == true)
		{
			_currentCocktail = null;
			_showingEditor = false;
			View.showList();
			return true;
		}
		else if(_currentCocktail != null)
		{
			_currentCocktail = null;
			View.showList();
			return true;
		}
		return false;
	}
	
	this.start = _start;
	this.setSettings = function(key, value) { Serializer.getSettings()[key] = value; }
	this.getSettings = function(key) { return Serializer.getSettings()[key]; }
	this.getData = function() { return Serializer.getData(); };
	this.getList = _getList;
	this.getNextVariantOf = _getNextVariantOf;
	this.setCurrentCocktail = _setCurrentCocktail;
	this.addVariantOf = _addVariantOf;
	// menù
	this.getMenuButtons = _getMenuButtons;
	this.execute = _execute;
	this.back = _back;
}

Controller = new ControllerConstructor();

CordovaApp.onInitialize = function() { View.start(); };
CordovaApp.onMenuButton = function() { View.showMenu(); };
CordovaApp.onBackButton = function() { return View.backMenu(); };
CordovaApp.onOrientationChange = function() { View.onOrientationChange(); };
