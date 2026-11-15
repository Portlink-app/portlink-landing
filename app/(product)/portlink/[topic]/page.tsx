import { notFound } from 'next/navigation'
import ProductJourney from '@/components/acquisition/ProductJourney'
import { topics } from '@/components/acquisition/journey-content'
export function generateStaticParams() { return topics.platform.map(t => ({ topic: t.id })) }
export default async function Topic({ params }: { params: Promise<{ topic: string }> }) { const { topic } = await params; if (!topics.platform.some(t => t.id === topic)) notFound(); return <ProductJourney topicId={topic} /> }

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) { const { topic } = await params; const record = topics.platform.find(t => t.id === topic); return { title: record?.title, description: record?.outcome, alternates: { canonical: `/portlink/${topic}/` } }
}
