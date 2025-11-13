import { createApiClient } from './apiClient';

const apiClient = createApiClient();

export interface PlantImage {
  license: number;
  license_name: string;
  license_url: string;
  original_url: string;
  regular_url: string;
  medium_url: string;
  small_url: string;
  thumbnail: string;
}

export interface PlantSpecies {
  id: number;
  common_name: string | null;
  scientific_name: string[];
  other_name: string[];
  family: string | null;
  hybrid: string | null;
  authority: string | null;
  subspecies: string | null;
  cultivar: string | null;
  variety: string | null;
  species_epithet: string | null;
  genus: string | null;
  default_image: PlantImage | null;
  cycle?: string | null;
  watering?: string | null;
  sunlight?: string[] | null;
  edible?: boolean | null;
  indoor?: boolean | null;
  poisonous?: boolean | null;
  hardiness?: string | string[] | PlantHardinessRange | null;
}

export interface PlantDimension {
  type?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  unit?: string | null;
}

export interface PlantHardinessRange {
  min?: string | null;
  max?: string | null;
}

export interface PlantHardinessLocation {
  full_url?: string | null;
  full_iframe?: string | null;
}

export interface PlantWateringBenchmark {
  value?: string | null;
  unit?: string | null;
}

export interface PlantAnatomyPart {
  part?: string | null;
  color?: string[] | null;
}

export interface PlantPruningCount {
  amount?: number | null;
  interval?: string | null;
}

export interface PlantWateringDepthRequirement {
  unit?: string | null;
  value?: string | null;
}

export interface PlantWateringTemperature {
  unit?: string | null;
  min?: number | null;
  max?: number | null;
}

export interface PlantWateringPhLevel {
  min?: number | null;
  max?: number | null;
}

export interface PlantSunlightDuration {
  min?: string | null;
  max?: string | null;
  unit?: string | null;
}

export interface PlantSpacingRequirement {
  unit?: string | null;
  value?: number | null;
}

export interface PlantSpeciesDetails extends PlantSpecies {
  origin?: string[] | null;
  type?: string | null;
  dimensions?: PlantDimension[] | null;
  attracts?: string[] | null;
  propagation?: string[] | null;
  hardiness?: PlantHardinessRange | string | string[] | null;
  hardiness_location?: PlantHardinessLocation | null;
  watering_general_benchmark?: PlantWateringBenchmark | null;
  plant_anatomy?: PlantAnatomyPart[] | null;
  pruning_month?: string[] | null;
  pruning_count?: PlantPruningCount | null;
  seeds?: boolean | null;
  maintenance?: string | null;
  care_guides?: string | null;
  soil?: string[] | null;
  growth_rate?: string | null;
  drought_tolerant?: boolean | null;
  salt_tolerant?: boolean | null;
  thorny?: boolean | null;
  invasive?: boolean | null;
  tropical?: boolean | null;
  care_level?: string | null;
  pest_susceptibility?: string[] | null;
  flowers?: boolean | null;
  flowering_season?: string | null;
  cones?: boolean | null;
  fruits?: boolean | null;
  edible_fruit?: boolean | null;
  harvest_season?: string | null;
  leaf?: boolean | null;
  edible_leaf?: boolean | null;
  cuisine?: boolean | null;
  medicinal?: boolean | null;
  poisonous_to_humans?: boolean | null;
  poisonous_to_pets?: boolean | null;
  description?: string | null;
  other_images?: PlantImage[] | null;
  xWateringQuality?: string[] | null;
  xWateringPeriod?: string[] | null;
  xWateringAvgVolumeRequirement?: string[] | null;
  xWateringDepthRequirement?: PlantWateringDepthRequirement | null;
  xWateringBasedTemperature?: PlantWateringTemperature | null;
  xWateringPhLevel?: PlantWateringPhLevel | null;
  xSunlightDuration?: PlantSunlightDuration | null;
  xTemperatureTolence?: string[] | null;
  xPlantSpacingRequirement?: PlantSpacingRequirement | null;
}

export interface SpeciesListResponseMeta {
  to: number;
  per_page: number;
  current_page: number;
  from: number;
  last_page: number;
  total: number;
}

export type SpeciesListResponse = SpeciesListResponseMeta & {
  data: PlantSpecies[];
};

export type SpeciesOrder = 'asc' | 'desc';

export type PlantCycle = 'annual' | 'biennial' | 'biannual' | 'perennial';

export type WateringFrequency = 'none' | 'minimum' | 'average' | 'frequent';

export type SunlightLevel =
  | 'full_shade'
  | 'part_shade'
  | 'sun-part_shade'
  | 'full_sun';

export interface SpeciesDetailsParams {
  key?: string;
}

export interface SpeciesListParams {
  q?: string;
  page?: number;
  order?: SpeciesOrder;
  edible?: boolean;
  indoor?: boolean;
  poisonous?: boolean;
  cycle?: PlantCycle;
  watering?: WateringFrequency;
  sunlight?: SunlightLevel;
  hardiness?: string;
  key?: string;
}

function buildQueryString(params?: SpeciesListParams): string {
  if (!params) {
    return '';
  }

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (typeof value === 'boolean') {
      searchParams.append(key, value ? 'true' : 'false');
      return;
    }

    searchParams.append(key, String(value));
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function fetchPlantSpeciesList(params?: SpeciesListParams): Promise<SpeciesListResponse> {
  const query = buildQueryString(params);
  const endpoint = `/plants/v2/species-list${query}`;

  return apiClient.get<SpeciesListResponse>(endpoint);
}

export async function fetchPlantSpeciesDetails(
  id: number,
  params?: SpeciesDetailsParams
): Promise<PlantSpeciesDetails> {
  const query = buildQueryString(params);
  const endpoint = `/plants/v2/species/details/${id}${query}`;

  return apiClient.get<PlantSpeciesDetails>(endpoint);
}

