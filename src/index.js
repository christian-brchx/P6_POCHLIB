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
    alertEmptySearchField();
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
        showInformationsFoundBook(book.id,resultBlokId);
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

function addFoundBookInBlok(book,blokId){
  let elementBook = document.createElement("div");
  elementBook.classList.add("book");
  let elementBookTitle = document.createElement("h2");
  elementBookTitle.classList.add("bookTitle");
  elementBookTitle.innerText = "Titre : " + book.volumeInfo.title;
  let elementBookId = document.createElement("h3");
  elementBookId.classList.add(BOOKID_CLASS);
  elementBookId.innerText = "Id : " + book.id;
  let elementBookAuthor = document.createElement("h4");
  elementBookAuthor.classList.add("bookAuthor");
  elementBookAuthor.innerText = "Auteur : " + book.volumeInfo.authors[0];
  let elementBookDescription = document.createElement("p");
  elementBookDescription.classList.add("bookDescription");
  if (book.volumeInfo.description != null) {
    elementBookDescription.innerHTML = "Description : " + book.volumeInfo.description.substring(0,200);
  } else {
    elementBookDescription.innerText = "Description : Information manquante";
  }
  let srcBookImage = unaivalablePng;
  if (book.volumeInfo.imageLinks != null) {
    console.log("foundBookInfoB : images available");
    if (book.volumeInfo.imageLinks.thumbnail != null) {
      srcBookImage = book.volumeInfo.imageLinks.thumbnail;
    } 
  } 
  document.getElementById(blokId).appendChild(elementBook);
  if (blokId == resultBlokId) {
    elementBook.appendChild(createBookMark(BOOKMARK_CLASS,book.id));
  }
  if (blokId == CONTENT_ID) {
    elementBook.appendChild(createBookMark(TRASHCAN_CLASS,book.id));
  }
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

function createBookMark(markClass,bookId){
  let img = document.createElement("img");
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
  console.log("actionBook Id = ",this.id);
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
  console.log(request);
  await fetch(request)
  .then(function(res) {
    if (res.ok){
      return res.json();
    }
  })
  .then(function (value){
    console.log(value);
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

async function loadMaPocheList() {
  let counterOfBooks = 0
  if (sessionStorage.getItem(COUNTER_OF_BOOKS)) {
    counterOfBooks = sessionStorage.getItem(COUNTER_OF_BOOKS);
  }
  console.log("load Ma PochList number of books = ",counterOfBooks);
  let numberOfBooksLoaded = 0;
  let key = 1;
  let bookId = null;
  while (numberOfBooksLoaded < counterOfBooks) {
    if (sessionStorage.getItem(key)) {
      bookId = sessionStorage.getItem(key);
      console.log("LoadMaPocheList avec BookId = ",bookId);
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
    console.log("storeBook get counter of books before storing= ",counterOfBooks);

    // Put the BookId with the first free key
    console.log("storeBook length of SessionStorage before storing = ",sessionStorage.length);
    // search for free key
    let key=1;
    while ((sessionStorage.getItem(key)) && (key<=MAX_BOOK_IN_POCH_LIST)) {
      key++;
    }
    sessionStorage.setItem(key,bookId);
    sessionStorage.setItem(bookId,key);
    console.log("storeBookId = ",bookId," in key = ",key);
    console.log("storeBook length of SessionStorage after storing = ",sessionStorage.length);

    // increment and save the counter of books in my poch list
    counterOfBooks++;
    console.log("storeBook save counter of books after storing= ",counterOfBooks);
    sessionStorage.setItem(COUNTER_OF_BOOKS,counterOfBooks);
    return true;
  } else {
    alertBookAlreadyExist();
    return false;
  }
}

function removeBook(bookId) {
  if (sessionStorage.getItem(bookId)) {
    console.log("removeBook key = ", sessionStorage.getItem(bookId));
    sessionStorage.removeItem(sessionStorage.getItem(bookId));
    console.log("removeBook bookId = ", bookId);
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
const unaivalablePng = "./img/unavailable.png";
const BOOKID_CLASS = "bookId";
const MAX_BOOK_IN_POCH_LIST=100;
const COUNTER_OF_BOOKS = "COUNTER_OF_BOOKS";
const BOOKMARK_SRC = "./img/bookmark-solid.svg";
const TRASHCAN_SRC = "./img/trash-can-solid.svg";
const BOOKMARK_CLASS = "bookmarkClass";
const TRASHCAN_CLASS = "trashCanClass";

//showContent();
onLoadPage();