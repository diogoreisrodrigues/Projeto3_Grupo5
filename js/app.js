import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

onload = () => {
    init();
}

const cubes = [];
const pyramids = [];
const objects = [];
var light;
var lightColor;
var lightPosition;
var lightIntensity;

let canvas, renderer, scene, camera, currentObject, material, angle, colorsArrayCube, vertexColorsCube,
    colorsArrayPyramid, vertexColorsPyramid, nElements, choseColorOrTexture, typeOfElements, ambientLight, sunlight;

let xPosition = 0.015, yPosition = 0.015, zPosition = 3;

document.getElementById('light-color').addEventListener('change', applyLighting);
document.getElementById('buttonLight').addEventListener('click', applyLighting);

let movementForward = false;
let movementBackward = false;
let movementLeft = false;
let movementRight = false;

async function init() {

    canvas = document.getElementById('gl-canvas');
    //light = document.getElementById('buttonLight');
    //light.onclick = applyLighting
    renderer = new THREE.WebGLRenderer({canvas});
    renderer.setClearColor(0xffffff);
    scene = new THREE.Scene();

    //Dados da camara

    const fov = 75;
    const near = 0.1;
    const far = 35;
    const aspect_r = canvas.width / canvas.height;
    camera = new THREE.PerspectiveCamera(fov, aspect_r, near, far);
    camera.position.x = xPosition;
    camera.position.y = yPosition;
    camera.position.z = zPosition;

    ambientLight = new THREE.AmbientLight(0x888888);
    scene.add(ambientLight);

    light = new THREE.DirectionalLight(0x000000, 0.5);
    light.position.set(1.0, -4.0, -2.0);
    scene.add(light);

    //N de elementos a ser gerados na cena, assim como o uso de um innerHTML para dar display no index.html
    await generateObjects();

    document.getElementById("nElements").innerHTML = nElements;
    document.getElementById("nCubes").innerHTML = cubes.length;
    document.getElementById("nPyramids").innerHTML = pyramids.length;
    document.getElementById("nObjects").innerHTML = objects.length;

    canvas.addEventListener("mousemove", onMouseMove, false);

    render();

}

function generateRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function updateCameraMovement() {
    const movementSpeed = 0.06;
    const movementVector = new THREE.Vector3();

    if (movementForward) {
        movementVector.z -= movementSpeed;
    }

    if (movementBackward) {
        movementVector.z += movementSpeed;
    }

    if (movementLeft) {
        movementVector.x -= movementSpeed;
    }

    if (movementRight) {
        movementVector.x += movementSpeed;
    }

    movementVector.applyQuaternion(camera.quaternion);
    camera.position.add(movementVector);
}

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    const mouse = {
        x: (event.clientX / canvas.clientWidth) * 2 - 1,
        y: -(event.clientY / canvas.clientHeight) * 2 + 1
    };

    const isMouseWithinCanvas = mouse.x >= -1 && mouse.x <= 1 && mouse.y >= -1 && mouse.y <= 1;
    if (isMouseWithinCanvas) {
        // Update the camera rotation based on mouse movement (inverted left and right)
        const targetRotationX = Math.PI * mouse.y * 0.23;
        const targetRotationY = Math.PI * -mouse.x * 0.23;

        camera.rotation.x = targetRotationX;
        camera.rotation.y = targetRotationY;
    }
}

window.addEventListener("keydown", (e) => {
    handleKeyDown(e);
});

window.addEventListener("keyup", (e) => {
    handleKeyUp(e);
});

function handleKeyDown(event) {
    switch (event.key) {
        case "w":
            movementForward = true;
            break;
        case "s":
            movementBackward = true;
            break;
        case "a":
            movementLeft = true;
            break;
        case "d":
            movementRight = true;
            break;
    }
}

function handleKeyUp(event) {
    switch (event.key) {
        case "w":
            movementForward = false;
            break;
        case "s":
            movementBackward = false;
            break;
        case "a":
            movementLeft = false;
            break;
        case "d":
            movementRight = false;
            break;
    }
}

//Função usada para definir um random

async function generateObjects() {

    nElements = Math.floor(generateRandomNumber(5, 30));
    for (let i = 0; i < nElements; i++) {
        typeOfElements = generateRandomNumber(0, 100);
        if (typeOfElements < 70) {
            let generateObject = generateRandomNumber(0, 100);
            if (generateObject < 50) {
                makeCube();
                cubes.push(currentObject);
            } else {
                makePyramid();
                pyramids.push(currentObject);
            }
        } else {       //TODO: Entender como e que importo o.obj e as texturas

            currentObject = await make3DObject();
            scene.add(currentObject);
            objects.push(currentObject);

        }
    }

}

//TODO: Porquê que o objeto não está a ser adicionado?
async function make3DObject() {

    return new Promise((resolve, reject) => {

        const loader = new OBJLoader();
        let objectToLoad = Math.floor(generateRandomNumber(0, 5));
        let objectString;
        let textureString;
        let dimensions = generateRandomNumber(0.01, 0.05);

        if (objectToLoad === 0) {
            objectString = 'modelos/bird.obj';
            textureString = 'modelos/bird.jpg';
        } else if (objectToLoad === 1) {
            objectString = 'modelos/Astronaut.obj';
            textureString = 'modelos/Astronaut.png';
            dimensions = 0.5; //Diferente porque caso contrario fica muito pequeno
        } else if (objectToLoad === 2) {
            objectString = 'modelos/Astronaut.obj';
            textureString = 'modelos/Astronaut.png';
        } else if (objectToLoad === 3) {
            objectString = 'modelos/Astronaut.obj';
            textureString = 'modelos/Astronaut.png';
        } else {
            objectString = 'modelos/Astronaut.obj';
            textureString = 'modelos/Astronaut.png';
        }

        loader.load(objectString,

            function (object) {

                object.scale.set(dimensions, dimensions, dimensions);
                object.position.set(generateRandomNumber(-10, 10), generateRandomNumber(-1, 1), generateRandomNumber(-10, 10));
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load(textureString, function (texture) {
                    object.traverse(function (child) {
                        if (child instanceof THREE.Mesh) {
                            child.material.map = texture;
                            child.material.needsUpdate = true;
                        }
                    });
                });
                resolve(object);
            },

            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },

            function (error) {
                console.log('An error happened');
            });
    });

}

//TODO: Porquê que a luz não é adicionada à cena?
function applyLighting() {

    lightColor = document.getElementById('light-color').value;
    lightIntensity = parseFloat(document.getElementById('light-intensity').value);

    lightPosition = {
        x: parseFloat(document.getElementById('light-x').value),
        y: parseFloat(document.getElementById('light-y').value),
        z: parseFloat(document.getElementById('light-z').value)
    };

    // Update the light's color and intensity
    light.color.set(lightColor);
    light.intensity = lightIntensity;
    light.position.set(lightPosition.x, lightPosition.y, lightPosition.z);
}


//Função de criação do cubo
function makeCube() {

    //Gera valor aleatorio entre 0.1 e 0.5 para dimensão do cubo
    const cubeSide = generateRandomNumber(0.1, 0.5);
    const loader = new THREE.TextureLoader();

    choseColorOrTexture = generateRandomNumber(0, 100);

    //Cria a geometria, os vertices
    colorsArrayCube = [];
    vertexColorsCube = [];

    //Coloca no vertexColors valores random, ou seja determina as cores de forma aleatoria
    for (let randomColor = 0; randomColor < 6; randomColor++) {
        vertexColorsCube[randomColor] = [Math.random(), Math.random(), Math.random()];
    }

    //Atribui as colores do vertexColors às diferentes faces do cubo
    for (let face = 0; face < 6; face++) {
        let faceColor = new THREE.Color();
        faceColor.setRGB(vertexColorsCube[face][0], vertexColorsCube[face][1], vertexColorsCube[face][2]);
        for (let vertex = 0; vertex < 6; vertex++) {
            colorsArrayCube.push(...faceColor);
        }
    }

    //Definições da geometria, cor, e junção ao cubo
    const geometry = new THREE.BoxGeometry(cubeSide, cubeSide, cubeSide).toNonIndexed();
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArrayCube, 3));

    if (choseColorOrTexture > 50) {
        material = new THREE.MeshPhongMaterial({map: loader.load('Texture-1.png')});    //Mudar para phnong
    } else {
        material = new THREE.MeshPhongMaterial({vertexColors: true});
    }

    const cube = new THREE.Mesh(geometry, material);

    currentObject = cube;

    //Definir posição do cubo
    cube.position.set(generateRandomNumber(-10, 10), generateRandomNumber(-1, 1), generateRandomNumber(-10, 10));
    scene.add(cube);

}

//TODO:Corrigir, uma face e a base estão a ficar sem cor
function makePyramid() {

    choseColorOrTexture = generateRandomNumber(0, 100);
    const radius = generateRandomNumber(0.1, 0.5);
    const detail = 0;
    const loader = new THREE.TextureLoader();

    //Cria a geometria, os vertices
    colorsArrayPyramid = [];
    vertexColorsPyramid = [];

    //Coloca no vertexColors valores random, ou seja determina as cores de forma aleatoria
    for (let randomColor = 0; randomColor < 4; randomColor++) {
        vertexColorsPyramid[randomColor] = [Math.random(), Math.random(), Math.random()];
    }

    for (let face = 0; face < 4; face++) {
        let faceColor = new THREE.Color();
        faceColor.setRGB(vertexColorsPyramid[face][0], vertexColorsPyramid[face][1], vertexColorsPyramid[face][2]);
        for (let vertex = 0; vertex < 3; vertex++) {        //alterar para 4 pinta 3 faces mas fica com fade
            colorsArrayPyramid.push(...faceColor);
        }
    }

    //Cria a geometria, os vertices
    const geometry = new THREE.TetrahedronGeometry(radius, detail).toNonIndexed();
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colorsArrayPyramid, 3))
    if (choseColorOrTexture > 50) {
        material = new THREE.MeshStandardMaterial({map: loader.load('Texture-2.jpg')});
    } else {
        material = new THREE.MeshStandardMaterial({vertexColors: true});
    }
    const pyramid = new THREE.Mesh(geometry, material);
    currentObject = pyramid;
    pyramid.position.set(generateRandomNumber(-10, 10), generateRandomNumber(-1, 1), generateRandomNumber(-10, 10));
    scene.add(pyramid);

}

function objectRotation() {

    for (const pyramid of pyramids) {
        angle = generateRandomNumber(0, 0.08);
        pyramid.rotation.x += angle;
        pyramid.rotation.y += angle;
        pyramid.rotation.z += angle;
        console.log(angle);
    }

    for (const cube of cubes) {
        angle = generateRandomNumber(0, 0.08);
        cube.rotation.x += angle;
        cube.rotation.y += angle;
        cube.rotation.z += angle;

    }

    for (const object of objects) {
        angle = generateRandomNumber(0, 0.08);
        object.rotation.x += angle;
        object.rotation.y += angle;
        object.rotation.z += angle;
    }

}

function render() {

    //translation (NO PROJETO O PROFESSOR QUER MEXER A CAMARA NAO O OBJETO)
    updateCameraMovement();
    //rotation
    objectRotation();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}