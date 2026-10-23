import { InfoToast } from '@/functions/sweetalert';

// Quick "add to bag" buttons (product cards, home, wishlist) can't ask for a
// size or colour. If a product has more than one of either, send the customer
// to the product page to choose instead of silently adding the first option.
//
// Returns true if the item was added, false if the customer was sent to choose.
export const quickAddOrChoose = (store, router, product) => {
  const sizes = product.sizes || [];
  const colors = product.colors || [];

  if (sizes.length > 1 || colors.length > 1) {
    InfoToast('Choose your size and color', product.name);
    router.push(`/product/${product.id}`);
    return false;
  }

  store.dispatch('cart/addToCart', {
    product,
    size: sizes[0] || '',
    color: colors[0] || '',
    quantity: 1,
    openDrawer: true
  });
  return true;
};
