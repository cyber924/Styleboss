import type { Product } from '@/lib/types';

export const seedProducts: Omit<Product, 'id'>[] = [
  { name: '소프트 캐시미어 터틀넥', price: 112000, imageUrl: 'https://placehold.co/400x533.png', category: 'latest', description: '최상급 캐시미어로 제작되어 부드러운 촉감을 자랑하는 터틀넥입니다. 겨울철 필수 아이템입니다.', dataAiHint: 'cashmere turtleneck' },
  { name: '하이웨이스트 슬랙스', price: 78000, imageUrl: 'https://placehold.co/400x533.png', category: 'popular', description: '다리가 길어 보이는 하이웨이스트 디자인의 모던한 슬랙스입니다. 오피스룩으로도 좋습니다.', dataAiHint: 'high-waist slacks' },
  { name: '플로럴 프린트 롱 원피스', price: 128000, imageUrl: 'https://placehold.co/400x533.png', category: 'all', description: '화사한 플로럴 프린트가 돋보이는 쉬폰 롱 원피스입니다. 봄나들이 룩으로 추천합니다.', dataAiHint: 'floral dress' },
  { name: '크롭 기장 데님 자켓', price: 95000, imageUrl: 'https://placehold.co/400x533.png', category: 'latest', description: '어떤 룩에도 잘 어울리는 스타일리시한 크롭 데님 자켓입니다. 활용도가 높습니다.', dataAiHint: 'cropped jacket' },
  { name: '골지 니트 가디건 세트', price: 82000, imageUrl: 'https://placehold.co/400x533.png', category: 'popular', description: '나시와 가디건이 세트로 구성되어 활용도가 높은 골지 니트 세트입니다. 여리여리한 무드를 연출합니다.', dataAiHint: 'knit cardigan' },
  { name: '핀턱 와이드 코튼 팬츠', price: 69000, imageUrl: 'https://placehold.co/400x533.png', category: 'all', description: '중앙의 핀턱 주름이 포멀한 느낌을 주는 와이드 코튼 팬츠입니다. 편안하면서도 갖춰 입은 느낌을 줍니다.', dataAiHint: 'wide pants' },
  { name: '실크 블렌드 셔츠', price: 99000, imageUrl: 'https://placehold.co/400x533.png', category: 'latest', description: '은은한 광택과 부드러운 촉감의 실크 블렌드 소재로 제작된 고급 셔츠입니다.', dataAiHint: 'silk shirt' },
  { name: 'A라인 미니 스커트', price: 54000, imageUrl: 'https://placehold.co/400x533.png', category: 'popular', description: '경쾌한 기장감과 깔끔한 A라인 핏이 돋보이는 미니 스커트입니다.', dataAiHint: 'mini skirt' },
  { name: '더블 브레스티드 트렌치 코트', price: 289000, imageUrl: 'https://placehold.co/400x533.png', category: 'all', description: '클래식한 디자인의 정석, 더블 브레스티드 트렌치 코트입니다. 간절기 필수 아이템입니다.', dataAiHint: 'trench coat' },
  { name: '스퀘어넥 퍼프 소매 블라우스', price: 65000, imageUrl: 'https://placehold.co/400x533.png', category: 'latest', description: '사랑스러운 퍼프 소매와 여성스러운 스퀘어넥 디자인이 매력적인 블라우스입니다.', dataAiHint: 'puff sleeve blouse' },
];
