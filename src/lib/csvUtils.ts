import type { Product, Order, OrderStatus, ProductCategory } from '../types';

/**
 * Helper function to trigger browser file download with UTF-8 BOM for Korean Excel compatibility
 */
export function downloadCsvFile(filename: string, csvContent: string) {
  // UTF-8 BOM so Excel opens Korean characters correctly
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape CSV field to prevent syntax breaks
 */
function escapeCsvValue(val: any): string {
  if (val === undefined || val === null) return '""';
  const stringVal = String(val);
  // If contains commas, quotes, or newlines, wrap in quotes and escape internal quotes
  return `"${stringVal.replace(/"/g, '""')}"`;
}

/**
 * Parse CSV line handling quoted values with commas
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuote = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuote && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        insideQuote = !insideQuote;
      }
    } else if (char === ',' && !insideQuote) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

/* =========================================================================
   1. PRODUCTS EXCEL/CSV EXPORT & IMPORT
   ========================================================================= */

export function exportProductsToCsv(products: Product[]): void {
  const headers = [
    '상품ID',
    '상품명',
    '판매가',
    '정상가',
    '분류',
    '전시분류',
    '대표이미지URL',
    '상품설명',
    '검색태그',
    'HOT특가여부(Y/N)',
    'AI스타일링제안'
  ];

  const rows = products.map(p => [
    escapeCsvValue(p.id),
    escapeCsvValue(p.name),
    escapeCsvValue(p.price),
    escapeCsvValue(p.originalPrice || p.price),
    escapeCsvValue(p.categoryLabel || '상의'),
    escapeCsvValue(p.category || 'latest'),
    escapeCsvValue(p.imageUrl),
    escapeCsvValue(p.description),
    escapeCsvValue((p.tags || []).join(';')),
    escapeCsvValue(p.isHot ? 'Y' : 'N'),
    escapeCsvValue(p.aiStylingSuggestion || '')
  ].join(','));

  const csvString = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().substring(0, 10);
  downloadCsvFile(`StyleWise_상품목록_${dateStr}.csv`, csvString);
}

export function parseProductsFromCsv(csvText: string): { products: Product[]; errorCount: number } {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return { products: [], errorCount: 0 };

  const parsedProducts: Product[] = [];
  let errorCount = 0;

  // Skip header line (index 0)
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 3) {
      errorCount++;
      continue;
    }

    const id = cols[0] || `prod-${Date.now()}-${i}`;
    const name = cols[1];
    const price = parseInt(cols[2]?.replace(/[^0-9]/g, '') || '0', 10);
    const originalPrice = cols[3] ? parseInt(cols[3].replace(/[^0-9]/g, ''), 10) : undefined;
    const categoryLabel = (cols[4] as ProductCategory) || '상의';
    const category = (cols[5] as any) || 'latest';
    const imageUrl = cols[6] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80';
    const description = cols[7] || `${name} 상품 설명입니다.`;
    const tags = cols[8] ? cols[8].split(';').map(t => t.trim()).filter(Boolean) : [categoryLabel, '신상품'];
    const isHot = cols[9]?.toUpperCase() === 'Y';
    const aiStylingSuggestion = cols[10] || `${categoryLabel} 기본 아이템과 매치하기 좋습니다.`;

    if (!name || isNaN(price) || price <= 0) {
      errorCount++;
      continue;
    }

    parsedProducts.push({
      id,
      name,
      price,
      originalPrice,
      categoryLabel,
      category,
      imageUrl,
      description,
      tags,
      isHot,
      aiStylingSuggestion,
      rating: 5.0,
      reviewsCount: 0
    });
  }

  return { products: parsedProducts, errorCount };
}

/* =========================================================================
   2. ORDERS EXCEL/CSV EXPORT & BULK TRACKING IMPORT
   ========================================================================= */

export function exportOrdersToCsv(orders: Order[]): void {
  const headers = [
    '주문번호',
    '주문일시',
    '주문자명',
    '연락처',
    '이메일',
    '배송지주소',
    '배송메모',
    '주문상품내역',
    '결제금액',
    '주문상태',
    '택배사',
    '운송장번호'
  ];

  const rows = orders.map(o => {
    const itemsSummary = o.items.map(i => `${i.productName}(${i.size || 'FREE'}, ${i.quantity}개)`).join(' / ');
    return [
      escapeCsvValue(o.orderNumber),
      escapeCsvValue(o.createdAt),
      escapeCsvValue(o.userName),
      escapeCsvValue(o.userPhone),
      escapeCsvValue(o.userEmail),
      escapeCsvValue(o.shippingAddress),
      escapeCsvValue(o.shippingMemo || ''),
      escapeCsvValue(itemsSummary),
      escapeCsvValue(o.finalAmount),
      escapeCsvValue(o.status),
      escapeCsvValue(o.courierCompany || ''),
      escapeCsvValue(o.trackingNumber || '')
    ].join(',');
  });

  const csvString = [headers.join(','), ...rows].join('\r\n');
  const dateStr = new Date().toISOString().substring(0, 10);
  downloadCsvFile(`StyleWise_주문배송내역_${dateStr}.csv`, csvString);
}

export interface BulkTrackingUpdateItem {
  orderNumber: string;
  courierCompany: string;
  trackingNumber: string;
}

export function parseTrackingCsv(csvText: string): { updates: BulkTrackingUpdateItem[]; errorCount: number } {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim().length > 0);
  if (lines.length <= 1) return { updates: [], errorCount: 0 };

  const updates: BulkTrackingUpdateItem[] = [];
  let errorCount = 0;

  // Header inspection: 주문번호, 택배사, 운송장번호
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols.length < 2) {
      errorCount++;
      continue;
    }

    const orderNumber = cols[0]?.replace(/"/g, '').trim();
    // If 2 cols, could be (orderNumber, trackingNumber) or 3 cols (orderNumber, courier, tracking)
    let courierCompany = 'CJ대한통운';
    let trackingNumber = '';

    if (cols.length >= 3) {
      courierCompany = cols[1]?.replace(/"/g, '').trim() || 'CJ대한통운';
      trackingNumber = cols[2]?.replace(/"/g, '').trim();
    } else {
      trackingNumber = cols[1]?.replace(/"/g, '').trim();
    }

    if (!orderNumber || !trackingNumber) {
      errorCount++;
      continue;
    }

    updates.push({
      orderNumber,
      courierCompany,
      trackingNumber
    });
  }

  return { updates, errorCount };
}
