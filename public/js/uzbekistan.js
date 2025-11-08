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
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 5);
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
        map: new THREE.TextureLoader().load(`/assets/images/${imagen}`),
        transparent: true
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

// Raycaster para detectar clicks 3D
const raycaster = new THREE.Raycaster();
const tapPosition = new THREE.Vector2();

window.addEventListener('click', (event) => {
    tapPosition.x = (event.clientX / window.innerWidth) * 2 - 1;
    tapPosition.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(tapPosition, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.name === 'miBoton') {
            alert('Botón 3D presionado');
            window.location.href = '/src/banderas.html';
            return;
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

// Estado actual
let currentModel = null;
let currentVideo = null;
let currentTrivia = [];
let currentStats = [];
let currentVideoElement = null;
let currentVideoControls = [];

function createVideoShaderMaterial(texture, type = 'none') {
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
        float offset = 1.0 / 10.0;
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
    currentStats.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    });
    currentStats = [];

    currentTrivia.forEach(mesh => {
        scene.remove(mesh);
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) mesh.material.dispose();
    });
    currentTrivia = [];

    if (currentVideo) {
        scene.remove(currentVideo);
        if (currentVideo.geometry) currentVideo.geometry.dispose();
        const mat = currentVideo.material;
        try {
            if (mat) {
                if (mat.map) mat.map.dispose();
                else if (mat.uniforms && mat.uniforms.tex && mat.uniforms.tex.value && typeof mat.uniforms.tex.value.dispose === 'function') {
                    mat.uniforms.tex.value.dispose();
                }
                mat.dispose();
            }
        } catch (e) {
            console.warn('Error al liberar material de currentVideo:', e);
        }
        currentVideo = null;
    }

    if (currentVideoElement) {
        currentVideoElement.pause();
        currentVideoElement.currentTime = 0;
        currentVideoElement = null;
    }

    currentVideoControls.forEach(btn => {
        scene.remove(btn);
        if (btn.geometry) btn.geometry.dispose();
        try {
            if (btn.material && btn.material.map) btn.material.map.dispose();
            if (btn.material) btn.material.dispose();
        } catch (e) {
            console.warn('Error al liberar material de control de video:', e);
        }
    });
    currentVideoControls = [];

    if (currentModel) {
        scene.remove(currentModel);
        currentModel = null;
    }
}

function showStats() {
    clearSceneSections();
    const loader = new FontLoader();

    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeo = new TextGeometry(
            "Primer Mundial:\n1982\n\nN. Participaciones: 2\n\nJugadores destacados:\n- Wynton Rufer\n- Ryan Nelsen\n- Chris Wood", {
                font: font,
                size: 0.03,
                height: 0,
                depth: 0.001,
            });
        const statsText = new THREE.Mesh(
            textGeo,
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        statsText.position.set(-0.5, 0.25, -1);
        scene.add(statsText);
        currentStats.push(statsText);
    });

    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeo2 = new TextGeometry("          Mejor Puesto:\nFase de grupos (1982, 2010)", {
            font: font,
            size: 0.03,
            height: 0,
            depth: 0,
        });
        const statsText2 = new THREE.Mesh(
            textGeo2,
            new THREE.MeshBasicMaterial({ color: 0xff0f0 })
        );
        statsText2.position.set(0.08, 0.20, -1);
        scene.add(statsText2);
        currentStats.push(statsText2);
    });

    loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
        const textGeo3 = new TextGeometry("Uniforme Actual", {
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
        currentStats.push(statsText3);
    });

    const Uniforme = crearBoton3d('Uniforme', 0xffffff, 0, 0, 'zeland.webp');
    Uniforme.position.set(0.06, -0.03, -0.2);
    Uniforme.scale.set(0.6, 0.6, 0.4);
    currentStats.push(Uniforme);
}

const triviaQuestions = [
        {
            question: "En que anio clasifico Nueva Zelanda por primera vez a un Mundial?",
            options: ["1978", "1982", "1990", "2010"],
            correct: 1
        },
        {
            question: "Quien es uno de los jugadores mas reconocidos de Nueva Zelanda?",
            options: ["Wynton Rufer", "Ryan Nelsen", "Chris Wood", "Winston Reid"],
            correct: 0
        },
        {
            question: "En que confederacion juega Nueva Zelanda?",
            options: ["OFC", "AFC", "UEFA", "CONCACAF"],
            correct: 0
        }
];

const buttonColors = [
    0x2196f3,
    0x4caf50,
    0xff9800,
    0xe91e63
];

function showTrivia() {
    clearSceneSections();

    let currentQuestion = 0;
    let score = 0;

    function showQuestion(questionIndex) {
        currentTrivia.forEach(mesh => {
            scene.remove(mesh);
            if (mesh.geometry) mesh.geometry.dispose();
            if (mesh.material) mesh.material.dispose();
        });
        currentTrivia = [];

        const loader = new FontLoader();
        loader.load('/fonts/helvetiker_regular.typeface.json', function (font) {
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

            triviaQuestions[questionIndex].options.forEach((option, idx) => {
                const btnGeo = new THREE.PlaneGeometry(0.4, 0.1);
                const btnMat = new THREE.MeshBasicMaterial({
                    color: buttonColors[idx],
                    transparent: true,
                    opacity: 0.8
                });
                const btn = new THREE.Mesh(btnGeo, btnMat);

                const row = Math.floor(idx / 2);
                const col = idx % 2;
                const xPos = -0.25 + (col * 0.5);
                const yPos = 0.05 - (row * 0.15);

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

    showQuestion(0);
}

function showVideo() {
    clearSceneSections();

    const video = document.createElement('video');
    video.src = '/assets/videos/zeland.mp4';
    video.loop = true;
    video.muted = false;
    video.playsInline = true;
    video.play();

    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;

    const baseMaterial = createVideoShaderMaterial(texture, 'none');

    const videoScreen = new THREE.Mesh(
        new THREE.PlaneGeometry(1, 1),
        baseMaterial
    );
    videoScreen.position.set(0, -0.1, -1.5);
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
    clearSceneSections();

    const loader = new GLTFLoader();
    loader.load('/assets/models/zeland.glb', (gltf) => {
        currentModel = gltf.scene;
        currentModel.position.set(0, -0.6, -2);
        currentModel.scale.set(7, 7, 7);
        scene.add(currentModel);

        mixer = new THREE.AnimationMixer(currentModel);
        if(gltf.animations && gltf.animations.length > 0){
            mixer.clipAction(gltf.animations[0]).play();
            mixer.timeScale = 2;
        }
    });

}

showStats();

const camDir = new THREE.Vector3();
const camRight = new THREE.Vector3();
const camUp = new THREE.Vector3(0, 1, 0);

renderer.setAnimationLoop(() => {
    camera.getWorldDirection(camDir);

    if (mixer) {
        mixer.update(0.01);
    }

    const distance = 0.18;
    const offsetRight = 0.05;
    const offsetUp = -0.08;

    camera.getWorldDirection(camDir);
    camRight.crossVectors(camDir, camUp).normalize();
    camUp.set(0, 1, 0);

    hud3D.position.copy(camera.position)
        .add(camDir.multiplyScalar(distance))
        .add(camRight.multiplyScalar(offsetRight))
        .add(camUp.multiplyScalar(offsetUp));

    hud3D.lookAt(camera.position);

    renderer.render(scene, camera);
});

// Ajuste al cambiar tamaño de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.xr.addEventListener('sessionend', () => {
    const hudEl = document.getElementById('hud');
    if (hudEl) hudEl.style.display = 'block';
});