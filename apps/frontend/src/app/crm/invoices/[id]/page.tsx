
import * as React from 'react';
import {invoiceService} from "../../../../services/invoices";
import InvoiceDetails from "../../../../components/pages/crm/invoices/details";

interface InvoicesDetailsPageProps {
    params: Promise<{
        id: string;
    }>;
}

const InvoicesDetailsPage = async ({ params }: InvoicesDetailsPageProps) => {
    const { id } = await params;

    const invoiceData = await invoiceService.getInvoiceById(parseInt(id, 10));

    return (
        <InvoiceDetails invoiceData={invoiceData} />
    );
}

export default InvoicesDetailsPage;
