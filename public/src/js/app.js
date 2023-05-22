var title = document.querySelector('.title');
var courseFeatureElements = document.querySelectorAll('.course-feature');
var button = document.querySelector('button');
const timeCoef = 100

navigator.serviceWorker.register('/sw.js')

function animate() {
  title.classList.remove('animate-in');
  for (var i = 0; i < courseFeatureElements.length; i++) {
    courseFeatureElements[i].classList.remove('animate-in');
  }
  button.classList.remove('animate-in');

  setTimeout(function () {
    title.classList.add('animate-in');
  }, timeCoef);

  setTimeout(function () {
    courseFeatureElements[0].classList.add('animate-in');
  }, timeCoef * 3);

  setTimeout(function () {
    courseFeatureElements[1].classList.add('animate-in');
  }, timeCoef * 4.5);

  setTimeout(function () {
    courseFeatureElements[2].classList.add('animate-in');
  }, timeCoef * 6);

  setTimeout(function () {
    courseFeatureElements[3].classList.add('animate-in');
  }, timeCoef * 7.5);

  setTimeout(function () {
    courseFeatureElements[4].classList.add('animate-in');
  }, timeCoef * 9);

  setTimeout(function () {
    courseFeatureElements[5].classList.add('animate-in');
  }, timeCoef * 10.5);

  setTimeout(function () {
    courseFeatureElements[6].classList.add('animate-in');
  }, timeCoef * 12);

  setTimeout(function () {
    button.classList.add('animate-in');
  }, timeCoef * 13.5);
}

animate();

button.addEventListener('click', function () {
  animate();
});