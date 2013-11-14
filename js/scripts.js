var mover;

var moverStyle = {
    fillColor:		"#FB4C9F",
	strokeColor: 	"#CA2A65",
	strokeJoin:		"round",
	strokeWidth:	2
};


// Paperjs direct mode settings
paper.install( window );


window.onload = function() {
	paper.setup( "myCanvas" );
	
	// Create jellies
		mover = new Mover();
		mover.init();

	
	// Set drawing loop
	view.onFrame = draw;


};


function draw( evt ) {
	mover.wander();
	mover.update( evt );
	mover.checkBounds();	
}


// -------------------------------------
// ---- mover Class BEGIN

function Mover() {
	this.path 			= new Path();
	this.location		= new Point( -100 , Math.random() * (view.size.height * 0.5) );
	this.velocity		= new Point( 0, 0 );
	this.acceleration	= new Point( 0, 0 );

	// the maximum speed of the moverfish	
	var maxSpeed		= Math.random() * 0.2 + 1;
	// the magnitude of its steering force
	var maxForce		= 0.4;
	
	// established the heading / direction of the mover
	var angle 			= (Math.PI * 2);
	var wrapAngle 		= (Math.PI / 2) + angle;
	var wanderTheta		= 0;
	
	var orientation		= 0;
	var lastOrientation = 0;
	var lastLocation;
		
	
	this.init = function() {
		// Creates body path

		this.path.strokeColor = 'black';
		this.path.add(new Point(0, 90));
		this.path.add(new Point(40, 0));
		this.path.add(new Point(80, 90));

		this.path.closed = true;
		
	};
	
	
	this.update = function( evt ) {
		lastLocation = this.location.clone();
		
		this.velocity.x += this.acceleration.x;
		this.velocity.y += this.acceleration.y;
		console.log('this.acceleration: ' + this.acceleration);
	    this.velocity.length = Math.min( maxSpeed, this.velocity.length );
	    
	    this.location.x += this.velocity.x;
	    this.location.y += this.velocity.y;
	    
	    this.acceleration.length = 0;
		
		// Change mover path position, without this it won't move
		this.path.position = this.location.clone();
		
		// Rotation alignment
		var locVector = new Point( this.location.x - lastLocation.x, this.location.y - lastLocation.y );
		orientation = locVector.angle + 90;
		this.path.rotate( orientation - lastOrientation );
		lastOrientation = orientation;
	};
	
	
	this.steer = function( target, slowdown ) {
		var steer;
		var desired	= new Point( target.x - this.location.x, target.y - this.location.y );
		var dist 	= desired.length;
		
		if ( dist > 0 ) {
			if ( slowdown && dist < 100 ) {
				desired.length = maxSpeed * ( dist / 100 );
			}
			else {
				desired.length = maxSpeed;
			}
			
			steer = new Point( desired.x - this.velocity.x, desired.y - this.velocity.y );

			// limit the steering ability by the maxForce
			steer.length = Math.min( maxForce, steer.length );
		}
		else {
			steer = new Point( 0, 0 );
		}
		return steer;
	}
	
	
	this.seek = function( target ) {
		var steer = this.steer( target, false );
		this.acceleration.x += steer.x;
		this.acceleration.y += steer.y;
	}
	
	
	this.wander = function() {
		var wanderR 	= 5;
		var wanderD		= 100;
		var change		= 0.05;
		
		wanderTheta += Math.random() * (change * 2) - change;
		
		var circleLocation = this.velocity.clone();
		circleLocation = circleLocation.normalize();
		circleLocation.x *= wanderD;
		circleLocation.y *= wanderD;
		circleLocation.x += this.location.x;
		circleLocation.y += this.location.y;
		
		var circleOffset = new Point( wanderR * Math.cos( wanderTheta ), wanderR * Math.sin( wanderTheta ) );
		
		var target = new Point( circleLocation.x + circleOffset.x, circleLocation.y + circleOffset.y );
		
		this.seek( target );
	}
	
	// wraps the mover object when it heads off screen	
	this.checkBounds = function() {
		var offset = 100;
		if ( this.location.x < -offset ) {
			this.location.x = view.size.width + offset;
		}
		if ( this.location.x > view.size.width + offset ) {
			this.location.x = -offset;
		}
		if ( this.location.y < -offset ) {
			this.location.y = view.size.height + offset;
		}
		if ( this.location.y > view.size.height + offset ) {
			this.location.y = -offset;
		}
	}
	
}

// ---- Mover Class END
// -------------------------------------


