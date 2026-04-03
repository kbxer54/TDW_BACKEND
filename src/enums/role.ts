/*
Defines the available roles for the system users.
Admin has full access, Developer can manage posts and broadcasts.

Define os cargos disponíveis para os usuários do sistema.
Admin tem acesso total, Developer pode gerenciar posts e envios de e-mail.
*/
export enum Role {
  ADMIN = "ADMIN",
  DEVELOPER = "DEVELOPER",
  LEADER = "LEADER",
}