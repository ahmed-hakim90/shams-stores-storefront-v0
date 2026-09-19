import type { Address } from './types'
export const requiredCheckoutFields: (keyof Address)[] = [
  'firstName',
  'phone',
  'address1',
  'city',
  'state',
]
export function checkoutErrors(
  address: Address,
): Partial<Record<keyof Address, string>> {
  const errors: Partial<Record<keyof Address, string>> = {}
  for (const field of requiredCheckoutFields)
    if (!address[field].trim()) errors[field] = 'Required'
  if (address.phone && !/^01[0-9]{9}$/.test(address.phone))
    errors.phone = 'Enter an 11-digit Egyptian mobile number starting with 01'
  return errors
}
