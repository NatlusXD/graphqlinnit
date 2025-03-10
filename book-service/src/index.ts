import { redisPub, redisSub } from "./redis";
import { connectDB } from "./database";
import { handleGetBooks, handleCreateBook, handleGetBookById, handleUpdateBook } from "./handlers";

connectDB();

redisSub.subscribe("book_queue", (err, count) => {
  if (err) {
    console.error("error sub redis", err);
  } else {
    console.log(`redis sub to book_queue (channels: ${count})`);
  }
});

redisSub.on("message", async (channel, message) => {
  if (channel !== "book_queue") return;

  const data = JSON.parse(message);
  console.log("received a msg in book_queue:", data);

  let response;
  switch (data.action) {
    case "getBooks":
      response = await handleGetBooks();
      break;
    case "getBookById":
      response = await handleGetBookById(data.id);
      break;
    case "createBook":
      response = await handleCreateBook(data);
      break;
    case "updateBook":
      response = await handleUpdateBook(data);
      break;
    default:
      console.warn(`what are you trying to do: ${data.action}`);
      return;
  }

  if (data.requestId) {
    const responseChannel = `book_queue_response_${data.requestId}`;
    redisPub.publish(responseChannel, JSON.stringify(response));
    console.log(`sending result to ${responseChannel}:`, response);
  }
});
