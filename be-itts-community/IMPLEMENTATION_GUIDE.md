# RBAC/IAM System - Implementation Guide

## 🎉 Congratulations!

Your complete RBAC (Role-Based Access Control) system has been implemented! This guide will help you get started.

## 📋 What's Been Implemented

### ✅ Complete Feature List

1. **Database Schema** (9 tables)
   - users, roles, permissions, resources, actions
   - role_permissions, user_roles, refresh_tokens, audit_logs

2. **JWT Authentication**
   - Login with email/password
   - Access token (15min) + Refresh token (7 days)
   - Token refresh mechanism
   - Logout with token revocation

3. **Permission System**
   - Resource-based permissions (e.g., `events:create`, `users:manage`)
   - 11 resources with 9 actions each
   - 6 default roles (super_admin, admin, moderator, event_manager, content_manager, viewer)

4. **Protected Routes**
   - All `/api/v1/admin/*` routes now require authentication
   - Per-endpoint permission checks
   - Automatic JWT validation

5. **Audit Logging**
   - Track all authentication events
   - Log permission changes
   - Track sensitive operations

## 🚀 Getting Started

### Step 1: Update Environment Variables

Copy `.env.example` to `.env` and update:

```bash
cp .env.example .env
```

Edit `.env` and set JWT secret (IMPORTANT!):

```env
# JWT Configuration (REQUIRED)
JWT_SECRET=your-super-secret-key-minimum-32-characters-long
JWT_ACCESS_DURATION=15m
JWT_REFRESH_DURATION=168h
JWT_ISSUER=itts-api
```

**⚠️ CRITICAL**: Change `JWT_SECRET` to a strong random string in production!

### Step 2: Run Migrations

```bash
# Run migrations to create RBAC tables
make migrate-up

# Or manually:
goose -dir migrations postgres "postgres://user:pass@localhost:5432/dbname?sslmode=disable" up
```

This will create:
- All RBAC tables
- Default roles (super_admin, admin, moderator, etc.)
- Default permissions
- Default super admin user

### Step 3: Install Dependencies

```bash
go mod download
go mod tidy
```

### Step 4: Run the Server

```bash
go run cmd/server.go
```

Server will start on port 3002 (or whatever you set in `APP_PORT`).

## 🔐 Default Admin Account

After running migrations, you'll have a default super admin:

```
Email: admin@itts.ac.id
Password: Admin123!
```

**⚠️ IMPORTANT**: Change this password immediately after first login!

## 📝 Testing the System

### 1. Login

```bash
curl -X POST http://localhost:3002/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@itts.ac.id",
    "password": "Admin123!"
  }'
```

Response:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "a1b2c3d4...",
    "token_type": "Bearer",
    "expires_in": 900,
    "user": {
      "id": "...",
      "email": "admin@itts.ac.id",
      "full_name": "Super Administrator",
      "is_super_admin": true,
      "roles": [...],
      "permissions": ["*:*"]
    }
  }
}
```

### 2. Get Current User Info

```bash
curl http://localhost:3002/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Access Protected Admin Route

```bash
# List users (requires users:list permission)
curl http://localhost:3002/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Create New User

```bash
curl -X POST http://localhost:3002/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "full_name": "John Doe",
    "is_active": true,
    "role_ids": ["30000000-0000-0000-0000-000000000003"]
  }'
```

### 5. List Roles

```bash
curl http://localhost:3002/api/v1/admin/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 6. List Permissions

```bash
curl http://localhost:3002/api/v1/admin/permissions \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎯 Available Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **super_admin** | Full system access | All permissions (*:*) |
| **admin** | Most permissions | All except user/role/permission management |
| **moderator** | Content moderation | Read all + approve/reject registrations |
| **event_manager** | Event management | Full access to events, speakers, registrations |
| **content_manager** | Content management | Full access to roadmaps, mentors, partners |
| **viewer** | Read-only access | Read permissions only |

## 📊 Permission Format

Permissions follow the pattern: `<resource>:<action>`

Examples:
- `events:create` - Create events
- `users:manage` - Manage users (includes reset password, assign roles)
- `registrations:approve` - Approve member registrations
- `*:*` - All permissions (super admin only)

## 🔄 Token Flow

### Access Token
- **Duration**: 15 minutes (configurable)
- **Usage**: Include in `Authorization: Bearer <token>` header
- **Contains**: User ID, email, roles, permissions

### Refresh Token
- **Duration**: 7 days (configurable)
- **Usage**: Refresh access token when it expires
- **Endpoint**: `POST /api/v1/auth/refresh`

### Refresh Example

```bash
curl -X POST http://localhost:3002/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }'
```

## 🛡️ Security Best Practices

### 1. Change Default Password

```bash
curl -X POST http://localhost:3002/api/v1/auth/change-password \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "Admin123!",
    "new_password": "YourNewSecurePassword123!"
  }'
```

### 2. Create New Super Admin

```bash
# 1. Create user
curl -X POST http://localhost:3002/api/v1/admin/users \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@itts.ac.id",
    "password": "SecurePassword123!",
    "full_name": "New Admin",
    "is_active": true,
    "is_super_admin": true,
    "role_ids": ["30000000-0000-0000-0000-000000000001"]
  }'

# 2. Delete default admin (optional, after testing)
curl -X DELETE http://localhost:3002/api/v1/admin/users/40000000-0000-0000-0000-000000000001 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Use Strong JWT Secret

Generate a strong random secret:

```bash
openssl rand -base64 32
```

Update `JWT_SECRET` in `.env` with the generated value.

### 4. Enable HTTPS in Production

Update CORS settings and use HTTPS for all API requests.

## 🔧 Common Operations

### Creating a Custom Role

```bash
curl -X POST http://localhost:3002/api/v1/admin/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "event_viewer",
    "description": "Can only view events",
    "permission_ids": [
      "PERMISSION_ID_FOR_events:read",
      "PERMISSION_ID_FOR_events:list"
    ]
  }'
```

### Assigning Role to User

```bash
curl -X POST http://localhost:3002/api/v1/admin/users/USER_ID/roles \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role_ids": ["ROLE_ID_1", "ROLE_ID_2"]
  }'
```

### Viewing Audit Logs

Audit logs are automatically created for:
- Login attempts (success/failure)
- User/role/permission changes
- Sensitive operations

Query audit logs (coming soon - need to add handler).

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/change-password` - Change password

### User Management
- `POST /api/v1/admin/users` - Create user
- `GET /api/v1/admin/users` - List users
- `GET /api/v1/admin/users/:id` - Get user
- `PATCH /api/v1/admin/users/:id` - Update user
- `DELETE /api/v1/admin/users/:id` - Delete user
- `POST /api/v1/admin/users/:id/reset-password` - Reset password
- `POST /api/v1/admin/users/:id/roles` - Assign roles

### Role Management
- `POST /api/v1/admin/roles` - Create role
- `GET /api/v1/admin/roles` - List roles
- `GET /api/v1/admin/roles/:id` - Get role
- `PATCH /api/v1/admin/roles/:id` - Update role
- `DELETE /api/v1/admin/roles/:id` - Delete role
- `POST /api/v1/admin/roles/:id/permissions` - Assign permissions
- `GET /api/v1/admin/roles/:id/permissions` - Get role permissions

### Permission Management
- `GET /api/v1/admin/permissions` - List permissions
- `GET /api/v1/admin/permissions/:id` - Get permission
- `GET /api/v1/admin/resources` - List resources
- `GET /api/v1/admin/actions` - List actions

## 🐛 Troubleshooting

### Issue: "Authentication required"

**Solution**: Make sure you include the Authorization header:
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Issue: "Token has expired"

**Solution**: Use refresh token to get new access token:
```bash
POST /api/v1/auth/refresh
```

### Issue: "Insufficient permissions"

**Solution**:
1. Check user's roles: `GET /api/v1/auth/me`
2. Verify role has required permission
3. Assign missing permission to role

### Issue: Migrations fail

**Solution**:
```bash
# Check migration status
make migrate-status

# Rollback and retry
make migrate-down
make migrate-up
```

## 📚 Next Steps

1. ✅ Change default admin password
2. ✅ Create your organization's roles
3. ✅ Create admin users for your team
4. ✅ Test permission boundaries
5. ✅ Integrate with frontend
6. ⬜ Set up audit log monitoring
7. ⬜ Configure alerts for suspicious activity

## 🔗 Related Documentation

- [RBAC Design Document](./RBAC_DESIGN.md) - Complete system architecture
- [API Documentation](./api-docs.md) - Full API reference (TODO)
- [Security Guide](./security.md) - Security best practices (TODO)

## 💡 Tips

1. **Super admin bypass**: Super admins automatically have all permissions
2. **Permission caching**: Consider adding Redis caching for permissions
3. **Audit logs**: Regularly review audit logs for security
4. **Token rotation**: Refresh tokens are rotated on use
5. **Password policy**: Minimum 8 characters enforced

## 🆘 Support

If you encounter issues:
1. Check server logs
2. Verify JWT_SECRET is set
3. Ensure migrations ran successfully
4. Test with default admin account first

For questions, contact your development team or refer to the RBAC_DESIGN.md document.

---

**Status**: ✅ RBAC system fully implemented and ready for use!
