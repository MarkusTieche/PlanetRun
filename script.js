var svg = document.querySelector("svg");
var viewBox = svg.viewBox.baseVal;
    viewBox.scale=1;
var point = svg.createSVGPoint();
var lastTick = Date.now();
var dt = 0;
var inputDiv = document.getElementById("inputDiv");


var player = document.getElementById("Player");
    player.alive = true;
    player.shadow =document.getElementById("shadow");
    player.onGround = true;
    player.position = {x:0,y:0};
    player.velocity = {x:0,y:0};
    player.scale = {x:1,y:1};
    player.rot = 0;
    player.speed = 0

var scoreDiv = document.getElementById("score")
var score = 0;

var currentPlanet=document.getElementById("earth");
    currentPlanet.atmo = currentPlanet.children[0]
    currentPlanet.atmo.scale = 1;
    currentPlanet.radius = 120;
    currentPlanet.bbox = currentPlanet.getBBox();
    currentPlanet.position = {x:currentPlanet.bbox.x+currentPlanet.bbox.width/2,y:currentPlanet.bbox.y+currentPlanet.bbox.height/2};

var level = document.getElementById("Game");
    level.velocity = {x:0,y:0};
    level.position = {x:0,y:0};
    level.cameraOffset = {x:currentPlanet.position.x,y:currentPlanet.position.y};
var cameraTarget = currentPlanet;    
var cameraScale =1;
var parallax = document.getElementById("Parallax");

var tweenable;



var planets = 
{
    "node":document.getElementById("Planets"),
    "lastPos":currentPlanet.position,
    "distance":{x:{min:-200,max:200},y:{min:200,max:350}},
    "assets":document.getElementById("Assets"),
    "max":5,
}

var particles = [];
    particles.spawn =  false;
var activeParticles = 0;
var particleTimer = 0;

onload();

function onload()
{

    inputDiv.onclick = inputDiv.ontouchstart = inputDown;
    inputDiv.onmouseup = inputDiv.ontouchend = inputUp;

    tweenable = new Tweenable({
        from: {scale:1},
        to: {scale:0.2},
        ease:"easeOutCubic",
        duration: 1000,
        onUpdate: ({scale}) => {
            viewBox.x = 20+(scale - 1)+ 720/2*(1-scale);
            viewBox.y = (scale - 1)+ 1280/2*(1-scale);
            
            viewBox.width = 768*scale;
            viewBox.height = 1280*scale;
        }
    })
  

    //INIT PARALLLAX BG
    for (let i = 0; i < parallax.children[0].children.length; i++) {
        parallax.children[0].children[i].parallaxFac = 2+Math.ceil(Math.random()*6)
        parallax.children[0].children[i].position = {x:Math.random()*768,y:Math.random()*1280};
        parallax.children[0].children[i].setAttribute("transform","translate("+(parallax.children[0].children[i].position.x)+","+(parallax.children[0].children[i].position.y)+")");
        
    }

    initLevel();
    initParticles();

    animate();
}

function resetLevel()
{

    // for (var i = planets.node.children.length - 1; i >= 0; i--) {
    //     planets.node.removeChild(planets.node.children[i]);
    // }
    var shiftDirection = Math.sign(player.position.x-currentPlanet.position.x)
    currentPlanet=document.getElementById("earth");
    currentPlanet.radius = 120;
    currentPlanet.bbox = currentPlanet.getBBox();
    // currentPlanet.position = {x:currentPlanet.bbox.x+currentPlanet.bbox.width/2,y:currentPlanet.bbox.y+currentPlanet.bbox.height/2};
    currentPlanet.position = {x:player.position.x+currentPlanet.bbox.width/2+(1500*shiftDirection),y:player.position.y+currentPlanet.bbox.height/2};
  
    
    particles.spawn =  false;
    KeyshapeJS.globalPlay();
    //UPDATE CAMERA TARGET
    cameraTarget = currentPlanet;
    score =0;
    scoreDiv.innerHTML = score;
    //APPLY NEW LEVEL AFTER DELAY
    // setTimeout(() => {
       
    //     for (var i = planets.node.children.length - 1; i >= 0; i--) {
    //         planets.node.removeChild(planets.node.children[i]);
    //     }
    //     // planets.lastPos = currentPlanet.position;
    //     initLevel();
    // }, 300);
}

function initLevel()
{
    for (var i = planets.node.children.length - 1; i >= 0; i--) {
        planets.node.removeChild(planets.node.children[i]);
    }
    
    currentPlanet.setAttribute("transform","translate("+ (currentPlanet.position.x-currentPlanet.bbox.x-currentPlanet.bbox.width/2)+","+(currentPlanet.position.y-currentPlanet.bbox.y-currentPlanet.bbox.height/2)+")" );
    planets.lastPos = currentPlanet.position;
    //INIT PLAYER
    player.position.x = currentPlanet.position.x;
    player.position.y = currentPlanet.position.y-currentPlanet.radius;

    player.velocity.x = player.velocity.y = 0;
    player.shadow.style.visibility = "visible";
    player.onGround = true;
    player.alive = true;
    player.rot = 0;


    //INIT LEVEL
    for (let i = 0; i < planets.max; i++) {

        addPlanet({x:planets.lastPos.x+(-200+Math.random()*400),y:planets.lastPos.y-(400+Math.random()*350)});
    }
}

function addPlanet(pos)
{
    planets.lastPos = pos;

    var scale = 1+Math.random()*0.4
    var random = Math.floor(Math.random()*planets.assets.children.length);
    var clone =  planets.assets.children[random].cloneNode(true);
        clone.atmo = clone.children[0];
        clone.atmo.scale = 1;
        clone.position = pos;
        clone.radius = 120*scale;
        clone.setAttribute("transform","translate("+pos.x+","+pos.y+") scale("+scale+")");
    planets.node.appendChild(clone);

}

function absorbEvent_(event) {
    // console.log(event)
    var e = event || window.event;
    e.preventDefault && e.preventDefault();
    e.stopPropagation && e.stopPropagation();
    e.cancelBubble = true;
    e.returnValue = false;
    return false;
}

function inputDown(e)
{
    absorbEvent_(e);
    if(!player.alive)
    {
        resetLevel();
        return;
    }

    if(player.onGround)
    {
        KeyshapeJS.globalPause();
        KeyshapeJS.timelines()[0].time(1000)
        // player.velocity.y = -4;
        var angle = (player.rot-90) * (Math.PI/180); // Convert to radians
        player.velocity.x = Math.cos(angle) * 5;
        player.velocity.y = Math.sin(angle) * 5;
        player.shadow.style.visibility = "hidden";
        player.onGround = false;
        particles.spawn = true;
        player.scale.x = .8;
        player.scale.y = 1.2;
    }

}

function inputUp(e)
{
}

function distance(p1,p2){
	var dx = p2.x-p1.x;
	var dy = p2.y-p1.y;
	return Math.sqrt(dx*dx + dy*dy);
}

function initParticles()
{
    var group=document.getElementById("Particles")
    
    var svgns = "http://www.w3.org/2000/svg";
    for (let i = 0; i < 20; i++) {

        var particle = document.createElementNS(svgns, 'circle');
            particle.setAttributeNS(null, 'cx', 100);
            particle.setAttributeNS(null, 'cy', 100);
            particle.setAttributeNS(null, 'r', 10);
            particle.setAttributeNS(null, 'style', 'fill: '+"#f59714"+'; stroke: none;');
            particle.setAttribute('visibility', 'hidden');
            particle.velocity = {x:0,y:0};
            particle.life = 0;
        group.appendChild(particle);
        particles.push(particle);
    }

}

function spawnParticle(pos,vel,color)
{
   
    var particle = particles[activeParticles];

    if(particle)
    {
        particle.life = 20;
        particle.setAttributeNS(null, 'cx', pos.x);
        particle.setAttributeNS(null, 'cy', pos.y);
        particle.setAttribute('r', 2+Math.random()*5);
        particle.velocity = vel;
        particle.style.fill ="#f59714";
        particle.setAttribute('visibility', 'visible');

        activeParticles +=1;

        particle = null;
    }
}

function updateParticles()
{
    for (let i = activeParticles-1; i >= 0; i--) 
    {
        var particle = particles[i];
            // particle.velocity.x *= 0.95;
            // particle.velocity.y *= 0.95;
            particle.setAttribute('r', Number(particle.getAttribute("r"))+(1*dt));
            particle.setAttribute('cx', Number(particle.getAttribute("cx"))+particle.velocity.x*dt);
            particle.setAttribute('cy', Number(particle.getAttribute("cy"))-particle.velocity.y*dt);
            particle.style.fill = lerpColor("#f59714","#e3130b", particle.life/20)
            particle.life -= 1*dt;
            if(particle.life <= 0)
            {
                particle.setAttribute('visibility', 'hidden');
                particles[i] = particles[activeParticles-1]
                particles[activeParticles-1] = particle;
                activeParticles -=1;
            }
    };
}

//https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
function lerpColor(a, b, amount) { 

    var ah = parseInt(a.replace(/#/g, ''), 16),
        ar = ah >> 16, ag = ah >> 8 & 0xff, ab = ah & 0xff,
        bh = parseInt(b.replace(/#/g, ''), 16),
        br = bh >> 16, bg = bh >> 8 & 0xff, bb = bh & 0xff,
        rr = ar + amount * (br - ar),
        rg = ag + amount * (bg - ag),
        rb = ab + amount * (bb - ab);

    return '#' + ((1 << 24) + (rr << 16) + (rg << 8) + rb | 0).toString(16).slice(1);
}

function lostInSpace()
{
    cameraTarget = {"position":{x:player.position.x,y:player.position.y-1280/2+level.cameraOffset.y}};
    player.velocity.x = 0;
    player.velocity.y = 0;
    particles.spawn = false;

    // tweenable.tween()
    //ZOOM IN
    // setTimeout( ()=>{tweenable.tween()}, 1000);
}

function render(time)
{
    //SIMULATE LOW FRAMERATE
    // if( (time-lastTick)/1000 <1/(20+Math.random()*60))
    // {
    //     return;
    // }

    dt = (time-lastTick)*.06;
    lastTick = time;

    if(dt>5)
    {
        return;
    }

    //CHECK PLANET COLLISION    
    if(!player.onGround)
    {
        //PLAYER NOT ON GROUND->FLY,CHECK FOR COLLISION
        for (let i = 0; i < planets.max; i++) {
            if(planets.node.children[i] == currentPlanet){continue;}
            var dist= distance( player.position,  planets.node.children[i].position);
            var angle = Math.atan2(planets.node.children[i].position.y - player.position.y, planets.node.children[i].position.x - player.position.x);
            
            //INSIDE ATOSPHERE
            if(dist < 250 && !player.onGround)
            {
                player.rot  = ((angle* 180 / Math.PI)-90);
                player.velocity.x += (Math.cos(-angle))/(10/dt);
                player.velocity.y += (Math.sin(angle))/(10/dt);
                particles.spawn = false;

                //LANDED
                if(dist < planets.node.children[i].radius)
                {
                    currentPlanet = planets.node.children[i];
                    cameraTarget = currentPlanet;

                    score +=1;
                    scoreDiv.innerHTML = score;
                    player.alive  = true;
                    
                    // currentPlanet.atmo.scale = 1.2;
                    currentPlanet.atmo.scale = 1.1;
                    
                    player.onGround = true;
                    KeyshapeJS.globalPlay();
                    player.shadow.style.visibility = "visible";
                    player.velocity.x = 0;
                    player.velocity.y = 0;
                    var angle = (player.rot-90) * (Math.PI/180); // Convert to radians
                    player.position.x = Math.cos(angle) * (currentPlanet.radius) + currentPlanet.position.x;
                    player.position.y = Math.sin(angle) * (currentPlanet.radius) + currentPlanet.position.y;

                    player.scale.x = 1.2;
                    player.scale.y = .8;
                    
                }
            }
        }
    }
    else
    {
        //PLAYER ON GROUND,->ROTATE
        currentPlanet.atmo.scale -= (currentPlanet.atmo.scale-1)/20;
        player.rot+=2*dt;
        var angle = (player.rot-90) * (Math.PI/180); // Convert to radians
        player.position.x = Math.cos(angle) * (currentPlanet.radius) + currentPlanet.position.x;
        player.position.y = Math.sin(angle) * (currentPlanet.radius) + currentPlanet.position.y;

    }

    if(particles.spawn)
    {
        particleTimer -= 0.05*dt;

        if(particleTimer <= 0)
        {
            particleTimer = .1;
            spawnParticle(player.position,{x:Math.sin((player.rot)* (Math.PI/180))+Math.random(),y:Math.cos(player.rot* (Math.PI/180))})
        }
    }

    currentPlanet.atmo.setAttribute("transform","scale("+currentPlanet.atmo.scale+")");
    //UPDATE PLAYER POSITION
    player.position.x +=player.velocity.x*dt;
    player.position.y +=player.velocity.y*dt;
    player.scale.x -= (player.scale.x-1)/(20/dt);
    player.scale.y -= (player.scale.y-1)/(20/dt);
    player.setAttribute("transform","translate("+player.position.x+","+player.position.y+") rotate(" +(player.rot)+",0,0) scale("+player.scale.x+","+player.scale.y+")" );

    //CHECK IF PLAYER IS ON SCREEN
    if(player.position.x > (level.position.x+868) || player.position.x < level.position.x-100 || player.position.y < level.position.y-100 ||  player.position.y > (level.position.y+1380))
    {
        //OUT OF BOUNDS
        // resetLevel();
        if(player.alive)
        {
            if(!player.onGround)
            {
                player.alive = false;
                lostInSpace();
            }
        }
        else
        {
            //RESET LEVEL IF ALREADY LOST IN SPACE :)
            initLevel()
        }
    }

    if(!player.alive)
    {
        player.rot+=(1*dt)
        // player.velocity.x *= 0.9;
        // player.velocity.y *= 0.9;
    }
     
    //CAMERA 
    level.velocity.x = ((cameraTarget.position.x-level.position.x-level.cameraOffset.x)/40);
    level.velocity.y = ((cameraTarget.position.y-level.position.y-level.cameraOffset.y)/40);
    level.position.x +=  level.velocity.x*dt;
    level.position.y +=  level.velocity.y*dt;
    level.setAttribute("transform","translate("+(-level.position.x)+","+(-level.position.y)+")");

    //PARALLAX
    // parallax.setAttribute("transform","translate("+(-level.position.x/2)+","+(-level.position.y/2)+")");
    for (let i = 0; i < parallax.children[0].children.length; i++) {
        
        parallax.children[0].children[i].position.x -= level.velocity.x/parallax.children[0].children[i].parallaxFac*dt;
        parallax.children[0].children[i].position.y -= level.velocity.y/parallax.children[0].children[i].parallaxFac*dt;
        parallax.children[0].children[i].setAttribute("transform","translate("+(parallax.children[0].children[i].position.x)+","+(parallax.children[0].children[i].position.y)+")");
        if(parallax.children[0].children[i].position.x<-100)
        {
            parallax.children[0].children[i].position.x=768+100
        }
        if(parallax.children[0].children[i].position.x>768+100)
        {
            parallax.children[0].children[i].position.x=-100
        }
        if(parallax.children[0].children[i].position.y<-100)
        {
            parallax.children[0].children[i].position.y=1280+100
        }
        if(parallax.children[0].children[i].position.y>1280+100)
        {
            parallax.children[0].children[i].position.y=-100
        }
    }

    //LEVEL-LOOP
    if(level.position.y<planets.lastPos.y)
    {
        planets.node.removeChild(planets.node.children[0]);
        addPlanet({x:planets.lastPos.x+(-200+Math.random()*400),y:planets.lastPos.y-(400+Math.random()*350)});
    }

    updateParticles()


}
// Animation loop
function animate(){
    requestAnimationFrame(animate);
    // Render scene
    render(Date.now());
}

