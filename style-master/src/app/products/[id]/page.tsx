
import { ProductDetailClient } from './product-detail-client';
import { type Metadata } from 'next';

type Props = {
  params: { id: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Since we are fetching data on the client, we can't get dynamic product data here.
  // We will provide a generic title and description.
  // The client-side component will update the document title dynamically.
  return {
    title: '상품 정보',
    description: 'StyleWise AI에서 상품의 상세 정보를 확인하세요.',
  };
}


export default function ProductDetailPage({ params }: Props) {
  const productId = params.id as string;
  
  // The client component is now responsible for fetching its own data.
  // We just need to pass the productId to it.
  return <ProductDetailClient productId={productId} />;
}
