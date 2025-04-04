// script.js
let books = JSON.parse(localStorage.getItem('books')) || [];

function saveBooks() {
    localStorage.setItem('books', JSON.stringify(books));
}

function renderBooks(filter = 'all') {
    const bookList = document.getElementById('book-list');
    bookList.innerHTML = '';
    const filteredBooks = books.filter(book => {
        if (filter === 'favorites') return book.favorite;
        if (filter === 'unread') return book.status === 'Unread';
        if (filter === 'read') return book.status === 'Read';
        return true;
    });
    filteredBooks.forEach(book => {
        const bookCard = `
            <div class="col-md-4 mb-3">
                <div class="card">
                    <img src="${book.image}" class="card-img-top" alt="${book.title}">
                    <div class="card-body">
                        <h5 class="card-title">${book.title}</h5>
                        <p class="card-text">${book.author} - ${book.genre}</p>
                        <button onclick="editBook('${book.id}')" class="btn btn-warning">Edit</button>
                        <button onclick="deleteBook('${book.id}')" class="btn btn-danger">Delete</button>
                        <button onclick="toggleFavorite('${book.id}')" class="btn btn-secondary">
                            ${book.favorite ? 'Unfavorite' : 'Favorite'}
                        </button>
                    </div>
                </div>
            </div>
        `;
        bookList.innerHTML += bookCard;
    });
}

function openAddModal() {
    document.getElementById('addBookForm').reset();
    new bootstrap.Modal(document.getElementById('addBookModal')).show();
}

document.getElementById('addBookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const genre = document.getElementById('genre').value;
    const status = document.getElementById('status').value;
    const image = document.getElementById('image').files[0];
    const reader = new FileReader();
    reader.onload = function () {
        const book = {
            id: Date.now().toString(),
            title,
            author,
            genre,
            status,
            favorite: false,
            image: reader.result
        };
        books.push(book);
        saveBooks();
        renderBooks();
        new bootstrap.Modal(document.getElementById('addBookModal')).hide();
    };
    reader.readAsDataURL(image);
});

