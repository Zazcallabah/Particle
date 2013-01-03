var T = function( x )
{
  var temp = x;
	
	this.data = function(){return temp;}
	this.touch = function(){temp*=2;}
}

describe('lets test objects', function(){
	it('contains own fields', function(){
		var a = new T(4);
		var b = new T(5);
		expect( a.data() ).toBe( 4 );
		expect( b.data() ).toBe( 5 );
		b.touch();
		expect( a.data() ).toBe( 4 );
		expect( b.data() ).toBe( 10 );
	});
});

describe('given vectors', function(){
	describe('when subtracting', function(){
	it('zero vector from 1 results in same vector', function(){
		var v1 = new Vec([1,1,1]);
		var v2 = new Vec([0,0,0]);

		var result = v1.sub(v2);
		expect( result.x()).toBe( 1 );
		expect( result.y()).toBe( 1 );
		expect( result.z()).toBe( 1 );
	});
	it('same vector from same results in zero vector', function(){
		var v1 = new Vec([1,1,1]);
		var v2 = new Vec([1,1,1]);

		var result = v1.sub(v2);
		expect( result.x()).toBe( 0 );
		expect( result.y()).toBe( 0 );
		expect( result.z()).toBe( 0 );
	});

	it('a vector from another', function(){
		var v1 = new Vec([3,2,1]);
		var v2 = new Vec([1,2,3]);

		var result = v1.sub(v2);
		expect( result.x()).toBe( 2 );
		expect( result.y()).toBe( 0 );
		expect( result.z()).toBe( -2 );
	});
	it('can subtract negative vector values', function(){
		var v1 = new Vec([3,2,-1]);
		var v2 = new Vec([1,-2,3]);

		var result = v1.sub(v2);
		expect( result.x()).toBe( 2 );
		expect( result.y()).toBe( 4 );
		expect( result.z()).toBe( -4 );
	});
	});
	describe('when adding ', function(){
		it('results in correct vector', function(){
			var v1 = new Vec([4,1,9]);
			var v2 = new Vec([-1,3,0]);
			var result = v1.add(v2);
			expect( result.x()).toBe( 3 );
			expect( result.y()).toBe( 4 );
			expect( result.z()).toBe( 9 );
		});
	});
	describe('when scaling', function(){
		it('to unit vector the vector has length 1', function(){
			var v = new Vec([5,0,0]);
			var unit = v.unit();
			expect( unit.abs()).toBeCloseTo( 1, 8 );

			 v = new Vec([5,6,1]);
			 unit = v.unit();
			expect( unit.abs()).toBeCloseTo(1, 14 );
		});
		it('to scalar correct vector is the result', function(){
			var v1 = new Vec([4,1,9]);
			var result = v1.mul( 3 );
			expect( result.x()).toBe( 12 );
			expect( result.y()).toBe( 3 );
			expect( result.z()).toBe( 27 );
		});
	});
	describe('when cross multiplying', function(){
	    it( 'gets correct values', function(){
	    var A = new Vec( [1.3825497059910933e-11, 1.2825136419212368e-11, 8.208087308295916e-12]);
	    var B = new Vec([-2.721303848492199e-9, -3.907469127769939e-10,9.787263348012682e-11]);
	    var result = A.cross(B);
	    expect(result.x()).toBe( 4.462514651610853e-21);
	    expect(result.y()).toBe( -2.3689837387250887e-20);
        expect(result.z()).toBe(2.9498822801272477e-20);
        });
    });


});

describe( 'given a viewport',function(){
	describe('when rotating viewport', function(){
		it('directional vectors are unit vectors', function(){
			var vp = makeView(new Vec());
			vp.rotate( makeRotational(0.4) );

			expect( vp.u().abs() ).toBeCloseTo(1,10);
			expect( vp.n().abs() ).toBeCloseTo(1,10);
			expect( vp.v().abs() ).toBeCloseTo(1,10);
		});
		it('u and v are orthogonal', function(){
			var vp = makeView(new Vec());
			vp.rotate( makeRotational(0.4) );

			expect( vp.u().dot( vp.v() ) ).toBeCloseTo(0,10);
			expect( vp.v().dot( vp.u() ) ).toBeCloseTo(0,10);
			expect( vp.v().dot( vp.n() ) ).toBeCloseTo(0,10);
		});
		it('rotates to correct position', function(){
			var vp = makeView(new Vec());
			vp.rotate( makeRotational(Math.PI/2) );

			expect( vp.u().x() ).toBeCloseTo(1,10);
			expect( vp.u().y() ).toBeCloseTo(0,10);
			expect( vp.u().z() ).toBeCloseTo(0,10);
			expect( vp.v().x() ).toBeCloseTo(0,10);
			expect( vp.v().y() ).toBeCloseTo(0,10);
			expect( vp.v().z() ).toBeCloseTo(-1,10);
			expect( vp.n().x() ).toBeCloseTo(0,10);
			expect( vp.n().y() ).toBeCloseTo(1,10);
			expect( vp.n().z() ).toBeCloseTo(0,10);
		});
	});
});
