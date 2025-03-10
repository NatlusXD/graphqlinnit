import { AppDataSource } from "./database";
import { User } from "./entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userRepo = AppDataSource.getRepository(User);
const JWT_SECRET = process.env.JWT_SECRET || "secret";

export const handleRegister = async (data: { name: string; email: string; password: string }) => {
  console.log("handleRegister is called with data:", data);

  try {
    const existingUser = await userRepo.findOne({ where: { email: data.email } });
    if (existingUser) {
      console.log("user already exists");
      return { success: false, message: "user already exists" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    console.log("password encrypted");

    const user = userRepo.create({ ...data, password: hashedPassword });
    await userRepo.save(user);
    console.log("user registered:", user);

    return { success: true, message: "user registered" };
  } catch (error) {
    console.error("err while registering:", error);
    return { success: false, message: "err while registering" };
  }
};

export const handleLogin = async (data: { email: string; password: string }) => {
  console.log("handleLogin is called with data:", data);

  const user = await userRepo.findOne({ where: { email: data.email } });
  if (!user) {
    console.log("WROOONG CREDENTIALS");
    return { success: false, message: "WROOONG CREDENTIALS" };
  }

  const isValid = await bcrypt.compare(data.password, user.password);
  if (!isValid) {
    console.log("WROOOONG PASSWORD");
    return { success: false, message: "WROOOONG PASSWORD" };
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
  console.log("logged in and token generated");

  return { success: true, token };
};

export const handleMe = async (data: { token: string }) => {
  console.log("handleMe is called with token:", data.token);

  try {
    const decoded = jwt.verify(data.token, JWT_SECRET) as { id: number; email: string };
    console.log("token is correct:", decoded);

    const user = await userRepo.findOne({ where: { id: decoded.id } });

    if (!user) {
      console.log("no user found");
      return { success: false, message: "no user found" };
    }

    return { success: true, user };
  } catch (error) {
    console.error("WROOONG TOKEN", error);
    return { success: false, message: "WROOONG TOKEN" };
  }
};

export const handleGetUserById = async (userId: number) => {
  console.log("getting user by id", userId);

  const user = await userRepo.findOne({ where: { id: userId } });
  if (!user) {
    console.log("no user found");
    return null;
  }

  console.log("user found", user);
  return { id: user.id, name: user.name, email: user.email };
};


