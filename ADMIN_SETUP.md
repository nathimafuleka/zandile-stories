# Admin Dashboard Setup Guide

## Overview
Your admin dashboard is now fully configured with authentication and book management capabilities.

## Features Implemented

### 1. Authentication System
- **Admin Login**: `/admin` - Secure login page with JWT authentication
- **Admin Registration API**: `/api/auth/register-admin` - Create admin accounts
- **Auth Verification**: `/api/auth/check-admin` - Verify admin tokens

### 2. Dashboard Pages
- **Main Dashboard**: `/admin/dashboard` - View and manage all books
- **Add New Book**: `/admin/books/new` - Create new books
- **Edit Book**: `/admin/books/[id]` - Edit existing books and manage chapters

### 3. API Endpoints (Protected)
All admin API endpoints require Bearer token authentication:

#### Books
- `GET /api/admin/books` - List all books
- `POST /api/admin/books` - Create new book
- `GET /api/admin/books/[id]` - Get single book
- `PUT /api/admin/books/[id]` - Update book
- `DELETE /api/admin/books/[id]` - Delete book

#### Chapters
- `POST /api/admin/chapters` - Create chapter
- `PUT /api/admin/chapters/[id]` - Update chapter
- `DELETE /api/admin/chapters/[id]` - Delete chapter

## First Time Setup

### Step 1: Create Database Tables
Run Prisma migrations to create the admin table:

```bash
npx prisma migrate dev --name add_admin_model
```

### Step 2: Create Your First Admin Account
Use the registration API to create an admin account:

```bash
curl -X POST http://localhost:3000/api/auth/register-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "email": "admin@example.com",
    "password": "your-secure-password"
  }'
```

Or use a tool like Postman/Insomnia to make the request.

### Step 3: Login
1. Navigate to `/admin`
2. Enter your email and password
3. You'll be redirected to `/admin/dashboard`

## Security Notes

### JWT Secret
Update your `.env` file with a secure JWT secret:

```env
JWT_SECRET=your-very-secure-random-string-here
```

Generate a secure secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Token Storage
- Admin tokens are stored in `localStorage` with key `adminToken`
- Tokens expire after 7 days
- Tokens are verified on every protected API call

## Usage

### Managing Books
1. **Add a Book**: Click "Add New Book" on the dashboard
2. **Edit a Book**: Click "Edit" on any book card
3. **Delete a Book**: Click the trash icon or "Delete Book" button
4. **View Chapters**: Chapters are listed in the edit book page sidebar

### Book Fields
- **Title** (required): Book title
- **Description** (required): Book description
- **Cover Image**: URL to cover image
- **Genre**: Book genre (e.g., Romance, Fantasy)
- **Year**: Publication year
- **Status**: Published or Coming Soon

### Managing Chapters
Chapters can be deleted from the edit book page. To add chapters, you'll need to implement a chapter creation UI or use the API directly.

## Troubleshooting

### "Invalid token" errors
- Token may have expired (7 days)
- JWT_SECRET may have changed
- Solution: Logout and login again

### Cannot access dashboard
- Ensure you're logged in at `/admin`
- Check browser console for errors
- Verify token exists in localStorage

### Database errors
- Run `npx prisma generate` to update Prisma client
- Run `npx prisma migrate dev` to apply migrations
- Check DATABASE_URL in `.env` file

## Next Steps

Consider implementing:
- Chapter creation UI in the admin dashboard
- Image upload functionality for book covers
- Rich text editor for book descriptions and chapters
- Admin user management (create/edit/delete admins)
- Activity logs and analytics
- Bulk operations for books
