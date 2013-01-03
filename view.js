var makeView = function(start, xdir, ydir, ping_callback )
{
	var default_position = new Vec([0,0,-866000000]);
	var default_u = new Vec([1,0,0]).unit();
	var default_v = new Vec([0,1,0]).unit();
	
	var pos = start || default_position;
	var u = xdir || default_u;
	var v = ydir || default_v;
	var n = u.cross( v );
	var fovx = 1;
	var fovy = 1;
	var hasmoved = false;
	var actions = {};
	var count = 0;

	var _rotate = function( ve, theta, around )
	{
		// this is basically the extracted arithmetic of multiplying a series of rotational matrixes with vector ve
		var cos = Math.cos(theta);
		var sin = Math.sin(theta);
		var u = around.x();
		var v = around.y();
		var w = around.z();
		var x = ve.x();
		var y = ve.y();
		var z = ve.z();
		var rx = u*(u*x+v*y+w*z)*(1-cos)+x*cos+(-1*w*y+v*z)*sin;
		var ry = v*(u*x+v*y+w*z)*(1-cos)+y*cos+(w*x-u*z)*sin;
		var rz = w*(u*x+v*y+w*z)*(1-cos)+z*cos+(-1*v*x+u*y)*sin;
		return new Vec([rx,ry,rz]);
	};

	return {
		rotate: function( angle, about ) {
			var local_u = _rotate(u,angle,about);
			var local_v = _rotate(v,angle,about);
			u = local_u.unit();
			v = local_v.unit();
			n = u.cross( v );
		},
		tick: function(keys) {
			if( count++ % 3000 === 0 && hasmoved )
			{
				ping_callback( this );
				hasmoved = false;
			}
			var captainspeedy = undefined;
			for(var k = 0; k < keys.length; k++ )
			{
				if( keys[k] === 16 )
					captainspeedy = true;
			}
			for( var k = 0; k < keys.length; k++ )
			{
				if(actions[keys[k]] !== undefined )
				{
					actions[keys[k]](this,captainspeedy);
					hasmoved = true;
				}
			}
		},
		u: function() { return u; },
		v: function() { return v; },
		n: function() { return n; },
		pos: function() { return pos; },
		moveTo: function( newpos ) { pos = newpos; },
		reset: function(){ pos = default_position; u = default_u; v = default_v; n = u.cross( v ); },
		addAction: function( key, action ){
			actions[key] = action;
		},
		draw: function( context, w,h,obj ) { // draw: draw obj on context which has width w, height h
			var p = obj.pos().sub( this.pos() ); // p is vector pointing from viewport to object
			var ndist = p.dot( this.n() ); // project p onto the viewport normal to get how far away object is along the axis
			if( ndist > -1*fovx*w ) // if object should be drawn, (i.e. if distance is positive)
			{
				var x = p.dot( this.u()); // project p onto x and y viewport axises
				var y = p.dot( this.v()); // these are the actual coordinates in the vector space of object as viewed from viewport
				
				//calculate the scaled down coordinates and size of object that represent the x and y coordinates of draw location. 
				var cx = (x*fovx*w) / (ndist+fovx*w) + w/2;
				var cy = (y*fovy*h) / (ndist+fovy*h) + h/2;
				var obj_observed_size = obj.r()*fovx*w/(ndist+fovx*w);

				if( cx < w && cy < h && cx >= 0 && cy >= 0 )
				{
					context.fillStyle = obj.style();
					context.beginPath();
					context.arc( cx, cy, obj_observed_size, 0, Math.PI*2, true); // draw circle at cx,cy
					context.fill();
				}
			}
		},
		drawguides: function( context, w,h){ // draw axis unit vectors in corner
		
		var drawAxis = function( color, vector ){
			var x = vector.dot( u );
			var y = vector.dot( v );
			
			context.strokeStyle = color;
			context.lineWidth = 2;
			context.beginPath();
			context.moveTo(50,50);
			context.lineTo(50*x+50,50*y+50);
			context.stroke();
		};
		
		drawAxis( "red", new Vec([0,0,1]));
		drawAxis( "green", new Vec([0,1,0]));
		drawAxis( "blue", new Vec([1,0,0]));
		
		context.fillStyle = "white";
		context.font = "12px";
		context.fillText( this.pos().info(), 100, 20 );
		
		}
	};
};
