export const SIZE_PRESETS = {
  Apparel: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
  Shoes: ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'],
  Bags: ['Small (20L)', 'Medium (35L)', 'Large (50L)'],
  Nutrition: ['250g', '500g', '1kg', '2kg'],
  Standard: ['One Size', 'Regular'],
};

export const getDefaultSizesForCategory = (categoryName = '') => {
  const cat = String(categoryName || '').toLowerCase().trim();
  if (cat.includes('shoe') || cat.includes('footwear')) {
    return ['UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];
  }
  if (cat.includes('nutrition') || cat.includes('care') || cat.includes('protein')) {
    return ['500g', '1kg', '2kg'];
  }
  if (cat.includes('bag') || cat.includes('backpack')) {
    return ['Small (20L)', 'Medium (35L)', 'Large (50L)'];
  }
  if (cat.includes('accessories') || cat.includes('bottle') || cat.includes('watch')) {
    return ['Regular', 'One Size'];
  }
  return ['S', 'M', 'L', 'XL', 'XXL'];
};

export const SIZE_GUIDE_CHART = {
  apparel: [
    { size: 'XS', chest: '34 - 36 in', waist: '28 - 30 in', hips: '34 - 36 in', fit: 'Slim Athletic' },
    { size: 'S', chest: '36 - 38 in', waist: '30 - 32 in', hips: '36 - 38 in', fit: 'Tailored' },
    { size: 'M', chest: '38 - 40 in', waist: '32 - 34 in', hips: '38 - 40 in', fit: 'Regular Athletic' },
    { size: 'L', chest: '40 - 42 in', waist: '34 - 36 in', hips: '40 - 42 in', fit: 'Comfort Pro' },
    { size: 'XL', chest: '42 - 44 in', waist: '36 - 38 in', hips: '42 - 44 in', fit: 'Relaxed' },
    { size: '2XL', chest: '44 - 46 in', waist: '38 - 40 in', hips: '44 - 46 in', fit: 'Extended' },
  ],
  shoes: [
    { uk: 'UK 6', us: 'US 7', eu: 'EU 40', cm: '25.0 cm' },
    { uk: 'UK 7', us: 'US 8', eu: 'EU 41', cm: '25.5 cm' },
    { uk: 'UK 8', us: 'US 9', eu: 'EU 42.5', cm: '26.5 cm' },
    { uk: 'UK 9', us: 'US 10', eu: 'EU 44', cm: '27.5 cm' },
    { uk: 'UK 10', us: 'US 11', eu: 'EU 45', cm: '28.5 cm' },
    { uk: 'UK 11', us: 'US 12', eu: 'EU 46', cm: '29.5 cm' },
  ],
};
