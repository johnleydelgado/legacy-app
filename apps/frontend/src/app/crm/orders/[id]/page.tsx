// File: src/app/crm/orders/[id]/page.tsx

import * as React from 'react';
import OrdersDetails from "../../../../components/pages/crm/orders/details";
import { ordersService } from '@/services/orders';

interface OrdersDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

const OrdersDetailsPage = async ({ params }: OrdersDetailsPageProps) => {
    const { id } = await params;

    // Fetch order data directly from the service on the server
    const orderData = await ordersService.getOrderById(parseInt(id, 10));

    return (
        <OrdersDetails
            orderData={orderData}
            orderId={parseInt(id, 10)}
        />
    );
};

export default OrdersDetailsPage;
