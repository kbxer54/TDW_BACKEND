// src/scripts/seedAdmin.ts

/*
English explanation here
This is a seed script to solve the "chicken and egg" problem. Since the registration route is protected, we need to create the first Super Admin directly in the database. 
Run this script once using the terminal command: npx ts-node src/scripts/seedAdmin.ts

Explicação em português aqui
Este é um script de "seed" para resolver o problema de "quem veio primeiro, o ovo ou a galinha". Como a rota de registro está protegida, precisamos criar o primeiro Super Admin diretamente no banco de dados.
Execute este script uma vez usando o comando no terminal: npx ts-node src/scripts/seedAdmin.ts
*/

import "reflect-metadata";
import { AppDataSource } from "../data-source";
import { User } from "../entities/user.entity";
import { Role } from "../enums/role";

async function createSuperAdmin() {
  try {
    await AppDataSource.initialize();
    console.log("Database connected. Checking for existing admins...");

    const userRepository = AppDataSource.getRepository(User);

    const existingAdmin = await userRepository.findOne({
      where: { email: "eduardo@thedarkwest.com" },
    });

    if (existingAdmin) {
      console.log("Super Admin already exists. No action taken.");
      process.exit(0);
    }

    const superAdmin = userRepository.create({
      name: "Eduardo Henrique",
      email: "eduardo@thedarkwest.com",
      password: "SuperPassword@2026", 
      role: Role.ADMIN,
    });

    await userRepository.save(superAdmin);
    console.log("Success! Super Admin created.");
    console.log("You can now login at POST /auth/login to get your Bearer Token.");
    
    process.exit(0);
  } catch (error) {
    console.error("Error creating Super Admin:", error);
    process.exit(1);
  }
}

createSuperAdmin();