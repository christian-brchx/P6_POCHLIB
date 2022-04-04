function logInConsole(message) {
  if (LOG_IN_CONSOLE) {
    console.log(message);
  }
}

function createAddBookButton(){
    let btn = createButton(ADDBUTTON_ID,"button--green","Ajouter un livre");
    btn.classList.add("button--center");
    return btn;
}

function createSearchBookButton(){
  return(createButton(SEARCHBUTTON_ID,"button--green","Rechercher"));
}

function createCancelButton(){
  return(createButton(CANCELBUTTON_ID,"button--red","Annuler"));
}

function createBlokSearchWithButtonsAndFields() {
  logInConsole("create searchbuttons and fields");
  
  let searchBlok = document.createElement("div");
  searchBlok.id = SEARCHBLOK_ID;
  h2NewBook.insertAdjacentElement("afterEnd",searchBlok);
  
  searchBlok.appendChild(document.createElement("p")).textContent = "Titre du livre";
  searchBlok.appendChild(createInputField(TITLEINPUT_ID));
  searchBlok.appendChild(document.createElement("p")).textContent = "Auteur";
  searchBlok.appendChild(createInputField(AUTHORINPUT_ID));
  //searchBlok.appendChild(document.createElement("p")).textContent = "";
  searchBlok.appendChild(createSearchBookButton());
  //searchBlok.appendChild(document.createElement("p")).textContent = "";
  searchBlok.appendChild(createCancelButton());
}

function createInputField(inputId){
  let input = document.createElement("input");
  input.id = inputId;
  return input;
}

function createButton(buttonId, buttonClass, buttonText){
  let button = document.createElement("button");
  button.classList.add("button");
  button.classList.add(buttonClass);
  button.id = buttonId;
  button.innerText = buttonText;
  button.addEventListener("click",actionRouter);
  return button;
}


function searchForBooks(){
  let title = document.getElementById(TITLEINPUT_ID);
  let author = document.getElementById(AUTHORINPUT_ID);
  if ((title.value == "") || (author.value == "")) {
    logInConsole("search for books : un des champs est vide");
    alertEmptySearchField();
  } else {
    logInConsole("search for books : titre = " + title.value + " auteur = " + author.value);
    // create a new result Blok
    createResultBlok();
    searchForBooksWithGoogleApi(title.value, author.value);
  }
}

async function searchForBooksWithGoogleApi(intitle, inauthor) {
  let request = GOOGLE_BOOKS_API + "?q=" + intitle + "+inauthor:" + inauthor;
  logInConsole(request);
  await fetch(request)
  .then(function(res) {
    if (res.ok){
      return res.json();
    }
  })
  .then(function (value){
    logInConsole(value);
    if (value.totalItems > 0) {
      for (let book of value.items) {
        showInformationsFoundBook(book.id,RESULTBLOK_ID);
      }
    } else {
      showNoFoundBook();
    }
    return value;
  })
  .catch(function(err){
    logInConsole();("erreur appel google API");
  });
}

function createResultBlok() {
  let resultBlok = document.createElement("div");
  resultBlok.id = RESULTBLOK_ID;
  resultBlok.appendChild(document.createElement("h2")).innerText="Résultats de recherche";
  document.getElementById(SEARCHBLOK_ID).insertAdjacentElement("afterend",resultBlok);
  resultBlok.insertAdjacentElement("beforebegin",document.createElement("hr"));
}

function addFoundBookInBlok(book,blokId){
  let elementBook = document.createElement("div");
  elementBook.classList.add(BOOK_CLASS);
  let elementBookTitle = document.createElement("div");
  elementBookTitle.classList.add(TITLE_CLASS);
  elementBookTitle.innerText = "Titre : " + book.volumeInfo.title;
  let elementBookId = document.createElement("div");
  elementBookId.classList.add(ID_CLASS);
  elementBookId.innerText = "Id : " + book.id;
  let elementBookAuthor = document.createElement("div");
  elementBookAuthor.classList.add(AUTHOR_CLASS);
  elementBookAuthor.innerText = "Auteur : " + book.volumeInfo.authors[0];
  let elementBookDescription = document.createElement("div");
  elementBookDescription.classList.add(DESCRIPTION_CLASS);
  if (book.volumeInfo.description != null) {
    logInConsole(book.volumeInfo.description.substring(0,200));
    elementBookDescription.innerHTML = "Description : " + book.volumeInfo.description.substring(0,200);
  } else {
    elementBookDescription.innerText = "Description : Information manquante";
  }
  let srcBookImage = UNAVAILABLE_PNG;
  if (book.volumeInfo.imageLinks != null) {
    logInConsole("foundBookInfoB : images available");
    if (book.volumeInfo.imageLinks.thumbnail != null) {
      srcBookImage = book.volumeInfo.imageLinks.thumbnail;
    } 
  } 
  document.getElementById(blokId).appendChild(elementBook);
  if (blokId == RESULTBLOK_ID) {
    elementBook.appendChild(createSolidBookMark(BOOKMARK_CLASS,book.id));
  }
  if (blokId == CONTENT_ID) {
    elementBook.appendChild(createSolidBookMark(TRASHCAN_CLASS,book.id));
  }
  elementBook.appendChild(elementBookTitle);
  elementBook.appendChild(elementBookId);
  elementBook.appendChild(elementBookAuthor);
  elementBook.appendChild(elementBookDescription);
  elementBook.appendChild(createImageBook(srcBookImage));
}

function createImageBook(src) {
  let img = document.createElement("img");
  img.classList.add(IMAGE_CLASS);
  img.src = src;
  img.alt = "book image";
  return img;
}

function createSolidBookMark(markClass,bookId){
  let img = document.createElement("img");
  img.classList.add("book__fa-solid");
  img.classList.add(markClass);
  switch (markClass) {
    case TRASHCAN_CLASS:
      img.id = "T_" + bookId;
      img.src = TRASHCAN_SRC;
      img.alt = "trash can image";
      img.title = "cliquez pour supprimer de votre poch'list";
      break;
    case BOOKMARK_CLASS:
      img.id = "B_" + bookId;
      img.src = BOOKMARK_SRC;
      img.alt = "bookmark image";
      img.title = "cliquez pour ajouter à votre poch'list";
      break;
  }
  img.addEventListener("click",actionBook);
  return img;
}

function actionBook(event){
  event.preventDefault;
  logInConsole("actionBook Id = " + extractId(this.id));
  if (this.classList.contains(BOOKMARK_CLASS)) {
    if (storeBook(extractId(this.id))) {
      showInformationsFoundBook(extractId(this.id),CONTENT_ID);
    }
  }
  if (this.classList.contains(TRASHCAN_CLASS)) {
    removeBook(extractId(this.id));
    this.parentNode.remove();
  }
}

function extractId(id){
  let retId = id.substring(2);
  return retId;
}

function showNoFoundBook() {
  let p = document.createElement("p");
  p.innerText = "Aucun livre n’a été trouvé";
  document.getElementById(RESULTBLOK_ID).appendChild(p);
}

function alertBookAlreadyExist() {
  alert("Vous ne pouvez ajouter deux fois le même livre");
}

function alertEmptySearchField() {
  alert("Vous devez renseigner le titre et l'auteur pour effectuer une recherche");
}


async function showInformationsFoundBook(bookId,blokId) {
  let request = GOOGLE_BOOKS_API + "/" + bookId;
  logInConsole(request);
  await fetch(request)
  .then(function(res) {
    if (res.ok){
      return res.json();
    }
  })
  .then(function (value){
    logInConsole(value);
    addFoundBookInBlok(value,blokId);
    return value;
  })
  .catch(function(err){
    console.error("erreur appel google API");
  });
}

function actionRouter(event) {
  event.preventDefault;
  switch (this.id){
    case ADDBUTTON_ID:
      logInConsole("clic addButton");
      // Clean the add Button
      removeElement(ADDBUTTON_ID);
      createBlokSearchWithButtonsAndFields();
      break;
    case SEARCHBUTTON_ID:
      logInConsole("clic searchButton");
      // clean old results blok
      removeElement(RESULTBLOK_ID);
      searchForBooks();
        break;
    case CANCELBUTTON_ID:
      // clean search and result blok
      removeElement(SEARCHBLOK_ID);
      removeElement(RESULTBLOK_ID);
      logInConsole("clic cancelButton");
      h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
      break;
    default:
      logInConsole("clic unknown");
    }
}

function removeElement(elementId) {
  let element = document.getElementById(elementId);
  if (element != null) {
    if (element.id == RESULTBLOK_ID) {
      // remove the <hr> tag before the resultBlok
      element.previousElementSibling.remove();
    }
    element.remove();
  }
}

async function loadMyPochList() {
  let tabOfBooks = getMyPochList();
  logInConsole("load Ma PochList number of books = " + tabOfBooks.length);
  let numberOfBooksLoaded = 0;
  while (numberOfBooksLoaded < tabOfBooks.length) {
    logInConsole("LoadMyPochList with BookId = " + tabOfBooks[numberOfBooksLoaded]);
    showInformationsFoundBook(tabOfBooks[numberOfBooksLoaded],CONTENT_ID);
    numberOfBooksLoaded++;
  }
}

function getMyPochList(){
  let tabOfBooks = [];
  if (sessionStorage.getItem(MAPOCHLISTE)) {
    tabOfBooks = JSON.parse(sessionStorage.getItem(MAPOCHLISTE));
  }
  logInConsole("getMyPochList = " + tabOfBooks);
  return tabOfBooks;
}

function saveMyPochList(tabOfBooks){
  let tabOfBooksToSave = [];
  for (let bookId of tabOfBooks) {
    if (bookId != REMOVED) {
      tabOfBooksToSave.push(bookId);
    }
  }
  sessionStorage.setItem(MAPOCHLISTE,JSON.stringify(tabOfBooksToSave));
  logInConsole("SaveMyPochList = " + tabOfBooksToSave);
}

function existBookInMyPochList(bookId){
  let tabOfBooks = getMyPochList();
  let find = false;
  let index = 0;
  while ((index < tabOfBooks.length) && !(find)) {
    if (tabOfBooks[index] == bookId) {
      find = true;
    };
    index++;
  }
  return find;
}

function storeBook(bookId){
  if (!existBookInMyPochList(bookId)) {
    let tabOfBooks = getMyPochList();
    logInConsole("storeBook length of SessionStorage before storing = " + tabOfBooks.length);
    tabOfBooks.unshift(bookId);
    logInConsole("storeBook length of SessionStorage after storing = " + tabOfBooks.length);
    saveMyPochList(tabOfBooks);
    return true;
  } else {
    alertBookAlreadyExist();
    return false;
  }
}

function removeBook(bookId) {
  let tabOfBooks = getMyPochList();
  let index = 0;
  let find = false;
  while ((index < tabOfBooks.length) && !(find)) {
    if (tabOfBooks[index] == bookId) {
      find = true;
      tabOfBooks[index] = REMOVED;
      logInConsole("removeBook bookId = " + bookId + " in position = " + index);
    } else {
      index++;
    }
  }
  saveMyPochList(tabOfBooks);
}

function onLoadPage() {
    h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
    loadMyPochList();
}

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const CONTENT_ID = "content";
const h2Content = document.querySelector("#content > h2");
const h2NewBook = document.querySelector("#myBooks > h2");
const ADDBUTTON_ID = "addButton";
const SEARCHBUTTON_ID = "searchButton";
const CANCELBUTTON_ID = "cancelButton";
const SEARCHBLOK_ID = "searchBlokId";
const TITLEINPUT_ID = "titleInputId";
const AUTHORINPUT_ID = "authorInputId";
const RESULTBLOK_ID = "resultBlokId";
const UNAVAILABLE_PNG = "./public/img/unavailable.png";
const BOOK_CLASS = "book";
const TITLE_CLASS = "book__title";
const AUTHOR_CLASS = "book__author";
const ID_CLASS = "book__id";
const DESCRIPTION_CLASS = "book__description";
const IMAGE_CLASS ="book__image";
const MAPOCHLISTE = "MAPOCHLISTE";
const REMOVED = "REMOVED";
const BOOKMARK_SRC = "./public/img/bookmark-solid-green.svg";
const TRASHCAN_SRC = "./public/img/trash-can-solid.svg";
const BOOKMARK_CLASS = "fa-bookmark";
const TRASHCAN_CLASS = "fa-trash-can";

onLoadPage();