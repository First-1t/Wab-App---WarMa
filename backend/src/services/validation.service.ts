import {
  MatchInputDto,
  SupportedCrop,
  SupportedSeason,
  SUPPORTED_CROPS,
  SUPPORTED_SEASONS,
  ALL_KNOWN_CROPS,
  WATER_CONDITIONS,
  WaterCondition,
} from '../types/scenario.types.js';

export interface ValidatedMatchInput {
  crop: string;
  plantingSeason: SupportedSeason;
  waterAvailableM3: number;
  areaRai: number;
  soilSeries?: string;
  waterCondition?: WaterCondition;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized: ValidatedMatchInput | null;
}

/**
 * Service to validate and sanitize user input for the Output Matching Engine
 */
export class ValidationService {
  /**
   * Validate MatchInputDto payload
   */
  static validate(payload: unknown): ValidationResult {
    const errors: string[] = [];

    if (!payload || typeof payload !== 'object') {
      return {
        isValid: false,
        errors: ['Request body must be a valid JSON object.'],
        sanitized: null,
      };
    }

    const input = payload as Record<string, unknown>;

    // 1. Crop / Variety validation
    const rawCrop = input.crop ?? input.variety;
    let crop: string | undefined;

    if (typeof rawCrop === 'string' && rawCrop.trim().length > 0) {
      const trimmedCrop = rawCrop.trim();
      if ((ALL_KNOWN_CROPS as readonly string[]).includes(trimmedCrop)) {
        crop = trimmedCrop;
      } else {
        errors.push(
          `Invalid crop/variety '${trimmedCrop}'. Recognized cassava varieties: ${ALL_KNOWN_CROPS.join(', ')}.`
        );
      }
    } else {
      errors.push(
        `Field 'crop' (or 'variety') is required. Supported varieties: ${SUPPORTED_CROPS.join(', ')}.`
      );
    }

    // 2. Planting Season validation
    const rawSeason = input.plantingSeason ?? input.season;
    let plantingSeason: SupportedSeason | undefined;

    if (typeof rawSeason === 'string' && rawSeason.trim().length > 0) {
      const trimmedSeason = rawSeason.trim();
      if ((SUPPORTED_SEASONS as readonly string[]).includes(trimmedSeason)) {
        plantingSeason = trimmedSeason as SupportedSeason;
      } else {
        errors.push(
          `Invalid plantingSeason '${trimmedSeason}'. Supported seasons: ${SUPPORTED_SEASONS.join(', ')}.`
        );
      }
    } else {
      errors.push(
        `Field 'plantingSeason' is required. Supported seasons: ${SUPPORTED_SEASONS.join(', ')}.`
      );
    }

    // 3. Area (areaRai / area) validation
    const rawArea = input.areaRai ?? input.area;
    let areaRai: number | undefined;

    if (rawArea !== undefined && rawArea !== null && rawArea !== '') {
      const parsedArea = Number(rawArea);
      if (Number.isFinite(parsedArea) && parsedArea > 0) {
        areaRai = parsedArea;
      } else {
        errors.push(`Field 'areaRai' (or 'area') must be a positive number greater than 0.`);
      }
    } else {
      errors.push(`Field 'areaRai' (or 'area') is required and must be greater than 0.`);
    }

    // 4. Water Available (waterAvailableM3 / waterAvailable) validation
    const rawWater = input.waterAvailableM3 ?? input.waterAvailable;
    let waterAvailableM3: number | undefined;

    if (rawWater !== undefined && rawWater !== null && rawWater !== '') {
      const parsedWater = Number(rawWater);
      if (Number.isFinite(parsedWater) && parsedWater > 0) {
        waterAvailableM3 = parsedWater;
      } else {
        errors.push(
          `Field 'waterAvailableM3' (or 'waterAvailable') must be a positive number greater than 0.`
        );
      }
    } else {
      errors.push(
        `Field 'waterAvailableM3' (or 'waterAvailable') is required and must be greater than 0.`
      );
    }

    // 5. Optional soilSeries
    const soilSeries =
      typeof input.soilSeries === 'string' && input.soilSeries.trim().length > 0
        ? input.soilSeries.trim()
        : undefined;

    // 6. Optional explicit waterCondition override
    let waterCondition: WaterCondition | undefined;
    if (typeof input.waterCondition === 'string') {
      if ((WATER_CONDITIONS as readonly string[]).includes(input.waterCondition)) {
        waterCondition = input.waterCondition as WaterCondition;
      } else {
        errors.push(
          `Invalid waterCondition '${input.waterCondition}'. Allowed values: ${WATER_CONDITIONS.join(', ')}.`
        );
      }
    }

    if (errors.length > 0 || !crop || !plantingSeason || areaRai === undefined || waterAvailableM3 === undefined) {
      return {
        isValid: false,
        errors,
        sanitized: null,
      };
    }

    return {
      isValid: true,
      errors: [],
      sanitized: {
        crop,
        plantingSeason,
        areaRai,
        waterAvailableM3,
        soilSeries,
        waterCondition,
      },
    };
  }
}
