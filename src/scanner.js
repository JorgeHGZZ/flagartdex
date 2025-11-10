const homebutton = document.querySelector('#homeBtn');
const collectionbutton = document.querySelector('#collectionButton');
const helpButton = document.getElementById("helpButton");
const modal = document.getElementById("tutorialModal");


// Helpers para localStorage
function getPaisesEscaneados() {
    return JSON.parse(localStorage.getItem("paisesEscaneados") || "[]");
}
function setPaisesEscaneados(arr) {
    localStorage.setItem("paisesEscaneados", JSON.stringify(arr));
}

homebutton.addEventListener('click', () => { window.location.href = "index.html"; });
collectionbutton.addEventListener('click', () => { window.location.href = "banderas.html"; });


// Cerrar/abrir modal (expuesto globalmente para el onclick inline del HTML)
function cerrarModal() {
    if (!modal) return;
    modal.style.display = "none";
}
window.cerrarModal = cerrarModal;

helpButton.addEventListener("click", () => {
    if (!modal) return;
    modal.style.display = "flex";
});

// Mensaje temporal al desbloquear país
function mostrarMensajeDesbloqueo(pais) {
    const cont = document.createElement("div");
    cont.style.cssText = `
        position: fixed; right: 16px; top: 16px;
        background: rgba(0,0,0,0.8); color: #fff;
        padding: 12px 18px; border-radius: 10px;
        z-index: 12000; font-size: 1rem; box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    `;
    cont.textContent = `🔓 País desbloqueado: ${pais}`;
    document.body.appendChild(cont);
    setTimeout(() => cont.remove(), 2500);
}

// --- Detectar primer escaneo ---
document.addEventListener("DOMContentLoaded", () => {
    // Mostrar modal inicial solo la primera vez
    if (!localStorage.getItem("mensajeInicialMostrado")) {
        mostrarMensajeInicial();
        localStorage.setItem("mensajeInicialMostrado", "true");
    }

    // Asegurar array en storage
    if (!localStorage.getItem("paisesEscaneados")) {
        setPaisesEscaneados([]);
    }

    console.log("Países desbloqueados (storage):", getPaisesEscaneados());

    // Mapeo de índices a países (ajusta si tu .mind tiene otro orden)
    const paises = {
        0: "argentina",
        1: "australia",
        2: "brasil",
        3: "canada",
        4: "corea",
        5: "ecuador",
        6: "eua",
        7: "iran",
        8: "japon",
        9: "jordania",
        10: "mexico",
        11: "nuevazelanda",
        12: "uzbekistan"
    };

    const targets = document.querySelectorAll("[mindar-image-target]");
    targets.forEach(target => {
        target.addEventListener("targetFound", (event) => {
            // Obtener índice de forma robusta
            const comp = target.components && target.components["mindar-image-target"];
            let targetIndex = comp ? comp.data.targetIndex : null;

            if (targetIndex === null) {
                const attr = target.getAttribute("mindar-image-target");
                if (typeof attr === "string") {
                    const m = attr.match(/targetIndex\s*:\s*(\d+)/);
                    targetIndex = m ? parseInt(m[1], 10) : null;
                } else if (attr && attr.targetIndex !== undefined) {
                    targetIndex = Number(attr.targetIndex);
                } else if (event && event.detail && event.detail.index !== undefined) {
                    targetIndex = Number(event.detail.index);
                }
            }

            console.log("targetFound -> index:", targetIndex, target);

            const paisEscaneado = paises[targetIndex];
            if (!paisEscaneado) {
                console.warn("Índice no mapeado:", targetIndex);
                return;
            }

            const almacen = getPaisesEscaneados();
            if (!almacen.includes(paisEscaneado)) {
                almacen.push(paisEscaneado);
                setPaisesEscaneados(almacen);

                // Primer escaneo especial
                if (almacen.length === 1) {
                    mostrarMensajePrimerEscaneo();
                    localStorage.setItem("primerEscaneo", "true");
                } else {
                    mostrarMensajeDesbloqueo(paisEscaneado);
                }

                console.log(`¡País desbloqueado: ${paisEscaneado}!`);
                console.log("Países desbloqueados (ahora):", almacen);
            } else {
                // opcional: pequeño feedback si ya estaba desbloqueado
                console.log(`${paisEscaneado} ya estaba desbloqueado.`);
            }
        });
    });
});

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
          <p>Felicidades, acabas de escanear tu primer país. Sigue escaneando para descubrir todos los países.</p>
          <button id="primerOkBtn" style="
            background:#007BFF;
            color:white;
            border:none;
            padding:10px 20px;
            border-radius:8px;
            font-size:1rem;
            margin-top:10px;
            cursor:pointer;">¡Genial!</button>
        </div>
      </div>
    `;
    document.body.appendChild(mensaje);
    document.getElementById("primerOkBtn").addEventListener("click", () => mensaje.remove());
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
          <button id="inicialOkBtn" style="
            background:#007BFF;
            color:white;
            border:none;
            padding:10px 20px;
            border-radius:8px;
            font-size:1rem;
            margin-top:10px;
            cursor:pointer;">¡Entendido!</button>
        </div>
      </div>
    `;
    document.body.appendChild(mensaje);
    document.getElementById("inicialOkBtn").addEventListener("click", () => mensaje.remove());
}