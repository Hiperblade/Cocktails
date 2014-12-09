// ---
var BASE_UNIT_MEASURE = { CL: "CL", OZ: "OZ", OZQ: "OZQ" };
var UNIT_MEASURE = { Cl: "", Fill: "fill", Pcs: "pcs", Splash: "spash", Spoon: "spoon", Drop: "drop" };
var CLASSIFICATION = [ "Shot", "LongDrink", "AfterDinner", "BeforeDinner", "AllDay", "Refreshing", "Sparkling", "HotDrink" ];
var TECHNIQUES = [ "Blend", "Build", "Layer", "Mix & Pour", "Muddler", "Shake & Strain", "Shake & Strain on Rocks", "Shake & Pour", "Stir & Strain", "Swizzle", "Throwing" ];
var ALCOHOLIC_LEVELS = [ "None", "Low", "Medium-Low", "Medium", "Medium-High", "High" ];

function Cocktail(id, description, classification, glass, alcoholicLevel, iba)
{
	var _id = id;
	var _description = description;
	var _classification = classification;
	var _glass = glass;
	var _alcoholicLevel = alcoholicLevel;
	var _iba = iba;

	var _baseCocktail = null;

	var _info = "";
	var _technique = "";
	var _garnish = "";
	var _ingredients = { };
	
	var _addIngredient = function(id, quantity, unitMeasure)
	{
		_ingredients[id] = { Quantity: quantity, UnitMeasure: unitMeasure };
	}
	
	var _clone = function()
	{
		var ret = new Cocktail("", _description + " new", _classification, _glass, _alcoholicLevel, false);
		ret.setInfo(_technique, _garnish, _info);
		for(var id in _ingredients)
		{
			ret.addIngredient(id, _ingredients[id].Quantity, _ingredients[id].UnitMeasure);
		}
		return ret;
	}

	this.Id = function () { return _id; };
	this.Description = function () { return _description; };
	this.Classification = function () { return _classification; };
	this.Glass = function () { return _glass; };
	this.AlcoholicLevel = function() { return _alcoholicLevel; };
	this.Iba = function() { return _iba; };

	this.setBaseCocktail = function(baseCocktail) { _baseCocktail = baseCocktail; };
	this.getBaseCocktail = function() { return _baseCocktail; };
	this.hasVariant = function() { return Boolean(_baseCocktail); };

	this.setInfo = function (technique, garnish, value) { _technique = technique; _garnish = garnish; _info = value; };
	this.Technique = function () { return _technique; };
	this.Garnish = function () { return _garnish; };
	this.Info = function () { return _info; };

	this.addIngredient = _addIngredient;
	this.getIngredients = function() { return _ingredients; };
	
	this.clone = _clone;
}

function CocktailsData()
{
	var _glasses = {};
	var _ingredients = {};
	var _cocktails = [];
	var _variants = {};
	
	var _getCocktail = function(cocktailId)
	{
		for(var i = 0; i < _cocktails.length; i++)
		{
			if(_cocktails[i].Id() == cocktailId)
			{
				return _cocktails[i];
			}
		}
		return null;
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
	
	var _addVariantOf = function(baseCocktail, variant)
	{
		if(!_variants[baseCocktail])
		{
			_variants[baseCocktail] = [];
		}

		for(var i = 0; i < _variants[baseCocktail].length; i++)
		{
			if(_getCocktail(variant).Description().toLowerCase() < _getCocktail(_variants[baseCocktail][i]).Description().toLowerCase())
			{
				_variants[baseCocktail].splice(i, 0, variant);
				return;
			}
		}
		_variants[baseCocktail].push(variant);
	}
	
	this.Glasses = function(){ return _glasses; }
	this.Ingredients = function(){ return _ingredients; };
	this.Cocktails = function(){ return _cocktails; };
	this.Variants = function(){ return _variants; };
	this.getCocktail = _getCocktail;
	this.addCocktail = _addCocktail;
	this.addVariantOf = _addVariantOf;
}

function CocktailsSettings()
{
	this.BaseUnitMeasure = BASE_UNIT_MEASURE.CL;
}

function CocktailsFilter()
{
	this.DescriptionLike = null;
	this.Classification = null;
}