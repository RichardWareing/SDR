# SDR Management System API Documentation

## Overview

The SDR Management System API is built using Azure Functions with TypeScript. It provides RESTful endpoints for managing Small Development Requests (SDRs) with integration to Azure DevOps as the primary backend.

## Base URL

- **Development**: `https://sdr-dev-func.azurewebsites.net/api`
- **Production**: `https://sdr-prod-func.azurewebsites.net/api`

## Authentication

All API endpoints require authentication using Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-token-here>
```

## Endpoints

### SDR Management

#### Create SDR
- **POST** `/sdr`
- **Description**: Creates a new SDR
- **Request Body**: [CreateSDRRequest](#createsdrrrequest)
- **Response**: [CreateSDRResponse](#createsdrresponse)

#### Get SDR
- **GET** `/sdr/{id}`
- **Description**: Retrieves an SDR by ID
- **Parameters**:
  - `id` (path): SDR ID
- **Response**: [GetSDRResponse](#getsdrresponse)

#### Update SDR
- **PUT** `/sdr/{id}`
- **Description**: Updates an existing SDR
- **Parameters**:
  - `id` (path): SDR ID
- **Request Body**: [UpdateSDRRequest](#updatesdrrrequest)
- **Response**: [UpdateSDRResponse](#updatesdrresponse)

#### List SDRs
- **GET** `/sdr`
- **Description**: Retrieves a paginated list of SDRs
- **Query Parameters**:
  - `page` (optional): Page number (default: 1)
  - `limit` (optional): Items per page (default: 10, max: 100)
  - `status` (optional): Filter by status
  - `priority` (optional): Filter by priority
  - `assignedTo` (optional): Filter by assigned user
  - `submitterId` (optional): Filter by submitter
- **Response**: [ListSDRsResponse](#listsdrsresponse)

#### Delete SDR
- **DELETE** `/sdr/{id}`
- **Description**: Deletes an SDR
- **Parameters**:
  - `id` (path): SDR ID
- **Response**: [DeleteSDRResponse](#deletesdrresponse)

### File Management

#### Upload Attachment
- **POST** `/sdr/{id}/attachments`
- **Description**: Uploads file attachments for an SDR
- **Parameters**:
  - `id` (path): SDR ID
- **Request**: Multipart form data with file(s)
- **Response**: [UploadAttachmentResponse](#uploadattachmentresponse)

#### Get Attachment
- **GET** `/sdr/{id}/attachments/{attachmentId}`
- **Description**: Downloads an attachment
- **Parameters**:
  - `id` (path): SDR ID
  - `attachmentId` (path): Attachment ID
- **Response**: File download

### Comments and History

#### Add Comment
- **POST** `/sdr/{id}/comments`
- **Description**: Adds a comment to an SDR
- **Parameters**:
  - `id` (path): SDR ID
- **Request Body**: [AddCommentRequest](#addcommentrequest)
- **Response**: [AddCommentResponse](#addcommentresponse)

#### Get Comments
- **GET** `/sdr/{id}/comments`
- **Description**: Retrieves comments for an SDR
- **Parameters**:
  - `id` (path): SDR ID
- **Response**: [GetCommentsResponse](#getcommentsresponse)

#### Get History
- **GET** `/sdr/{id}/history`
- **Description**: Retrieves change history for an SDR
- **Parameters**:
  - `id` (path): SDR ID
- **Response**: [GetHistoryResponse](#gethistoryresponse)

### Utility Endpoints

#### Health Check
- **GET** `/health`
- **Description**: Health check endpoint
- **Response**: Health status

#### Validate DevOps Connection
- **GET** `/devops/test-connection`
- **Description**: Tests the DevOps API connection
- **Response**: Connection status

## Data Models

### CreateSDRRequest

```typescript
interface CreateSDRRequest {
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  customerType: 'Internal' | 'External';
  requiredByDate?: string;
  businessJustification?: string;
  estimatedHours?: number;
  technicalComplexity?: 'Low' | 'Medium' | 'High';
  riskLevel?: 'Low' | 'Medium' | 'High';
  testingRequired?: boolean;
  documentationRequired?: boolean;
}
```

### SDR

```typescript
interface SDR {
  id: number;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  customerType: 'Internal' | 'External';
  status: 'New' | 'Active' | 'Resolved' | 'Closed' | 'Removed';
  sourceType: 'Manual' | 'Email' | 'File' | 'Teams';
  submitterId: string;
  submitterName: string;
  submitterEmail: string;
  assignedTo?: string;
  assignedToName?: string;
  estimatedHours?: number;
  actualHours?: number;
  requiredByDate?: string;
  createdDate: string;
  lastModifiedDate: string;
  approvalStatus?: 'Not Required' | 'Pending' | 'Approved' | 'Rejected';
  approvalComments?: string;
  approverId?: string;
  businessJustification?: string;
  technicalComplexity?: 'Low' | 'Medium' | 'High';
  riskLevel?: 'Low' | 'Medium' | 'High';
  testingRequired?: boolean;
  documentationRequired?: boolean;
  attachments?: FileAttachment[];
}
```

## Error Responses

All error responses follow this format:

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  errors?: ValidationError[];
  statusCode: number;
}
```

### Common HTTP Status Codes

- **200 OK**: Successful request
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation failed
- **500 Internal Server Error**: Server error

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 1000 requests per hour per authenticated user
- **Headers**: Rate limit information is included in response headers:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## SDK and Client Libraries

### JavaScript/TypeScript SDK

```bash
npm install @sdr/api-client
```

```typescript
import { SDRApiClient } from '@sdr/api-client';

const client = new SDRApiClient({
  baseUrl: 'https://sdr-dev-func.azurewebsites.net/api',
  authToken: 'your-auth-token'
});

// Create SDR
const sdr = await client.createSDR({
  title: 'New Feature Request',
  description: 'Add user dashboard',
  priority: 'High',
  customerType: 'Internal'
});
```

## Webhooks

The API supports webhooks for real-time notifications:

### Supported Events

- `sdr.created`: New SDR created
- `sdr.updated`: SDR updated
- `sdr.status_changed`: SDR status changed
- `sdr.assigned`: SDR assigned to user
- `sdr.commented`: New comment added

### Webhook Configuration

Configure webhooks in your application settings or contact system administrators.

## Support

For API support and questions:

- **Documentation**: [Full API Documentation](./openapi.yaml)
- **Support Email**: sdr-support@company.com
- **GitHub Issues**: [Report Issues](https://github.com/company/sdr-system/issues)