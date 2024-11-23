import * as THREE from 'three';

let currentSliderValue = 8;
let targetSliderValue = currentSliderValue;

export function updateSunPosition(deltaTime) {
  currentSliderValue += (targetSliderValue - currentSliderValue) * deltaTime;
  const normalizedTime = currentSliderValue / 24;
  const sunAngle = normalizedTime * Math.PI * 2;
  const sunX = Math.cos(sunAngle) * 100;
  const sunY = Math.max(Math.sin(sunAngle) * 80, 5); // Prevent sun from going below the horizon
  const sunZ = Math.sin(sunAngle) * 100;

  // Update directional light position and intensity
  directionalLight.position.set(sunX, sunY, sunZ);

  // Optional: Adjust the intensity of the sunlight based on the time of day
  directionalLight.intensity = Math.max(Math.cos(sunAngle), 0.2);
}

export const daytimeSlider = document.getElementById('daytimeSlider');
daytimeSlider.addEventListener('input', (event) => {
  targetSliderValue = parseFloat(event.target.value);
});
