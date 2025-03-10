import { redisPub, redisSub } from "./redis";
import { connectDB } from "./database";
import { handleRegister, handleLogin, handleMe, handleGetUserById } from "./handlers";


connectDB();
console.log("connected to db");

redisSub.subscribe("auth_queue", (err, count) => {
  if (err) console.error("err", err);
  else console.log(`subbing to auth_queue (channels: ${count})`);
});

redisSub.on("message", async (channel, message) => {
  if (channel !== "auth_queue") return;

  console.log(`receivied msg ${channel}:`, message);

  const data = JSON.parse(message);
  const { action, requestId } = data;

  if (!requestId) {
    console.error("requestId is missing", data);
    return;
  }

  let response;
  switch (action) {
    case "register":
      response = await handleRegister(data);
      break;
    case "login":
      response = await handleLogin(data);
      break;
    case "me":
      response = await handleMe(data);
      break;
    case "getUserById":
      response = await handleGetUserById(data.userId);
      break;
    default:
      console.warn(`what are you doing: ${action}`);
      return;
  }

  console.log(`sending to auth_queue_response_${requestId}:`, response);
  redisPub.publish(`auth_queue_response_${requestId}`, JSON.stringify(response));
});

