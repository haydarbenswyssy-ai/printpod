export const BASE_PRICE = parseFloat(process.env.NEXT_PUBLIC_BASE_PRICE || '42.000');

export const CATEGORIES = [
  'Streetwear',
  'Graphic Art',
  'Typography',
  'Abstract',
  'Vintage',
  'Minimalist',
  'Pop Culture',
  'Nature',
  'Music',
  'Sports',
] as const;

export const SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;

export const TSHIRT_COLORS = {
  white: '#ffffff',
  black: '#1a1a1a',
} as const;
