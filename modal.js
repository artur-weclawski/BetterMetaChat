// Create modal.
function createEmoteMenuModal() {
    // Overlay to listen clicks outside right modal.
    const modalOverlay = document.createElement('div');
    modalOverlay.className = "bmc-emote-menu-modal";
    // Right modal with all elements.
    const modalContent = document.createElement('div');
    modalContent.className = "bmc-emote-menu-modal-content";
    // Container with navigation buttons.
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = "bmc-emote-buttons-container";

    const addNewEmoteButton = createButton('img', '', 'button', 'icons/bmc-icon-add.svg', {name: 'aria-label', value: 'Add new emote'})
    const removeEmoteButton = createButton('img', '', 'button', 'icons/bmc-icon-remove.svg', {name: 'aria-label', value: 'Remove emote'})
    const shareEmotesButton = createButton('img', '', 'button', 'icons/bmc-icon-share.svg', {name: 'aria-label', value: 'Share emotes'})
    const loadEmoteSetButton = createButton('img', '', 'button', 'icons/bmc-icon-set.svg', {name: 'aria-label', value: 'Load emote set'})

    buttonsContainer.appendChild(addNewEmoteButton);
    buttonsContainer.appendChild(removeEmoteButton);
    buttonsContainer.appendChild(loadEmoteSetButton);
    buttonsContainer.appendChild(shareEmotesButton);

    // Containder displaying emotes.
    const containerWithEmotes = createContainerWithEmotes(emotes.getDictionary())
    modalContent.appendChild(containerWithEmotes);
    // Containder allowing to add new emote.
    const addEmoteContainer = createAddEmoteContainer(modalContent);
    modalContent.appendChild(addEmoteContainer);
    // Containder allowing to remove emote.
    const removeEmoteContainer = createRemoveEmoteContainer(modalContent);
    modalContent.appendChild(removeEmoteContainer);
    // Container allowing to load new set of emotes.
    const loadEmoteSetContainer = createLoadEmoteSetContainer(modalContent);
    modalContent.appendChild(loadEmoteSetContainer);

    modalContent.appendChild(buttonsContainer);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    // Copy shareCode to clipboard.
    shareEmotesButton.addEventListener('click', () => {
        navigator.clipboard.writeText(emotes.getShareCode());
    });

    addNewEmoteButton.addEventListener('click', () => {
      removeEmoteContainer.style.display = removeEmoteContainer.style.display === "flex" && "none";
      loadEmoteSetContainer.style.display = loadEmoteSetContainer.style.display === "flex" && "none";
      addEmoteContainer.style.display = (addEmoteContainer.style.display === "none" || addEmoteContainer.style.display === "") ? "flex" : "none";
    })

    removeEmoteButton.addEventListener('click', () => {
      addEmoteContainer.style.display = addEmoteContainer.style.display === "flex" && "none";
      loadEmoteSetContainer.style.display = loadEmoteSetContainer.style.display === "flex" && "none";
      // Set input value to null;
      const emoteName = document.getElementById('remove-emote-id');
      emoteName.value = "";
      removeEmoteContainer.style.display = (removeEmoteContainer.style.display === "none" || removeEmoteContainer.style.display === "") ? "flex" : "none";
    })

    loadEmoteSetButton.addEventListener('click', () => {
      addEmoteContainer.style.display = addEmoteContainer.style.display === "flex" && "none";
      removeEmoteContainer.style.display = removeEmoteContainer.style.display === "flex" && "none";
      loadEmoteSetContainer.style.display = (loadEmoteSetContainer.style.display === "none" || loadEmoteSetContainer.style.display === "") ? "flex" : "none";
    })

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.visibility = 'hidden';
      }
    });

    return modalOverlay;
}


// Creates main container displaying emotes.
// @param [emoteDictionary] Loaded emotes.
// @return container.
function createContainerWithEmotes(emotesDictionary){
  const emoteContainer = document.createElement('div');
  emoteContainer.id = "emoteContainer";
  emoteContainer.className = "bmc-emote-container";
  // Create images from avaible dictionary to display in conteiner.
  Object.fromEntries(
    Object.entries(emotesDictionary).map(([key, value]) => {
        const imgContainer = document.createElement('div');
        imgContainer.className = 'bmc-img-container';

        const img = document.createElement('img')
        img.src = "https://cdn.7tv.app/emote/" + value + "/2x.webp";
        img.id = key;
        img.alt = key;
        img.title = key;

        img.addEventListener('click', (e) => {
          const removeEmoteContainer = document.getElementsByClassName('bmc-remove-emote-container');
          if(removeEmoteContainer[0].style.display === 'flex'){
            let textField = document.getElementById('remove-emote-id');
            textField.value = textField.value === e.target.id ? "" : e.target.id;
          }else{
            const metaTextField = document.querySelectorAll('p.xat24cr.xdj266r');
            const metaTextFieldLastElement = metaTextField[metaTextField.length - 1];
            pasteEmoteOnChat(metaTextFieldLastElement, e.target.id);
          }
        });

        imgContainer.appendChild(img);

        return emoteContainer.appendChild(imgContainer);
        }));

  return emoteContainer;
}


// Creates container displaing input to adding emotes.
// @param [modal] Modal container.
// @return container.
function createAddEmoteContainer(modal){
  const addEmoteContainer = document.createElement('div');
  addEmoteContainer.className = 'bmc-add-emote-container'

  const emoteName = createInput('text', '', 'bmc-add-emote-name-input', 'Name')
  const emoteCode = createInput('text', '', 'bmc-add-emote-code-input', 'Emote code or link')
  const acceptEmoteButton = createButton('img','bmc-accept-emote-button', 'button', 'icons/bmc-icon-accept.svg', {name: 'aria-label', value: 'Confirm'})

  addEmoteContainer.appendChild(emoteName);
  addEmoteContainer.appendChild(emoteCode);
  addEmoteContainer.appendChild(acceptEmoteButton);

  acceptEmoteButton.addEventListener('click',() =>{
    const clearedEmoteCode = emoteCode.value.split('/').pop();
    const emoteCodeRegEx = /^[a-zA-Z0-9]+$/;
    if(emoteCodeRegEx.test(clearedEmoteCode) && (clearedEmoteCode.length === 26 && (emoteName.length > 0))){
      // Add new emote to set.
      emotes.addEmote(emoteName.value, clearedEmoteCode);
      updateEmotesInStorage(emotes.getDictionary());
      addEmoteContainer.style.display = "none";
      // Rerender emotes in menu.
      modal.replaceChild(createContainerWithEmotes(emotes.getDictionary()), document.getElementById("emoteContainer"));
    }else{
      alert('Provided wrong emote code or emote name.\nCode should contain 26 characters.\nYou can also paste link.\ne.g. https://7tv.app/emotes/01G10SNY8800087S6WDJRSJ2QE');
    }

  })

  return addEmoteContainer;
}


// Creates container displaying input to removing emotes.
// @param [modal] Modal container.
// @return container.
function createRemoveEmoteContainer(modal){
  const removeEmoteContainer = document.createElement('div');
  removeEmoteContainer.className = 'bmc-remove-emote-container';

  const emoteName = createInput('text', 'remove-emote-id', 'bmc-remove-emote-name-input', 'Choose emote to delete')
  const removeEmoteButton = createButton('img','bmc-remove-emote-button', 'button', 'icons/bmc-icon-accept.svg', {name: 'aria-label', value: 'Confrim'})

  removeEmoteContainer.appendChild(emoteName);
  removeEmoteContainer.appendChild(removeEmoteButton);

  removeEmoteButton.addEventListener('click', () => {
    // Remove chosen emote.
    emotes.removeEmote(emoteName.value);
    updateEmotesInStorage(emotes.getDictionary());
    removeEmoteContainer.style.display = 'none'

    // Rerender emotes in menu.
    modal.replaceChild(createContainerWithEmotes(emotes.getDictionary()), document.getElementById("emoteContainer"));
  })
  return removeEmoteContainer;
}


// Creates container displaying input to load new set of emotes.
// @param [modal] Modal container.
// @return container.
function createLoadEmoteSetContainer(modal){
  const loadEmoteSetContainer = document.createElement('div');
  loadEmoteSetContainer.className = 'bmc-load-emote-set-container';
  
  const emoteSetName = createInput('text', '', 'bmc-load-emote-set-input', 'Code with emote set');
  const acceptEmoteSetButton = createButton('img','bmc-accept-emote-set-button', 'button', 'icons/bmc-icon-accept.svg', {name: 'aria-label', value: 'Confirm'});

  loadEmoteSetContainer.appendChild(emoteSetName);
  loadEmoteSetContainer.appendChild(acceptEmoteSetButton);

  acceptEmoteSetButton.addEventListener('click', async () => {
    await updateEmotesInStorageByShareCode(emoteSetName.value);
    initializeEmotes().then(()=>{
      loadEmoteSetContainer.style.display = "none";
      // Rerender emotes in menu.
      modal.replaceChild(createContainerWithEmotes(emotes.getDictionary()), document.getElementById("emoteContainer"));
    })
  })
  return loadEmoteSetContainer;
}


// Function allowing to past emote in chat.
// @param [element] Input field, where you would type messages.
// @param [emoteName] Emote name.
function pasteEmoteOnChat(element, emoteName) {
    const deepestChild = getDeepestChild(element);
    if (deepestChild.nodeName == "BR") { // If input field is empty.
      deepestChild.dispatchEvent(new InputEvent("input", {
       bubbles: true,
       inputType: 'insertText',
       data: emoteName
      }
      ));
    } else { // If input field already contains text.
      deepestChild.textContent += " " + emoteName;
      const elementToDispatch = deepestChild.parentElement.parentElement;
      elementToDispatch.dispatchEvent(new InputEvent("input", {
       bubbles: true
      }
      ));
    }
}


// Function helping to find deepest child of given element.
// @param [element] Element which child you want to find.
// @return Deepest child of given element.
function getDeepestChild(element) {
  if (element.lastChild) {
    return getDeepestChild(element.lastChild);
  } else {
    return element;
  }
}