export const openapiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'CoWork Backend API',
    version: '1.0.0',
    description:
      'REST API for the CoWork space-management platform. JWT Bearer auth on most endpoints; use POST /api/auth/login to obtain a token, then click "Authorize" above and paste it.',
  },
  servers: [
    { url: 'http://localhost:8080', description: 'Local dev' },
    { url: 'https://YOUR-RENDER-URL.onrender.com', description: 'Production' },
  ],
  tags: [
    { name: 'Auth', description: 'Signup, login, password reset, current user' },
    { name: 'Users', description: 'User management (admin / superadmin)' },
    { name: 'Branches', description: 'Coworking locations' },
    { name: 'Workspaces', description: 'Bookable spaces within a branch' },
    { name: 'Plans', description: 'Subscription plans / pricing tiers' },
    { name: 'Bookings', description: 'Workspace reservations' },
    { name: 'Public', description: 'Unauthenticated endpoints for marketing pages' },
    { name: 'Dashboard', description: 'Aggregated stats for admin / superadmin' },
    { name: 'Upload', description: 'Image upload to Cloudinary' },
    { name: 'System', description: 'Health checks' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
        required: ['error'],
      },
      Role: { type: 'string', enum: ['superadmin', 'admin', 'user'] },
      WorkspaceType: {
        type: 'string',
        enum: [
          'hot_desk',
          'dedicated_desk',
          'focus_pod',
          'meeting_room',
          'conference_hall',
          'private_cabin',
        ],
      },
      WorkspaceStatus: {
        type: 'string',
        enum: ['available', 'occupied', 'maintenance'],
      },
      BookingStatus: {
        type: 'string',
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      },
      PlanType: {
        type: 'string',
        enum: ['daily', 'weekly', 'monthly', 'corporate'],
      },
      BranchStatus: { type: 'string', enum: ['active', 'inactive'] },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { $ref: '#/components/schemas/Role' },
          branch: { type: 'string', nullable: true },
          phone: { type: 'string' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Branch: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          address: { type: 'string' },
          city: { type: 'string' },
          phone: { type: 'string' },
          email: { type: 'string' },
          operatingHours: { type: 'string' },
          imageUrl: { type: 'string' },
          status: { $ref: '#/components/schemas/BranchStatus' },
        },
      },
      Workspace: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          branch: {
            oneOf: [
              { type: 'string' },
              { $ref: '#/components/schemas/Branch' },
            ],
          },
          type: { $ref: '#/components/schemas/WorkspaceType' },
          capacity: { type: 'integer' },
          floor: { type: 'string' },
          status: { $ref: '#/components/schemas/WorkspaceStatus' },
          pricePerHour: { type: 'number' },
          pricePerDay: { type: 'number' },
          pricePerMonth: { type: 'number' },
          description: { type: 'string' },
          imageUrl: { type: 'string' },
        },
      },
      Plan: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          type: { $ref: '#/components/schemas/PlanType' },
          price: { type: 'number' },
          durationDays: { type: 'integer' },
          maxBookingsPerMonth: { type: 'integer' },
          meetingRoomHours: { type: 'integer' },
          features: { type: 'array', items: { type: 'string' } },
          isActive: { type: 'boolean' },
        },
      },
      Booking: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          user: { type: 'string' },
          workspace: { type: 'string' },
          branch: { type: 'string' },
          date: { type: 'string', format: 'date-time' },
          startTime: { type: 'string', example: '09:00' },
          endTime: { type: 'string', example: '17:00' },
          amount: { type: 'number' },
          status: { $ref: '#/components/schemas/BookingStatus' },
          notes: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Self-registration (always creates role=user)',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/BadRequest' },
          '409': { description: 'Email already in use' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email + password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Authenticated',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        tags: ['Auth'],
        summary: 'Request a password reset token',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: { email: { type: 'string', format: 'email' } },
              },
            },
          },
        },
        responses: { '200': { description: 'Always 200 to avoid leaking existence' } },
      },
    },
    '/api/auth/reset-password': {
      post: {
        tags: ['Auth'],
        summary: 'Reset password using token from forgot-password',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'OK' }, '400': { description: 'Invalid/expired' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user (from JWT)',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/User' } },
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/api/auth/change-password': {
      post: {
        tags: ['Auth'],
        summary: 'Change password (authed user)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'OK' }, '401': { description: 'Current password wrong' } },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (superadmin: all, admin: own branch)',
        parameters: [
          {
            in: 'query',
            name: 'role',
            schema: { $ref: '#/components/schemas/Role' },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    users: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/User' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Users'],
        summary: 'Create user (admin: only role=user in own branch)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { $ref: '#/components/schemas/Role' },
                  branch: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/users/members': {
      get: {
        tags: ['Users'],
        summary: "List users with role='user'",
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/users/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Users'], summary: 'Get user by id', responses: { '200': { description: 'OK' } } },
      patch: {
        tags: ['Users'],
        summary: 'Update user',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  phone: { type: 'string' },
                  isActive: { type: 'boolean' },
                  role: { $ref: '#/components/schemas/Role' },
                  branch: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
      delete: { tags: ['Users'], summary: 'Delete user', responses: { '204': { description: 'Deleted' } } },
    },
    '/api/branches': {
      get: {
        tags: ['Branches'],
        summary: 'List branches',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    branches: { type: 'array', items: { $ref: '#/components/schemas/Branch' } },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Branches'],
        summary: 'Create branch (superadmin)',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/Branch' } },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/branches/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Branches'], summary: 'Get branch', responses: { '200': { description: 'OK' } } },
      patch: {
        tags: ['Branches'],
        summary: 'Update branch (superadmin or admin of that branch)',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Branch' } } },
        },
        responses: { '200': { description: 'OK' } },
      },
      delete: { tags: ['Branches'], summary: 'Delete (superadmin)', responses: { '204': { description: 'Deleted' } } },
    },
    '/api/workspaces': {
      get: {
        tags: ['Workspaces'],
        summary: 'List workspaces (admin scoped to own branch)',
        parameters: [
          { in: 'query', name: 'branch', schema: { type: 'string' } },
          { in: 'query', name: 'type', schema: { $ref: '#/components/schemas/WorkspaceType' } },
          { in: 'query', name: 'status', schema: { $ref: '#/components/schemas/WorkspaceStatus' } },
        ],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Workspaces'],
        summary: 'Create workspace',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Workspace' } } },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/workspaces/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Workspaces'], summary: 'Get workspace', responses: { '200': { description: 'OK' } } },
      patch: {
        tags: ['Workspaces'],
        summary: 'Update workspace',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Workspace' } } },
        },
        responses: { '200': { description: 'OK' } },
      },
      delete: { tags: ['Workspaces'], summary: 'Delete workspace', responses: { '204': { description: 'Deleted' } } },
    },
    '/api/workspaces/{id}/availability': {
      get: {
        tags: ['Workspaces'],
        summary: 'Get bookings on a specific date',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
          {
            name: 'date',
            in: 'query',
            required: true,
            schema: { type: 'string', format: 'date', example: '2026-05-09' },
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    workspace: {
                      type: 'object',
                      properties: { _id: { type: 'string' }, name: { type: 'string' } },
                    },
                    date: { type: 'string', format: 'date' },
                    bookings: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          _id: { type: 'string' },
                          startTime: { type: 'string' },
                          endTime: { type: 'string' },
                          status: { $ref: '#/components/schemas/BookingStatus' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/plans': {
      get: {
        tags: ['Plans'],
        summary: 'List plans (all authed)',
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Plans'],
        summary: 'Create plan (superadmin)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Plan' } } },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/plans/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
      get: { tags: ['Plans'], summary: 'Get plan', responses: { '200': { description: 'OK' } } },
      patch: {
        tags: ['Plans'],
        summary: 'Update plan (superadmin)',
        requestBody: {
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Plan' } } },
        },
        responses: { '200': { description: 'OK' } },
      },
      delete: { tags: ['Plans'], summary: 'Delete plan (superadmin)', responses: { '204': { description: 'Deleted' } } },
    },
    '/api/bookings': {
      get: {
        tags: ['Bookings'],
        summary: 'List bookings (scoped by role)',
        parameters: [
          { in: 'query', name: 'status', schema: { $ref: '#/components/schemas/BookingStatus' } },
        ],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Bookings'],
        summary: 'Create booking',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['workspace', 'date', 'startTime', 'endTime', 'amount'],
                properties: {
                  workspace: { type: 'string' },
                  date: { type: 'string', format: 'date' },
                  startTime: { type: 'string', example: '09:00' },
                  endTime: { type: 'string', example: '17:00' },
                  amount: { type: 'number' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/bookings/{id}/status': {
      patch: {
        tags: ['Bookings'],
        summary: 'Update booking status (admin/superadmin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: { status: { $ref: '#/components/schemas/BookingStatus' } },
              },
            },
          },
        },
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/bookings/{id}': {
      delete: {
        tags: ['Bookings'],
        summary: 'Delete booking',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '204': { description: 'Deleted' } },
      },
    },
    '/api/public/branches': {
      get: {
        tags: ['Public'],
        summary: 'List branches (no auth)',
        security: [],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/public/branches/{id}': {
      get: {
        tags: ['Public'],
        summary: 'Get branch (no auth)',
        security: [],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
    },
    '/api/public/workspaces': {
      get: {
        tags: ['Public'],
        summary: 'List workspaces (no auth)',
        security: [],
        parameters: [
          { in: 'query', name: 'branch', schema: { type: 'string' } },
          { in: 'query', name: 'type', schema: { $ref: '#/components/schemas/WorkspaceType' } },
        ],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/public/plans': {
      get: {
        tags: ['Public'],
        summary: 'List active plans (no auth)',
        security: [],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/dashboard/summary': {
      get: {
        tags: ['Dashboard'],
        summary: 'Aggregated stats (superadmin: global, admin: branch)',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    scope: { type: 'string', enum: ['global', 'branch'] },
                    bookings: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        thisMonth: { type: 'integer' },
                        byStatus: {
                          type: 'object',
                          properties: {
                            pending: { type: 'integer' },
                            confirmed: { type: 'integer' },
                            cancelled: { type: 'integer' },
                            completed: { type: 'integer' },
                          },
                        },
                      },
                    },
                    revenue: {
                      type: 'object',
                      properties: {
                        thisMonth: { type: 'number' },
                        lastMonth: { type: 'number' },
                      },
                    },
                    members: {
                      type: 'object',
                      properties: {
                        total: { type: 'integer' },
                        newThisMonth: { type: 'integer' },
                      },
                    },
                    occupancy: {
                      type: 'object',
                      properties: {
                        totalWorkspaces: { type: 'integer' },
                        occupiedToday: { type: 'integer' },
                        percent: { type: 'integer' },
                      },
                    },
                  },
                },
              },
            },
          },
          '403': { $ref: '#/components/responses/Forbidden' },
        },
      },
    },
    '/api/upload/image': {
      post: {
        tags: ['Upload'],
        summary: 'Upload image to Cloudinary',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                  folder: { type: 'string', enum: ['branches', 'workspaces', 'avatars'] },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Uploaded',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    publicId: { type: 'string' },
                    width: { type: 'integer' },
                    height: { type: 'integer' },
                    format: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Liveness probe',
        security: [],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' },
                    uptime: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

// Reusable response objects (placed here because TypeScript const assertions are easier this way)
(openapiSpec.components as Record<string, unknown>).responses = {
  Unauthorized: {
    description: 'Unauthorized',
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/Error' } },
    },
  },
  Forbidden: {
    description: 'Forbidden',
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/Error' } },
    },
  },
  BadRequest: {
    description: 'Bad request',
    content: {
      'application/json': { schema: { $ref: '#/components/schemas/Error' } },
    },
  },
};
