export interface ConversionFactor {
  id: string
  name: string
  factor_to_kg: any
}

/**
 * Converts a given quantity from a specific unit to Kilograms.
 * Prioritizes custom database conversion factors created by the owner.
 */
export function convertToKg(
  amount: number,
  unitName: string,
  conversions: ConversionFactor[]
): number {
  const normalizedUnit = unitName.trim().toLowerCase()
  
  if (normalizedUnit === 'kg' || normalizedUnit === 'kilogram') {
    return amount
  }

  // 1. Check custom database conversion factors (e.g. Liter, Karung, etc.)
  const match = conversions.find(
    (c) => c.name.trim().toLowerCase() === normalizedUnit
  )
  if (match) {
    return amount * Number(match.factor_to_kg)
  }

  // 2. Default hardcoded fallbacks
  if (normalizedUnit === 'liter') {
    return amount * 0.8 // 1 Liter = 0.8 Kg
  }
  if (normalizedUnit === 'karung') {
    return amount * 50.0 // 1 Karung = 50 Kg
  }
  if (normalizedUnit === 'pcs') {
    return amount // 1 Pcs = 1 Unit
  }

  return amount
}

/**
 * Converts a given quantity in Kilograms to a specific unit.
 * Prioritizes custom database conversion factors created by the owner.
 */
export function convertFromKg(
  kgAmount: number,
  unitName: string,
  conversions: ConversionFactor[]
): number {
  const normalizedUnit = unitName.trim().toLowerCase()

  if (normalizedUnit === 'kg' || normalizedUnit === 'kilogram') {
    return kgAmount
  }

  // 1. Check custom database conversion factors
  const match = conversions.find(
    (c) => c.name.trim().toLowerCase() === normalizedUnit
  )
  if (match) {
    const factor = Number(match.factor_to_kg)
    return factor > 0 ? kgAmount / factor : kgAmount
  }

  // 2. Default hardcoded fallbacks
  if (normalizedUnit === 'liter') {
    return kgAmount * 1.25 // 1 Kg = 1.25 Liter (1 / 0.8)
  }
  if (normalizedUnit === 'karung') {
    return kgAmount / 50.0 // 1 Karung = 50 Kg
  }

  return kgAmount
}

/**
 * Formats a given weight in Kg into a readable display of the target unit.
 */
export function formatUnitDisplay(
  kgAmount: number,
  unitName: string,
  conversions: ConversionFactor[]
): string {
  const converted = convertFromKg(kgAmount, unitName, conversions)
  return `${converted.toLocaleString('id-ID', { maximumFractionDigits: 2 })} ${unitName}`
}
