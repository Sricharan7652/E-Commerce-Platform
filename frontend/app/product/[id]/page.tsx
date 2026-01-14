import ProductDetailClient from './ProductDetailClient';

export async function generateStaticParams() {
  // Return empty array for dynamic routing with static export
  return [];
}

export default function ProductDetail() {
  return <ProductDetailClient />;
}
