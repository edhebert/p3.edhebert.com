/*

Ed Hebert
ehebert@fas.harvard.edu
DWA15 - Project 3 - Javascript

This project uses the Paper.js library to create a "fish" that
steers itself naturally, gets "fed" by mouse clicks, grows when it eats,
and "poops" to return to its original size.

The concepts for this project are adapted from the books 
_The Nature of Code_, By Daniel Shiffman, and
_Foundation HTML Animation with Javascript_,
by Billy Lamberta and Keith Peters

Also inspired by topics and sketches posted on OpenProcessing.org

http://natureofcode.com
http://paperjs.org
http://openprocessing.org
http://www.amazon.com/Foundation-HTML5-Animation-JavaScript-Lamberta/dp/1430236655

*/


// the global fish creature
var fish;

// the maximum desired speed of the fish   
var maxSpeed        = 10; 

// the magnitude of its steering ability
var maxForce        = 0.2;

// the default scale of the fish
var fishScale = 1.0;

// the food particle
var food;

// bool to track whether there's food on the screen
var foodExists = false;

// the fish's umm..."purging" matter
var purging;

// whether the food is purged
var purged = false;

// number of streaming Tails
var numTails        = 2;
var tails           = [numTails];
var hasTails        = true;

// define the creature's tails' color and style
var tailStyle = {
    strokeColor:    "#FFFFFF",
    strokeWidth:    2
};

var tailTipStyle = {
    fillColor:      "#CA2A65"
};

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
    var foodPosition = new Point();

    // Set drawing loop
    view.onFrame = function(event) {
        fish.update();
        fish.checkBoundaries();

        if (foodExists)
        {
            fish.seek(foodPosition);
            fish.eat();
            food.resize();
        }
        else
            fish.wander();     

        // poop fish when necessary!
        if (Math.abs(fish.path.area) > 3000)
            $('#poop').show();
        else
            $('#poop').hide();

        // decay any purgings
        if (purged)
            purging.decay();
    }


    // Feed fish with a mouse click
    tool.onMouseDown = function(event) {
        // remove the old food
        if (foodExists)
           food.path.remove();

        // set foodPosition to the click location
        foodPosition = event.point;

        // add food particle to the canvas
        food = new Food(event.point);  
        foodExists = true;
    }

    // add or remove 'fish tails' via button click
    $('#tails').click(function() {
            // toggle tails on or off
            if (hasTails){
                // toggle both tails invisible
                for (var i = 0; i < numTails; i++)
                    tails[i].path.visible = false;
                hasTails = false;
                $('#tails').html('Add Kitefish Tails');
                // make fish more quick and manueverable
                maxSpeed += 3;
                maxForce += 0.2;
            }
            else
            {
                // toggle visible
                for (var i = 0; i < numTails; i++)
                    tails[i].path.visible = true;   
                hasTails = true;
                $('#tails').html('Remove Kitefish Tails');
                // make fish less quick and manueverable
                maxSpeed -= 3;
                maxForce -= 0.2;                
            }
    });

    // poop the fish!
    $('#poop').click(function(){

        // purge the fish
        purging = new Poop(fish.path.position);
        purged = true;

        fish.scaleAbsolute(1.0);

        // set max speed based on whether tails currently exist
        if (hasTails)
        {
            maxSpeed = 10;
            maxForce = 0.2;
        }
        else
        {
            maxSpeed = 13;
            maxForce = 0.5;
        }
    });

});


/* Begin Fish Class */

function Fish() {
    // the path that draws the fish
    this.path           = new Path();
    this.head           = new Segment();
    var mouth;

    // the vectors that will govern the fish's motion (load from off screen)
    this.location       = new Point(view.center);
    this.velocity       = new Point(0, 0);
    this.acceleration   = new Point(0, 0);
    
    // establishes the heading / direction of the fish
    var angle           = (Math.PI * 2);

    // how much the fish will wander about
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
        if (hasTails)
            var offset = 300;
        else
            var offset = 50;

        if (this.location.x < -offset) {
            this.location.x = view.size.width + offset;
            // redraw tails
            for ( var t = 0; t < numTails; t++ ) {
                tails[t].path.position = this.location.clone();
            }
        }
        if (this.location.x > view.size.width + offset) {
            this.location.x = -offset;
            for ( var t = 0; t < numTails; t++ ) {
                tails[t].path.position = this.location.clone();
            }
        }
        if (this.location.y < -offset) {
            this.location.y = view.size.height + offset;
            for ( var t = 0; t < numTails; t++ ) {
                tails[t].path.position = this.location.clone();
            }
        }
        if (this.location.y > view.size.height + offset) {
            this.location.y = -offset;
            for ( var t = 0; t < numTails; t++ ) {
                tails[t].path.position = this.location.clone();
            }
        }
    }


    this.eat = function() {
        // detect food location against location of mouth's point        
        var hitResult1 = food.path.hitTest(mouth.point);

        // detect food location in fish belly position
        var hitResult2 = food.path.hitTest(this.path.position);
        // if fish or fish mouth hits food, remove food
        if (hitResult1 || hitResult2)
        {
           food.path.remove();
            foodExists = false;
            this.scaleAbsolute(fishScale * 1.1);
            maxSpeed -= 0.3;
            maxForce -= 0.01;
        }
    }


    this.init = function() {
        // construct the fish shape
        mouth = this.path.add(new Point(30,0));

        // create V-shaped back
        this.path.add(new Point(0,90));  
        this.path.segments[1].handleOut.x = 50;
        this.path.segments[1].handleOut.y = -50;

        this.path.add(new Point(60, 90));
        this.path.segments[2].handleIn.x = -50;
        this.path.segments[2].handleIn.y = -50;        

        this.path.closed = true; 
        this.path.fillColor = '#FFFFFF'; 
        this.path.strokeWidth = 2;
        this.path.strokeColor =  '#FFFFFF'; 
        // this.path.opacity = 0.8;

        // Create tails
        for ( var t = 0; t < numTails; t++ ) {
            tails[t] = new Tail();
            tails[t].init();
        }       
    }


    // create a function to absolutely scale the fish (vs. relatively)
    this.scaleAbsolute = function(absScale) {
        this.path.scale(absScale / fishScale);
        fishScale = absScale;
    }


    this.seek = function(target) {
        // scale desired speed according to max speed
        var desired = new Point(target.subtract(this.location));

        // get the distance between the fish and target
        var distance = desired.length;

        // normalize 'desired' path vector to 1
        desired = desired.normalize();

        // teach the fish to slow down to arrive at object
        if (distance < 300) 
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

        //reset the orientation
        this.path.rotate(orientation - lastOrientation);
        lastOrientation = orientation;

        // Attach tails 
        for ( var t = 0; t < numTails; t++ ) {
            // get the tails heading in the same direction as the head
            tails[t].update(orientation);
            // point 0 is 'mouth', no tail there [t+1]
            tails[t].head.point = this.path.segments[t+1].point;
        } 
    };  

    // draws a "wandering" circle and target some distance ahead of the fish
    this.wander = function() {      
        // radius of wander circle
        var wanderR         = 5;

        // distance of circle ahead of the fish
        var wanderD         = 125;

        // how much to randomize the target each loop
        var change          = .25;      

        wanderTheta += Math.random() * (change * 2) - change;
        
        // get the current velocity
        var circleLocation = this.velocity.clone();
        // normalize it (to get heading)
        circleLocation = circleLocation.normalize();
        // multiply it by the circle's distance
        circleLocation = circleLocation.multiply(wanderD);
        // make the circle relative to the fish's current location
        circleLocation = circleLocation.add(this.location);
      
        var circleOffset = new Point(wanderR * Math.cos( wanderTheta ), wanderR * Math.sin( wanderTheta));
        
        var target = new Point(circleLocation.x + circleOffset.x, circleLocation.y + circleOffset.y);
        
        this.seek(target);
    }
}

/* End Fish Class */


/* Begin Food Class */

function Food(point) {
    // the path that draws the food

    var grow = true;
    var minSize = 2; 
    var maxSize = 30;
    var radius;
    this.path               = new Shape.Circle(point, minSize);
    this.path.fillColor     = 'orange';
    this.path.sendToBack();

    this.resize = function() {

        radius = this.path.bounds.width / 2;
        var newRadius;

        if (radius > maxSize)
            grow = false;
        else if (radius < minSize)
            grow = true;

        // cycle the food color
        this.path.fillColor.hue += 1;

        if (grow){
            newRadius = radius + 1;
            // set new radius
            this.path.scale(newRadius / radius);
            radius = newRadius;
        }            
        else
        {
            newRadius = radius - 1;
            // set new radius
            this.path.scale(newRadius / radius);
            radius = newRadius;           
        }
    }
}

/* End Food Class */


/* Begin Poop Class */

function Poop(point) {

    purged = true;

    // base the 'poop' size on the scale of the fish itself
    var radius = fishScale * 20;

    // draw it
    this.path               = new Shape.Circle(point, radius);
    this.path.fillColor     = 'brown';
    this.path.sendToBack();

    this.decay = function() {
        radius = this.path.bounds.width / 2;
        var newRadius;
        newRadius = radius + 5;
        
        // set new radius
        this.path.scale(newRadius / radius);
        radius = newRadius;    

        // make less opaque
        this.path.opacity -= .006;    

        if (this.path.opacity <= 0)
        {
            // remove the poop
            this.path.remove();
            purged = false;   
        }
                
    }
}

/* End poop class */


/* Begin Tail Class */

function Tail() {
    this.head   = new Segment();
    
    this.path               = new Path();
    var numSegments         = 20;
    var segmentLength       = 20;
    
    var pathTip             = new Path.Circle( new Point(0, 0), 10 );
    pathTip.style           = tailTipStyle;
        
    
    this.init = function() {
        for ( var i = 0; i < numSegments; i++ ) {
            this.path.add( new Point( 0, i * segmentLength ) );
        }
        this.path.style     = tailStyle;
        this.head           = this.path.segments[0];
    };
    
    
    // Use Inverse kinematic motion to create tail whip
    // Technique covered in Ch. 14 - Foundation HTML animation w/ Javascript
    this.update = function(orientation) {
        this.path.segments[1].point = this.head.point;
        
        var dx      = this.head.point.x - this.path.segments[1].point.x;
        var dy      = this.head.point.y - this.path.segments[1].point.y;
        var angle   = Math.atan2(dy, dx) + (orientation * (Math.PI / 180));
        angle += Math.PI / 2;
        
        this.path.segments[1].point.x += Math.cos(angle);
        this.path.segments[1].point.y += Math.sin(angle);
        
        for ( var i = 2; i < numSegments; i++ ) {
            var pt = new Point( (this.path.segments[i].point.x - this.path.segments[i-2].point.x), (this.path.segments[i].point.y - this.path.segments[i-2].point.y) );
            var len = pt.length;
            if ( len > 0.0 ) {
                this.path.segments[i].point.x = this.path.segments[i-1].point.x + (pt.x * segmentLength) / len;
                this.path.segments[i].point.y = this.path.segments[i-1].point.y + (pt.y * segmentLength) / len;
            }
        }
        
        pathTip.position.x = this.path.segments[numSegments-1].point.x;
        pathTip.position.y = this.path.segments[numSegments-1].point.y;

        // toggle path tips on or off 
        if (hasTails)
            pathTip.visible = true;
        else
            pathTip.visible = false;

        this.path.smooth();
    };    
}

/* End Tail Class */