onload=() => {
    init();
}

const cubes=[];
const pyramids=[];
const cameraSpeed = 0.1;

let canvas,renderer,scene,camera,currentObject,material,angle,colorsArrayCube,vertexColorsCube,colorsArrayPyramid,
    vertexColorsPyramid,nElements,choseColorOrTexture,light;
let xPosition=0.015,yPosition=0.015,zPosition=3;
let targetX = xPosition, targetY = yPosition, targetZ = zPosition;
let scaleFactor=0.1;

function init(){

    canvas= document.getElementById('gl-canvas');
    renderer=new THREE.WebGLRenderer({canvas});
    renderer.setClearColor(0xffffff);
    scene=new THREE.Scene();

    //Dados da camara

    const fov=75;
    const near=0.1;
    const far = 5;
    z_pos=3;
    const aspect_r=canvas.width/canvas.height;
    camera= new THREE.PerspectiveCamera(fov,aspect_r,near,far);
    camera.position.x=xPosition;
    camera.position.y=yPosition;
    camera.position.z=zPosition;

    //N de elementos a ser gerados na cena, assim como o uso de um innerHTML para dar display no index.html
    generateObjects();

    document.getElementById("nElements").innerHTML = nElements;
    document.getElementById("nCubes").innerHTML =  cubes.length;
    document.getElementById("nPyramids").innerHTML = pyramids.length;

    render();
}

window.addEventListener("keydown", (e)=>{
        switch(e.key){
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
    }
)

function updateCamera() {
    // Gradually move the camera towards the target position
    camera.position.x += (targetX - camera.position.x) * 0.1;
    camera.position.y += (targetY - camera.position.y) * 0.1;
    camera.position.z += (targetZ - camera.position.z) * 0.1;
}

//Função usada para definir um random
function generateRandomNumber(min, max) {
    return Math.random() * (max - min) + min;
}

/*function makeLight(lightType) {

}

function removeObjects() {
    for (let i = 0; i < cubes.length; i++) {
        scene.remove(cubes[i]);
    }
    cubes.length = 0;
    for (let i = 0; i < pyramids.length; i++) {
        scene.remove(pyramids[i]);
    }
    pyramids.length = 0;
}


function prepareLight(){

    document.getElementById("light_selector").onchange = function () {
        scene.remove(light);
        scene.remove(light.target);
        let lightType = document.getElementById("light_selector").value;
        makeLight(lightType);
    }

    //TODO: Entender how this works
    document.getElementById("material_selector").onchange = function () {
        removeObjects();
        let materialType = document.getElementById("material_selector").value;

    }
}*/

function generateObjects(){
    nElements= Math.floor(generateRandomNumber(5,30));
    for(let i =0; i<nElements;i++){
        let generateObject=generateRandomNumber(0,100);
        if(generateObject<50){
            makeCube();
            cubes.push(currentObject);
        }
        else{
            makePyramid();
            pyramids.push(currentObject);
        }
    }
}

//Função de criação do cubo
function makeCube(){

    //Gera valor aleatorio entre 0.1 e 0.5 para dimensão do cubo
    const cubeSide= generateRandomNumber(0.1,0.5);
    const loader = new THREE.TextureLoader();

    choseColorOrTexture=generateRandomNumber(0,100);

    //Cria a geometria, os vertices
    colorsArrayCube=[];
    vertexColorsCube =[];

    //Coloca no vertexColors valores random, ou seja determina as cores de forma aleatoria
    for (let randomColor = 0; randomColor < 6; randomColor++) {
        vertexColorsCube[randomColor] = [Math.random(), Math.random(), Math.random()];
    }

    //Atribui as colores do vertexColors às diferentes faces do cubo
    for (let face=0;face<6;face++) {
        let faceColor=new THREE.Color();
        faceColor.setRGB(vertexColorsCube[face][0], vertexColorsCube[face][1], vertexColorsCube[face][2]);
        for(let vertex=0;vertex<6;vertex++){
            colorsArrayCube.push(...faceColor);
        }
    }

    //Definições da geometria, cor, e junção ao cubo
    const geometry=new THREE.BoxGeometry(cubeSide,cubeSide,cubeSide).toNonIndexed();
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colorsArrayCube,3));

    if(choseColorOrTexture>50){
        material = new THREE.MeshBasicMaterial({map: loader.load('Texture-1.png')});    //Mudar para phnong
    }
    else{
        material= new THREE.MeshBasicMaterial({vertexColors:true});
    }

    const cube=new THREE.Mesh(geometry,material);

    currentObject=cube;

    //Definir posição do cubo
    cube.position.set(generateRandomNumber(-10,10),generateRandomNumber(-1,1),generateRandomNumber(-10,10));
    scene.add(cube);

}

//TODO:Corrigir, uma face e a base estão a ficar sem cor
function makePyramid(){

    choseColorOrTexture=generateRandomNumber(0,100);
    const randomSize=generateRandomNumber(0.1,0.5);
    const baseRadius=randomSize;
    const height=randomSize;
    const segments=3;
    const loader = new THREE.TextureLoader();

    //Cria a geometria, os vertices
    colorsArrayPyramid=[];
    vertexColorsPyramid=[];

    //Coloca no vertexColors valores random, ou seja determina as cores de forma aleatoria
    for (let randomColor = 0; randomColor < 4; randomColor++) {
        vertexColorsPyramid[randomColor] = [Math.random(), Math.random(), Math.random()];
    }

    for (let face=0;face<4;face++){
        let faceColor=new THREE.Color();
        faceColor.setRGB(vertexColorsPyramid[face][0], vertexColorsPyramid[face][1], vertexColorsPyramid[face][2]);
        for(let vertex=0;vertex<3;vertex++){        //alterar para 4 pinta 3 faces mas fica com fade
            colorsArrayPyramid.push(...faceColor);
        }
    }

    //Cria a geometria, os vertices
    const geometry=new THREE.ConeGeometry(baseRadius,height,segments).toNonIndexed();
    geometry.setAttribute('color',new THREE.Float32BufferAttribute(colorsArrayPyramid,3))
    if(choseColorOrTexture>50){
        material = new THREE.MeshBasicMaterial({map: loader.load('Texture-2.jpg')});
    }
    else{
        material= new THREE.MeshBasicMaterial({vertexColors:true});
    }
    const pyramid=new THREE.Mesh(geometry,material);
    currentObject=pyramid;
    pyramid.position.set(generateRandomNumber(-10,10),generateRandomNumber(-1,1),generateRandomNumber(-10,10));
    scene.add(pyramid);

}

function render(){

    //translation (NO PROJETO O PROFESSOR QUER MEXER A CAMARA NAO O OBJETO)

    //scaling

    //rotation
    for(const pyramid of pyramids){
        angle= generateRandomNumber(0,0.12);
        pyramid.rotation.x += angle;
        pyramid.rotation.y += angle;
        pyramid.rotation.z += angle;
    }


    for(const cube of cubes){
        angle= generateRandomNumber(0,0.12);
        cube.rotation.x += angle;
        cube.rotation.y += angle;
        cube.rotation.z += angle;
    }

    updateCamera();

    renderer.render(scene,camera);
    requestAnimationFrame(render);
}