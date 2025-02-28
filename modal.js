// Create modal.
function createEmoteMenuModal() {
    const modalOverlay = document.createElement('div');
    modalOverlay.style.position = 'fixed';
    modalOverlay.style.bottom = '0px';
    modalOverlay.style.right = '0px';
    modalOverlay.style.width = '100vw';
    modalOverlay.style.height = '100vh';
    modalOverlay.style.display = 'flex';
    modalOverlay.style.justifyContent = 'flex-end';
    modalOverlay.style.alignItems = 'flex-end';
    modalOverlay.style.zIndex = '10000';
    modalOverlay.style.visibility = 'hidden';
    modalOverlay.style.paddingBottom = '70px';
    modalOverlay.style.paddingRight = '70px';
  
    const modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
    modalContent.style.width = '300px';
    modalContent.style.height = '400px';
    modalContent.style.textAlign = 'center';
  
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';

    const addNewEmoteButton = document.createElement('button');
    addNewEmoteButton.textContent = 'Add new emote';
    const removeEmoteButton = document.createElement('button');
    removeEmoteButton.textContent = 'Remove emote'; 
    const shareEmoteseButton = document.createElement('button');
    shareEmoteseButton.textContent = 'Share emotes';
  
    modalContent.innerHTML = `<h2>Temp modal!</h2>`;
    Object.fromEntries(
        Object.entries(emotes.getDictionary()).map(([key, value]) => {
            const img = document.createElement('img')
            img.src = "https://cdn.7tv.app/emote/" + value + "/2x.webp";
            img.id = key;
            img.addEventListener('click', (e) => {
                console.log(e.target.id);
                navigator.clipboard.writeText(e.target.id);
            })
            return modalContent.appendChild(img);
            }));
    modalContent.appendChild(closeButton);
    modalContent.appendChild(addNewEmoteButton);
    modalContent.appendChild(removeEmoteButton);
    modalContent.appendChild(shareEmoteseButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);
  
    closeButton.addEventListener('click', () => {
      modalOverlay.style.visibility = 'hidden';
    });
    shareEmoteseButton.addEventListener('click', () => {
        navigator.clipboard.writeText(emotes.getShareCode());
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.style.visibility = 'hidden';
      }
    });

    return modalOverlay;
}

function createDeleteEmoteModal(){

}

function createAddEmoteModal(){
    
}