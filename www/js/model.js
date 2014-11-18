// ---
var BASE_UNIT_MEASURE = { CL: "CL", OZ: "OZ", OZQ: "OZQ" };
var UNIT_MEASURE = { Cl: "", Fill: "fill", Pcs: "pcs", Splash: "spash", Spoon: "spoon", Drop: "drop" };
var CLASSIFICATION = [ "Shot", "LongDrink", "AfterDinner", "BeforeDinner", "AllDay", "Refreshing", "Sparkling", "HotDrink" ];
var TECHNIQUES = [ "Build", "Layer", "Mix &amp; Pour", "Muddler", "Shake &amp; Strain", "Stir &amp; Strain" ];
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
}

function CocktailsData()
{
	this.Glasses = {};
	this.Ingredients = {};
	this.Cocktails = [];
	this.Variants = {};
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