function createButton(tagName, className, role, src, attribute){
    const button = document.createElement(tagName);
    button.className = className;
    button.role = role;
    button.src = chrome.runtime.getURL(src);
    button.setAttribute(attribute.name, attribute.value)
    return button;
}
