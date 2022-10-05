const { nanoid } = require('nanoid');
// files
const books = require('./books');
// add book
const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  // handling client error
  if (!name) { // nama kosong
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }
  if (readPage >= pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;
  const finished = pageCount === readPage;

  const newBook = {
    id, name, year, author, summary, publisher, pageCount, readPage, finished, reading, insertedAt, updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }
  // handling server error
  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};
// get all books
const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;
  let filteredBooks = books;
  if (name) {
    filteredBooks = filteredBooks.filter((book) => book.name.toLowerCase().includes(name.toLowerCase()));
  }
  if (reading) {
    filteredBooks = filteredBooks.filter((book) => book.reading === !!Number(reading));
  }
  if (finished) {
    filteredBooks = filteredBooks.filter((book) => book.finished === !!Number(finished));
  }

  const response = h.response({
    status: 'success',
    data: {
      books: filteredBooks.map((book) => ({
        id: book.id,
        name: book.name,
        publisher: book.publisher,
      })),
    },
  });
  response.code(200);
  return response; // get detail
};
const getBookByIdHandler = (request, handler) => {
  const id = request.params.bookId;
  const book = books.find((book) => book.id == id);

  if (!book) {
    return handler
      .response({
        status: 'fail',
        message: 'Buku tidak ditemukan',
      })
      .code(404);
  }

  return {
    status: 'success',
    data: {
      book,
    },
  };
};
  // edit book
const editBookByIdHandler = (request, handler) => {
  const id = request.params.bookId;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  if (!name) {
    return handler
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku',
      })
      .code(400);
  }

  if (readPage > pageCount) {
    return handler
      .response({
        status: 'fail',
        message:
            'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
      })
      .code(400);
  }

  const index = books.findIndex((book) => book.id === id);

  if (index < 0) {
    return handler
      .response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Id tidak ditemukan',
      })
      .code(404);
  }

  const updatedAt = new Date().toISOString();

  books[index] = {
    ...books[index],
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
    updatedAt,
  };

  return {
    status: 'success',
    message: 'Buku berhasil diperbarui',
  };
};

const deleteBookByIdHandler = (request, handler) => {
  const id = request.params.bookId;

  const index = books.findIndex((book) => book.id === id);

  if (index < 0) {
    return handler
      .response({
        status: 'fail',
        message: 'Buku gagal dihapus. Id tidak ditemukan',
      })
      .code(404);
  }

  books.splice(index, 1);

  return {
    status: 'success',
    message: 'Buku berhasil dihapus',
  };
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
