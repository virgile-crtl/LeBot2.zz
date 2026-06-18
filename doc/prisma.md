# Prisma

## Initialization

To generate the Prisma client, run the following command:

```bash
NODE_ENV=dev npx prisma generate

```
## Migrations

To Create New Migrations, run the following command:

```bash
NODE_ENV=dev npx prisma migrate dev
```

To apply migrations to the database, run the following command:

```bash
NODE_ENV=dev npx prisma migrate deploy
```
