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
			if(this.onInitialize)
			{
				this.onInitialize();
			}
		});
	};

	var _onMenuButton = function()
	{
		if(this.onMenuButton)
		{
			this.onMenuButton();
		}
	};

	var _onBackButton = function()
	{
		if(this.onBackButton)
		{
			if(!this.onBackButton())
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
		if(this.onOrientationChange)
		{
			this.onOrientationChange();
		}
	};

	var _onSwipeLeft = function()
	{
		if(this.onSwipeLeft)
		{
			this.onSwipeLeft();
		}
	};
	
	var _swipeRight = function()
	{
		if(this.onSwipeRight)
		{
			this.onSwipeRight();
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
	
	this.onInitialize = function() { View.start(); };
	this.onMenuButton = null;
	this.onBackButton = null;
	this.onOrientationChange = null;
	this.onSwipeLeft = null;
	this.onSwipeRight = null;
}

CordovaApp = new CordovaAppConstructor();
