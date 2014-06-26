function makeLog()
{
	var counter = 0;
	var timestamp = new Date().getTime();
	var fps = 0;
	return function(context, width, height, mark, pressedkeys)
	{
		counter++;
		var took = new Date().getTime() - timestamp;
		if( took > 1000 )
		{
			var load = took/counter;
			fps = 1000/load;
			counter =0;
			timestamp=new Date().getTime();
		}
		
		context.fillStyle = "white";
		context.font = "12px";
		context.fillText( "FPS: " + Math.round(fps), 120, 40 );
		context.fillText( "WASD - Move, Shift for speed",120, 60 );
		context.fillText( "IJKL - Rotate",120, 70 );
		context.fillText( "XC - Reset",120, 80 );
		context.fillText( "FVB - Particles",120, 90 );
	};
}

function getEventKey(event){
	if(event == null)
		return window.event.keyCode;
	else
		return event.keyCode;
};

function makeKeyHandler()
{
	pressedkeys = [];
	document.onkeyup = function(event) {
		var keyCode = getEventKey(event);
		for( var k =0;k< pressedkeys.length;k++ )
		{
			if( pressedkeys[k] === keyCode )
			{
				pressedkeys.splice(k,1);
				return;
			}
		}
	}

	document.onkeydown = function(event) {
		var keyCode = getEventKey(event);
		for( var k =0;k< pressedkeys.length;k++ )
		{
			if( pressedkeys[k] === keyCode )
				return;
		}
		pressedkeys.push( keyCode );
	};
	
	return {
		pressedkeys: pressedkeys
	};
}


function makeEngine( canvas )
{
	var workers = [];
	var kh = makeKeyHandler();
	var triggerWork = function( context, width, height, mark )
	{
		for (var worker =0; worker< workers.length; worker++)
		{
			workers[worker](context, width, height, mark, kh.pressedkeys);
		}
	};

	var animate = function()
	{
		var context = canvas.getContext("2d");
		var frameTimeStamp = new Date().getTime() - startTime;
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.canvas.width  = window.innerWidth-10;
		context.canvas.height = window.innerHeight-50;
		triggerWork(context, canvas.width, canvas.height, frameTimeStamp );

		// request new frame
		requestAnimFrame(function(){
			animate();
		});
	};

	window.requestAnimFrame = (function(){
		return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback){
				window.setTimeout(callback, 1000 / 60);
			};
	})();

	var startTime = undefined;

	return {
		add: function( fn )
		{
			workers.push(fn);
		},
		start: function(){
			startTime = new Date().getTime();
			animate();
		}
	};
}
