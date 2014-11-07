// ---
var ScreenOrientation = { PORTRAIT: 0, LANDSCAPE: 1 };

function CordovaAppConstructor()
{
	var _initialize = function()
	{
		document.addEventListener('deviceready', _onDeviceReady, false);
	};

	var _onDeviceReady = function()
	{
		document.addEventListener('menubutton', _onMenuButton, false);
		document.addEventListener("backbutton", _onBackButton, false);
		window.addEventListener("orientationchange", _onOrientationChange);

		System.initialize(function(){ Book.start(); });
	};

	var _onMenuButton = function()
	{
		Book.showMenu();
	};

	var _onBackButton = function()
	{
		// nascondo il menù se è aperto o sospendo il libro se è aperto
		if(!Book.backMenu())
		{
			// esco dall'applicazione
			navigator.app.exitApp();
			}
	};

	var _onOrientationChange = function()
	{
		Book.onOrientationChange();
	};

	this.initialize = _initialize;
	this.currentOrientation = function()
	{
		if((window.orientation == 90) || (window.orientation == -90))
//		if(window.outerWidth > window.outerHeight)
		{
			return ScreenOrientation.LANDSCAPE;
		}
		return ScreenOrientation.PORTRAIT;
	};
}

CordovaApp = new CordovaAppConstructor();
