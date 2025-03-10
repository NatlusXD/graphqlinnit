import { redisPub, redisSub } from "./redis";
import { AppDataSource } from "./database";
import { Book } from "./entities/Book";

const bookRepo = AppDataSource.getRepository(Book);

export const handleGetBooks = async () => {
  console.log("receiving books");
  const books = await bookRepo.find();
  return await Promise.all(books.map(async (book) => await attachAuthor(book)));
};

export const handleGetBookById = async (id: number) => {
  console.log("receiving books by id:", id);
  const book = await bookRepo.findOne({ where: { id } });
  if (!book) return null;
  return await attachAuthor(book);
};

export const handleCreateBook = async (data: { title: string; description: string; authorId: number }) => {
  console.log("creating book:", data);
  const book = bookRepo.create(data);
  await bookRepo.save(book);
  return await attachAuthor(book);
};

export const handleUpdateBook = async (data: { id: number; title?: string; description?: string }) => {
  console.log("updating book:", data);
  const book = await bookRepo.findOne({ where: { id: data.id } });
  if (!book) return null;
  if (data.title) book.title = data.title;
  if (data.description) book.description = data.description;
  await bookRepo.save(book);
  return await attachAuthor(book);
};

const attachAuthor = async (book: Book) => {
  const requestId = Date.now().toString();
  const channel = `auth_queue_response_${requestId}`;

  console.log(`receiving author ${book.authorId}`);

  return new Promise((resolve, reject) => {
    redisSub.subscribe(channel, (err) => {
      if (err) {
        console.error("err sub to channel:", err);
        return reject(err);
      }

      redisPub.publish("auth_queue", JSON.stringify({ action: "getUserById", userId: book.authorId, requestId }));

      redisSub.on("message", (respChannel, message) => {
        if (respChannel === channel) {
          redisSub.unsubscribe(channel);
          resolve({ ...book, author: JSON.parse(message) });
        }
      });

      setTimeout(() => {
        redisSub.unsubscribe(channel);
        console.error(`time out mate ${book.authorId}`);
        resolve({ ...book, author: null });
      }, 5000);
    });
  });
};
