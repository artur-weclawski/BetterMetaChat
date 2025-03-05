function createInput(type, id, className, placeHolder){
    const input = document.createElement('input');
    input.type = type;
    input.id = id;
    input.className = className;
    input.placeholder = placeHolder;
    return input;
}