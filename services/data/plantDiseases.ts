/**
 * plantCareData.ts
 * 
 * Dummy data for plant disease descriptions and care steps.
 */

export interface PlantCareInfo {
    description: string;
    careSteps: string[];
    preventionTips: string[];
  }
  
  export const plantCareData: Record<string, PlantCareInfo> = {
    complex: {
      description:
        'This indicates the plant may be suffering from multiple overlapping issues or environmental stress factors.',
      careSteps: [
        'Inspect for multiple diseases or pests.',
        'Isolate the affected plant from others.',
        'Prune damaged leaves and stems.',
        'Adjust watering and light exposure to recommended levels.',
        'Apply a broad-spectrum fungicide if fungal symptoms are present.'
      ],
      preventionTips: [
        'Ensure proper drainage and avoid overwatering.',
        'Regularly clean garden tools.',
        'Rotate crops or plant positions yearly to reduce soil-borne issues.'
      ]
    },
  
    frog_eye_leaf_spot: {
      description:
        'A fungal disease that causes small circular brown or gray spots with darker borders on leaves.',
      careSteps: [
        'Remove and destroy infected leaves.',
        'Avoid overhead watering to keep foliage dry.',
        'Apply an appropriate fungicide following label directions.',
        'Increase airflow between plants by proper spacing.'
      ],
      preventionTips: [
        'Use resistant plant varieties if available.',
        'Rotate crops to prevent reinfection.',
        'Clean fallen leaves and debris regularly.'
      ]
    },
  
    healthy: {
      description:
        'Your plant is in good health! Continue your current care routine and monitor regularly.',
      careSteps: [
        'Maintain consistent watering and light exposure.',
        'Check leaves weekly for any early signs of disease.',
        'Use balanced fertilizer as needed.'
      ],
      preventionTips: [
        'Avoid overwatering or waterlogging.',
        'Keep the environment clean and pest-free.'
      ]
    },
  
    multiple_diseases: {
      description:
        'The plant shows signs of multiple diseases, which may be interacting or compounding symptoms.',
      careSteps: [
        'Isolate the plant immediately.',
        'Remove all visibly affected parts.',
        'Apply fungicide or pesticide treatments as appropriate for each disease type.',
        'Consider consulting an expert if symptoms persist.'
      ],
      preventionTips: [
        'Avoid overcrowding plants.',
        'Sanitize equipment before and after use.',
        'Maintain balanced soil nutrients and moisture levels.'
      ]
    },
  
    powdery_mildew: {
      description:
        'A common fungal infection that appears as white, powdery spots on leaves and stems.',
      careSteps: [
        'Remove heavily infected leaves.',
        'Improve air circulation and reduce humidity.',
        'Apply a sulfur-based or neem oil fungicide.',
        'Avoid watering foliage directly.'
      ],
      preventionTips: [
        'Ensure good sunlight exposure.',
        'Water at the soil level, not from above.',
        'Space plants adequately to improve airflow.'
      ]
    },
  
    rust: {
      description:
        'A fungal disease characterized by orange, yellow, or brown pustules on the undersides of leaves.',
      careSteps: [
        'Remove infected leaves and discard them (do not compost).',
        'Apply a fungicide labeled for rust control.',
        'Avoid wetting leaves during watering.',
        'Increase spacing and airflow.'
      ],
      preventionTips: [
        'Avoid overhead watering.',
        'Inspect plants regularly during humid seasons.',
        'Use resistant cultivars when possible.'
      ]
    },
  
    scab: {
      description:
        'A fungal disease causing dark, scabby lesions on leaves, fruits, or stems, reducing plant vigor.',
      careSteps: [
        'Prune and dispose of affected plant material.',
        'Apply a copper-based fungicide early in the season.',
        'Maintain good air circulation.',
        'Avoid working with plants when wet.'
      ],
      preventionTips: [
        'Clean up fallen leaves and fruit after each season.',
        'Ensure proper pruning for ventilation.',
        'Rotate crops and avoid planting in infected soil.'
      ]
    }
  };
  