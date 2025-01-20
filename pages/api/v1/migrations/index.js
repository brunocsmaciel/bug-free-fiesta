import { createRouter } from "next-connect";
import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";
import { InternalServerError, MethodNotAllowedError } from "infra/errors";

const router = createRouter();

router.get(getHandler).post(postHandler);
export default router.handler({
  onNoMatch: onNoMatchHandler,
  onError: onErrorHandler,
});

async function getMigrationOptions() {
  const dbClient = await database.getNewClient();
  const defaultMigrationsOptions = {
    dbClient: dbClient,
    dryRun: true,
    dir: resolve("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationsTable: "pgmigrations",
  };
  return { dbClient, defaultMigrationsOptions };
}

async function getHandler(request, response) {
  let dbClient;
  try {
    const { client, defaultMigrationsOptions } = await getMigrationOptions();
    dbClient = client;
    const pendingMigrations = await migrationRunner(defaultMigrationsOptions);
    return response.status(200).json(pendingMigrations);
  } finally {
    await dbClient.end();
  }
}

async function postHandler(request, response) {
  let dbClient;

  try {
    const { client, defaultMigrationsOptions } = await getMigrationOptions();
    dbClient = client;
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationsOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      return response.status(201).json(migratedMigrations);
    }
    return response.status(200).json(migratedMigrations);
  } finally {
    await dbClient.end();
  }
}

function onNoMatchHandler(request, response) {
  const publicErrorObject = new MethodNotAllowedError();
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}

function onErrorHandler(error, request, response) {
  const publicErrorObject = new InternalServerError({ cause: error });

  console.log("Erro dentro do catch do next-connect");
  console.error(publicErrorObject);
  response.status(publicErrorObject.statusCode).json(publicErrorObject);
}
