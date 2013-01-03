var makeInterstellar = function( radius, position, color )
{
  var _radius = radius;
	var _pos = position;
	var _color = color;
	return {
		r: function() {return _radius;},
		tick: function(){},
		pos: function() {return _pos;},
		style: function(){return _color;}
	};
};

var _t89c = makeT89C();
var _RE = 6.378e6;
var _c = 3e8;
var _c2 = _c*_c;

// energy decides particle speed, velocity is only the unit vector for the velocity direction
function Particle( energy, position, velocity, halt )
{
	// this whole function is a javascript port of the brilliant work of Emelie Holm. Without her thesis, this simulation would be very boring indeed.
	var eV = 1.60218e-19;
	this._q = 1.602e-19;
	this._m = 1.6726e-27;
	this._style = "#77F";
	this._radius = 6e5;
	this._halt =halt;


	var E = (energy  || 1e6)*eV;

	var emc = (E/(this._m*_c2)+1);
	var absv = _c*Math.sqrt( 1 - 1/(emc*emc));
	var g = 1/Math.sqrt(1-(absv*absv)/_c2);

	this._r = position;
	this._v = (velocity || new Vec([
		 (Math.random()-0.5),
		(Math.random()-0.5),
		 (Math.random()-0.5)
	]).unit()).mul(absv);
	this._p = this._v.mul(this._m*g);

	this.ef_pos = position;
	this.we_are_done = false;
};

		Particle.prototype.pos = function() { return this.ef_pos; };
		Particle.prototype.tick = function(dt) {

			if( this.we_are_done )
			{
				return
			}

			if( this._halt !== undefined )
			{
				this.we_are_done = this._halt( this.pos() );
				if( this.we_are_done )
				{
					this._style = "red";
					this._radius = 1e5;
				}
			}

			var t_b = _t89c( 3,[],0, this._r.x()/_RE, this._r.y()/_RE, this._r.z()/_RE );

        	var B_field =new Vec([t_b.bx,t_b.by,t_b.bz]).mul( 1e-9 );

			var A = this._v.mul(this._q);
			var F = A.cross(B_field);

			this._p = this._p.add( F.mul(dt) );
			var pabs = this._p.abs();
			this._v = this._p.mul(1/Math.sqrt(this._m*this._m+(pabs*pabs)/_c2));
			this._r = this._r.add(this._v.mul(dt) );


			this.ef_pos = new Vec(this._r.data);
		};
		Particle.prototype.r = function(){ return this._radius;};
		Particle.prototype.style = function(){return this._style;};

var setVpMovementActions = function( view )
{
	var movevp = function( vp, direction, multiplier ) {
		vp.moveTo( vp.pos().add( direction.mul( multiplier ) ) )
	};
	var addMoveActions = function( a, s, selector )
	{
		view.addAction( a, function(vp,c){ movevp( vp, selector(vp), 1e6*(c===undefined?1:20) ) } );
		view.addAction( s, function(vp,c){ movevp( vp, selector(vp), -1e6*(c===undefined?1:20) ) } );
	};
	addMoveActions( 87, 83, function(vp){ return vp.n() } ); // w s
	addMoveActions( 68, 65, function(vp){ return vp.u() } ); // d a
	addMoveActions( 81, 69, function(vp){ return vp.v() } ); // q e
	view.addAction( 88, //x
	function(vp){ vp.reset() } );
	var rotatevp = function( vp, angle, about )
	{
		vp.rotate( angle, about );
	};
	var addRotActions = function( a, s, selector)
	{
		var rotatespeed = 0.005*2*Math.PI;
		view.addAction( a, function(vp){rotatevp( vp, rotatespeed, selector(vp) ) } );
		view.addAction( s, function(vp){rotatevp( vp, -1*rotatespeed, selector(vp) ) } );
	};

	addRotActions( 73,75,function(vp){return vp.u() }); //ik
	addRotActions( 76,74,function(vp){return vp.v() }); //lj
	addRotActions( 79,85,function(vp){return vp.n() }); //ou
};

var setParticleControlActions = function( view, drawlist )
{
	var frameTimeStamp = new Date().getTime();
	// stuff already in drawlist are always supposed to be there
	var defaultobjects = [];
	for( var d in drawlist )
	{
		defaultobjects.push( drawlist[d] );
	}
	var moon = defaultobjects[0];
	var earth = defaultobjects[1];	
	// clear all particles.
	view.addAction( 67, // c
	function() {
		drawlist.length = 0;
		for( d in defaultobjects )
			drawlist.push( defaultobjects[d]);
	}); 
	
	// boxed-in moon
	view.addAction( 86, // v
	function(){

		var current = new Date().getTime();
		if( current - frameTimeStamp < 1000 )
			return;
		frameTimeStamp = new Date().getTime();
	for( var i = -300e6; i< 131e6; i+=34e6 )
		for( var j = -100e6; j< 101e6; j+=35e6 )
			for( var k = -100e6; k< 101e6; k+=36e6 )
			{
				var part_pos = moon.pos().mul(0.5).add(new Vec([i,j,k]));
				drawlist.push( new Particle(
					1e8,
					part_pos,
					moon.pos().sub(part_pos).unit(),
					function(p){
					if(p.sub(moon.pos()).abs() < moon.r() )
					{
						return true;
					}
					return p.sub(earth.pos()).abs() < earth.r();
				}));
			}
	});
	
	var energies = [1e6,1e7,1e8,1e9,1e10,1e11,1e12];
	var MJ = 3844e5;
	var energycounter = 0;
	var selectenergy = function()
	{
		return energies[energycounter++ % energies.length];
	};
	view.addAction( 78, // n
		function(){

			var current = new Date().getTime();
			if( current - frameTimeStamp < 1000 )
				return;
			frameTimeStamp = new Date().getTime();

			var energy = selectenergy();
			for( var j = 1; j<37;j++)
			{
				var theta = j*10*Math.PI/180;
				var r = new Vec([(-MJ+(MJ+10*_RE)*Math.cos(theta)),
					(MJ+10*_RE)*Math.sin(theta), 0]);
				var v = new Vec([-Math.cos(theta),-Math.sin(theta),0]).unit();
				drawlist.push( new Particle( energy, r, v,
					function(p){
					if(p.sub(moon.pos()).abs() < moon.r() )
					{
						return true;
					}
					return p.sub(earth.pos()).abs() < earth.r();
					}));

				}
		});
	// circle around moon
	view.addAction( 66, // b
	function(){

		var current = new Date().getTime();
		if( current - frameTimeStamp < 1000 )
			return;
		frameTimeStamp = new Date().getTime();

		var energy = selectenergy();
		for( var i = 0; i<50;i++)
		{
			var theta = i * (2/50)*Math.PI;
			var directionv = new Vec([Math.sin(theta),Math.cos(theta),0]);
			var part_pos = moon.pos().add( directionv.mul(MJ) );
			drawlist.push( new Particle(
				energy,
				part_pos,
				moon.pos().sub(part_pos).unit(),
				function(p){
					if(p.sub(moon.pos()).abs() < moon.r() )
					{
						return true;
					}
					return p.sub(earth.pos()).abs() < earth.r();
				}));
		}

		 });
	
};

var makeMoonSim = function()
{
	var sundist = 1.52e11;
	var drawables = [];
	var moon = makeInterstellar( 1.7371e6, new Vec([-3844e5,0,0]), "white" );
	var earth = makeInterstellar( 6.4e6, new Vec(), "blue" );
	var sun  = makeInterstellar( 7e8, new Vec([sundist,0,0]), "yellow" );
	var vp_start = moon.pos().add(new Vec([0,0,-1*_RE*30]));
	var xdir = undefined;
	var ydir = undefined;
	
	var setifdef = function( data, setter )
	{
		if( data !== null && data !== undefined )
		{
			var parsed = JSON.parse(data);
			setter(new Vec(parsed));
		}
	};
	
	if( typeof(localStorage) !== undefined )
	{
		setifdef( localStorage.getItem( "viewport_position" ), function(d){ vp_start = d; } );
		setifdef( localStorage.getItem( "viewport_u" ), function(d){ xdir = d; } );
		setifdef( localStorage.getItem( "viewport_v" ), function(d){ ydir = d; } );
	}
	
	var setStorageVec = function( label, v )
	{
		var jsonData = JSON.stringify( v.data );
		localStorage.setItem(label,jsonData);
	};
	
	var touch_storage = function( vp )
	{
		if( typeof(localStorage) !== undefined )
		{
			setStorageVec( "viewport_position", vp.pos() );
			setStorageVec( "viewport_u", vp.u() );
			setStorageVec( "viewport_v", vp.v() );
		}
	};
	
	var viewport = makeView(vp_start,xdir,ydir,touch_storage);
	setVpMovementActions( viewport );

	drawables.push(moon);
	drawables.push(earth);
	drawables.push(sun);

	drawables.push( makeInterstellar( 2.5e6, new Vec([sundist-6.982e10,0,0]), "white" ) ); //mercury
	drawables.push( makeInterstellar( 6e6, new Vec([sundist-1.089e11,0,0]), "white" ) ); //venus
	drawables.push( makeInterstellar( 3.3e6, new Vec([sundist-2.49e11,0,0]), "red" ) ); //mars

	drawables.push( makeInterstellar( 7e7, new Vec([sundist-8.16e11,0,0]), "orange" ) ); //jupiter
	drawables.push( makeInterstellar( 6e7, new Vec([sundist-1.513e12,0,0]), "gold" ) ); //saturn
	drawables.push( makeInterstellar( 2.5e7, new Vec([sundist-3e12,0,0]), "cyan" ) ); //uranus
	drawables.push( makeInterstellar( 2.4e7, new Vec([sundist-4.553e12,0,0]), "#aaf" ) ); //neptune




	setParticleControlActions( viewport, drawables );
	
	var lastmark = -1;
	
	var sortFunction = function(a,b){
		var v1 = b.pos().sub( viewport.pos() ).abs();
		var v2 = a.pos().sub( viewport.pos() ).abs();
		return v1 - v2;
	};

	return function( context, width, height, mark, keys ) {
		if( lastmark < 0 )
			lastmark =mark;
		viewport.tick( keys );
		for( var d in drawables )
		{
			drawables[d].tick( (mark - lastmark)/10000 ); // magic number here, since mark is measured in seconds*10^-5
		}
		
		drawables.sort( sortFunction ); // if we dont sort, stuff farther away may be drawn on top of closer stuff, it's a makeshift z-buffer

		for( var d2 in drawables )
		{
			viewport.draw( context, width,height, drawables[d2] );
		}
		viewport.drawguides( context, width, height );
		lastmark = mark;
	};
};
