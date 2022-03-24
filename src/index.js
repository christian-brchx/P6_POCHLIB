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
    if (value.items.length > 0) {
      //h2Content.innerText = "Nombre de livres trouvés : " + value.totalItems;
      createResultsBlok();
      for (let book of value.items) {
        showInformationsFoundBook(book);
      }
    } else {
      showNoFoundBook;
    }
    return value;
  })
  .catch(function(err){
    console.error();("erreur appel google API");
  });
}

function createResultsBlok() {
  let searchBlok = document.getElementById(searchBlokId);
  let resultBlok = document.createElement("div");
  resultBlok.id = resultBlokId;
  searchBlok.insertAdjacentElement("afterend",resultBlok);
  searchBlok.insertAdjacentElement("afterend",document.createElement("hr"));
  let h2 = document.createElement("h2");
  h2.innerText = "Résultats de recherche";
  resultBlok.appendChild(h2);
}


function showNoFoundBook(book) {
  h2Content.innerText = "Aucun livre n’a été trouvé";
}

function addFoundBookInResultBlok(book){
  let elementBook = document.createElement("div");
  elementBook.classList.add("Book");
  let elementBookTitle = document.createElement("div");
  elementBookTitle.classList.add("Title");
  elementBookTitle.innerText = "Titre : " + book.volumeInfo.title;
  let elementBookId = document.createElement("div");
  elementBookId.classList.add("Id");
  elementBookId.innerText = "Id : " + book.id;
  let elementBookAuthor = document.createElement("div");
  elementBookAuthor.classList.add("Author");
  elementBookAuthor.innerText = "Auteur : " + book.volumeInfo.authors[0];
  let elementBookDescription = document.createElement("div");
  elementBookDescription.classList.add("Description");
  if (book.volumeInfo.description != null) {
    elementBookDescription.innerText = book.volumeInfo.description.substring(0,200);
  } else {
    elementBookDescription.innerText = "Information manquante";
  }
  if (book.imageLinks.smallThumbnail != null) {
    console.log("foundBookInfoB : ",book.imageLinks.smallThumbnail);
  } else {
    console.log("foundBookInfoB : unavailable.png");
  }
  document.getElementById(resultBlokId).appendChild(elementBook);
  elementBook.appendChild(elementBookTitle);
  elementBook.appendChild(elementBookId);
  elementBook.appendChild(elementBookAuthor);
  elementBook.appendChild(elementBookDescription);
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
      document.getElementById(addButtonId).remove();
      createBlokSearchWithButtonsAndFields();
      break;
    case searchButtonId:
      console.log("clic searchButton");
      searchForBooks();
        break;
    case cancelButtonId:
      // clean search blok if exists
      let searchBlok = document.getElementById(searchBlokId);
      if (searchBlok != null) {
        searchBlok.remove();
      }
      console.log("clic cancelButton");
      // Add AddBookButton
      h2NewBook.insertAdjacentElement("afterEnd",createAddBookButton());
      break;
    default:
      console.error("clic unknown");
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

//showContent();
onLoadPage();