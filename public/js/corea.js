import * as THREE from 'three';
import { ARButton } from 'three/examples/jsm/webxr/ARButton.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { blur, uniform } from 'three/tsl';


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
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 10);
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
        if (obj.name === 'PlayAnimation') {
            if (mixer) {
                mixer.clipAction(gltf.animations[0]).play(); // Reproducir la animación
            }
        }

        switch (obj.name) {
            case 'Pause':
                if (currentVideoElement) currentVideoElement.pause();
                break;
            case 'Play':
                if (currentVideoElement) currentVideoElement.play();
                break;
            case 'Gray':
                if (currentVideo) currentVideo.material = createVideoShaderMaterial(currentVideo.material.uniforms.tex.value, 'gray');
                break;
            case 'Blur':
                if (currentVideo) currentVideo.material = createVideoShaderMaterial(currentVideo.material.uniforms.tex.value, 'blur');
                break;
            case 'Contrast':
                if (currentVideo) currentVideo.material = createVideoShaderMaterial(currentVideo.material.uniforms.tex.value, 'contrast');
                break;
            case 'Clear':
                if (currentVideo) currentVideo.material = createVideoShaderMaterial(currentVideo.material.uniforms.tex.value, 'none');
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

function createVideoShaderMaterial(texture, type = 'none') {
    // mapear nombres a enteros que usa el shader
    const filterMap = { none: 0, gray: 1, contrast: 2, blur: 3 };
    let uType = 0;
    if (typeof type === 'string') {
        uType = filterMap[type.toLowerCase()] ?? 0;
    } else {
        uType = Number(type) || 0;
    }

    const uniforms = {
        tex: { value: texture },
        uFilterType: { value: uType }
    };

    return new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
    `,
        fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tex;
    uniform int uFilterType;

    vec4 grayscale(vec4 color) {
        float avg = (color.r + color.g + color.b) / 3.0;
        return vec4(vec3(avg), color.a);
    }

    vec4 contrast(vec4 color) {
        float contrast = 2.0;
        color.rgb = ((color.rgb - 0.5) * contrast + 0.5);
        return color;
    }

    vec4 blur(sampler2D t, vec2 uv) {
        float offset = 1.0 / 16.0;
        vec4 sum = vec4(0.0);
        sum += texture2D(t, uv + vec2(-offset, -offset)) * 0.0625;
        sum += texture2D(t, uv + vec2( offset, -offset)) * 0.0625;
        sum += texture2D(t, uv + vec2(-offset,  offset)) * 0.0625;
        sum += texture2D(t, uv + vec2( offset,  offset)) * 0.0625;
        sum += texture2D(t, uv + vec2(0.0, 0.0)) * 0.75;
        return sum;
    }

    void main() {
        vec4 color = texture2D(tex, vUv);
        if (uFilterType == 1) color = grayscale(color);
        else if (uFilterType == 2) color = contrast(color);
        else if (uFilterType == 3) color = blur(tex, vUv);
        gl_FragColor = color;
    }
    `
    });
}

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
        // geometría
        if (currentVideo.geometry) currentVideo.geometry.dispose();

        // material: puede ser ShaderMaterial (usa uniform tex) o tener map
        const mat = currentVideo.material;
        try {
            if (mat) {
                if (mat.map) {
                    mat.map.dispose();
                } else if (mat.uniforms && mat.uniforms.tex && mat.uniforms.tex.value && typeof mat.uniforms.tex.value.dispose === 'function') {
                    mat.uniforms.tex.value.dispose();
                }
                mat.dispose();
            }
        } catch (e) {
            console.warn('Error al liberar material de currentVideo:', e);
        }

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
        if (btn.geometry) btn.geometry.dispose();
        // proteger por si no hay textura
        try {
            if (btn.material && btn.material.map) btn.material.map.dispose();
            if (btn.material) btn.material.dispose();
        } catch (e) {
            console.warn('Error al liberar material de control de video:', e);
        }
    });
    currentVideoControls = [];

    // Eliminar modelo
    if (currentModel) {
        scene.remove(currentModel);
        // si quieres liberar geometrías/texturas del GLTF, haz un traverse aquí
        currentModel = null;
    }
}


function showStats() {
    clearSceneSections(); // limpiar antes de crear
    const loader = new FontLoader();

    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeo = new TextGeometry
            ("               Primer Mundial:\n                    1954 \n\n          N. Participaciones: 10  \n\n          Jugadores destacados: \n            -Son Heung-min \n            -Cha Bum-kun \n            -Park Ji-sung", {
                font: font,
                size: 0.03,
                height: 0,
                depth: 0.001,
            });
        const statsText = new THREE.Mesh(
            textGeo,
            new THREE.MeshBasicMaterial({ color: 0x00000 })
        );
        statsText.position.set(-0.5, 0.25, -1);
        scene.add(statsText);

        currentStats.push(statsText); // ✅ referencia guardada dentro del callback
    });

    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeo2 = new TextGeometry("       Mejor Puesto:\nSemifinales (2002)", {
            font: font,
            size: 0.03,
            height: 0,
            depth: 0,
        });
        const statsText2 = new THREE.Mesh(
            textGeo2,
            new THREE.MeshBasicMaterial({ color: 0xff0f0 })
        );
        statsText2.position.set(0.17, 0.20, -1);
        scene.add(statsText2);

        currentStats.push(statsText2); // ✅ también guardado aquí
    });

    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeo3 = new TextGeometry("         Uniforme Actual", {
            font: font,
            size: 0.03,
            height: 0,
            depth: 0,
        });
        const statsText3 = new THREE.Mesh(
            textGeo3,
            new THREE.MeshBasicMaterial({ color: 0xff0f0 })
        );
        statsText3.position.set(0.15, -0.35, -1);
        scene.add(statsText3);

        currentStats.push(statsText3); // ✅ también guardado aquí
    });

    const Uniforme = crearBoton3d('Uniforme', 0xffffff, 0, 0, 'Uniforme_corea.jpeg');
    Uniforme.position.set(0.08, -0.03, -0.2);
    Uniforme.scale.set(0.6, 0.6, 0.4);
    currentStats.push(Uniforme); // ✅ guardar referencia

}

const triviaQuestions = [
    {
        question: "En que anio clasifico Corea del Sur por primera vez a un Mundial?",
        options: ["1954", "1962", "1986", "1994"],
        correct: 0
    },
    {
        question: "Quien es la estrella mas reconocida actualmente de Corea del Sur?",
        options: ["Son Heung-min", "Park Ji-sung", "Cha Bum-kun", "Lee Kang-in"],
        correct: 0
    },
    {
        question: "En que confederacion juega Corea del Sur?",
        options: ["UEFA", "AFC", "CONCACAF", "CONMEBOL"],
        correct: 1
    }
];

const buttonColors = [
    0x2196f3, // azul
    0x4caf50, // verde
    0xff9800, // naranja
    0xe91e63  // rosa
];

// Reemplazar la función showTrivia() existente
function showTrivia() {
    clearSceneSections();

    let currentQuestion = 0;
    let score = 0;

    function showQuestion(questionIndex) {
        currentTrivia.forEach(mesh => {
            scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
        })
        currentTrivia = [];

        const loader = new FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
            // Mostrar pregunta
            const questionGeo = new TextGeometry(triviaQuestions[questionIndex].question, {
                font: font,
                size: 0.04,
                height: 0,
                depth: 0.004
            });
            const questionMesh = new THREE.Mesh(
                questionGeo,
                new THREE.MeshBasicMaterial({ color: 0xffffff })
            );
            questionMesh.position.set(-0.6, 0.2, -1);
            scene.add(questionMesh);
            currentTrivia.push(questionMesh);

            // Mostrar opciones
            triviaQuestions[questionIndex].options.forEach((option, idx) => {
                const btnGeo = new THREE.PlaneGeometry(0.4, 0.1);
                const btnMat = new THREE.MeshBasicMaterial({
                    color: buttonColors[idx], // usar color según índice
                    transparent: true,
                    opacity: 0.8
                });
                const btn = new THREE.Mesh(btnGeo, btnMat);

                // Calcula posición en formato 2x2
                const row = Math.floor(idx / 2);    // 0 o 1
                const col = idx % 2;                // 0 o 1
                const xPos = -0.25 + (col * 0.5);   // -0.25 para primera columna, 0.25 para segunda
                const yPos = 0.05 - (row * 0.15);   // Primera fila en 0.05, segunda en -0.1

                btn.position.set(xPos, yPos, -1);
                btn.userData = { optionIndex: idx };

                const textGeo = new TextGeometry(option, {
                    font: font,
                    size: 0.03,
                    height: 0,
                    depth: 0.004
                });
                const textMesh = new THREE.Mesh(
                    textGeo,
                    new THREE.MeshBasicMaterial({ color: 0xffffff })
                );
                textMesh.position.copy(btn.position).add(new THREE.Vector3(-0.15, -0.02, 0.001));

                scene.add(btn);
                scene.add(textMesh);
                currentTrivia.push(btn, textMesh);
            });
        });
    }

    // Modificar el event listener existente para manejar las respuestas
    const originalClickHandler = window.onclick;
    window.onclick = (event) => {
        tapPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
        tapPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(tapPosition, camera);
        const intersects = raycaster.intersectObjects(currentTrivia);

        if (intersects.length > 0) {
            const selected = intersects[0].object;
            if (selected.userData && typeof selected.userData.optionIndex !== 'undefined') {
                const correct = selected.userData.optionIndex === triviaQuestions[currentQuestion].correct;
                if (correct) score++;

                if (currentQuestion < triviaQuestions.length - 1) {
                    currentQuestion++;
                    showQuestion(currentQuestion);
                } else {
                    // Mostrar resultado final
                    clearSceneSections();
                    const loader = new FontLoader();
                    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
                        const finalText = new TextGeometry(
                            `Juego terminado!\nPuntaje: ${score}/${triviaQuestions.length}`, {
                            font: font,
                            size: 0.05,
                            height: 0,
                            depth: 0.004
                        });
                        const finalMesh = new THREE.Mesh(
                            finalText,
                            new THREE.MeshBasicMaterial({ color: 0xffffff })
                        );
                        finalMesh.position.set(-0.3, 0, -1);
                        scene.add(finalMesh);
                        currentTrivia.push(finalMesh);
                    });
                }
            }
        }
    };

    // Mostrar la primera pregunta
    showQuestion(0);
}

function showVideo() {
    clearSceneSections(); // limpiar antes

    const video = document.createElement('video');
    video.src = '/assets/videos/corea.mp4';
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    // Material inicial (sin filtro)
    const baseMaterial = createVideoShaderMaterial(texture, 'none');

    const videoScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.8, 1.3),
        baseMaterial
    );
    videoScreen.position.set(0, 0, -1.5);
    scene.add(videoScreen);
    currentVideo = videoScreen;
    currentVideoElement = video;

    const pauseBtn = crearBoton3d('Pause', 0xffffff, -0.2, -0.5, 'pauseicon.png');
    const playBtn = crearBoton3d('Play', 0xffffff, 0.2, -0.5, 'playicon.jpg');
    playBtn.position.set(0.2, 0, -0.5);
    pauseBtn.position.set(0.2, -0.03, -0.5);

    const grayBtn = crearBoton3d('Gray', 0xffffff, -0.35, -0.5, 'grayicon.png');
    const blurBtn = crearBoton3d('Blur', 0xffffff, -0.12, -0.5, 'bluricon.png');
    const contrastBtn = crearBoton3d('Contrast', 0xffffff, 0.12, -0.5, 'contrasticon.png');
    const clearBtn = crearBoton3d('Clear', 0xffffff, 0.35, -0.5, 'clearicon.png');
    clearBtn.position.set(0.15, -0.13, -0.5);
    grayBtn.position.set(-0.15, -0.13, -0.5);
    blurBtn.position.set(-0.05, -0.13, -0.5);
    contrastBtn.position.set(0.05, -0.13, -0.5);


    currentVideoControls.push(pauseBtn, playBtn, grayBtn, blurBtn, contrastBtn, clearBtn);

}

let mixer;

function showModel() {
    clearSceneSections(); // limpiar antes de crear

    const loader = new GLTFLoader();
    loader.load('/assets/models/korean.glb', (gltf) => {
        currentModel = gltf.scene; // ✅ guardar referencia aquí
        currentModel.position.set(0, -0.8, -2);
        currentModel.scale.set(0.001, 0.001, 0.001);
        scene.add(currentModel);

        // Configurar el mixer para las animaciones
        mixer = new THREE.AnimationMixer(currentModel);
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play(); // Reproducir la primera animación
        });
    });

    // Crear botón para iniciar la animación
    const playAnimBtn = crearBoton3d('PlayAnimation', 0xffffff, -2.0, -0.5, 'playicon.png');
    playAnimBtn.position.set(0, 0, -0.5);
    playAnimBtn.name = 'PlayAnimation'; // Asignar un nombre al botón
    currentVideoControls.push(playAnimBtn); // Guardar referencia del botón
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

    if (mixer) {
        mixer.update(0.01);
    }

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
