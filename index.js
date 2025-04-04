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