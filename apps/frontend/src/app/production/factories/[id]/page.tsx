import * as React from 'react';
import { notFound } from 'next/navigation';
import { factoriesService } from '@/services/factories';
import FactoryDetails from '@/components/pages/production/factories/details';

interface FactoryDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

const FactoryDetailsPage = async ({ params }: FactoryDetailsPageProps) => {
    const { id } = await params;

    // Validate that id is a number
    if (!id || isNaN(parseInt(id))) {
        notFound();
    }

    try {
        const factoryData = await factoriesService.getFactoryById(parseInt(id, 10));
    
        return <FactoryDetails factoryData={{
            ...factoryData,
            factories_service_category: factoryData.factories_service,
        }} factoryId={parseInt(id, 10)} />
    } catch (error) {
        console.error(`Failed to fetch factory data got ${error}`);
        notFound();
    }
}

export default FactoryDetailsPage;
