# Roles System & Database Seeder Setup

## Overview
Your application now has a complete roles-based authentication system with:
- **Role Model**: Manages user and admin roles
- **Database Seeder**: Automatically creates roles and default admin account
- **Updated APIs**: All registration endpoints now assign appropriate roles

## What Changed

### 1. Database Schema Updates
- Added `Role` model with `admin` and `user` roles
- Updated `User` model with `roleId` foreign key
- Updated `Admin` model with `roleId` foreign key

### 2. Seeder Created
- `prisma/seed.ts` - Creates roles and default admin account
- Automatically runs after migrations with `npx prisma db seed`

### 3. API Updates
- `/api/auth/register` - Assigns "user" role to new users
- `/api/auth/register-admin` - Assigns "admin" role to new admins

## Setup Instructions

### Step 1: Run Migration
This will create the roles table and update user/admin tables:

```bash
npx prisma migrate dev --name add_roles_system
```

This command will:
1. Create the migration files
2. Apply the migration to your database
3. Regenerate Prisma Client (fixes TypeScript errors)
4. Automatically run the seeder

### Step 2: Verify Seeder Results
After migration, you should see:

```
🌱 Starting database seeding...
📝 Creating roles...
✅ Admin role created: [uuid]
✅ User role created: [uuid]
👤 Creating default admin account...
✅ Admin account created: admin@zandile.com
   Email: admin@zandile.com
   Password: admin123
   ⚠️  Please change this password after first login!
✨ Seeding completed successfully!
```

### Step 3: Login with Default Admin
1. Navigate to `/admin`
2. Use these credentials:
   - **Email**: `admin@zandile.com`
   - **Password**: `admin123`
3. **IMPORTANT**: Change this password immediately!

## Database Schema

### Roles Table
```sql
CREATE TABLE roles (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME ON UPDATE CURRENT_TIMESTAMP
);
```

Default roles:
- `admin` - Full access to admin dashboard
- `user` - Regular user access

### Updated Users Table
```sql
ALTER TABLE users ADD COLUMN role_id VARCHAR(36) NOT NULL;
ALTER TABLE users ADD FOREIGN KEY (role_id) REFERENCES roles(id);
```

### Updated Admins Table
```sql
ALTER TABLE admins ADD COLUMN role_id VARCHAR(36) NOT NULL;
ALTER TABLE admins ADD FOREIGN KEY (role_id) REFERENCES roles(id);
```

## Manual Seeding

If you need to run the seeder manually:

```bash
npm run seed
```

Or with Prisma:

```bash
npx prisma db seed
```

## Creating Additional Admins

After seeding, you can create more admin accounts via API:

```bash
curl -X POST http://localhost:3000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Admin",
    "email": "newadmin@example.com",
    "password": "secure-password"
  }'
```

## Troubleshooting

### "Admin role not found" error
- The seeder hasn't run yet
- Run: `npx prisma db seed`

### "User role not found" error
- The seeder hasn't run yet
- Run: `npx prisma db seed`

### TypeScript errors about 'role' property
- Prisma Client needs to be regenerated
- Run: `npx prisma generate`

### Migration fails
- Check your DATABASE_URL in `.env`
- Ensure MySQL server is running
- Check if tables already exist

## Resetting Database (Development Only)

To start fresh:

```bash
# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset

# This will:
# 1. Drop the database
# 2. Create a new database
# 3. Run all migrations
# 4. Run the seeder automatically
```

## Security Notes

### Default Admin Credentials
The seeder creates a default admin with:
- Email: `admin@zandile.com`
- Password: `admin123`

**⚠️ CRITICAL**: Change this password immediately after first login!

### Production Deployment
Before deploying to production:
1. Change default admin password
2. Update JWT_SECRET in `.env`
3. Use strong passwords for all accounts
4. Consider removing the default admin creation from seeder
5. Use environment variables for sensitive data

## Role-Based Access Control

### Checking User Role
In your API routes, you can check roles:

```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  include: { role: true }
})

if (user.role.name === 'admin') {
  // Admin-only logic
}
```

### Admin Token Verification
The admin authentication already checks for admin role:

```typescript
// In lib/auth.ts
if (decoded.role !== 'admin') {
  throw new Error('Not authorized as admin')
}
```

## Next Steps

Consider implementing:
- Role-based permissions (read, write, delete)
- Custom roles beyond admin/user
- Role management UI in admin dashboard
- Audit logs for role changes
- Multi-factor authentication for admins
