'use client';

import * as React from 'react';
import PurchaseOrderDetailsHeaders from '../sections/headers';
import CustomerSelectCard from '../sections/customer-select-card';
import VendorSelectCard from '../sections/vendor-select-card';
import { Vendor } from '@/services/vendors/types';
import FactorySelectCard from '../sections/factory-select-card';
import { Factory as FactoryType, FactoryDetail } from '@/services/factories/types';
import { useOrganization } from '@/hooks/useOrganizations';
import { InfoBox } from '@/components/custom/info-box';
import CompanyInfo from '../sections/company-info';
import TabWindow from '../tabs/tab-window';
import { Customer } from '@/services/customers/types';
import { Separator } from '@/components/ui/separator';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import CustomerSelectDetailsCard from '../sections/customer-select-details-card';
import VendorSelectDetailsCard from '../sections/vendor-select-details-card';
import { useAddressByForeignKey, useAddressMutations } from '@/hooks/useAddresses';
import VendorContent from '../tabs/vendor-content';
import POVendorsItemsTable, { TablePOVendorsItems } from '../sections/po-vendors-items-table';
import ItemsSummary, { PurchaseOrderSummaryTypes } from '../sections/items-summary';
import { toast } from 'sonner';
import { CreatePurchaseOrderDto, PurchaseOrderPriority } from '@/services/purchase-orders/types';
import moment from 'moment';
import { useCreatePurchaseOrder, useDeletePurchaseOrder } from '@/hooks/usePurchaseOrders';
import { useRouter } from 'next/navigation';
import { useAllLocationTypes } from '@/hooks/useLocationTypes';
import { useCreatePurchaseOrderItem } from '@/hooks/usePurchaseOrdersItems';
import { useCreateActivityHistory } from '@/hooks/useActivityHistory';
import { ContactAddressFormValues } from '../forms/contact-address-form';
import { defaultFormValues } from '../forms/contact-address-form';
import { useContactMutations } from '@/hooks/useContacts';
import { ContactTypeEnums } from '@/services/contacts/types';
import { useCreateImageGallery, useCreateImageGalleryFromUrl, useImageGalleryByItemEndpoint } from '@/hooks/useImageGallery';
import { FKItemType, Type } from '@/services/image-gallery/types';
import { uploadSingleImage } from '@/components/pages/crm/quotes-details/helpers-functions/image-helpers';
import { useCustomer } from '@/hooks/useCustomers2';
import { useOrderItemsByOrderId } from '@/hooks/useOrdersItems';
import { ExtendedFile } from '@/components/pages/crm/quotes-details/sections/image-upload-dropzone';

export interface PurchaseOrderData {
    clientName: string;
    clientDescription: string;
    quoteApproveDate: string;
    pdSignedDate: string;
    shippingDate: string;
    totalQuantity: number;
    userOwner: string;
    locationTypeId: number;
    priority: PurchaseOrderPriority;
}

const AddPurchaseOrder = () => {
    const router = useRouter();

    const [status, setStatus] = React.useState(5);
    const { customerID } = useSelector((state: RootState) => state.customers);
    const { ordersID, ordersNumber } = useSelector((state: RootState) => state.orders);
    const { fullname } = useSelector((state: RootState) => state.users);

    const [purchaseOrderData, setPurchaseOrderData] = React.useState<PurchaseOrderData>({
        clientName: '',
        clientDescription: '',
        quoteApproveDate: '',
        pdSignedDate: '',
        shippingDate: '',       
        totalQuantity: 0,
        userOwner: fullname,
        locationTypeId: 0,
        priority: PurchaseOrderPriority.NORMAL,
    });

    const [isModifyFlag, setIsModifyFlag] = React.useState(false);
    const [isSaving, setIsSaving] = React.useState(false);

    const [selectedCustomerID, setSelectedCustomerID] = React.useState<number>(customerID);
    const [selectedVendorID, setSelectedVendorID] = React.useState<number>(0);
    
    const [showCustomerSearch, setShowCustomerSearch] = React.useState(false);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

    const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(null);
    const [showVendorSearch, setShowVendorSearch] = React.useState(false);

    const [billingValues, setBillingValues] = React.useState<ContactAddressFormValues>(defaultFormValues as ContactAddressFormValues);
    const [shippingValues, setShippingValues] = React.useState<ContactAddressFormValues>(defaultFormValues as ContactAddressFormValues);
    const [notes, setNotes] = React.useState('');

    const [purchaseOrderItems, setPurchaseOrderItems] = React.useState<TablePOVendorsItems[]>([]);
    const [purchaseOrderSummary, setPurchaseOrderSummary] = React.useState<PurchaseOrderSummaryTypes>({
        addedQuantity: 0,
        addedUnitPrice: 0,
        addedTaxRate: 0,
        addedLineTotal: 0,
        paid: 0,
      });
    
    const [fkOrdersItemID, setFKOrdersItemID] = React.useState<number>(-1);
    const [currentImageFetchIndex, setCurrentImageFetchIndex] = React.useState<number>(0);

    const { data: orgData, isLoading: orgLoading } = useOrganization(2);

    const { customer: serialCustomer } = useCustomer(customerID);

    const { data: customerBillingAddress } = useAddressByForeignKey({ fk_id: selectedCustomerID, table: 'Customers', address_type: 'BILLING' });
    const { data: vendorBillingAddress } = useAddressByForeignKey({ fk_id: selectedVendorID, table: 'Vendors', address_type: 'BILLING' });  

    const { data: orderItems } = useOrderItemsByOrderId(ordersID);

    const { mutateAsync: createPurchaseOrder } = useCreatePurchaseOrder();
    const { createContact: createPurchaseOrderContact } = useContactMutations();
    const { createAddress: createPurchaseOrderAddress } = useAddressMutations();
    const { mutateAsync: createPurchaseOrderItem } = useCreatePurchaseOrderItem();
    const { mutateAsync: createActivityHistory } = useCreateActivityHistory();

    const { createImage } = useCreateImageGallery();
    const { createImageFromUrl } = useCreateImageGalleryFromUrl();

    const { data: orderItemsImageGallery } = useImageGalleryByItemEndpoint(fkOrdersItemID, 'ORDERS');

    const handleCustomerSelect = React.useCallback((customer: Customer) => {
        setSelectedCustomerID(customer.pk_customer_id);
        setSelectedCustomer(customer);
        setShowCustomerSearch(false);
    }, []);

    const clearCustomerSelection = React.useCallback(() => {
        setSelectedCustomerID(0);
        setSelectedCustomer(null);
    }, []);

    const handleCreatePurchaseOrder = React.useCallback(async () => {
        try {
            setIsSaving(true);

            if (selectedCustomerID === 0 || selectedVendorID === 0) {
                toast.error("Please select a customer and vendor.");
                return;
            }

            if (!purchaseOrderData.locationTypeId || purchaseOrderData.locationTypeId === 0) {
                toast.error("Please select a location type.");
                return;
            }

            if (!purchaseOrderData.clientName || purchaseOrderData.clientName.length === 0) {
                toast.error("Client Name is required.");
                return;
            }
    
            if (!purchaseOrderData.quoteApproveDate || purchaseOrderData.quoteApproveDate.length === 0) {
                toast.error("Quote Approve Date is required.");
                return;
            }

            if (!purchaseOrderData.pdSignedDate || purchaseOrderData.pdSignedDate.length === 0) {
                toast.error("PD Signed Date is required.");
                return;
            }
    
            if (!purchaseOrderData.shippingDate || purchaseOrderData.shippingDate.length === 0) {
                toast.error("Shipping Date is required.");
            }
    
            if (!purchaseOrderData.totalQuantity || purchaseOrderData.totalQuantity === 0) {
                toast.error("Total Quantity is required.");
                return;
            }
    
            if (!purchaseOrderData.userOwner || purchaseOrderData.userOwner.length === 0) {
                toast.error("User Owner is required.");
                return;
            } 
            
            const newPurchaseOrder: CreatePurchaseOrderDto = {
                fkCustomerID: selectedCustomerID,
                fkVendorID: selectedVendorID,
                fkFactoryID: 0,
                fkLocationTypeID: purchaseOrderData.locationTypeId,
                fKLeadNumbersID: 0,
                fkShippingMethodID: 0,
                fkOrderID: ordersID,
                status,
                priority: purchaseOrderData.priority,
                clientName: purchaseOrderData.clientName,
                clientDescription: purchaseOrderData.clientDescription.length > 0 ? purchaseOrderData.clientDescription : purchaseOrderData.clientName,
                quoteApprovedDate: purchaseOrderData.quoteApproveDate ? moment(purchaseOrderData.quoteApproveDate).format('YYYY/MM/DD') : '',
                pdSignedDate: purchaseOrderData.pdSignedDate ? moment(purchaseOrderData.pdSignedDate).format('YYYY/MM/DD') : '',
                shippingDate: purchaseOrderData.shippingDate ? moment(purchaseOrderData.shippingDate).format('YYYY/MM/DD') : '',
                totalQuantity: purchaseOrderSummary.addedQuantity > 0 ? purchaseOrderSummary.addedQuantity : purchaseOrderData.totalQuantity,
                notes,
                userOwner: purchaseOrderData.userOwner,
            }

            const createdPurchaseOrder = await createPurchaseOrder(newPurchaseOrder);

            try {
                await createPurchaseOrderContact({
                    fk_id: createdPurchaseOrder.pk_purchase_order_id,  
                    table: 'PurchaseOrders',
                    contactType: ContactTypeEnums.BILLING,
                    firstname: billingValues.contactFirstname,
                    lastname: billingValues.contactLastname,
                    email: billingValues.contactEmail,
                    phoneNumber: billingValues.contactPhoneNumber,
                    mobileNumber: billingValues.contactMobileNumber,
                    positionTitle: billingValues.contactPositionTitle
                });

                await createPurchaseOrderAddress({
                    fk_id: createdPurchaseOrder.pk_purchase_order_id,
                    table: 'PurchaseOrders',
                    address_type: 'BILLING',
                    address1: billingValues.addressLine1,
                    city: billingValues.city,
                    state: billingValues.state,
                    zip: billingValues.zip,
                    country: billingValues.country
                });
            } catch (error) {   
                console.error("Error creating billing information:", error);
                toast.error("Error creating billing information.");
            }

            try {
                await createPurchaseOrderContact({
                    fk_id: createdPurchaseOrder.pk_purchase_order_id,
                    table: 'PurchaseOrders',
                    contactType: ContactTypeEnums.SHIPPING,
                    firstname: shippingValues.contactFirstname,
                    lastname: shippingValues.contactLastname,
                    email: shippingValues.contactEmail,
                    phoneNumber: shippingValues.contactPhoneNumber,
                    mobileNumber: shippingValues.contactMobileNumber,
                    positionTitle: shippingValues.contactPositionTitle
                });

                await createPurchaseOrderAddress({
                    fk_id: createdPurchaseOrder.pk_purchase_order_id,
                    table: 'PurchaseOrders',
                    address_type: 'SHIPPING',
                    address1: shippingValues.addressLine1,
                    city: shippingValues.city,
                    state: shippingValues.state,
                    zip: shippingValues.zip,
                    country: shippingValues.country
                }); 
            } catch (error) {   
                console.error("Error creating shipping information:", error);
                toast.error("Error creating shipping information.");
            }

            try {
                const normalizedPurchaseOrderItems = purchaseOrderItems.map((item) => ({
                    purchaseOrderID: createdPurchaseOrder.pk_purchase_order_id,
                    productID: item.productID,
                    itemSku: item.itemSku,
                    itemName: item.itemName,
                    itemDescription: item.itemDescription,
                    itemSpecifications: JSON.stringify(item.itemSpecifications),
                    itemNotes: item.itemNotes,
                    // packagingInstructions: JSON.stringify(item.packagingInstructions),
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    rate: Number(item.rate),
                    currency: 'USD',
                }));

                const createPurchaseOrderItemPromises = await Promise.all(normalizedPurchaseOrderItems.map(async (item) => await createPurchaseOrderItem(item)));
                const purchaseOrderItemIDs = createPurchaseOrderItemPromises.map(data => data.pk_purchase_order_item_id);
                const uploadedImages = [];

                // Sequential processing of each quote item's images
                for (let i = 0; i < purchaseOrderItems.length; i++) {
                    const data = purchaseOrderItems[i]; 
                    if (!data || !data.images || data.images.length === 0) continue;
        
                    const purchaseOrderItemID = Number(purchaseOrderItemIDs[i]);
        
                    // Process each image sequentially for this order item
                    for (let j = 0; j < data.images.length; j++) {
                        const dataImage = data.images[j];
            
                        const imageType = dataImage.typeImage === Type.LOGO ? Type.LOGO :
                            (dataImage.typeImage === Type.ARTWORK ? Type.ARTWORK : Type.OTHER);
            
                        try {
                            // Check if dataImage is a File object or a URL
                            const isFile = dataImage instanceof File;
                            
                            let uploadedImage;
                        
                            if (isFile) {
                            // Use createImage for File objects
                            const createImageParams = {
                                fkItemID: purchaseOrderItemID,
                                fkItemType: FKItemType.PURCHASE_ORDERS,
                                imageFile: dataImage,
                                description: dataImage.name || `Image ${j+1} for item #${purchaseOrderItemID}`,
                                type: imageType
                            }
        
                            // Attempt to upload with retry logic
                            uploadedImage = await uploadSingleImage(createImageParams, createImage);
                        } else {
                            // Use createImageFromUrl for non-File objects (URLs)
                            const imageUrl = (dataImage as any).preview || (dataImage as any).url || (dataImage as any).image_url || '';
                            const imageName = (dataImage as any).name || (dataImage as any).filename || `Image ${j+1} for item #${purchaseOrderItemID}`;
                            
                            // Call createImageFromUrl directly since it's not a mutation hook
                            uploadedImage = await createImageFromUrl({
                                url: imageUrl,
                                fkItemID: purchaseOrderItemID,
                                fkItemType: FKItemType.PURCHASE_ORDERS,
                                description: imageName,
                                type: imageType
                            });
                        }
        
                        if (uploadedImage) uploadedImages.push(uploadedImage);
                        
                    } catch (uploadError) {
                        // Fault tolerance - continue with other images even if this one fails
                        console.error(`Failed to process image ${j+1} for order item #${purchaseOrderItemID}:`, uploadError);
                        toast.error(`Failed to process image ${j+1} for order item #${purchaseOrderItemID}`);
                    }
                }
                }

                console.log(`Uploaded ${uploadedImages.length} images for Purchase Order #${createdPurchaseOrder.purchase_order_number}`);

            } catch (error) {
                console.error("Error creating purchase order items:", error);
                toast.error("Error creating purchase order items.");
            }

            try {
                await createActivityHistory({
                    customerID: selectedCustomerID,
                    status,
                    tags: JSON.stringify(["Purchase Order", "Create"]),
                    documentID: createdPurchaseOrder.pk_purchase_order_id,
                    documentType: 'PurchaseOrders',
                    activity: `Create Purchase Order #${createdPurchaseOrder.purchase_order_number}`,
                    activityType: `Create`,
                    userOwner: fullname,
                });

                console.log("Activity history created successfully.");

            } catch (error) {   
                console.error("Error creating activity history:", error);
                toast.error("Error creating activity history.");
            }

            toast.success(`Purchase order ${createdPurchaseOrder.purchase_order_number} created successfully.`);
            router.push(`/production/purchase-orders/${createdPurchaseOrder.pk_purchase_order_id}`);

        } catch (error) {
            console.error("Error creating purchase order:", error);
            toast.error("Error creating purchase order.");
        } finally {
            setIsSaving(false);
        }
    }, [purchaseOrderData, purchaseOrderItems, purchaseOrderSummary, selectedCustomerID, selectedVendorID]);

    const convertImageGalleryToExtendedFile = (imageGallery: any[]): ExtendedFile[] => {
        if (!imageGallery || !Array.isArray(imageGallery)) return [];
      
        return imageGallery.map(image => ({
          // Required ExtendedFile properties
          preview: image.url || image.image_url || '',
          typeImage: image.type || 'OTHER',
          lastModified: Date.now(),
          name: image.filename || `image-${Date.now()}`,
          size: 0,
          type: 'image/jpeg',
          uid: `${Date.now()}-${Math.random()}`,
          status: 'done',
          percent: 100,
          ...image // Keep original properties too
        }));
    };  

    React.useEffect(() => {
        if (selectedCustomer) {
            setPurchaseOrderData({
                ...purchaseOrderData,
                clientName: selectedCustomer.name
            });
        }
    }, [selectedCustomer]);

    React.useEffect(() => {
        if (selectedVendor) {
            setSelectedVendorID(selectedVendor.pk_vendor_id);
        }
    }, [selectedVendor]);

    React.useEffect(() => {
        const totalQuantity = purchaseOrderItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
        const totalUnitPrice = purchaseOrderItems.reduce((acc, item) => acc + Number(item.unitPrice || 0), 0);
        const totalTaxRate = 0.08;
        const totalLineTotal = purchaseOrderItems.reduce((acc, item) => acc + Number(item.total || 0), 0);
        setPurchaseOrderSummary({ addedQuantity: totalQuantity, addedUnitPrice: totalUnitPrice, addedTaxRate: totalTaxRate, addedLineTotal: totalLineTotal, paid: 0 });
        setPurchaseOrderData({
            ...purchaseOrderData,
            totalQuantity: totalQuantity
        });
    }, [purchaseOrderItems]);

    React.useEffect(() => {
        if (serialCustomer) {
            setSelectedCustomer(serialCustomer as unknown as Customer);
        }
    }, [serialCustomer]);

    React.useEffect(() => {
        if (orderItems && purchaseOrderItems.length === 0) {
            const normalizedData = orderItems.items.map((data) => (
                {
                    purchaseOrderItemID: 0,
                    orderItemID: data.pk_order_item_id,
                    categoryID: data.products_category_data.id,
                    categoryName: data.products_category_data.name,
                    productID: data.products_data.id,
                    itemNumber: data.item_number,
                    itemSku: data.products_data.product_sku,
                    itemName: data.products_data.product_name,
                    itemDescription: data.item_description,
                    itemSpecifications: [
                        {
                            key: 'Style',
                            value: data.products_data.style
                        },
                        {
                            key: 'Yarn Color',
                            value: data.yarn_data.yarn_color
                        },
                        {
                            key: 'Yarn Type',
                            value: data.yarn_data.yarn_type
                        },
                        {
                            key: 'Trim',
                            value: data.trim_data.trim
                        },
                        {
                            key: 'Packaging',
                            value: data.packaging_data.packaging
                        }
                    ],
                    itemNotes: '',
                    packagingInstructions: '',
                    quantity: data.quantity,
                    unitPrice: data.unit_price,
                    rate: data.tax_rate,
                    total: data.line_total,
                    currency: 'USD',
                    images: [],
                    actionCreate: false,
                    actionModify: false,
                    actionEdited: false,
                    errorState: [],
                    modifyList: [],
                    imagesLoaded: false,
                }
            ));

            setPurchaseOrderItems(normalizedData as unknown as TablePOVendorsItems[]);
        }
    }, [orderItems]);

    React.useEffect(() => {
        if (purchaseOrderItems && purchaseOrderItems.length > 0 && currentImageFetchIndex < purchaseOrderItems.length) {
          const currentItem = purchaseOrderItems[currentImageFetchIndex];
    
          if (currentItem?.orderItemID && currentItem.orderItemID > 0) {
            setFKOrdersItemID(currentItem.orderItemID);
          }
        }
    }, [purchaseOrderItems, currentImageFetchIndex]);
    
    React.useEffect(() => {
        // Only run if we have image data and a valid quote item ID
        if (orderItemsImageGallery?.items && fkOrdersItemID > 0) {
            // Update the current item with the fetched images, with proper type conversion
            setPurchaseOrderItems(prevItems =>
                prevItems.map(item =>
                  item.orderItemID === fkOrdersItemID
                    ? {
                      ...item,
                      images: convertImageGalleryToExtendedFile(orderItemsImageGallery.items),
                      imagesLoaded: true
                    }: item
                )
            );
    
            // Move to the next item after a short delay to avoid race conditions
            setTimeout(() => {
              setCurrentImageFetchIndex(prevIndex => {
                // If we've processed all items, reset
                if (prevIndex + 1 >= purchaseOrderItems.length) {
                  return prevIndex; // Stay at last index
                }
                return prevIndex + 1;
              });
           }, 500);
        }
    }, [orderItemsImageGallery, fkOrdersItemID]);

    return (
        <div className="space-y-6">
            <PurchaseOrderDetailsHeaders 
                add={true}
                status={status}
                setStatus={setStatus}
                handleUpdateClick={handleCreatePurchaseOrder}
                isSaving={isSaving}
            />

            <InfoBox
               title={`Create New Purchase Order ${ordersNumber.length > 0 ? `from Order #${ordersNumber}` : ''}`}
               subtitle="Can create a new purchase order for vendor."
            />

            { orgData &&
                <CompanyInfo orgData={orgData} orgLoading={orgLoading} />
            }

            <div className="flex flex-row gap-2 flex-wrap">
                <CustomerSelectDetailsCard 
                    selectedCustomer={selectedCustomer}
                    showSearch={showCustomerSearch}
                    onShowSearchChange={setShowCustomerSearch}
                    onCustomerSelect={handleCustomerSelect}
                    onClearSelection={clearCustomerSelection}
                    customerAddress={customerBillingAddress}
                />
                <VendorSelectDetailsCard 
                    selectedVendor={selectedVendor}
                    showSearch={showVendorSearch}
                    onShowSearchChange={setShowVendorSearch}
                    onVendorSelect={setSelectedVendor}
                    onClearSelection={() => setSelectedVendor(null)}
                    vendorAddress={vendorBillingAddress}
                />
            </div>

            <VendorContent
                addMode={true}
                customerID={selectedCustomerID}
                purchaseOrderData={purchaseOrderData}
                setPurchaseOrderData={setPurchaseOrderData}
                billingValues={billingValues}
                setBillingValues={setBillingValues}
                shippingValues={shippingValues}
                setShippingValues={setShippingValues}
                notes={notes}
                setNotes={setNotes}
            />    

            <POVendorsItemsTable
                poVendorsItems={purchaseOrderItems}
                setPoVendorsItems={setPurchaseOrderItems}
                setModifyFlag={setIsModifyFlag}
            />

            <ItemsSummary
                addedQuantity={purchaseOrderSummary.addedQuantity}
                addedUnitPrice={purchaseOrderSummary.addedUnitPrice}
                addedTaxRate={purchaseOrderSummary.addedTaxRate}
                addedLineTotal={purchaseOrderSummary.addedLineTotal}
                paid={purchaseOrderSummary.paid}
            />
        </div>
    )
}

export default AddPurchaseOrder;
