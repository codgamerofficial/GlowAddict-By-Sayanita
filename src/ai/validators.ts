/**
 * Strict facts-only validation layer to guard against hallucinations and placeholders.
 */
export function validateProduct(product: any): boolean {
  const checkValue = (val: any, isLongText = false): boolean => {
    if (val === undefined || val === null) return true; // nulls are allowed (factual omission)
    const str = String(val).trim().toLowerCase();
    if (!str) return true;

    // Strict exact matching for titles/brands/categories
    const strictBlocked = [
      "untitled product",
      "untitled",
      "unknown brand",
      "unknown",
      "generic product",
      "cosmetic product",
      "premium skincare product",
      "beauty product",
      "cosmetics",
      "null",
      "undefined",
      "rs 999",
      "rs.999",
      "999",
      "1099",
      "rs 1099"
    ];

    if (strictBlocked.includes(str)) {
      return false;
    }

    // For long descriptions, check specific boilerplate text using includes
    if (isLongText) {
      const boilerplate = [
        "ai extraction completed",
        "detected from packaging",
        "ai generated description",
        "premium skincare product designed for modern beauty"
      ];
      if (boilerplate.some(bp => str.includes(bp))) {
        return false;
      }
    }

    return true;
  };

  // Only validate critical semantic fields, never raw OCR text or ingredients
  const fieldsToValidate = ["brand", "productName", "displayTitle", "category", "description"];
  for (const key of fieldsToValidate) {
    if (key in product) {
      const val = product[key];
      const isLong = key === "description";
      if (!checkValue(val, isLong)) {
        console.warn(`[Validator] Field '${key}' failed placeholder validation with value:`, val);
        return false;
      }
    }
  }

  return true;
}
