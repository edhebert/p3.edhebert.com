/*

Ed Hebert
ehebert@fas.harvard.edu
DWA15 - Project 3 - Javascript

This project uses the Paper.js library to create a natural organic object.
It will wander on its own, respond to mouse events, etc.

The concepts for this project are adapted from Chapter 6 of the book 
"The Nature of Code", By Dan Shiffman. It discusses the creation of "autonomous 
agents" with 

Shiffman's book details natural simulation algorithms implemented in Processing / Java.

His concepts for organic movement have been ported to Javascript / Paper.js, 
and adapted to my own object.

http://natureofcode.com
http://paperjs.org

*/


// the global creature, called "vehicle"
var vehicle;
// Access paper.js directly through JavaScript
paper.install(window);


window.onload = function() {
    paper.setup("myCanvas");
    
    // Create a vehicle object
    vehicle = new Vehicle();
    vehicle.init();

    // initialize the mouse tool in Paper.js
    tool = new Tool();

    // initialize mouse Position
    var mousePosition = new Point (-100, -100);

    // Set drawing loop
    view.onFrame = function(event) {
        vehicle.update();
        vehicle.checkBoundaries();
        vehicle.seek(mousePosition);         
    }

    // Define a mousedown and mousedrag handler
    tool.onMouseMove = function(event) {
        mousePosition = new Point(event.point);    
    }
};


/* Begin Vehicle Class */

function Vehicle() {
    // the path that draws the vehicle
    this.path           = new Path();

    // the vectors that will govern the vehicle's motion (load from off screen)
    this.location       = new Point(-100 , Math.random() * (view.size.height * 0.5));
    this.velocity       = new Point(0, 0);
    this.acceleration   = new Point(0, 1);

    // the maximum desired speed of the vehicle   
    var maxSpeed        = 10; // Math.random() * 0.2 + 1;
    console.log(maxSpeed);

    // the magnitude of its steering ability
    var maxForce        = .8;
    
    // established the heading / direction of the vehicle
    var angle           = (Math.PI * 2);
    var wrapAngle       = (Math.PI / 2) + angle;
    var wanderTheta     = 0;
    
    var orientation     = 0;
    var lastOrientation = 0;
    var lastLocation;
        
    
    this.init = function() {
        // construct the vehicle shape
        this.path.strokeColor = 'black';
        this.path.add(new Point(0, 90));
        this.path.add(new Point(40, 0));
        this.path.add(new Point(80, 90));

        this.path.closed = true;        
    };


    // function to apply various force vectors to vehicle acceleration
    this.applyForce = function(force) {
        this.acceleration = this.acceleration.add(force);
    }
 

     // wraps the vehicle object to the opposite side of the screen    
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


    this.seek = function(target) {
        // scale desired speed according to max speed
        var desired = new Point(target.subtract(this.location));

        // get the distance between the vehicle and mouse
        var distance = desired.length;

        // normalize 'desired' path vector to 1
        desired = desired.normalize();

        // teach the vehicle to slow down to arrive at object
        if (distance < 300) 
            // slow down
            desired = desired.multiply(maxSpeed * (distance / 300));
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
        lastLocation = this.location.clone();
        
        // velocity = velocity + acceleration
        this.velocity = this.velocity.add(this.acceleration);

        // regulate the velocity to the max speed
        this.velocity.length = Math.min(maxSpeed, this.velocity.length);
        
        // location = location + velocity
        this.location = this.location.add(this.velocity);
        
        // reset acceleration
        this.acceleration.length = 0;
        
        // Change vehicle path position, without this it won't move
        this.path.position = this.location.clone();
        
        // Align rotation to match direction of velocity vector
        var theta = new Point(this.location.subtract(lastLocation));
        orientation = theta.angle + 90;
        this.path.rotate(orientation - lastOrientation);
        lastOrientation = orientation;
    };   
}

/* End Vehicle Class */


