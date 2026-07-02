import { getProductImage, saveProductImage } from './productFilters';

describe('product image helpers', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('returns the uploaded image for a product', () => {
    saveProductImage(1, 'data:image/png;base64,abc');
    const image = getProductImage({ id: 1, image: null });

    expect(image).toBe('data:image/png;base64,abc');
  });

  it('falls back to the product image when no upload is stored', () => {
    const image = getProductImage({ id: 2, image: 'product-default.png' });

    expect(image).toBe('product-default.png');
  });
});
