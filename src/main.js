import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';


// Escena básica
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

// Botón AR
document.body.appendChild(ARButton.createButton(renderer));


// Luz
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// Crear el boton del hud 3D
const hud3D = new THREE.Mesh(
  new THREE.PlaneGeometry(0.2, 0.1),
  new THREE.MeshBasicMaterial({ color: 0x0000ff })
);
hud3D.scale.set(0.1, 0.1, 1);
hud3D.name = 'miBoton';
scene.add(hud3D);

function crearBoton3d(nombre, color, x, y, imagen) {
  const btn = new THREE.PlaneGeometry(0.1, 0.1);
  const btnMat = new THREE.MeshBasicMaterial({
    color,
    map: new THREE.TextureLoader().load(`/assets/images/${imagen}`), // Se usa el parámetro
    transparent: true // Para que la textura con transparencia se vea bien
  });
  const btnV = new THREE.Mesh(btn, btnMat);
  btnV.position.set(x, y, -0.3);
  btnV.scale.set(0.3, 0.7 / 3, 0.3);
  btnV.name = nombre;
  scene.add(btnV);
  return btnV;
}


const btnVideo = crearBoton3d('Video', 0xffffff, -0.0, 0.15, 'videoicon.jpg');
const btnStat = crearBoton3d('Stats', 0xffffff, -0.05, 0.15, 'statsicon.png');
const btnTriv = crearBoton3d('Trivia', 0xffffff, 0.06, 0.15, 'triviapicon.jpg');
const btnModel = crearBoton3d('Model', 0xffffff, 0.1, 0.15, 'model3dicon.webp');
console.log(btnVideo, btnStat, btnTriv, btnModel);



// Raycaster para detectar clicks 3D
const raycaster = new THREE.Raycaster();
const tapPosition = new THREE.Vector2();

window.addEventListener('click', (event) => {
  tapPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
  tapPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(tapPosition, camera);

  // intersecta solo con los hijos que agregaste a la cámara (HUD)
  const intersects = raycaster.intersectObjects(scene.children);

  if (intersects.length > 0) {
    const obj = intersects[0].object; // ✅ aquí está el objeto clickeado
    console.log('Clic en objeto 3D:', obj.name);
    if (obj.name === 'miBoton') {
      alert('Botón 3D presionado');
      window.location.href = '/src/banderas.html';
      return; // salir para no seguir evaluando
    }

    switch (obj.name) {
      case 'Pause':
        if (currentVideoElement) currentVideoElement.pause();
        break;
      case 'Play':
        if (currentVideoElement) currentVideoElement.play();
        break;
      case 'Stats':
        showStats();
        break;
      case 'Trivia':
        showTrivia();
        break;
      case 'Video':
        showVideo();
        break;
      case 'Model':
        showModel();
        break;
    }
  }
});


// 🔹 Función para limpiar lo anterior
let currentModel = null;
let currentVideo = null;
let currentTrivia = [];
let currentStats = [];
let currentVideoElement = null; // 🔹 referencia al elemento <video> para controlar audio
let currentVideoControls = []; // 🔹 botones de control del video (pausa, play, filtros)

function clearSceneSections() {
  // Eliminar stats
  currentStats.forEach(mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  currentStats = [];

  // Eliminar trivia
  currentTrivia.forEach(mesh => {
    scene.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });
  currentTrivia = [];

  // Eliminar video
  if (currentVideo) {
    scene.remove(currentVideo);
    currentVideo.geometry.dispose();
    currentVideo.material.map.dispose();
    currentVideo.material.dispose();
    currentVideo = null;
  }

  // Detener audio del video
  if (currentVideoElement) {
    currentVideoElement.pause();
    currentVideoElement.currentTime = 0;
    currentVideoElement = null;
  }

  // 🔹 Eliminar botones de control del video (pausa, play, filtros)
  currentVideoControls.forEach(btn => {
    scene.remove(btn);
    btn.geometry.dispose();
    btn.material.map.dispose(); // liberar textura
    btn.material.dispose();
  });
  currentVideoControls = [];

  // Eliminar modelo
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }
}


function showStats() {
  clearSceneSections(); // limpiar antes de crear
  const loader = new FontLoader();

  loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeo = new TextGeometry("Goles: 5 \nPuntos: 12 \nGrupo A", {
      font: font,
      size: 0.03,
      height: 0,
      depth: 0.001,
    });
    const statsText = new THREE.Mesh(
      textGeo,
      new THREE.MeshBasicMaterial({ color: 0x00000 })
    );
    statsText.position.set(-0.25, 0, -1);
    scene.add(statsText);

    currentStats.push(statsText); // ✅ referencia guardada dentro del callback
  });

  loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
    const textGeo2 = new TextGeometry("Ranking 13", {
      font: font,
      size: 0.03,
      height: 0,
      depth: 0,
    });
    const statsText2 = new THREE.Mesh(
      textGeo2,
      new THREE.MeshBasicMaterial({ color: 0xff0f0 })
    );
    statsText2.position.set(0.08, -0.05, -1);
    scene.add(statsText2);

    currentStats.push(statsText2); // ✅ también guardado aquí
  });
}

function showTrivia() {
  clearSceneSections(); // ✅ limpiar antes
  console.log("Mostrar trivia en 3D");

  //btn trivia 1
  const btn1 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x2196f3 })
  );
  btn1.position.set(-0.15, 0, -1);
  btn1.name = 'TriviaButton1';
  scene.add(btn1);
  currentTrivia.push(btn1); // ✅ guardar referencia

  //btn trivia 2
  const btn2 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x4caf50 })
  );
  btn2.position.set(-0.15, -0.15, -1);
  btn2.name = 'TriviaButton2';
  scene.add(btn2);
  currentTrivia.push(btn2); // ✅ guardar referencia

  //btn trivia 3
  const btn3 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.1),
    new THREE.MeshBasicMaterial({ color: 0xff5722 })
  );
  btn3.position.set(0.2, 0, -1);
  btn3.name = 'TriviaButton3';
  scene.add(btn3);
  currentTrivia.push(btn3); // ✅ guardar referencia

  //btn trivia 4
  const btn4 = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.1),
    new THREE.MeshBasicMaterial({ color: 0x9c27b0 })
  );
  btn4.position.set(0.2, -0.15, -1);
  btn4.name = 'TriviaButton4';
  scene.add(btn4);
  currentTrivia.push(btn4); // ✅ guardar referencia
}

function showVideo() {
  clearSceneSections(); // limpiar antes

  const video = document.createElement('video');
  video.src = '/assets/videos/GokuPelea.mp4';
  video.loop = true;
  video.muted = false;
  video.playsInline = true;
  video.play();

  const texture = new THREE.VideoTexture(video);
  const videoScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 0.56),
    new THREE.MeshBasicMaterial({ map: texture })
  );
  videoScreen.position.set(0, 0, -1.5);
  scene.add(videoScreen);

  currentVideo = videoScreen;      
  currentVideoElement = video;

  const pauseBtn = crearBoton3d('Pause', 0xffffff, -0.2, -0.5, 'pauseicon.png');
  const playBtn = crearBoton3d('Play', 0xffffff, 0.2, -0.5, 'playicon.jpg');
  playBtn.position.set(0.2, 0, -0.5);
  pauseBtn.position.set(-0.2, 0, -0.5);

  currentVideoControls.push(pauseBtn, playBtn);

}

function showModel() {
  clearSceneSections(); // limpiar antes de crear

  const loader = new GLTFLoader();
  loader.load('/assets/models/aguila.glb', (gltf) => {
    currentModel = gltf.scene; // ✅ guardar referencia aquí
    currentModel.position.set(0, 0, -2);
    scene.add(currentModel);
  });
}
showStats(); // Mostrar trivia al iniciar

const camDir = new THREE.Vector3();
// Vector lateral derecho
const camRight = new THREE.Vector3();
const camUp = new THREE.Vector3(0, 1, 0);

// En el loop de animación
renderer.setAnimationLoop(() => {
  // Dirección hacia adelante
  camera.getWorldDirection(camDir);

  // Calcular posición relativa: adelante + derecha + arriba
  const distance = 0.18; // frente a la cámara
  const offsetRight = 0.05; // a la derecha
  const offsetUp = -0.08;    // arriba

  // Vector lateral derecho de la cámara
  camera.getWorldDirection(camDir); // dirección hacia adelante
  camRight.crossVectors(camDir, camUp).normalize(); // vector a la derecha
  camUp.set(0, 1, 0); // vector hacia arriba

  hud3D.position.copy(camera.position)
    .add(camDir.multiplyScalar(distance))  // adelante
    .add(camRight.multiplyScalar(offsetRight)) // derecha
    .add(camUp.multiplyScalar(offsetUp));      // arriba

  hud3D.lookAt(camera.position); // siempre mirando a la cámara

  renderer.render(scene, camera);
});

// ---- Botón HTML encima del canvas ----
document.getElementById('htmlButton').addEventListener('click', () => {
  cube.material.color.set(Math.random() * 0xffffff);
});



// Ajuste al cambiar tamaño de ventana
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// renderer.xr.addEventListener('sessionstart', () => {
//   document.getElementById('hud').style.display = 'none';
// });

renderer.xr.addEventListener('sessionend', () => {
  document.getElementById('hud').style.display = 'block';
});
