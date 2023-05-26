var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var titleInput = document.querySelector('#title')

function openCreatePostModal() {
  showInstallPrompt();
}

const createPost = (event) => {
  event.preventDefault();

  var promise = new Promise((resolve, eject) => {
    setTimeout(() => {
      resolve('https://swapi.dev/api/people/1');
    }, 1000)
  })
    .then((url) => {
      return fetch(url, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      })
    })
    .then((resp) => {
      // console.log({ resp })
      if (resp.status === 200)
        return resp.json()
      else throw new Error(resp.statusText)
    })
    .then(data => {
      console.log('data', data);
      titleInput.value = data.name;
    })
    .catch(err => console.log({ err }))
    .then(() => {
      return new Promise((resolve, eject) => {
        setTimeout(() => {
          resolve();
        }, 1000)
      })
    })
    .finally(() => {
      closeCreatePostModal()
    })

}

function closeCreatePostModal() {
  createPostArea.removeAttribute('style');
}

const showInstallPrompt = () => {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(choiceResult => {
      console.log({ choiceResult });

      if (choiceResult.outcome === 'dismissed') {
        console.log('cancelling installation');
      } else {
        console.log('add app to homescreen');
      }

      deferredPrompt = null
    })
  }

}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

createPostArea.addEventListener('click', createPost);

// experiment with manual caching
function onSaveButtonClicked(event) {
  console.log('click');
  if ('caches' in window) {
    caches.open('user-request')
      .then((cache) => {
        cache.add('https://httpbin.org/get')
        cache.add('/src/images/sf-boat.jpg')
      })
  }
}

const createCard = () => {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';

  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);

  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitle.appendChild(cardTitleTextElement);

  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);

  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.className = 'card-save'
  // cardSaveButton.textContent = 'Save';
  // cardSupportingText.appendChild(cardSaveButton)

  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);

  // setTimeout(() => {
  //   const card = document.querySelector('.card-save')
  //   if (card) {
  //     card.addEventListener('click', onSaveButtonClicked);
  //   } else {
  //     console.log('card not added');
  //   }
  // }, 0);
}

fetch('https://httpbin.org/get')
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    createCard();
  })
  .catch(err => {
    console.log({ err });
  });