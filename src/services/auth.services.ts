import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { Account } from "../entities/account.entity";
import { AppError } from "../error";
import { AuthenticatedAccount, AuthTokenPayload, AccountRole } from "../interface/auth.interfaces";
import { getJwtExpiresIn, getJwtSecret } from "../config/auth.config";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role?: AccountRole;
};

type LoginInput = {
  email: string;
  password: string;
};

type SelfProfileUpdateInput = {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
};

type AdminAccountUpdateInput = {
  name?: string;
  email?: string;
  password?: string;
  role?: AccountRole;
};

const accountRepository = () => AppDataSource.getRepository(Account);

const sanitizeAccount = (account: Account): AuthenticatedAccount => ({
  id: account.id,
  name: account.name,
  email: account.email,
  role: account.role,
  isActive: account.isActive,
  createdAt: account.createdAt,
  updatedAt: account.updatedAt,
});

const findAccountWithPasswordByEmail = async (email: string) =>
  accountRepository()
    .createQueryBuilder("account")
    .addSelect("account.password")
    .where("LOWER(account.email) = LOWER(:email)", { email })
    .getOne();

const findAccountWithPasswordById = async (id: number) =>
  accountRepository()
    .createQueryBuilder("account")
    .addSelect("account.password")
    .where("account.id = :id", { id })
    .getOne();

const ensureEmailIsAvailable = async (email: string, currentId?: number) => {
  const existingAccount = await accountRepository()
    .createQueryBuilder("account")
    .where("LOWER(account.email) = LOWER(:email)", { email })
    .getOne();

  if (existingAccount && existingAccount.id !== currentId) {
    throw new AppError("Email already in use", 409, [
      { field: "email", message: "Email already in use" },
    ]);
  }
};

const countActiveAdminAccounts = async () =>
  accountRepository().count({
    where: { role: "ADMIN", isActive: true },
  });

const ensureActiveAdminRemains = async (
  account: Account,
  nextRole?: AccountRole,
) => {
  if (account.role !== "ADMIN" || !nextRole || nextRole === "ADMIN") {
    return;
  }

  const adminCount = await countActiveAdminAccounts();

  if (adminCount <= 1) {
    throw new AppError("At least one admin account must remain", 400);
  }
};

const ensureActorCanManageTargetAccount = (
  actor: AuthenticatedAccount,
  target: Account,
) => {
  if (actor.id === target.id) {
    throw new AppError("You cannot manage your own account this way", 400);
  }

  if (actor.role === "DEVELOPER") {
    throw new AppError("You do not have permission to perform this action", 403);
  }

  if (actor.role === "LEADER" && target.role !== "DEVELOPER") {
    throw new AppError("You do not have permission to perform this action", 403);
  }
};

const signAuthToken = (account: AuthenticatedAccount) =>
  jwt.sign(
    {
      role: account.role,
      email: account.email,
    },
    getJwtSecret(),
    {
      subject: String(account.id),
      expiresIn: getJwtExpiresIn(),
    },
  );

export const registerAccountService = async (
  data: RegisterInput,
  actor?: AuthenticatedAccount,
) => {
  const repository = accountRepository();

  if (!actor || actor.role !== "ADMIN") {
    throw new AppError("Only admins can create accounts", 403);
  }

  await ensureEmailIsAvailable(data.email);

  const hashedPassword = await bcrypt.hash(data.password, 12);
  const requestedRole: AccountRole = data.role || "DEVELOPER";

  const account = repository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role: requestedRole,
  });

  await repository.save(account);

  return sanitizeAccount(account);
};

export const loginService = async (data: LoginInput) => {
  const account = await findAccountWithPasswordByEmail(data.email);

  if (!account || !account.isActive) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(data.password, account.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const sanitizedAccount = sanitizeAccount(account);

  return {
    token: signAuthToken(sanitizedAccount),
    user: sanitizedAccount,
  };
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  const decoded = jwt.verify(token, getJwtSecret());

  if (
    typeof decoded !== "object" ||
    !decoded ||
    typeof decoded.sub !== "string" ||
    typeof decoded.email !== "string" ||
    typeof decoded.role !== "string"
  ) {
    throw new AppError("Invalid token", 401);
  }

  return {
    sub: decoded.sub,
    email: decoded.email,
    role: decoded.role as AccountRole,
  };
};

export const getAccountProfileService = async (accountId: number) => {
  const account = await accountRepository().findOneBy({ id: accountId });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  return sanitizeAccount(account);
};

export const getAuthenticatedAccountService = async (accountId: number) => {
  const account = await accountRepository().findOneBy({
    id: accountId,
    isActive: true,
  });

  if (!account) {
    throw new AppError("Authentication required", 401);
  }

  return sanitizeAccount(account);
};

export const updateOwnProfileService = async (
  accountId: number,
  data: SelfProfileUpdateInput,
) => {
  const repository = accountRepository();
  const account = await findAccountWithPasswordById(accountId);

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  if (data.email) {
    await ensureEmailIsAvailable(data.email, account.id);
    account.email = data.email;
  }

  if (data.name) {
    account.name = data.name;
  }

  if (data.password) {
    const passwordMatches = await bcrypt.compare(
      data.currentPassword || "",
      account.password,
    );

    if (!passwordMatches) {
      throw new AppError("Current password is incorrect", 400, [
        {
          field: "currentPassword",
          message: "Current password is incorrect",
        },
      ]);
    }

    account.password = await bcrypt.hash(data.password, 12);
  }

  await repository.save(account);
  return sanitizeAccount(account);
};

export const updateAccountByAdminService = async (
  accountId: number,
  data: AdminAccountUpdateInput,
) => {
  const repository = accountRepository();
  const account = await findAccountWithPasswordById(accountId);

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  await ensureActiveAdminRemains(account, data.role);

  if (data.email) {
    await ensureEmailIsAvailable(data.email, account.id);
    account.email = data.email;
  }

  if (data.name) {
    account.name = data.name;
  }

  if (data.role) {
    account.role = data.role;
  }

  if (data.password) {
    account.password = await bcrypt.hash(data.password, 12);
  }

  await repository.save(account);
  return sanitizeAccount(account);
};

export const deactivateAccountService = async (
  accountId: number,
  actor: AuthenticatedAccount,
) => {
  const repository = accountRepository();
  const account = await repository.findOneBy({ id: accountId });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  ensureActorCanManageTargetAccount(actor, account);

  if (!account.isActive) {
    throw new AppError("Account is already inactive", 400);
  }

  await ensureActiveAdminRemains(account, "DEVELOPER");

  account.isActive = false;
  await repository.save(account);
};

export const hardDeleteAccountService = async (
  accountId: number,
  actor: AuthenticatedAccount,
) => {
  const repository = accountRepository();
  const account = await repository.findOneBy({ id: accountId });

  if (!account) {
    throw new AppError("Account not found", 404);
  }

  ensureActorCanManageTargetAccount(actor, account);
  await ensureActiveAdminRemains(account, "DEVELOPER");

  await repository.remove(account);
};
