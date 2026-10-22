import { parsePhoneNumberFromString, isValidPhoneNumber } from 'libphonenumber-js';

/**
 * Real-time phone number validator and normalizer.
 * Supports Indian mobile numbers (10 digits, e.g. 9876543210, +919876543210)
 * and international numbers with country codes.
 *
 * @param {string} phone
 * @param {string} defaultCountry
 * @returns {{ isValid: boolean, normalized: string, error: string | null }}
 */
export const validatePhoneNumber = (phone, defaultCountry = 'IN') => {
  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    return {
      isValid: false,
      normalized: '',
      error: 'Phone number is required',
    };
  }

  const clean = phone.trim();

  try {
    const parsed = parsePhoneNumberFromString(clean, defaultCountry);
    if (parsed && parsed.isValid()) {
      return {
        isValid: true,
        normalized: parsed.format('E.164'),
        error: null,
      };
    }

    if (isValidPhoneNumber(clean, defaultCountry)) {
      const normalized = clean.startsWith('+')
        ? clean
        : `+91${clean.replace(/^0+/, '')}`;
      return {
        isValid: true,
        normalized,
        error: null,
      };
    }
  } catch (e) {
    // Falls through to invalid
  }

  return {
    isValid: false,
    normalized: '',
    error: 'Please enter a valid phone number (e.g. 9876543210 or +919876543210)',
  };
};

/**
 * Validates street / address line
 */
export const validateStreet = (street) => {
  if (!street || typeof street !== 'string' || !street.trim()) {
    return 'Street address is required';
  }
  const trimmed = street.trim();
  if (trimmed.length < 5) {
    return 'Street address must be at least 5 characters long';
  }
  if (!/[a-zA-Z0-9]/.test(trimmed)) {
    return 'Street address must contain letters or numbers';
  }
  return null;
};

/**
 * Validates city name
 */
export const validateCity = (city) => {
  if (!city || typeof city !== 'string' || !city.trim()) {
    return 'City is required';
  }
  const trimmed = city.trim();
  if (trimmed.length < 2) {
    return 'City name must be at least 2 characters';
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return 'City can only contain letters, spaces, and hyphens';
  }
  return null;
};

/**
 * Validates state name
 */
export const validateState = (state) => {
  if (!state || typeof state !== 'string' || !state.trim()) {
    return 'State is required';
  }
  const trimmed = state.trim();
  if (trimmed.length < 2) {
    return 'State name must be at least 2 characters';
  }
  if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) {
    return 'State can only contain letters, spaces, and hyphens';
  }
  return null;
};

/**
 * Validates PIN / postal code
 */
export const validatePinCode = (zipCode, country = 'India') => {
  if (!zipCode || (typeof zipCode !== 'string' && typeof zipCode !== 'number')) {
    return 'PIN / Postal code is required';
  }
  const trimmed = String(zipCode).trim();
  if (!trimmed) {
    return 'PIN / Postal code is required';
  }

  const isIndia =
    !country ||
    country.toLowerCase() === 'india' ||
    country.toUpperCase() === 'IN';

  if (isIndia) {
    if (!/^[1-9][0-9]{5}$/.test(trimmed)) {
      return 'Please enter a valid 6-digit Indian PIN code (e.g. 560001)';
    }
  } else {
    if (trimmed.length < 3 || trimmed.length > 10) {
      return 'Please enter a valid postal code (3-10 characters)';
    }
  }
  return null;
};

/**
 * Validates full address object
 *
 * @param {Object} address
 * @returns {{ isValid: boolean, errors: Object, sanitized: Object }}
 */
export const validateAddress = (address) => {
  if (!address || typeof address !== 'object') {
    return {
      isValid: false,
      errors: { street: 'Address is required' },
      sanitized: {},
    };
  }

  const country = (address.country || 'India').trim();
  const street = (address.street || address.addressLine || address.addressLine1 || '').trim();
  const city = (address.city || '').trim();
  const state = (address.state || '').trim();
  const zipCode = String(address.zipCode || address.pinCode || address.postalCode || '').trim();

  const errors = {};

  const streetErr = validateStreet(street);
  if (streetErr) errors.street = streetErr;

  const cityErr = validateCity(city);
  if (cityErr) errors.city = cityErr;

  const stateErr = validateState(state);
  if (stateErr) errors.state = stateErr;

  const pinErr = validatePinCode(zipCode, country);
  if (pinErr) errors.zipCode = pinErr;

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      street,
      city,
      state,
      zipCode,
      country,
    },
  };
};

/**
 * Format address into a readable single-line display
 */
export const formatAddressDisplay = (addr) => {
  if (!addr) return '';
  if (typeof addr === 'string') return addr.trim();
  const parts = [addr.street, addr.city, addr.state, addr.zipCode, addr.country].filter(Boolean);
  return parts.join(', ');
};
