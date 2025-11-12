import { createApiClient, uploadFile } from './apiClient';
import { plantCareData } from './data/plantDiseases';

// Create API client instance for plant doctor service
const apiClient = createApiClient('PLANT_DOCTOR_URL', 'http://54.255.221.210:8080');

// Plant Doctor API Types
export interface DiagnosisRequest {
  image: string; // Base64 encoded image or URI
}

// Actual API Response format
export interface DiagnosisApiResponse {
  confidence: number;
  predicted_class: string;
}

// Transformed response for UI
export interface DiagnosisResponse {
  isHealthy: boolean;
  plantName: string;
  diseaseName?: string;
  confidence: number;
  description: string;
  metrics?: {
    height: string;
    water: string;
    light: string;
    humidity: string;
  };
  diseaseImages?: string[];
  symptoms?: string;
  careSteps?: string[];
  preventionTips?: string[];
}

export interface ApiError {
  message: string;
  error?: string;
}

/**
 * Transform API response to UI-friendly format
 */
function normalizeKey(predictedClass: string): string {
  return predictedClass
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toTitleCase(text: string): string {
  return text
    .replace(/[_\s]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function transformDiagnosisResponse(apiResponse: DiagnosisApiResponse): DiagnosisResponse {
  const normalizedKey = normalizeKey(apiResponse.predicted_class);
  const careInfo = plantCareData[normalizedKey];

  const isHealthy = normalizedKey === 'healthy' || apiResponse.predicted_class.toLowerCase() === 'healthy';
  // API returns confidence as percentage (e.g., 94.29)
  // Round to 2 decimal places for display
  const confidence = Math.round(apiResponse.confidence * 100) / 100;

  const description =
    careInfo?.description ||
    (isHealthy
      ? 'Your plant appears to be in good health! Continue with your current care routine.'
      : `Your plant has been diagnosed with ${toTitleCase(apiResponse.predicted_class)}. Please take appropriate measures to treat it.`);

  // Base response structure
  const response: DiagnosisResponse = {
    isHealthy,
    plantName: isHealthy ? 'Healthy Plant' : toTitleCase(apiResponse.predicted_class),
    confidence,
    description,
  };

  // Add disease name if not healthy
  if (!isHealthy) {
    response.diseaseName = toTitleCase(apiResponse.predicted_class);
  }

  // Add metrics for healthy plants (you can customize these)
  if (isHealthy) {
    response.metrics = {
      height: 'Normal',
      water: 'Adequate',
      light: 'Sufficient',
      humidity: 'Optimal',
    };
  }

  if (careInfo?.careSteps?.length) {
    response.careSteps = careInfo.careSteps;
  }

  if (careInfo?.preventionTips?.length) {
    response.preventionTips = careInfo.preventionTips;
  }

  return response;
}

/**
 * Diagnose plant from image URI
 * POST {PLANT_DOCTOR_URL}/doctor/predict
 * Body: FormData with file key containing image file
 */
export async function diagnosePlant(imageUri: string): Promise<DiagnosisResponse> {
  try {
    // Create FormData for file upload
    const formData = new FormData();
    
    // Extract file name and type from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const extension = match ? match[1].toLowerCase() : 'jpg';
    const type = extension === 'heic' ? 'image/heic' : `image/${extension}`;
    
    // For React Native, we need to append the file as an object
    // API expects key to be 'file' not 'image'
    formData.append('file', {
      uri: imageUri,
      name: filename,
      type: type,
    } as any);

    // Get base URL for upload
    const baseUrl = process.env.EXPO_PUBLIC_API_GATEWAY_URL;
    // Use uploadFile helper for FormData uploads
    const apiResponse = await uploadFile<DiagnosisApiResponse>(
      baseUrl,
      '/doctor/predict',
      formData
    );

    // Transform API response to UI format
    return transformDiagnosisResponse(apiResponse);
  } catch (error: any) {
    throw error;
  }
}
// Export the API client instance for direct use if needed
export { apiClient };

