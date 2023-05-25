import * as THREE from 'three';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';

onload = () => {
    init();
}

const cubes = [];
const pyramids = [];
const objects = [];
const cameraSpeed = 0.1;

let canvas, renderer, scene, camera, currentObject, material, angle, colorsArrayCube, vertexColorsCube,
    colorsArrayPyramid, vertexColorsPyramid, nElements, choseColorOrTexture, typeOfElements, ambientLight, sunlight;

let xPosition = 0.015, yPosition = 0.015, zPosition = 3;

let targetX = xPosition, targetY = yPosition, targetZ = zPosition;

async function init() {

    canvas = document.getElementById('gl-canvas');
    let light = document.getElementById('buttonLight');
    light.onclick = applyLighting
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

    sunlight = new THREE.DirectionalLight(0xffffff, 0.5);
    sunlight.position.set(1.0, -4.0, -2.0);
    scene.add(sunlight);

    //N de elementos a ser gerados na cena, assim como o uso de um innerHTML para dar display no index.html
    await generateObjects();

    document.getElementById("nElements").innerHTML = nElements;
    document.getElementById("nCubes").innerHTML = cubes.length;
    document.getElementById("nPyramids").innerHTML = pyramids.length;
    document.getElementById("nObjects").innerHTML = objects.length;
    render();

}


window.addEventListener("keydown", (e) => {
    switch (e.key) {
        case "a":
            targetX -= cameraSpeed;
            break;
        case "w":
            targetZ -= cameraSpeed;
            break;
        case "d":
            targetX += cameraSpeed;
            break;
        case "s":
            targetZ += cameraSpeed;
            break;
    }
})

function generateRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

function updateCamera() {
    // Gradually move the camera towards the target position
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
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
            objectString = 'modelos/cat.obj';
            textureString = 'modelos/cat_texture.png';
        } else if (objectToLoad === 3) {
            objectString = 'modelos/pig.obj';
            textureString = 'modelos/pig.png';
        } else {
            objectString = 'modelos/trophy.obj';
            textureString = 'modelos/trophy.jpg';
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

    let amb_r = parseFloat(document.getElementById("ambient_r").value);
    let amb_g = parseFloat(document.getElementById("ambient_g").value);
    let amb_b = parseFloat(document.getElementById("ambient_b").value);

    let sun_r = parseFloat(document.getElementById("sun_r").value);
    let sun_g = parseFloat(document.getElementById("sun_g").value);
    let sun_b = parseFloat(document.getElementById("sun_b").value);

    let sun_x = parseFloat(document.getElementById("sun_x").value);
    let sun_y = parseFloat(document.getElementById("sun_y").value);
    let sun_z = parseFloat(document.getElementById("sun_z").value);

    ambientLight.color.setRGB(amb_r, amb_g, amb_b);
    sunlight.color.setRGB(sun_r, sun_g, sun_b);
    sunlight.position.set(sun_x, sun_y, sun_z);
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
        material = new THREE.MeshBasicMaterial({map: loader.load('Texture-2.jpg')});
    } else {
        material = new THREE.MeshBasicMaterial({vertexColors: true});
    }
    const pyramid = new THREE.Mesh(geometry, material);
    currentObject = pyramid;
    pyramid.position.set(generateRandomNumber(-10, 10), generateRandomNumber(-1, 1), generateRandomNumber(-10, 10));
    scene.add(pyramid);

}

function objectRotation() {

    for (const pyramid of pyramids) {
        angle = generateRandomNumber(0, 0.15);
        pyramid.rotation.x += angle;
        pyramid.rotation.y += angle;
        pyramid.rotation.z += angle;
    }


    for (const cube of cubes) {
        angle = generateRandomNumber(0, 0.15);
        cube.rotation.x += angle;
        cube.rotation.y += angle;
        cube.rotation.z += angle;

    }

    for (const object of objects) {
        angle = generateRandomNumber(0, 0.15);
        object.rotation.x += angle;
        object.rotation.y += angle;
        object.rotation.z += angle;
    }

}

function render() {

    //translation (NO PROJETO O PROFESSOR QUER MEXER A CAMARA NAO O OBJETO)
    updateCamera();
    //rotation
    objectRotation();

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}