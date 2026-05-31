import { DataSource, DataSourceOptions } from "typeorm";
import path from "path";
import "dotenv/config";

const getPositiveIntegerEnv = (
  key: string,
  fallback: number,
): number => {
  const value = process.env[key];
  const parsedValue = Number(value);

  if (!value || !Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const settings = (): DataSourceOptions => {
  const entitiesPath: string = path.join(__dirname, "./entities/**.{ts,js}");
  const migrationPath: string = path.join(__dirname, "./migrations/**.{ts,js}");
  const nodeEnv: string | undefined = process.env.NODE_ENV;

  if (nodeEnv === "test") {
    return {
      type: "sqlite",
      database: ":memory:",
      synchronize: true,
      entities: [entitiesPath],
    };
  }

  const dbUrl: string | undefined = process.env.DATABASE_URL;

  if (!dbUrl) throw new Error("Missing env var: 'DATABASE_URL'");

  return {
    type: "postgres",
    url: dbUrl,
    synchronize: false,
    logging: nodeEnv !== "production",
    extra: {
      max: getPositiveIntegerEnv(
        "DB_POOL_MAX",
        nodeEnv === "production" ? 10 : 5,
      ),
      connectionTimeoutMillis: getPositiveIntegerEnv(
        "DB_CONNECTION_TIMEOUT_MS",
        10000,
      ),
      idleTimeoutMillis: getPositiveIntegerEnv("DB_IDLE_TIMEOUT_MS", 30000),
    },
    entities: [entitiesPath],
    migrations: [migrationPath],
    ...(nodeEnv === "production" && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  };
};

const AppDataSource = new DataSource(settings());

export { AppDataSource };
