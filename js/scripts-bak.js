/*

Ed Hebert
ehebert@fas.harvard.edu
DWA15 - Project 3 - Javascript

This project uses the Paper.js library to create a fish that
steers naturally, responds to mouse events, etc.

The concepts for this project are adapted from Chapter 6, "Autonomous Agents" from the book _The Nature of Code_, By Dan Shiffman. 

Also thanks to topics and sketches posted on OpenProcessing.org

http://natureofcode.com
http://paperjs.org
http://openprocessing.org

*/

var fishStyle = {
    strokeColor:    "#CA2A65",
    strokeWidth:    2
};

var fishHeadStyle = {
    fillColor:  "#CA2A65"
};




// the global fish creature
var fish;

// an array to contain food particles
var food;

// Access paper.js directly through JavaScript rather than PaperScript
paper.install(window);


$(document).ready(function() {
    paper.setup("myCanvas");
    
    // Create a fish object
    fish = new Fish();
    fish.init();

    // initialize the mouse tool in Paper.js
    tool = new Tool();

    // initialize mouse Position
    var foodPosition = new Point (-100, -100);

    // Set drawing loop
    view.onFrame = function(event) {
        fish.update();
        fish.checkBoundaries();
        fish.seek(foodPosition); 
        fish.eat();        
    }

/*
    // creature follows mouse movements
    tool.onMouseMove = function(event) {
        foodPosition = new Point(event.point);    
    }
*/

    // Feed fish with a mouse click
    tool.onMouseDown = function(event) {

        // remove the old food (for now)
        if (typeof food != 'undefined')
            food.path.remove();

        // add a new food particle to the array
        food = new Food(event.point);

        // (temp) set foodPosition to the click location
        foodPosition = event.point;

        // add the food particle to the array (eventually need to locate closest food)
        // food.push(newFood);  

    }

});


/* Begin Fish Class */

function Fish() {
    // the path that draws the fish
    this.path           = new Path();
        
    var pathTip             = new Path.Circle( new Point(0, 0), 10 );
    pathTip.style           = fishHeadStyle;

    // fish head
    this.head   = new Segment();
    
    // the fish's mouth
    var mouth;

    // the number and length of fish body 'spine' segments
    var segmentLength = 5;
    var numSegments = 20;

    // the vectors that will govern the fish's motion (load from off screen)
    // this.location       = new Point(-100 , Math.random() * (view.size.height * 0.5));
    this.location       = new Point(view.center);
    this.velocity       = new Point(0, 0);
    this.acceleration   = new Point(0, 0);

    // the maximum desired speed of the fish   
    var maxSpeed        = 3; // Math.random() * 0.2 + 1;

    // the magnitude of its steering ability
    var maxForce        = .1;
    
    // established the heading / direction of the fish
    var angle           = (Math.PI * 2);
    var wrapAngle       = (Math.PI / 2) + angle;
    var wanderTheta     = 0;
    
    var orientation     = 0;
    var lastOrientation = 0;
    var lastLocation;
        
    
    // apply various force vectors to fish acceleration
    this.applyForce = function(force) {
        this.acceleration = this.acceleration.add(force);
    }
 

     // wraps the fish object to the opposite side of the screen    
    this.checkBoundaries = function() {

        // create offset of 'white space' beyond the window
        var offset = 50;
        if (this.location.x < -offset) {
            this.location.x = view.size.width + offset;
        }
        if (this.location.x > view.size.width + offset) {
            this.location.x = -offset;
        }
        if (this.location.y < -offset) {
            this.location.y = view.size.height + offset;
        }
        if (this.location.y > view.size.height + offset) {
            this.location.y = -offset;
        }
    }


    this.eat = function() {
        // if food exists, compare its location against location of mouth's point
        if (typeof food != "undefined")
            var hitResult = food.path.hitTest(mouth);
            
        // console.log('mouth: ' + mouth +', ' + 'hitResult: ' + hitResult);

        // if fish mouth hits food, do stuff
        if (hitResult)
            console.log('Yum!');
    }


    this.init = function() {
        // construct the fish shape
        // this.path.strokeColor = 'black';
        // this.path.strokeWidth = 4;
        // this.path.add(new Point(0, 90));
        // mouth = this.path.add(new Point(40, 0));
        // this.path.add(new Point(80, 90));

        // this.path.closed = true; 
        // this.path.fillColor = 'black';   

        for ( var i = 0; i < numSegments; i++ ) {
            this.path.add( new Point( 0, i * segmentLength ) );
        }

        this.path.style     = fishStyle;
        this.head           = this.path.segments[0];
         
    }


    this.seek = function(target) {
        // scale desired speed according to max speed
        var desired = new Point(target.subtract(this.location));

        // get the distance between the fish and target
        var distance = desired.length;

        // normalize 'desired' path vector to 1
        desired = desired.normalize();

        // teach the fish to slow down to arrive at object
        if (distance < 500) 
            // set speed based on the proximity to the target
            desired = desired.multiply(maxSpeed * (distance / 200));
        else
            // pursue at full speed
            desired = desired.multiply(maxSpeed);

        // create a steering Force
        var steer = new Point(desired.subtract(this.velocity));

        // limit the magnitude of the steering force
        steer.length = Math.min( maxForce, steer.length );

        // apply steering force to our acceleration
            this.applyForce(steer);
    }

    
    this.update = function() {
        // clone the active location to last location
        lastLocation = this.location.clone();
        
        // add acceleration forces to velocity
        this.velocity = this.velocity.add(this.acceleration);

        // regulate the velocity to the max speed
        this.velocity.length = Math.min(maxSpeed, this.velocity.length);
        
        // apply velocity to the location
        this.location = this.location.add(this.velocity);
        
        // reset acceleration
        this.acceleration.length = 0;
        
        // Change fish path position (without this it won't move)
        this.path.position = this.location.clone();
        
        // Align rotation to match direction of velocity vector
        var theta = new Point(this.location.subtract(lastLocation));

        // orient the vector perpendicular to the mouse (90°)
        orientation = theta.angle + 90;

        // make the fish swim in this direction
        this.path.segments[1].point = this.head.point;       
        var dx      = this.head.point.x - this.path.segments[1].point.x;
        var dy      = this.head.point.y - this.path.segments[1].point.y;
        var angle   = Math.atan2( dy, dx ) + (orientation * (Math.PI / 180));
        angle += Math.PI / 2;
        
        this.path.segments[1].point.x += Math.cos( angle );
        this.path.segments[1].point.y += Math.sin( angle );
        
        for ( var i = 2; i < numSegments; i++ ) {
            var pt = new Point( (this.path.segments[i].point.x - this.path.segments[i-2].point.x), (this.path.segments[i].point.y - this.path.segments[i-2].point.y) );
            var len = pt.length;
            if ( len > 0.0 ) {
                this.path.segments[i].point.x = this.path.segments[i-1].point.x + (pt.x * segmentLength) / len;
                this.path.segments[i].point.y = this.path.segments[i-1].point.y + (pt.y * segmentLength) / len;
            }
        }
        
        pathTip.position.x = this.path.segments[0].point.x;
        pathTip.position.y = this.path.segments[0].point.y;

        //reset the orientation
        this.path.rotate(orientation - lastOrientation);
        lastOrientation = orientation;
    };  


}

/* End Fish Class */


/* Begin Food Class */

function Food(point) {

    // the path that draws the food
    this.path           = new Path.Circle(point, 10);
    this.path.fillColor = 'black';
}

/* End Food Class */