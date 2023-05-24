var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
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

function closeCreatePostModal() {
  createPostArea.removeAttribute('style');
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
