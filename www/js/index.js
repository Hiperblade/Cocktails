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

		//$('#mainPage').bind('swipeleft', _onSwipeLeft);
		//$('#mainPage').bind('swiperight', _onSwipeRight);
		
		System.initialize(function()
		{
			if(CordovaApp.onInitialize)
			{
				CordovaApp.onInitialize();
			}
		});
	};

	var _onMenuButton = function()
	{
		if(CordovaApp.onMenuButton)
		{
			CordovaApp.onMenuButton();
		}
	};

	var _onBackButton = function()
	{
		if(CordovaApp.onBackButton)
		{
			if(!CordovaApp.onBackButton())
			{
				// esco dall'applicazione
				navigator.app.exitApp();
			}
		}
		else
		{
			// esco dall'applicazione
			navigator.app.exitApp();
		}
	};

	var _onOrientationChange = function()
	{
		if(CordovaApp.onOrientationChange)
		{
			CordovaApp.onOrientationChange();
		}
	};

	var _onSwipeLeft = function()
	{
		if(CordovaApp.onSwipeLeft)
		{
			CordovaApp.onSwipeLeft();
		}
	};
	
	var _swipeRight = function()
	{
		if(CordovaApp.onSwipeRight)
		{
			CordovaApp.onSwipeRight();
		}
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
