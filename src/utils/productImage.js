export function getProductImageUrl(product) {
  const isBookmarker = /bookmark/i.test(
    `${product.name} ${product.category || ""}`,
  );

  return product.imageUrl || (isBookmarker ? "/assets/bee_bookmarker.jpeg" : "");
}
