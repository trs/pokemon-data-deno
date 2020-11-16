export const buildAssetId = (dex: number, values?: {assetBundleSuffix?: string, assetBundleValue?: number}) => {
  return values?.assetBundleSuffix ?? [
    String(dex).padStart(3, '0'),
    String(values?.assetBundleValue ?? '00').padStart(2, '0')
  ].join('_');
}
