/*!
 * - XXXXXXXX
 * Core Javascript Methods
 * Copyright 2014, Andrew Cobley
 */

var scene1, scene2;
var line1, line2;
var lineTest;
var word_scene;
var scrollPercent = 0;

var text1, text2, font;

var valleys = ['valley-1','valley-2','valley-3','valley-4','valley-5','valley-6'];

$(function() {

	resizeContainers();

	// Check for WebGL

	if (!window.WebGLRenderingContext)
	{
		// the browser doesn't even know what WebGL is
		//window.location = "http://get.webgl.org";
		initPageNoWebGL();
	} else
	{
		var canvas = document.getElementById("canvas-test");
    	//var ctx = canvas.getContext("webgl");
    	var ctx = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    	console.dir(ctx);
    	if (!ctx)
    	{
			initPageWebGLProblem();
		}
		else 
		{
			initPage();
			init3DText();
		}
	}


  	// Initialise scroller library
	var s = skrollr.init({
		forceHeight: false,
        render: function(data) {
            //Debugging - Log the current scroll position.
            //console.log(data.curTop);
        }
    });

    $(window).resize(function() {
      resizeContainers()
    });

});

function initPage() {

	// Set initial values
	text1 = $('#ThreeD-1').text();
	text2 = $('#ThreeD-2').text();
	font = "lato";

	// Remove No-WebGL section
	$('#text-no-webgl').remove();

	// Add Listeners
	addSettingsListeners();

	// Reset Content Background
	$('#content').css('background', 'none');

	// Initialise Containers Sizings
	resizeContainers();

	// Initialise Valley Positions
	var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
	scrollUpdateValleys(scrollTop);

}

function checkEditAllow(scrollTop) {

	console.log("Check!");

	// Check within bounds to show the edit button.
	if(scrollTop > 20 && scrollTop < 200)
  	{
  		$('#open-settings').css('opacity', 0.7);
  	}
  	else
  	{
  		$('#open-settings').css('opacity', 0);
  	}

}

function checkIfTextFade() {

	var opacity = $('#text-wrapper .text-inner').css('opacity');
  	var margin_top_max = -80;
  	var margin_top = margin_top_max * (1 - opacity);
  	$('#text-wrapper .text-inner h1').css('margin-top', margin_top + "px");
  	console.log(opacity);
}

function addSettingsListeners() {

	// Add listeners to editing features
	$('#open-settings').click(function(e) {
		e.preventDefault();
		clickOpenSettings();
	});
	$('#edit-cancel').click(function() {
		clickEditCancel();
	});
	$('#settings').submit(function(e) {
		clickEditSubmit();
		return false;
	});

	// Add scroll listener
	$(document).scroll(function() {
  		var scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
  		var scrollLimit = $('#text-wrapper').height() * 1.2;
  		scrollPercent = (scrollTop / scrollLimit) * 100;

  		if(scrollPercent < 0) {
  			scrollPercent = 0;
  		}
  		else if (scrollPercent > 100) {
  			scrollPercent = 100;
  		}

  		// Run Update on Valleys
  		scrollUpdateValleys(scrollTop);
  	
  		// Run Update on Text Effects
  		scrollUpdateTextEffects(scrollPercent);

  		// Check if Text Effects Fading
  		checkIfTextFade();

  		// Check If Edit Button should show
  		checkEditAllow(scrollTop);
	});

	// Add resize listener to deal with Line adjustments.
	$(window).resize(function() {
      line1.resize();
      line2.resize();
    });
}

function scrollUpdateValleys(scroll) 
{
	// Valley Parallax
  	var valley = $('#valley-wrapper').position();
  	var valleyLimit = $('#text-wrapper').height() * 1.5;

  	if (scroll > 0 && scroll < valleyLimit) 
  	{
  		var valleyPercent = (scroll / valleyLimit);
  		for (var i = 0; i < valleys.length; i++)
  		{
  			var v = $('#' + valleys[i]);
  			if(v.data('p-max') && v.data('p-min'))
  			{
  				var max = parseInt(v.data('p-max'));
  				var min = parseInt(v.data('p-min'));
  				var bounds =  Math.abs(max) + Math.abs(min);
  				console.log(bounds);

  				var y = (max > min) ? max - (bounds * valleyPercent) : max + (bounds * valleyPercent);
		
				v.css('transform', 'translate(0%, ' + y + '%)');
			}
  		}
  	}
}

function scrollUpdateTextEffects(scrollPercent)
{
  	line1.update(scrollPercent);
  	line2.update(scrollPercent);
}

function clickOpenSettings() {
	console.log("Open Settings");
	$('#text1').val(text1);
	$('#text2').val(text2);
	
	$('#font option[value="' + font + '"]').prop('selected',true);

	$('#edit-wrapper').css('bottom', 0);
	$('#edit-wrapper').fadeIn();
}

function clickEditSubmit() {
	console.log("Submit Edit");

	// Update variables for Text and Font
	text1 = $('#text1').val();
	text2 = $('#text2').val();
	font = $('#font').find(":selected").val();

	// Remove edit options then update the canvas
	$('#edit-wrapper').animate({
		bottom: '120%',
	}, 500, function() {
		$('#edit-wrapper').fadeOut(function() {
			$('canvas').fadeOut(function() {
				init3DText();
				scrollUpdateTextEffects(scrollPercent);
				$('canvas').fadeIn();
			});
		});
	});
}

function clickEditCancel() {
	console.log("Cancel Edit");
	$('#edit-wrapper').fadeOut();
}

function init3DText() {

	// Check settings exist for font, before initialising
	if(effect_settings[font])
	{
		var settings = effect_settings[font];

		line1 = new Line();
  		$('#ThreeD-1').text('');
  		line1.init("ThreeD-1", text1, settings);
	
  		line2 = new Line();
  		$('#ThreeD-2').text('');
  		line2.init("ThreeD-2", text2, settings);
	}
	else
	{
		console.error("FONT EFFECT SETTINGS NOT FOUND");
		// -> OR REVERT TO DEFAULTS?
	}


}

function resizeContainers() {

	// Resize valleys to maintain aspect ratio
	var el = $('div#valley-1');
	var ratio = el.width() / parseInt( el.css('max-width') );
	console.log(el.width());
  	var height = parseInt(el.css('max-height')) * ratio;
  	console.log(height);
  	$('div.valley').height(height);

  	// Update content-wrapper height to mimic content height.
  	$('#content-wrapper').height($('#content').height());

  	// Update body height
  	$('body').height( $('#effects-wrapper').height() + $('#content-wrapper').height() );
}


function initPageNoWebGL() 
{
	$('#text-wrapper').remove()
	$('#edit-wrapper').remove()
	$('#text-no-webgl p').html("I'm really sorry but unfortunately this is so cutting edge that sadly your web browser isn't capable of displaying it.  Fear not, most current versions of desktop browsers <a href='http://get.webgl.org'>support WebGL</a> and mobile browsers will have support soon. If you are completely stuck then you should go and play <a href='http://www.monumentvalleygame.com'>Monument Valley</a> until the world catches up.")
	$('#text-no-webgl').css('display', 'block');
}

function initPageWebGLProblem() 
{
	$('#text-wrapper').remove();
	$('#edit-wrapper').remove();
	$('#text-no-webgl p').html("Hmm, it seems like WebGL is available but not working correctly in your browser. Let's try and <a href='http://get.webgl.org/troubleshooting'>solve the issue!</a>");
	$('#text-no-webgl').css('display', 'block');
}



var rotWorldMatrix;

// Rotate an object around an arbitrary axis in world space       
function rotateAroundWorldAxis(object, axis, radians) {
    rotWorldMatrix = new THREE.Matrix4();
    rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
    
    // >>> REMOVED TO STOP ADDITION
    rotWorldMatrix.multiply(object.matrix);                // pre-multiply

    object.matrix = rotWorldMatrix;

    object.rotation.setFromRotationMatrix(object.matrix);
}


