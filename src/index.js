function logInConsole(message) {
  if (LOG_IN_CONSOLE) {
    console.log(message);
  }
}

function createAddBookButton(){
    let btn = createButton(addButtonId,"button--green","Ajouter un livre");
    btn.classList.add("button--center");
    return btn;
}

function createSearchBookButton(){
  return(createButton(searchButtonId,"button--green","Rechercher"));
}

function createCancelButton(){
  return(createButton(cancelButtonId,"button--red","Annuler"));
}

function createBlokSearchWithButtonsAndFields() {
  logInConsole("create searchbuttons and fields");
  
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
  let title = document.getElementById(titleInputId);
  let author = document.getElementById(authorInputId);
  if ((title.value == "") || (author.value == "")) {
    logInConsole("search for books : un des champs est vide");
    alertEmptySearchField();
  } else {
    logInConsole("search for books : titre = ",title.value," auteur = ",author.value);
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
        showInformationsFoundBook(book.id,resultBlokId);
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
  resultBlok.id = resultBlokId;
  resultBlok.appendChild(document.createElement("h2")).innerText="Résultats de recherche";
  document.getElementById(searchBlokId).insertAdjacentElement("afterend",resultBlok);
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
  let elementBookDescription = document.createElement("p");
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
  if (blokId == resultBlokId) {
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
  img.id = bookId;
  switch (markClass) {
    case TRASHCAN_CLASS:
      img.src = TRASHCAN_SRC;
      img.alt = "trash can image";
      img.title = "cliquez pour supprimer de votre poch'list";
      break;
    case BOOKMARK_CLASS:
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
  logInConsole("actionBook Id = ",this.id);
  if (this.classList.contains(BOOKMARK_CLASS)) {
    if (storeBook(this.id)) {
      showInformationsFoundBook(this.id,CONTENT_ID);
    }
  }
  if (this.classList.contains(TRASHCAN_CLASS)) {
    removeBook(this.id);
    this.parentNode.remove();
  }
}

function showNoFoundBook() {
  let p = document.createElement("p");
  p.innerText = "Aucun livre n’a été trouvé";
  document.getElementById(resultBlokId).appendChild(p);
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
    case addButtonId:
      logInConsole("clic addButton");
      // Clean the add Button
      removeElement(addButtonId);
      createBlokSearchWithButtonsAndFields();
      break;
    case searchButtonId:
      logInConsole("clic searchButton");
      // clean old results blok
      removeElement(resultBlokId);
      searchForBooks();
        break;
    case cancelButtonId:
      // clean search and result blok
      removeElement(searchBlokId);
      removeElement(resultBlokId);
      logInConsole("clic cancelButton");
      // Add AddBookButton
      h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
      break;
    default:
      logInConsole("clic unknown");
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

async function loadMaPocheList() {
  let counterOfBooks = 0
  if (sessionStorage.getItem(COUNTER_OF_BOOKS)) {
    counterOfBooks = sessionStorage.getItem(COUNTER_OF_BOOKS);
  }
  logInConsole("load Ma PochList number of books = ",counterOfBooks);
  let numberOfBooksLoaded = 0;
  let key = 1;
  let bookId = null;
  while (numberOfBooksLoaded < counterOfBooks) {
    if (sessionStorage.getItem(key)) {
      bookId = sessionStorage.getItem(key);
      logInConsole("LoadMaPocheList avec BookId = ",bookId);
      showInformationsFoundBook(bookId,CONTENT_ID);
      numberOfBooksLoaded++;
    }
    key++;
  }
}

function storeBook(bookId){
  if (!sessionStorage.getItem(bookId)) {
    let counterOfBooks = 0
    if (sessionStorage.getItem(COUNTER_OF_BOOKS)) {
      counterOfBooks = sessionStorage.getItem(COUNTER_OF_BOOKS);
    }
    logInConsole("storeBook get counter of books before storing= ",counterOfBooks);

    // Put the BookId with the first free key
    logInConsole("storeBook length of SessionStorage before storing = ",sessionStorage.length);
    // search for free key
    let key=1;
    while ((sessionStorage.getItem(key)) && (key<=MAX_BOOK_IN_POCH_LIST)) {
      key++;
    }
    sessionStorage.setItem(key,bookId);
    sessionStorage.setItem(bookId,key);
    logInConsole("storeBookId = ",bookId," in key = ",key);
    logInConsole("storeBook length of SessionStorage after storing = ",sessionStorage.length);

    // increment and save the number of books selected
    counterOfBooks++;
    logInConsole("storeBook save counter of books after storing= ",counterOfBooks);
    sessionStorage.setItem(COUNTER_OF_BOOKS,counterOfBooks);
    return true;
  } else {
    alertBookAlreadyExist();
    return false;
  }
}

function removeBook(bookId) {
  if (sessionStorage.getItem(bookId)) {
    logInConsole("removeBook key = ", sessionStorage.getItem(bookId));
    sessionStorage.removeItem(sessionStorage.getItem(bookId));
    logInConsole("removeBook bookId = ", bookId);
    sessionStorage.removeItem(bookId);
    let counterOfBooks = sessionStorage.getItem(COUNTER_OF_BOOKS);
    counterOfBooks--;
    sessionStorage.setItem(COUNTER_OF_BOOKS,counterOfBooks);
  }
}

function onLoadPage() {
    //sessionStorage.clear();
    h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
    //storeBook("TWKQPwAACAAJ");
    //storeBook("QvA1EAAAQBAJ");
    //storeBook("monBookId3");
    //removeBook("monBookId3");
    loadMaPocheList();
}

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const CONTENT_ID = "content";
const h2Content = document.querySelector("#content > h2");
const h2NewBook = document.querySelector("#myBooks > h2");
const addButtonId = "addButton";
const searchButtonId = "searchButton";
const cancelButtonId = "cancelButton";
const searchBlokId = "searchBlokId";
const titleInputId = "titleInputId";
const authorInputId = "authorInputId";
const resultBlokId = "resultBlokId";
const UNAVAILABLE_PNG = "./public/img/unavailable.png";
const BOOK_CLASS = "book";
const TITLE_CLASS = "book__title";
const AUTHOR_CLASS = "book__author";
const ID_CLASS = "book__id";
const DESCRIPTION_CLASS = "book__description";
const IMAGE_CLASS ="book__image";
const MAX_BOOK_IN_POCH_LIST=100;
const COUNTER_OF_BOOKS = "COUNTER_OF_BOOKS";
const BOOKMARK_SRC = "./public/img/bookmark-solid-green.svg";
const TRASHCAN_SRC = "./public/img/trash-can-solid.svg";
const BOOKMARK_CLASS = "fa-bookmark";
const TRASHCAN_CLASS = "fa-trash-can";
//const LOG_IN_CONSOLE = true;

//showContent();
onLoadPage();