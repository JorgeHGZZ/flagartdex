


const homebutton = document.querySelector('#homeBtn');
const exitbutton = document.querySelector('#helpButton');
const collectionbutton = document.querySelector('#collectionButton');


homebutton.addEventListener('click', function () {
    window.location.href = "index.html";
});

collectionbutton.addEventListener('click', function () {
    window.location.href = "banderas.html";
});

const modal = document.getElementById("tutorialModal");
const helpButton = document.getElementById("helpButton");

// Cerrar modal
function cerrarModal() {
    modal.classList.display = "none"; // Lo oculta completamente
}


// Abrir modal al dar clic en el botón de ayuda
helpButton.addEventListener("click", () => {
    modal.style.display = "flex"; // Lo volvemos a mostrar
});



// --- Detectar primer escaneo ---
document.addEventListener("DOMContentLoaded", () => {
    if (!localStorage.getItem("mensajeInicialMostrado")) {
        mostrarMensajeInicial();
        localStorage.setItem("mensajeInicialMostrado", "true");
    }

    // Detectar cuando un target es encontrado
    const targets = document.querySelectorAll("[mindar-image-target]");

    targets.forEach(target => {
        target.addEventListener("targetFound", () => {
            // Solo mostrar mensaje la PRIMERA vez que se escanee algo
            if (!localStorage.getItem("primerEscaneo")) {
                mostrarMensajePrimerEscaneo();
                localStorage.setItem("primerEscaneo", "true");
            }
        });
    });
});

// --- Función para mostrar un mensaje especial ---
function mostrarMensajePrimerEscaneo() {
    const mensaje = document.createElement("div");
    mensaje.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 11000;">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 15px;
          text-align: center;
          width: 80%;
          max-width: 350px;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);">
          <h2>🎉 ¡Primer país desbloqueado!</h2>
          <p>Felicidades, acabas de escanear tu primer pais. Sigue escaneando para descubrir todos los países.</p>
          <button style="
            background:#007BFF;
            color:white;
            border:none;
            padding:10px 20px;
            border-radius:8px;
            font-size:1rem;
            margin-top:10px;
            cursor:pointer;"
            onclick="this.parentElement.parentElement.remove()">¡Genial!</button>
        </div>
      </div>
    `;
    document.body.appendChild(mensaje);
}

// --- Modal inicial: "Intenta escanear una bandera" ---
function mostrarMensajeInicial() {
    const mensaje = document.createElement("div");
    mensaje.innerHTML = `
      <div style="
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 11000;">
        <div style="
          background: white;
          padding: 20px;
          border-radius: 15px;
          text-align: center;
          width: 80%;
          max-width: 350px;
          box-shadow: 0 0 10px rgba(0,0,0,0.3);">
          <h2>👋 ¡Bienvenido!</h2>
          <p>Intenta escanear una bandera para desbloquear contenido en realidad aumentada.</p>
          <button style="
            background:#007BFF;
            color:white;
            border:none;
            padding:10px 20px;
            border-radius:8px;
            font-size:1rem;
            margin-top:10px;
            cursor:pointer;"
            onclick="this.parentElement.parentElement.remove()">¡Entendido!</button>
        </div>
      </div>
    `;
    document.body.appendChild(mensaje);
}