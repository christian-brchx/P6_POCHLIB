async function showContent() {
  try {
    //const content = await retrieveContent();

    let elt = document.createElement('div');
    elt.innerHTML = content.join('<br />');

    document.getElementsByTagName('body')[0].appendChild(elt);
  } catch (e) {
    console.log('Error', e);
  }
}

function createAddBookButton(){
    let element = document.createElement("button");
    element.innerText = "Ajouter un livre";
    element.addEventListener("click",onClickAddBookButton);
    h2NewBook.insertAdjacentElement("afterEnd",element);
}

function onClickAddBookButton(e) {
    e.preventDefault;
    console.log("clic Button");
    searchForBook();
}

function searchForBook(){
    console.log("Search for Book");
    
}

function onLoadPage() {
    createAddBookButton();    
}

const myBooks = document.getElementById('myBooks');
const content = document.getElementById('content');
const h2NewBook = document.querySelector("#myBooks > h2");

//showContent();
onLoadPage();