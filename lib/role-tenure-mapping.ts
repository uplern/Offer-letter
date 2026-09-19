// Role-Tenure-Template Mapping System
export interface RoleTenureMapping {
  [roleCode: string]: {
    name: string
    availableTenures: number[] // months
    templates: {
      [months: number]: string // template code
    }
  }
}

export const ROLE_TENURE_MAPPING: RoleTenureMapping = {
  'RSBPE': {
    name: 'Recruitment Specialist and Business Partnership Executive',
    availableTenures: [65], // 65 Days
    templates: {
      65: 'RSBPE_65D'
    }
  }
}

// Get available tenures for a role
export function getAvailableTenuresForRole(roleCode: string): number[] {
  return ROLE_TENURE_MAPPING[roleCode]?.availableTenures || []
}

// Get template code for role and tenure
export function getTemplateCode(roleCode: string, months: number): string | null {
  return ROLE_TENURE_MAPPING[roleCode]?.templates[months] || null
}

// Get all role codes
export function getAllRoleCodes(): string[] {
  return Object.keys(ROLE_TENURE_MAPPING)
}

// Get role name by code
export function getRoleName(roleCode: string): string {
  return ROLE_TENURE_MAPPING[roleCode]?.name || roleCode
}
