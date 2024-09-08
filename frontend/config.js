// Selecciona todos los contenedores y botones
var audioContainer = document.querySelector('.config-container-audio');
var videoContainer = document.querySelector('.config-container-video');
var controlesContainer = document.querySelector('.config-container-controles');
var btnAudio = document.querySelector('#btn-audio');
var btnVideo = document.querySelector('#btn-video');
var btnControles = document.querySelector('#btn-controles');

// Función para mostrar el contenedor seleccionado y ocultar los demás
function showContainer(containerToShow) {
  // Oculta todos los contenedores
  audioContainer.classList.add('d-none');
  videoContainer.classList.add('d-none');
  controlesContainer.classList.add('d-none');

  // Muestra solo el contenedor seleccionado
  containerToShow.classList.remove('d-none');
}

// Asocia eventos a los botones
btnAudio.addEventListener('click', function() {
  showContainer(audioContainer);
});

btnVideo.addEventListener('click', function() {
  showContainer(videoContainer);
});

btnControles.addEventListener('click', function() {
  showContainer(controlesContainer);
});