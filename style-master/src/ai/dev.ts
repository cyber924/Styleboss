
// This file is used to load all Genkit flows for development environments.
// It is now implicitly loaded via next.config.js and does not need to be
// directly imported by the functions entrypoint (index.ts).

import { config } from 'dotenv';
config();

import '@/ai/flows/predictive-trends.ts';
import '@/ai/flows/ai-image-generation.ts';
import '@/ai/flows/product-search.ts';
import '@/ai/flows/trend-recommendation.ts';
import '@/ai/flows/ai-ad-image-generation.ts';
import '@/ai/flows/market-research.ts';
import '@/ai/flows/sns-content-generation.ts';
import '@/ai/flows/generate-similar-images.ts';
import '@/ai/flows/product-detail-enhancement.ts';
import '@/ai/flows/ai-product-page-optimizer.ts';
import '@/ai/flows/ai-product-page-optimizer-types.ts';
import '@/ai/flows/ai-product-image-generation.ts';
import '@/ai/flows/ai-product-creation.ts';
import '@/ai/flows/ai-product-enrichment.ts';
import '@/ai/flows/sales-analysis.ts';
import '@/ai/flows/personal-codi-flow.ts';
import '@/ai/flows/personal-codi-types.ts';
import '@/ai/flows/style-analysis.ts';
