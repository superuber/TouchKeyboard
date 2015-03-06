(function() {


	var keyboard;
	var input;
	var inputList;

	var currentKey;
	var currentTooltip;
	var currentKeyboard;

	var shiftOption = 0;

	var timerId;


	function setup() 
	{
		var baseUrl = "";
		if (chrome && chrome.extension && chrome.extension.getURL) {
			baseUrl = chrome.extension.getURL("");
		}

		$.get(baseUrl+"style.css", function (data) {
			$("head").append('<style type="text/css">'+data+'</style>');
		});

		$.get(baseUrl+"keyboard.html", function (data) {

			keyboard = $(data).mousedown(onMouseDown).mouseup(onMouseUp).mousemove(onMouseMove);
			hideKeyboard();
			setKeyboard(1);
			
			$("img", keyboard).each(function(){
				$(this).attr("src", baseUrl+$(this).attr("src"));
			});

			inputList = $("input").focus(onFocus).blur(onBlur);
			
			keyboard.appendTo("body");
		});
	}
		
	function onFocus(e)
	{
		input = this;
		updateEnterOption();
		showKeyboard();
	}
		
	function onBlur()
	{
		input = null;
		hideKeyboard();
	}
		
	function showKeyboard()
	{
		setKeyboard(1);
		keyboard.show();
	}
		
	function hideKeyboard()
	{
		keyboard.hide();
	}

	function onMouseDown(e)
	{
		e.preventDefault();

		setCurrentKey($(e.target));

		clearTimeout(timerId);
		timerId = setTimeout(showTooltip, 500);
	}
	
	function onMouseUp(e)
	{
		processKey();

		setCurrentKey(null);
		hideTooltip();
	}

	function onMouseMove(e)
	{
		if (currentTooltip) {
			updateTooltip(e.pageX);
		}
	}
	
	function showTooltip()
	{
		if (currentTooltip) {
			hideTooltip();
		}
		if (currentKey) {
			currentTooltip = $("#tooltip_"+getKeyValue());
			if (currentTooltip.length > 0) {
				currentTooltip.show();
				updateTooltip(currentKey.offset().left);
			}
		}
	}
	
	function hideTooltip()
	{
		if (currentTooltip) {
			currentTooltip.hide();
		}
		currentTooltip = null;
	}
	
	function updateTooltip(mouseX)
	{
		var buttons = currentTooltip.children();
		var index = 0;
		for (var i = 0; i < buttons.length; i++) {
			if (buttons.eq(i).offset().left < mouseX) {
				index = i;
			} else {
				break;
			}
		}
		setCurrentKey(buttons.eq(index));
	}
	
	function setCurrentKey(_currentKey)
	{
		if (currentKey) {
			currentKey.removeClass("active");
		} 
		currentKey = _currentKey;
		if (currentKey) {
			currentKey.addClass("active");
		} 
	}
	
	function getKeyValue()
	{
		if (currentKey) {
			return currentKey.attr("data-key");
		} 
		return null;
	}

	function processKey()
	{	
		var key = getKeyValue();

		if (!key || !input) {
			return;
		}

		switch(key)	{

			case "changeKeyboard":
				setKeyboard(currentKey.attr("data-keyboardId"));
				break;

			case "shift":
				setShiftOption(shiftOption+1);
				break;

			case "enter":
				var index = inputList.index(input);
				if (index == inputList.length-1) {
					$(input).closest("form").submit();
				}  else {
					inputList.eq(index+1).focus();
				}
				setShiftOption(1);
				break;

			case "backspace":
				var pos = input.selectionStart;
				var posEnd = input.selectionEnd;
				if (posEnd == pos) {
					pos = pos-1;
				}
				input.value = input.value.substr(0, pos)+input.value.substr(posEnd);
				input.selectionStart = pos;
				input.selectionEnd = pos;
				if (shiftOption == 1) {
					setShiftOption(1);
				}
				break;

			default:
				if (shiftOption > 0) {
					key = key.toUpperCase();
				}
				var pos = input.selectionStart;
				var posEnd = input.selectionEnd;
				input.value = input.value.substr(0, pos)+key+input.value.substr(posEnd);
				input.selectionStart = pos+1;
				input.selectionEnd = pos+1;
				if (shiftOption == 1) {
					setShiftOption(1);
				}
				break;
		}
	}

	function setKeyboard(keyboardId)
	{
		if (currentKeyboard) {
			currentKeyboard.hide();	
		}
		currentKeyboard = $("#keyboard-"+keyboardId).show();
		setShiftOption(1);
	}

	function setShiftOption(_shiftOption)
	{	
		if (shiftOption == _shiftOption) {
			return;
		}

		$(".shift").removeClass("option-"+shiftOption);
		shiftOption = _shiftOption;
		if (shiftOption > 3) {
			shiftOption = 1;
		} 
		$(".shift").addClass("option-"+shiftOption);

		if (shiftOption > 1) {
			$(".hasCaps").each(buttonToUpperCase);
		} else {
			$(".hasCaps").each(buttonToLowerCase);
		}
	}

	function buttonToUpperCase()
	{	
		$(this).html($(this).html().toUpperCase());
	}

	function buttonToLowerCase()
	{	
		$(this).html($(this).html().toLowerCase());
	}

	function updateEnterOption()
	{
		if (input) {
			var index = inputList.index(input);	
			if (index == inputList.length-1) {
				$(".enter").removeClass("option-1").addClass("option-2");
			} else {
				$(".enter").addClass("option-1").removeClass("option-2");
			}
		}
	}

	setup();

})();