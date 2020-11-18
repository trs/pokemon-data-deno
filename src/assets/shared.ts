export const buildAssetId = (dex: number, values?: {assetBundleSuffix?: string, assetBundleValue?: number}) => {
  // Fixes
  if (dex === 493 && values?.assetBundleValue == 11) {
    values = {assetBundleValue: 0}
  }
  if (dex === 201 && !values?.assetBundleValue) {
    values = {assetBundleValue: 11}
  }

  return values?.assetBundleSuffix ?? [
    String(dex).padStart(3, '0'),
    String(values?.assetBundleValue ?? '00').padStart(2, '0')
  ].join('_');
}
