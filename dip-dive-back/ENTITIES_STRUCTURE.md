# 🏊‍♂️ DIP-DIVE - Structure des Entités NestJS 11

## 📋 Vue d'ensemble

Structure complète des entités pour l'application de gestion de plongée avec :
- ✅ **5 entités principales** avec relations bidirectionnelles
- ✅ **Validations class-validator** complètes
- ✅ **Enums TypeScript** pour type safety
- ✅ **Index optimisés** pour les performances
- ✅ **Soft delete** et audit trails
- ✅ **Méthodes helper** métier
- ✅ **Configuration TypeORM** production-ready

## 🗂️ Structure des fichiers

```
src/
├── entities/
│   ├── enums/
│   │   ├── category.enum.ts           # Enum pour admin/diving
│   │   ├── permission-action.enum.ts  # Enum pour CRUD actions
│   │   └── index.ts                   # Export central des enums
│   ├── user.entity.ts                 # Entité User avec validations
│   ├── role.entity.ts                 # Entité Role avec hiérarchie
│   ├── permission.entity.ts           # Entité Permission granulaire
│   ├── user-role.entity.ts           # Table de liaison User-Role
│   ├── role-permission.entity.ts     # Table de liaison Role-Permission
│   └── index.ts                      # Export central des entités
├── config/
│   └── database.config.ts            # Configuration TypeORM
├── seeds/
│   ├── initial-data.seed.ts          # Seed des données initiales
│   └── run-seeds.ts                  # Script d'exécution des seeds
└── app.module.example.ts             # Exemple d'intégration NestJS
```

## 🏗️ Architecture des entités

### 👤 **User Entity**
```typescript
- id (UUID, PK)
- firstName (string, max 50, validations)
- lastName (string, max 50, validations)
- email (string, unique, email validation)
- passwordHash (string, excluded from API)
- divingLicenseNumber (string, optional, format validation)
- isActive (boolean, default true)
- createdAt, updatedAt, deletedAt (audit)

Relations:
- userRoles: OneToMany → UserRole (lazy)
- assignedUserRoles: OneToMany → UserRole (lazy)

Méthodes:
- hasRole(roleName), hasRoleInCategory(category)
- getActiveRoles(), deactivate(), reactivate()
- Propriétés virtuelles: fullName, displayName, isDiver
```

### 👥 **Role Entity**
```typescript
- id (UUID, PK)
- name (string, unique, UPPER_CASE validation)
- description (text, optional)
- category (CategoryEnum: admin|diving)
- isActive (boolean, default true)
- createdAt, updatedAt, deletedAt (audit)

Relations:
- userRoles: OneToMany → UserRole (lazy)
- rolePermissions: OneToMany → RolePermission (lazy)

Méthodes:
- hasPermission(name), getPermissionNames()
- getUsersCount(), canBeDeleted()
- isSystemRole(), getHierarchyLevel(), isHigherThan()
- Constantes: ROLES = { SUPER_ADMIN, ADMIN, DIVER, etc. }
```

### 🔐 **Permission Entity**
```typescript
- id (UUID, PK)
- name (string, unique, snake_case validation)
- description (text, optional)
- resource (string, snake_case validation)
- action (PermissionActionEnum: create|read|update|delete)
- category (CategoryEnum: admin|diving)
- createdAt, updatedAt (audit)

Relations:
- rolePermissions: OneToMany → RolePermission (lazy)

Méthodes:
- getRoleNames(), isAssignedToAnyRole()
- isSystemPermission(), getActionWeight()
- generateName(resource, action)
- Constantes: RESOURCES = { USERS, DIVES, etc. }
```

### 🔗 **UserRole Entity** (Table de liaison)
```typescript
- userId (UUID, PK composite)
- roleId (UUID, PK composite)
- assignedAt (timestamp)
- assignedByUserId (UUID, optional FK)
- isActive (boolean, default true)

Relations:
- user: ManyToOne → User (eager: false)
- role: ManyToOne → Role (eager: false)
- assignedByUser: ManyToOne → User (eager: false)

Méthodes:
- validateAssignment(), getDisplayInfo()
- deactivate(), reactivate()
- wasAssignedBy(), isSelfAssigned
```

### 🔗 **RolePermission Entity** (Table de liaison)
```typescript
- roleId (UUID, PK composite)
- permissionId (UUID, PK composite)
- grantedAt (timestamp)

Relations:
- role: ManyToOne → Role (eager: false)
- permission: ManyToOne → Permission (eager: false)

Méthodes:
- validateAssignment(), getDisplayInfo()
- categoriesMatch, isCriticalPermission
- getPermissionScope()
```

## 🔧 Configuration TypeORM

### Fonctionnalités incluses :
- ✅ **Naming Strategy** snake_case pour MySQL
- ✅ **Connection pooling** optimisé
- ✅ **Cache de requêtes** avec durée configurable
- ✅ **Logging** adaptatif (dev/prod)
- ✅ **SSL support** pour la production
- ✅ **Migrations** automatiques en production
- ✅ **Timezone UTC** forcé

### Environnements supportés :
- 🔧 **Development** : Synchronize ON, logging détaillé
- 🚀 **Production** : Migrations only, logging errors
- 🧪 **Test** : SQLite in-memory, drop schema

## 📊 Index et performances

### Index créés automatiquement :
```sql
-- User entity
INDEX(email), INDEX(isActive), INDEX(divingLicenseNumber)
INDEX(lastName, firstName)

-- Role entity  
INDEX(name), INDEX(category), INDEX(isActive)
INDEX(category, isActive)

-- Permission entity
INDEX(name), INDEX(resource), INDEX(action), INDEX(category)
INDEX(category, resource), INDEX(resource, action)
INDEX(category, resource, action)

-- UserRole entity
UNIQUE(userId, roleId), INDEX(assignedAt), INDEX(isActive)
INDEX(userId, isActive), INDEX(roleId, isActive)

-- RolePermission entity
UNIQUE(roleId, permissionId), INDEX(grantedAt)
```

## 🌱 Données initiales (Seeds)

### Rôles créés automatiquement :
- 🔴 **SUPER_ADMIN** : Accès complet système
- 🟠 **ADMIN** : Gestion technique + lecture plongée
- 🔵 **INSTRUCTOR** : Permissions plongée avancées
- 🟢 **DIVE_MASTER** : Supervision de plongées
- 🟡 **DIVING_SUPERVISOR** : Supervision basique
- ⚪ **DIVER** : Permissions de lecture uniquement

### Permissions par catégorie :
**Admin** : users, roles, permissions, settings
**Diving** : dives, divers, diving_sites, equipment, reports

### Utilisateur admin par défaut :
- 📧 **Email** : `admin@dipdive.local`
- 🔐 **Password** : `Admin123!`
- 👑 **Role** : SUPER_ADMIN

## 🚀 Installation et utilisation

### 1. Installation des dépendances
```bash
npm install --save @nestjs/typeorm @nestjs/config typeorm mysql2 \
  class-validator class-transformer typeorm-naming-strategies bcrypt

npm install --save-dev @types/bcrypt
```

### 2. Configuration environnement (.env)
```env
DATABASE_HOST=localhost
DATABASE_PORT=3307
DATABASE_NAME=dip_dive_dev
DATABASE_USER=dev_user
DATABASE_PASSWORD=dev_password
```

### 3. Intégration dans AppModule
```typescript
import { ENTITIES } from './entities';
import { getDatabaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),
    TypeOrmModule.forFeature(ENTITIES),
  ],
})
export class AppModule {}
```

### 4. Exécution des seeds
```bash
npm run seed
```

## 🔒 Sécurité et bonnes pratiques

### ✅ Implémenté :
- **Soft delete** pour User et Role
- **Password hashing** avec bcrypt (cost 12)
- **Input validation** avec class-validator
- **Relations lazy** pour éviter les requêtes N+1
- **UUID** pour toutes les clés primaires
- **Index optimisés** pour les recherches fréquentes
- **Foreign keys** avec CASCADE approprié

### 🛡️ Validations métier :
- Rôles plongée requis pour les utilisateurs avec licence
- Permissions par catégorie (admin/diving)
- Hiérarchie des rôles avec niveaux
- Validation des assignations de permissions
- Contraintes d'intégrité référentielle

## 🎯 Fonctionnalités avancées

### Méthodes helper métier :
```typescript
// User
await user.hasRole('DIVING_SUPERVISOR');
await user.getActiveRoles();

// Role  
const canDelete = await role.canBeDeleted();
const level = role.getHierarchyLevel();

// Permission
const isAssigned = await permission.isAssignedToAnyRole();

// UserRole
const errors = await userRole.validateAssignment();
const info = userRole.getDisplayInfo();
```

### Types de permissions :
- 🔴 **System** : roles, permissions, settings
- 🟠 **Admin** : users, administrative functions
- 🔵 **Diving** : dives, divers, diving operations
- ⚪ **User** : basic user operations

Cette structure est **production-ready** et **évolutive** pour votre application de gestion de plongée ! 🏊‍♂️