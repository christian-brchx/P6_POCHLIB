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
    return(createButton(addButtonId,"button-green","Ajouter un livre"));
}

function createSearchBookButton(){
  return(createButton(searchButtonId,"button-green","Rechercher"));
}

function createCancelButton(){
  return(createButton(cancelButtonId,"button-red","Annuler"));
}


function createBlokSearchWithButtonsAndFields() {
  console.log("create searchbuttons and fields");
  
  let searchBlok = document.createElement("div");
  searchBlok.id = searchBlokId;
  h2NewBook.insertAdjacentElement("afterEnd",searchBlok);
  
  searchBlok.appendChild(document.createElement("p")).textContent = "Titre du livre";
  searchBlok.appendChild(createInputField(titleInputId));
  searchBlok.appendChild(document.createElement("p")).textContent = "Auteur";
  searchBlok.appendChild(createInputField(authorInputId));
  searchBlok.appendChild(document.createElement("p")).textContent = "";
  searchBlok.appendChild(createSearchBookButton());
  searchBlok.appendChild(document.createElement("p")).textContent = "";
  searchBlok.appendChild(createCancelButton());
  
}

function createInputField(inputId){
  let input = document.createElement("input");
  input.id = inputId;
  input.maxLength = 100;
  input.required = true;
  return input;
}

function createButton(buttonId, buttonClass, buttonText){
  let button = document.createElement("button");
  button.classList.add(buttonClass);
  button.id = buttonId;
  button.innerText = buttonText;
  button.addEventListener("click",actionRouter);
  return button;
}


function searchForBooks(){
  let title = document.getElementById(titleInputId);
  let author = document.getElementById(authorInputId);
  if ((title.value == "") || (author.value == "")) {
    console.log("search for books : un des champs est vide");
  } else {
    console.log("search for books : titre = ",title.value," auteur = ",author.value);
    // create a new result Blok
    createResultBlok();
    searchForBooksWithGoogleApi(title.value, author.value);
  }
}

async function searchForBooksWithGoogleApi(intitle, inauthor) {
  let request = GOOGLE_BOOKS_API + "?q=" + intitle + "+inauthor:" + inauthor;
  console.log(request);
  await fetch(request)
  .then(function(res) {
    if (res.ok){
      return res.json();
    }
  })
  .then(function (value){
    console.log(value);
    if (value.totalItems > 0) {
      //h2Content.innerText = "Nombre de livres trouvés : " + value.totalItems;
      for (let book of value.items) {
        showInformationsFoundBook(book);
      }
    } else {
      showNoFoundBook();
    }
    return value;
  })
  .catch(function(err){
    console.error();("erreur appel google API");
  });
}

function createResultBlok() {
  let resultBlok = document.createElement("div");
  resultBlok.id = resultBlokId;
  resultBlok.appendChild(document.createElement("h2")).innerText="Résultats de recherche";
  document.getElementById(searchBlokId).insertAdjacentElement("afterend",resultBlok);
  resultBlok.insertAdjacentElement("beforebegin",document.createElement("hr"));
}

function addFoundBookInResultBlok(book){
  let elementBook = document.createElement("div");
  elementBook.classList.add("book");
  let elementBookTitle = document.createElement("div");
  elementBookTitle.classList.add("bookTitle");
  elementBookTitle.innerText = "Titre : " + book.volumeInfo.title;
  let elementBookId = document.createElement("div");
  elementBookId.classList.add("bookId");
  elementBookId.innerText = "Id : " + book.id;
  let elementBookAuthor = document.createElement("div");
  elementBookAuthor.classList.add("bookAuthor");
  elementBookAuthor.innerText = "Auteur : " + book.volumeInfo.authors[0];
  let elementBookDescription = document.createElement("div");
  elementBookDescription.classList.add("bookDescription");
  if (book.volumeInfo.description != null) {
    elementBookDescription.innerText = book.volumeInfo.description.substring(0,200);
  } else {
    elementBookDescription.innerText = "Information manquante";
  }
  let srcBookImage = unaivalablePng;
  if (book.volumeInfo.imageLinks != null) {
    console.log("foundBookInfoB : images available");
    if (book.volumeInfo.imageLinks.thumbnail != null) {
      srcBookImage = book.volumeInfo.imageLinks.thumbnail;
    } 
  } 
  document.getElementById(resultBlokId).appendChild(elementBook);
  elementBook.appendChild(elementBookTitle);
  elementBook.appendChild(elementBookId);
  elementBook.appendChild(elementBookAuthor);
  elementBook.appendChild(elementBookDescription);
  elementBook.appendChild(createImageBook(srcBookImage));
}

function createImageBook(src) {
  let img = document.createElement("img");
  img.classList.add("bookImage");
  img.src = src;
  img.alt = "book image";
  return img;
}

function showNoFoundBook() {
  let p = document.createElement("p");
  p.innerText = "Aucun livre n’a été trouvé";
  document.getElementById(resultBlokId).appendChild(p);
}

async function showInformationsFoundBook(book) {
  let request = GOOGLE_BOOKS_API + "/" + book.id;
  console.log(request);
  await fetch(request)
  .then(function(res) {
    if (res.ok){
      return res.json();
    }
  })
  .then(function (value){
    console.log(value);
    addFoundBookInResultBlok(value);
    return value;
  })
  .catch(function(err){
    console.error("erreur appel google API");
  });
}

function actionRouter(event) {
  event.preventDefault;
  switch (this.id){
    case addButtonId:
      console.log("clic addButton");
      // Clean the add Button
      removeElement(addButtonId);
      createBlokSearchWithButtonsAndFields();
      break;
    case searchButtonId:
      console.log("clic searchButton");
      // clean old results blok
      removeElement(resultBlokId);
      searchForBooks();
        break;
    case cancelButtonId:
      // clean search and result blok
      removeElement(searchBlokId);
      removeElement(resultBlokId);
      console.log("clic cancelButton");
      // Add AddBookButton
      h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
      break;
    default:
      console.error("clic unknown");
    }
}

function removeElement(elementId) {
  let element = document.getElementById(elementId);
  if (element != null) {
    if (element.id == resultBlokId) {
      // remove the <hr> tag before the resultBlok
      element.previousElementSibling.remove();
    }
    element.remove();
  }
}

function onLoadPage() {
    h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
}

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const myBooks = document.getElementById('myBooks');
const content = document.getElementById('content');
const h2Content = document.querySelector("#content > h2");
const h2NewBook = document.querySelector("#myBooks > h2");
const addButtonId = "addButton";
const searchButtonId = "searchButton";
const cancelButtonId = "cancelButton";
const searchBlokId = "searchBlokId";
const titleInputId = "titleInputId";
const authorInputId = "authorInputId";
const resultBlokId = "resultBlokId";
const unaivalablePng = "./img/unavailable.png";

//showContent();
onLoadPage();