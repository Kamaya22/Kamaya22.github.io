var renderer = null;
var scene = null;
var camera = null;
var funFact = null;
var curTime = Date.now();
const zoomFactor = 0.0001;
const baseURL = 'https://raw.githubusercontent.com/jeromeetienne/threex.planets/master/';
const planetURL = 'https://raw.githubusercontent.com/dumitrux/solar-system-threejs/master/assets/textures/';
const dataJSON = '{"earth": {"funFact": "Over 4.4 billion years ago, a Mars-size body smashed into a primitive Earth, launching our moon into permanent orbit around our planet.But a new study finds that this event could have had a much larger impact than previously thought. The collision could also have imbued our planet with the carbon, nitrogen and sulfur needed for life to form, scientists reported today (Jan. 23) in the journal Science Advances."},"mercury": {"funFact": "Mercury has been known to humanity since ancient times and although its discovery date is unknown, the first mentions of the planet are believed to be around 3000 BC by the Sumerians."},"venus": {"funFact": "It takes Venus longer to rotate once on its axis than to complete one orbit of the Sun. That’s 243 Earth days to rotate once - the longest rotation of any planet in the Solar System - and only 224.7 Earth days to complete one orbit of the Sun."},"mars": {"funFact":"The surface gravity of Mars is only 37% of what you would find on Earth, which makes it possible for volcanoes to be taller without collapsing. This is why we have Olympus Mons, the tallest volcano known on a planet in the Solar System. It’s 16 miles (25 kilometers) high and its diameter is approximately the same as the state of Arizona, according to NASA. But Mars also has a deep and wide canyon known as Valles Marineris, after the spacecraft (Mariner 9) that discovered it. In some parts, the canyon is 4 miles (7 kilometers) deep. According to NASA, the valley is as wide as the United States and is about 20% of the Red Planet’s diameter."},"jupiter": {"funFact":"Jupiter has a 67 confirmed and named satellites. However, it is estimated that the planet has over 200 natural satellites orbiting it. Almost all of them are less than 10 kilometers in diameter, and were only discovered after 1975, when the first spacecraft (Pioneer 10) arrived at Jupiter."},"saturn": {"funFact":"Determining the rotation speed of Saturn was actually very difficult to do, because the planet doesn’t have a solid surface. Unlike Mercury, you can’t just watch to see how long it takes for a specific crater to rotate back into view; astronomers needed to come up with a clever solution: the magnetic field.To determine the rotational speed of Saturn, astronomers had to measure the rotation of the planet’s magnetic field. By one measurement, Saturn takes 10 hours and 14 minutes to turn on its orbit, but when Cassini approached Saturn, it clocked the rotation at 10 hours and 45 minutes. Astronomers now agree on an average day of 10 hours, 32 minutes and 35 seconds."},"uranus": {"funFact":"Uranus has 27 known moons, and they are named after characters from the works of William Shakespeare and Alexander Pope."},"neptune": {"funFact": "The first person to have seen Neptune was likely Galileo, who marked it as a star in one of his drawings. However, since he did not identify it as a planet, he is not credited with the discovery. That credit goes to French mathematician Urbain Le Verrier and the English mathematician John Couch Adams, both of whom predicted that a new planet – known as Planet X – would be discovered in a specific region of the sky.When astronomer Johann Gottfried Galle actually found the planet in 1846, both mathematicians took credit for the discovery. English and French astronomers battled over who made the discovery first, and there are still defenders of each claim to this day. Today, the consensus among astronomers is that Le Verrier and Adams deserve equal credit for the discovery."}}';
const data = JSON.parse(dataJSON);
var h1 = document.createElement('h1');

//We put here all the constants that we'll need for the solar system
//Here I tried to take the real values but I changed it so it could be more visible on the screen
//All the radius
const sunRadius = 695500; 
const mercuryRadius = (4880/2)*16;
const venusRadius = (12100/2)*16;
const earthRadius = (6371)*16; 
const marsRadius = (6780/2)*16;
const jupiterRadius = (138850/2)*4;
const saturnRadius = (114630/2)*4;
const uranusRadius = (50530/2)*4;
const neptuneRadius = (49100/2)*4;
const moonRadius = 1737*6; 

//Distance between Earth and the Moon.
const earthMoonDistance = 38440*4; 

//All the distances to the sun
const mercurySunDistance = 800000 ;
const venusSunDistance = 1080000 ;
const earthSunDistance = 1500000; 
const marsSunDistance = 2280000;
const jupiterSunDistance = 7780000/2;
const saturnSunDistance = 14270000/2;
const uranusSunDistance = 20000000/2;
const neptuneSunDistance = 25070000/2;





//Here I'll put all the methods to creates my meshes
//Create the sun
function createSun(orbit) {    
    const material = new THREE.MeshPhongMaterial({
        // Diffuse Texture
        map: new THREE.TextureLoader().load('/Solar_system/IMAGES/sun.jpeg'),

        // Bump Texture
        bumpMap: new THREE.TextureLoader().load('/Solar_system/IMAGES/sunbump.jpeg'),
        bumpScale: 0.1,
    });
    const geometry = new THREE.SphereGeometry(sunRadius * zoomFactor, 50, 50);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    orbit.add(mesh);
    return mesh;
}

//Create Star Galaxy
const createGalaxy = () => {
    
            
    const material = new THREE.MeshPhongMaterial(
        {
            map : new THREE.TextureLoader().load(baseURL + 'images/galaxy_starfield.png'),
            side : THREE.DoubleSide,
            shininess : 0
    });
        const geometry = new THREE.SphereGeometry(5000, 50, 50);
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
}

//Template for creating planets
function createPlanet(name, size, distanceX, orbit, scene) {
    const material = new THREE.MeshBasicMaterial({
        // Diffuse Texture
        map: new THREE.TextureLoader().load(planetURL + name + ".jpg")
    });

        
    const geometry = new THREE.SphereGeometry(size * zoomFactor, 50, 50);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(distanceX*zoomFactor, 0, 0);
    orbit.add(mesh);
    return mesh;
};

//This function returns the group that contains the planet and their orbit line
function createOrbits() {
    const orbit = new THREE.Group();
    for (let i=0, j = arguments.length; i<j; i++)
    {
        arguments[i].add(orbit);    
    };
    return orbit;  
}

//This function returns the group that contains the moon and its orbit line
function createMoonOrbit() {
    const orbit = new THREE.Group();
    orbit.position.set((earthSunDistance)*zoomFactor, 0, 0);

    for (let i=0, j=arguments.length; i<j; i++) 
    {
        arguments[i].add(orbit);
    };
    
    return orbit;
}

//This function creates the orbit lines for every planet
function createOrbitLines(distanceX, scene){
    const innerRadius = distanceX*zoomFactor - 1;
    const outerRadius = distanceX*zoomFactor + 1;
    const thetaSegments = 80;
    const geometry = new THREE.RingBufferGeometry(innerRadius, outerRadius, thetaSegments);
    const material = new THREE.MeshBasicMaterial({
        color : 0xf5e96c,
        opacity : 0.2,
        transparent : true,
        side: THREE.DoubleSide
    });
    var mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = Math.PI / 2;
    scene.add(mesh);

}
//Creates the earth's clouds (this function was taken from the internet)
const createEarthClouds = () => {
    const canvasCloud = document.createElement('canvas');
    canvasCloud.width = 1024;
    canvasCloud.height = 512;
    const contextCloud = canvasCloud.getContext('2d');

    // Load earthcloudmap
    const imageMap    = new Image();
    imageMap.addEventListener('load', function() {
        // Create dataMap ImageData for earthcloudmap
        const canvasMap = document.createElement('canvas');
        canvasMap.width = imageMap.width;
        canvasMap.height = imageMap.height;
        const contextMap = canvasMap.getContext('2d');
        contextMap.drawImage(imageMap, 0, 0);
        const dataMap = contextMap.getImageData(0, 0, canvasMap.width, canvasMap.height);

        // Load earthcloudmaptrans
        const imageTrans = new Image();
        imageTrans.addEventListener('load', function () {
            // Create dataTrans ImageData for earthcloudmaptrans
            const canvasTrans = document.createElement('canvas');
            canvasTrans.width = imageTrans.width;
            canvasTrans.height = imageTrans.height;
            const contextTrans = canvasTrans.getContext('2d');
            contextTrans.drawImage(imageTrans, 0, 0);
            const dataTrans = contextTrans.getImageData(0, 0, canvasTrans.width, canvasTrans.height);

        // Merge dataMap + dataTrans into dataResult
            const dataResult = contextMap.createImageData(canvasMap.width, canvasMap.height);
            for (let y = 0, offset = 0; y < imageMap.height; y++) {
                for (let x = 0; x < imageMap.width; x++, offset += 4) {
                    // The array contains (height x width x 4 bytes) of data
                    dataResult.data[offset + 0] = dataMap.data[offset + 0]; // Red channel
                    dataResult.data[offset + 1] = dataMap.data[offset + 1]; // Green channel
                    dataResult.data[offset + 2] = dataMap.data[offset + 2]; // Blue channel
                    dataResult.data[offset + 3] = 255 - dataTrans.data[offset + 0]; // Alpha channel
                }
            }

            // Update texture with the result
            contextCloud.putImageData(dataResult,0,0);
            material.map.needsUpdate = true;
        });
        imageTrans.crossOrigin = 'Anonymous';
        imageTrans.src = baseURL + 'images/earthcloudmaptrans.jpg';
        }, false);
    imageMap.crossOrigin = 'Anonymous';
    imageMap.src = baseURL + 'images/earthcloudmap.jpg';

    const geometry = new THREE.SphereGeometry(earthRadius*zoomFactor, 50 ,50);

    const material = new THREE.MeshPhongMaterial(
        {
            map : new THREE.Texture(canvasCloud),
            transparent : true,
            opacity : 0.8
        });
        const mesh = new THREE.Mesh(geometry, material);
        return mesh;
    };


// This function is loaded whenever we load the document
function init() {
    //Get Display Canvas
    canvas = document.getElementById("webglcanvas");
    console.log(canvas);
    
    //Create the Threejs renderer and attach it to the canvas
    renderer = new THREE.WebGLRenderer({canvas : canvas, antialias : true});
    
    //Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    document.body.appendChild(renderer.domElement);

    //Create a scene
    scene = new THREE.Scene();

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    //Add a camera
    camera = new THREE.PerspectiveCamera(60, canvas.width/canvas.height, 1, 10000);
    camera.position.set(0, 800, 2400);
    
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    // OrbitControl
    controls = new THREE.OrbitControls(camera, canvas);

    //Add lights
    var light = new THREE.PointLight(0xFFFFFF, 0.5);
    light.position.set(0, 0, 0);
    scene.add(light);

    var light = new THREE.AmbientLight(0x888888);
    scene.add(light);

    //We put our basic mesh here
    const solarSystem = new THREE.Group();
    scene.add(solarSystem);

    //We first put the Sun
    sun = createSun(solarSystem);

    //Then all the planets and their orbits
    mercuryOrbit = createOrbits(solarSystem);
    mercury = createPlanet("mercury", mercuryRadius, mercurySunDistance, mercuryOrbit, scene);
    createOrbitLines(mercurySunDistance, scene);

    venusOrbit = createOrbits(solarSystem);
    venus = createPlanet("venus", venusRadius, venusSunDistance, venusOrbit, scene);
    createOrbitLines(venusSunDistance, scene);

    earthOrbit = createOrbits(solarSystem);
    earth = createPlanet("earth", earthRadius, earthSunDistance, earthOrbit, scene);
    earthClouds = createEarthClouds();
    earth.add(earthClouds);
    createOrbitLines(earthSunDistance, scene);

    marsOrbit = createOrbits(solarSystem);
    mars = createPlanet("mars", marsRadius, marsSunDistance, marsOrbit, scene);
    createOrbitLines(marsSunDistance, scene);

    jupiterOrbit = createOrbits(solarSystem);
    jupiter = createPlanet("jupiter", jupiterRadius, jupiterSunDistance, jupiterOrbit, scene);
    createOrbitLines(jupiterSunDistance, scene);

    saturnOrbit = createOrbits(solarSystem);
    saturn = createPlanet("saturn", saturnRadius, saturnSunDistance, saturnOrbit, scene);
    createOrbitLines(saturnSunDistance, scene);

    // Saturns ring
    const innerRadius = 26;
    const outerRadius = 32;
    const thetaSegments = 60;
    const saturnBelt = new THREE.RingBufferGeometry(
        innerRadius, outerRadius, thetaSegments);
    const material = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(saturnBelt, material);
    mesh.rotation.set(5,0,0);
    mesh.position.set(saturnSunDistance*zoomFactor, 0, 0);
    saturnOrbit.add(mesh);

    uranusOrbit = createOrbits(solarSystem);
    uranus = createPlanet("uranus", uranusRadius, uranusSunDistance, uranusOrbit, scene);
    createOrbitLines(uranusSunDistance, scene);

    neptuneOrbit = createOrbits(solarSystem);
    neptune = createPlanet("neptune", neptuneRadius, neptuneSunDistance, neptuneOrbit, scene);
    createOrbitLines(neptuneSunDistance, scene);
    
    moonOrbit = createMoonOrbit(earthOrbit);
    moon = createPlanet("moon", moonRadius, earthMoonDistance, moonOrbit, scene);
    createOrbitLines(earthMoonDistance, moonOrbit);
    canvas.addEventListener('dblclick', onDoubleClick);

    galaxy = createGalaxy();
    scene.add(galaxy);
}

//This function is called regularly to update the canvas webgl
function run() {
    //Ask to call again run
    requestAnimationFrame(run);

    //Render the scene
    render();

    //Animate if the camera should move
    animate();

    
}

//This funciton takes care of the rendering
function render() {
    controls.update();
    renderer.render(scene, camera);
}

//This function updates object
function animate(){
    //Computes the time change
    var now = Date.now();
    var deltaTime = now - curTime;
    curTime = now;
    var fracTime = deltaTime / 1000;
    //We put here the changes 
    //the variable angle is based on the rotation of the earth 
    var angle = fracTime * Math.PI * 2;

    mercuryOrbit.rotation.y += angle/88;
    mercury.rotation.y += angle/58;

    venusOrbit.rotation.y += angle/225;
    venus.rotation.y += angle/243;

    earthOrbit.rotation.y += angle/365;
    earth.rotation.y += angle;

    marsOrbit.rotation.y += angle/687;
    mars.rotation.y += angle;

    jupiterOrbit.rotation.y += angle/4329;
    jupiter.rotation.y += angle*2;

    saturnOrbit.rotation.y += angle/10751;
    saturn.rotation.y += angle*2;

    uranusOrbit.rotation.y += angle/30664;
    uranus.rotation.y += angle*1.5;

    neptuneOrbit.rotation.y += angle/60148;
    neptune.rotation.y += angle*1.5;

    moonOrbit.rotation.y += angle/28;
    moon.rotation.y += angle/28;
    sun.rotation.y += angle/27;  
}

//When we double click on an object of the scene an animation starts and the camera goes towards the object's position
//and a fun fact about the object get written on the screen. 
function onDoubleClick(event)
    {
        event.preventDefault();

        mouse.x =(event.clientX/canvas.width)*2 - 1;
        mouse.y = - (event.clientY/canvas.height)*2 + 1;
        raycaster.setFromCamera(mouse, camera);
        var intersects = raycaster.intersectObjects(scene.children, true);
        if (intersects.length)
        {
            var coords = camera.position;
            // I take the first object that the ray encounters
            var planet = intersects[0].object;
            var cur_pos_x = planet.position.x * Math.cos(planet.parent.rotation.y);
            var cur_pos_z = planet.position.x * Math.sin(-planet.parent.rotation.y);
            controls.target = new THREE.Vector3(cur_pos_x, planet.position.y, cur_pos_z);
            var tween = new TWEEN.Tween(coords).to({x:cur_pos_x - 60, y:planet.position.y + 20,z:cur_pos_z}, 2000);
            tween.start();
            // Depending on which planet we click on we get the right fun fact
            if (planet.position.x == (zoomFactor*mercurySunDistance))
            {
                funFact = data.mercury.funFact;
            }

            if (planet.position.x == (zoomFactor*venusSunDistance))
            {
                funFact = data.venus.funFact;
            }

            if (planet.position.x == (zoomFactor*earthSunDistance))
            {
                funFact = data.earth.funFact;
            }

            if (planet.position.x == (zoomFactor*marsSunDistance))
            {
                funFact = data.mars.funFact;
            }

            if (planet.position.x == (zoomFactor*jupiterSunDistance))
            {
                funFact = data.jupiter.funFact;
            }

            if (planet.position.x == (zoomFactor*saturnSunDistance))
            {
                funFact = data.saturn.funFact;
            }

            if (planet.position.x == (zoomFactor*uranusSunDistance))
            {
                funFact = data.uranus.funFact;
            }

            if (planet.position.x == (zoomFactor*neptuneSunDistance))
            {
                funFact = data.neptune.funFact;
            }
            
            h1.innerText = "Fun Fact : " + funFact;
            document.body.appendChild(h1);
            requestAnimationFrame(animation);
        }
        

            
    }


//This Gui is for further development if I need it later.
function setUpGui()
{   
    //Definition of the controllers
    effectController = {
        mensaje : "Over 4.4 billion years ago, a Mars-size body smashed into a primitive Earth, launching our moon into permanent orbit around our planet.But a new study finds that this event could have had a much larger impact than previously thought. The collision could also have imbued our planet with the carbon, nitrogen and sulfur needed for life to form, scientists reported today (Jan. 23) in the journal Science Advances.",
        planet : []
    }
    //Creation of the interface
    var gui = new dat.GUI();
    //Construction of menu
    var menu = gui.addFolder("Control infos on planets");
    menu.add(effectController, 'planet', {Mercury:0, Venus:1, Earth:2, Mars:3, Jupiter:4, Saturn:5, Uranus:6, Neptune:7}).name("Planet")
    menu.add(effectController, 'mensaje').name("Fun Fact")
        
}


//This function is for the TWEEN animations
function animation(time)
{
    
    requestAnimationFrame(animation);
    TWEEN.update(time);
}
    

//This function is for further uses it will allow me to draw a message bubble for the fun facts.
function drawMessageBubble()
{
    if (canvas.getContext)
    {
        var ctx = canvas.getContext('2d');

        //Formation of the bubble
        ctx.beginPath();
        ctx.moveTo(75, 25);
        ctx.quadraticCurveTo(25, 25, 25, 62.5);
        ctx.quadraticCurveTo(25, 100, 50, 100);
        ctx.quadraticCurveTo(50, 120, 30, 125);
        ctx.quadraticCurveTo(60, 120, 65, 100);
        ctx.quadraticCurveTo(125, 100, 125, 62.5);
        ctx.quadraticCurveTo(125, 25, 75, 25);
        ctx.stroke();
    }
}
    
   
