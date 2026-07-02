import { filterProducts, PRODUCT_DATA } from './productFilters';

describe('filterProducts', () => {
  it('filters by search term, category, brand and price range', () => {
    const result = filterProducts(PRODUCT_DATA, {
      searchTerm: 'iphone',
      selectedCategory: 'Phones & Tablets',
      selectedBrands: ['Apple'],
      selectedManufacturers: [],
      minPrice: 1000000,
      maxPrice: 2000000,
    });

    expect(result).toHaveLength(1);
    expect(result[0].name).toContain('iPhone');
    expect(result[0].brand).toBe('Apple');
  });

  it('matches products when no filters are active', () => {
    const result = filterProducts(PRODUCT_DATA, {
      searchTerm: '',
      selectedCategory: 'All Products',
      selectedBrands: [],
      selectedManufacturers: [],
      minPrice: '',
      maxPrice: '',
    });

    expect(result).toHaveLength(PRODUCT_DATA.length);
  });
});
