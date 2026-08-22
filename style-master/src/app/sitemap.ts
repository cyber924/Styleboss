import { MetadataRoute } from 'next';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';


const BASE_URL = 'https://stylewise-ai.web.app';

async function fetchCollectionPaths(collectionName: string, pathPrefix: string): Promise<MetadataRoute.Sitemap> {
    try {
        const snapshot = await getDocs(collection(db, collectionName));
        if (snapshot.empty) {
            return [];
        }
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                url: `${BASE_URL}${pathPrefix}/${doc.id}`,
                lastModified: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date(),
                changeFrequency: 'weekly',
                priority: 0.8,
            }
        });
    } catch (error) {
        console.error(`Error fetching sitemap for ${collectionName}:`, error);
        return [];
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        '/',
        '/products',
        '/hot',
        '/ai-products',
        '/ai-codi',
        '/stylist',
        '/my-products',
        '/my-info',
        '/login',
        '/signup',
    ].map(route => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: route === '/' ? 1 : 0.7,
    }));

    const [products, hotProducts, aiProducts] = await Promise.all([
        fetchCollectionPaths('products', '/products'),
        fetchCollectionPaths('hot_products', '/hot'),
        fetchCollectionPaths('ai_products', '/ai-products')
    ]);

    return [
        ...staticRoutes,
        ...products,
        ...hotProducts,
        ...aiProducts,
    ];
}
