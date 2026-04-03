import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { AppError } from "../error";
import { TRegisterRequest, TLoginRequest, IAuthResponse } from "../interface/auth.interfaces";
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

const userRepository = AppDataSource.getRepository(User);

export const registerService = async (data: TRegisterRequest): Promise<IAuthResponse> => {
  const existingUser = await userRepository.findOneBy({ email: data.email });
  
  if (existingUser) {
    throw new AppError("Email already in use", 409);
  }

  const user = userRepository.create(data);
  await userRepository.save(user);

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "default_super_secret_key_change_in_production",
    { expiresIn: "1d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const loginService = async (data: TLoginRequest): Promise<IAuthResponse> => {
  const user = await userRepository.findOneBy({ email: data.email });
  
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isPasswordValid = await bcrypt.compare(data.password, user.password);
  
  if (!isPasswordValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET || "default_super_secret_key_change_in_production",
    { expiresIn: "1d" }
  );

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};