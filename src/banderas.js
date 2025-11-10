const container = document.querySelector('.flagsContainer');

// Función para obtener países desbloqueados del localStorage
function getPaisesDesbloqueados() {
    return JSON.parse(localStorage.getItem("paisesEscaneados") || "[]");
}

// Mapeo de IDs a nombres de países como están en localStorage
const idToPais = {
    'flag-mexico': 'mexico',
    'flag-japan': 'japon',
    'flag-jordania': 'jordania',
    'flag-argentina': 'argentina',
    'flag-Brasil': 'brasil',
    'flag-ecuador': 'ecuador',
    'flag-nuevaZelanda': 'nuevazelanda',
    'flag-surcorea': 'corea',
    'flag-eua': 'eua',
    'flag-canada': 'canada',
    'flag-iran': 'iran',
    'flag-australia': 'australia',
    'flag-uzbekistan': 'uzbekistan'
};

// Actualizar estado de banderas al cargar la página
function actualizarEstadoBanderas() {
    const paisesDesbloqueados = getPaisesDesbloqueados();
    const banderas = document.querySelectorAll('.flag-item');

    banderas.forEach(bandera => {
        const paisId = idToPais[bandera.id];
        if (paisesDesbloqueados.includes(paisId)) {
            bandera.classList.remove('disabled');
            bandera.classList.add('enabled');
        } else {
            bandera.classList.remove('enabled');
            bandera.classList.add('disabled');
        }
    });
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', actualizarEstadoBanderas);

container.addEventListener('click', (e) => {
    const flag = e.target.closest('.flag-item'); // busca el .flag-item más cercano al clic
    if (!flag) return;

    if (flag.classList.contains('disabled')) return;

    switch (flag.id) {
        case 'flag-mexico':
            window.location.href = '/src/Mexico.html';
            break;
        case 'flag-japan':
            window.location.href = '/src/Japon.html';
            break;
        case 'flag-jordania':
            window.location.href = '/src/jordania.html';
            break;
        case 'flag-argentina':
            window.location.href = '/src/argentina.html';
            break;
        case 'flag-Brasil':
            window.location.href = '/src/brasil.html';
            break;
        case 'flag-ecuador':
            window.location.href = '/src/ecuador.html';
            break;
        case 'flag-nuevaZelanda':
            window.location.href = '/src/zelanda.html';
            break;
        case 'flag-surcorea':
            window.location.href = '/src/surcorea.html';
            break;
        case 'flag-eua':
            window.location.href = '/src/eua.html';
            break;
        case 'flag-canada':
            window.location.href = '/src/canada.html';
            break;
        case 'flag-iran':
            window.location.href = '/src/iran.html';
            break;
        case 'flag-australia':
            window.location.href = '/src/australia.html';
            break;
        case 'flag-uzbekistan':
            window.location.href = '/src/uzbekistan.html';
            break;
        // Agrega más casos según las banderas disponibles
    }
});

const scanerButton = document.getElementById('scannerButton');
scanerButton.addEventListener('click', () => {
    window.location.href = '/src/scanner.html';
});

const homeButton = document.getElementById('homeBtn');
homeButton.addEventListener('click', () => {
    window.location.href = '/index.html';
});
