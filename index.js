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
function editBook(id) {
    const book = books.find(b => b.id === id);
    document.getElementById('editId').value = book.id;
    document.getElementById('editTitle').value = book.title;
    document.getElementById('editAuthor').value = book.author;
    document.getElementById('editGenre').value = book.genre;
    document.getElementById('editStatus').value = book.status;
    new bootstrap.Modal(document.getElementById('editBookModal')).show();
}

document.getElementById('editBookForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const book = books.find(b => b.id === id);
    book.title = document.getElementById('editTitle').value;
    book.author = document.getElementById('editAuthor').value;
    book.genre = document.getElementById('editGenre').value;
    book.status = document.getElementById('editStatus').value;
    const image = document.getElementById('editImage').files[0];
    if (image) {
        const reader = new FileReader();
        reader.onload = function () {
            book.image = reader.result;
            saveBooks();
            renderBooks();
            new bootstrap.Modal(document.getElementById('editBookModal')).hide();
        };
        reader.readAsDataURL(image);
    } else {
        saveBooks();
        renderBooks();
        new bootstrap.Modal(document.getElementById('editBookModal')).hide();
    }
});

function deleteBook(id) {
    if (confirm('Are you sure you want to delete this book?')) {
        books = books.filter(book => book.id !== id);
        saveBooks();
        renderBooks();
    }
}

function toggleFavorite(id) {
    const book = books.find(b => b.id === id);
    book.favorite = !book.favorite;
    saveBooks();
    renderBooks();
}

document.getElementById('search').addEventListener('input', function () {
    const query = this.value.toLowerCase();
    const filteredBooks = books.filter(book => 
        book.title.toLowerCase().includes(query) || 
        book.author.toLowerCase().includes(query)
    );


    document.querySelector('.search-bar').addEventListener('click', function () {
        const query = document.getElementById('search').value.trim().toLowerCase();
        if (!query) return;

        const localMatches = books.filter(book=>
            book.title.toLowerCase().includes(query) ||
             book.author.toLowerCase().includes (query)
        );

        if (localMatches.length>0) {
            displayBooks(localMatches, true);
            return;
        }

        fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const publicBooks = data.items.map(item =>{
                    const info = item.volumeInfo;
                    return{
                        title: info.title || "No title",
                        author: (info.authors && info.authors.join(',')) || "Unknown Author",
                        genre: info.categories? info.categories[0]: "General",
                        image: info.imageLinks?.thumbnail || 'https://via.placeholder.com/150',
                        link: info.previewLink || "#"
                    };
                });
                displayBooks(publicBooks,false);
                
                }
                else {
                    document.getElementById('bool-list').innerHTML = "<p class='text-white'>No books found.</p>";
            }
        })
        .catch(err =>{
            console.error("Error fetching from google Books API:", err);
            document.getElementById('book-list').innerHTML= "<p class='text-white'>Failed to fetch public book.</p>";
        });
    })

    function displayBooks(bookArray, isLocal = true) {
    document.getElementById('book-list').innerHTML = bookArray.map(book => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <img src="${book.image}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">${book.author} - ${book.genre}</p>
                    ${isLocal ? `
                    <button onclick="editBook('${book.id}')" class="btn btn-warning">Edit</button>
                    <button onclick="deleteBook('${book.id}')" class="btn btn-danger">Delete</button>
                    <button onclick="toggleFavorite('${book.id}')" class="btn btn-secondary">
                        ${book.favorite ? 'Unfavorite' : 'Favorite'}
                    </button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}
    
    renderBooks();
    document.getElementById('book-list').innerHTML = filteredBooks.map(book => `
        <div class="col-md-4 mb-3">
            <div class="card">
                <img src="${book.image}" class="card-img-top" alt="${book.title}">
                <div class="card-body">
                    <h5 class="card-title">${book.title}</h5>
                    <p class="card-text">${book.author} - ${book.genre}</p>
                </div>
            </div>
        </div>
    `).join('');
});

document.querySelectorAll('[data-tab]').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('[data-tab]').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        const filter = this.getAttribute('data-tab')
        renderBooks(filter);
    });
});



