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
    ret = searchForBooksWithGoogleApi("Les voies", "Powers");
    console.log("Search for Book ret = ", ret);
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
      h2Content.innerText = "Nombre de livres trouvés : " + value.totalItems;
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

function showNoFoundBook(book) {
  h2Content.innerText = "Aucun livre n’a été trouvé";
}

function addFoundBookInContent(book){
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
  if (book.volumeInfo.description != "") {
    elementBookDescription.innerText = book.volumeInfo.description;
  } else {
    elementBookDescription.innerText = "Information manquante";
  }
  content.appendChild(elementBook);
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
    addFoundBookInContent(value);
  })
  .catch(function(err){
    console.error("erreur appel google API");
  });
}


function onLoadPage() {
    createAddBookButton();    
}

const GOOGLE_BOOKS_API = "https://www.googleapis.com/books/v1/volumes";
const myBooks = document.getElementById('myBooks');
const content = document.getElementById('content');
const h2Content = document.querySelector("#content > h2");
const h2NewBook = document.querySelector("#myBooks > h2");

//showContent();
onLoadPage();