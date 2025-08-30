import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { validateRequest, authenticateUser } from '../../../shared/middleware';
import { SDRService } from '../../../shared/services/SDRService';
import { ValidationService } from '../../../shared/services/ValidationService';
import { createSDRSchema } from '../../../shared/utils/validation';
import type { CreateSDRRequest, CreateSDRResponse } from '../../../shared/types';

export async function createSDR(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  try {
    // Authentication
    const user = await authenticateUser(request);
    if (!user) {
      return {
        status: 401,
        jsonBody: {
          success: false,
          message: 'Authentication required'
        }
      };
    }

    // Validate request body
    const validation = await validateRequest(request.json(), createSDRSchema);
    if (!validation.isValid) {
      return {
        status: 400,
        jsonBody: {
          success: false,
          errors: validation.errors,
          message: 'Validation failed'
        }
      };
    }

    const sdrData: CreateSDRRequest = validation.data;
    
    // Add user context
    sdrData.submitterId = user.id;
    sdrData.submitterName = user.name;
    sdrData.submitterEmail = user.email;

    // Create SDR
    const sdrService = new SDRService();
    const createdSDR = await sdrService.createSDR(sdrData);

    context.log(`SDR created successfully: ${createdSDR.id}`);

    const response: CreateSDRResponse = {
      success: true,
      data: createdSDR,
      message: 'SDR created successfully'
    };

    return {
      status: 201,
      jsonBody: response
    };

  } catch (error) {
    context.log.error('Error creating SDR:', error);

    return {
      status: 500,
      jsonBody: {
        success: false,
        message: 'Internal server error'
      }
    };
  }
}

app.http('createSDR', {
  methods: ['POST'],
  route: 'sdr',
  handler: createSDR
});