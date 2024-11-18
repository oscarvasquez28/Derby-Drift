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

// Default controls
const defaultControls = {
  forward: 'W',
  backward: 'S',
  left: 'A',
  right: 'D',
  shoot: 'R',
  drift: 'C',
  flip: 'F',
};

// Load controls from localStorage or use defaults
function loadControls() {
  const controls = JSON.parse(localStorage.getItem('controls')) || defaultControls;
  document.querySelector('#forward').value = controls.forward;
  document.querySelector('#backward').value = controls.backward;
  document.querySelector('#left').value = controls.left;
  document.querySelector('#right').value = controls.right;
  document.querySelector('#shoot').value = controls.shoot;
  document.querySelector('#drift').value = controls.drift;
  document.querySelector('#flip').value = controls.flip;
}

loadControls();

// Save controls to localStorage
function saveControls() {
  const controls = {
    forward: document.querySelector('#forward').value,
    backward: document.querySelector('#backward').value,
    left: document.querySelector('#left').value,
    right: document.querySelector('#right').value,
    shoot: document.querySelector('#shoot').value,
    drift: document.querySelector('#drift').value,
    flip: document.querySelector('#flip').value,    
  };
  localStorage.setItem('controls', JSON.stringify(controls));
}

// Add event listeners to inputs
document.querySelectorAll('.config-controles input').forEach(input => {
  input.addEventListener('change', () => {
    if (input.value.length < 1) {
      const localValue = JSON.parse(localStorage.getItem('controls'))?.[input.id];
      input.value = localValue || defaultControls[input.id];
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No puedes dejar este campo vacío',
      });
    } else {
      input.value = input.value.charAt(0).toUpperCase();
      let duplicate = false;
      document.querySelectorAll('.config-controles input').forEach(otherInput => {
        if (otherInput !== input && otherInput.value === input.value) {
          duplicate = true;
        }
      });
      if (duplicate) {
        input.value = JSON.parse(localStorage.getItem('controls'))[input.id] || defaultControls[input.id];
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'No puedes asignar la misma tecla a dos controles',
        });
      }
    }
  });
});

document.getElementById('btn-reset').addEventListener('click', function() {
  Swal.fire({
    icon: 'question',
    title: '¿Estás seguro?',
    text: 'Esto restablecerá los controles a los valores predeterminados',
    showCancelButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem('controls');
      loadControls();
      Swal.fire({
        icon: 'success',
        title: 'Controles restablecidos',
      });
    }
  });
});

document.getElementById('btn-guardar').addEventListener('click', function() {
  saveControls();
  Swal.fire({
    icon: 'success',
    title: 'Controles guardados',
  });
});

