# Dépendances nécessaires pour les entités DIP-DIVE

## Installation des dépendances

```bash
npm install --save \
  @nestjs/typeorm \
  @nestjs/config \
  typeorm \
  mysql2 \
  class-validator \
  class-transformer \
  typeorm-naming-strategies \
  bcrypt

npm install --save-dev \
  @types/bcrypt
```

## Scripts package.json à ajouter

```json
{
  "scripts": {
    "typeorm": "npm run build && npx typeorm -d dist/config/database.config.js",
    "migration:generate": "npm run typeorm migration:generate",
    "migration:run": "npm run typeorm migration:run",
    "migration:revert": "npm run typeorm migration:revert",
    "seed": "ts-node src/seeds/run-seeds.ts",
    "db:reset": "npm run typeorm schema:drop && npm run migration:run && npm run seed"
  }
}
```

## Versions recommandées

- `@nestjs/typeorm`: ^10.0.0
- `typeorm`: ^0.3.17
- `mysql2`: ^3.6.0
- `class-validator`: ^0.14.0
- `class-transformer`: ^0.5.1
- `typeorm-naming-strategies`: ^4.1.0
- `bcrypt`: ^5.1.0

## Configuration TypeScript

Assurez-vous que votre `tsconfig.json` inclut :

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "strictPropertyInitialization": false
  }
}
```