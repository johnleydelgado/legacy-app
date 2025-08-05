'use client';

import * as React from 'react';
import { useParams } from 'next/navigation';
import { useDeletePurchaseOrder, usePurchaseOrder, useUpdatePurchaseOrder } from '@/hooks/usePurchaseOrders';
import PurchaseOrderDetailsHeaders from '../sections/headers';
import { InfoBox } from '@/components/custom/info-box';
import { usePurchaseOrderMutations } from '@/hooks/usePurchaseOrders';
import { infoBoxFormatDate } from '@/helpers/date-formatter';
import PurchaseOrderDetailsSkeleton from '../sections/skeleton';
import { useOrganization } from '@/hooks/useOrganizations';
import CompanyInfo from '../sections/company-info';
import CustomerSelectDetailsCard from '../sections/customer-select-details-card';
import VendorSelectDetailsCard from '../sections/vendor-select-details-card';
import { Customer } from '@/services/customers/types';
import { useAddressByForeignKey, useAddressMutations } from '@/hooks/useAddresses';
import { Vendor } from '@/services/vendors/types';
import { useCustomer } from '@/hooks/useCustomers';
import { useVendor } from '@/hooks/useVendors2';
import VendorContent from '../tabs/vendor-content';
import { PurchaseOrderPriority } from '@/services/purchase-orders/types';
import { RootState } from '@/store';
import { useSelector } from 'react-redux';
import { PurchaseOrderData } from '../add';
import { ContactAddressFormValues } from '../forms/contact-address-form';
import { defaultFormValues } from '../forms/contact-address-form';
import { useContactByReference, useContactMutations } from '@/hooks/useContacts';
import POVendorsItemsTable from '../sections/po-vendors-items-table';
import { useDeletePurchaseOrderItem, usePurchaseOrderItemsByOrderId, usePurchaseOrderItemMutations } from '@/hooks/usePurchaseOrdersItems';
import { TablePOVendorsItems } from '../sections/po-vendors-items-table';
import ItemsSummary, { PurchaseOrderSummaryTypes } from '../sections/items-summary';
import ActivityHistory from '../sections/activity-history';
import { useImageGalleryByItemEndpoint, useCreateImageGallery } from '@/hooks/useImageGallery';
import { ExtendedFile } from '@/components/pages/crm/quotes-details/sections/image-upload-dropzone';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useCreateActivityHistory } from '@/hooks/useActivityHistory';
import { Type } from '@/services/image-gallery/types';
import { FKItemType } from '@/services/image-gallery/types';
import { uploadSingleImage } from '@/components/pages/crm/quotes-details/helpers-functions/image-helpers';
import { useOrder } from '@/hooks/useOrders';
import { useQuote } from '@/hooks/useQuotes';
import Link from 'next/link';


const PurchaseOrderDetails = () => {
    const { id } = useParams();
    const router = useRouter();
    const { fullname } = useSelector((state: RootState) => state.users);

    const [status, setStatus] = React.useState(0);
    const [statusText, setStatusText] = React.useState('');
    const [isSaving, setIsSaving] = React.useState(false);
    const [isModifyFlag, setIsModifyFlag] = React.useState(false);

    const [statusChange, setStatusChange] = React.useState(false);

    const [selectedCustomerID, setSelectedCustomerID] = React.useState(0);

    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
    const [showCustomerSearch, setShowCustomerSearch] = React.useState(false);

    const [selectedVendorID, setSelectedVendorID] = React.useState(0);
    const [selectedVendor, setSelectedVendor] = React.useState<Vendor | null>(null);
    const [showVendorSearch, setShowVendorSearch] = React.useState(false);

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

    const [billingValues, setBillingValues] = React.useState<ContactAddressFormValues>(defaultFormValues as ContactAddressFormValues);
    const [shippingValues, setShippingValues] = React.useState<ContactAddressFormValues>(defaultFormValues as ContactAddressFormValues);
    const [notes, setNotes] = React.useState('');

    const [modifyBillingFlag, setModifyBillingFlag] = React.useState(false);
    const [modifyShippingFlag, setModifyShippingFlag] = React.useState(false);

    const [purchaseOrderItems, setPurchaseOrderItems] = React.useState<TablePOVendorsItems[]>([]);
    const [purchaseOrderSummary, setPurchaseOrderSummary] = React.useState<PurchaseOrderSummaryTypes>({
        addedQuantity: 0,
        addedUnitPrice: 0,
        addedTaxRate: 0,
        addedLineTotal: 0,
        paid: 0,
      });

    const [deleteItems, setDeleteItems] = React.useState<number[]>([]);

    const [currentImageFetchIndex, setCurrentImageFetchIndex] = React.useState(0);
    const [fkPurchaseOrderItemID, setFKPurchaseOrderItemID] = React.useState(-1);

    const [toggleRefetch, setToggleRefetch] = React.useState(false);

    // Add these constants at the top of the file
    const MAX_RETRY_ATTEMPTS = 3;
    const RETRY_DELAY = 2000; // 2 seconds

    const [retryCount, setRetryCount] = React.useState<Record<number, number>>({});
    
    const { data: purchaseOrder, isLoading: isLoadingPurchaseOrder } = usePurchaseOrder(Number(id));
    const { data: orgData, isLoading: orgLoading } = useOrganization(2);

    const { data: customerData } = useCustomer(selectedCustomerID);
    const { data: vendorData } = useVendor(selectedVendorID);

    const { data: customerBillingAddress } = useAddressByForeignKey({ fk_id: selectedCustomerID, table: 'Customers', address_type: 'BILLING' });
    const { data: vendorBillingAddress } = useAddressByForeignKey({ fk_id: selectedVendorID, table: 'Vendors', address_type: 'BILLING' });

    const { data: purchaseOrderBillingContact } = useContactByReference(purchaseOrder?.pk_purchase_order_id || 0, 'PurchaseOrders', 'BILLING');
    const { data: purchaseOrderShippingContact } = useContactByReference(purchaseOrder?.pk_purchase_order_id || 0, 'PurchaseOrders', 'SHIPPING');
    
    const { data: purchaseOrderBillingAddress } = useAddressByForeignKey({ fk_id: purchaseOrder?.pk_purchase_order_id || 0, table: 'PurchaseOrders', address_type: 'BILLING' });
    const { data: purchaseOrderShippingAddress } = useAddressByForeignKey({ fk_id: purchaseOrder?.pk_purchase_order_id || 0, table: 'PurchaseOrders', address_type: 'SHIPPING' });

    const { data: purchaseOrderItemsData } = usePurchaseOrderItemsByOrderId(purchaseOrder?.pk_purchase_order_id || 0);

    const {
        data: dataPurchaseOrderItemsImage,
        loading: isLoadingPurchaseOrderItemsImage,
        error: errorPurchaseOrderItemsImage,
        refetch: refetchPurchaseOrderItemsImage,
    } = useImageGalleryByItemEndpoint(fkPurchaseOrderItemID, 'PURCHASE_ORDERS');

    const { mutateAsync: deletePurchaseOrder } = useDeletePurchaseOrder();
    const { mutateAsync: deletePurchaseOrderItem } = useDeletePurchaseOrderItem();

    const { mutateAsync: updatePurchaseOrder } = useUpdatePurchaseOrder();
    const { updateContact } = useContactMutations();
    const { updateAddress } = useAddressMutations();

    const { createImage } = useCreateImageGallery();

    const { 
        create: createPurchaseOrderItems, 
        update: updatePurchaseOrderItems 
    } = usePurchaseOrderItemMutations();

    const { mutateAsync: createActivityHistory } = useCreateActivityHistory();

    const { data: quoteDetailsData } = useQuote(purchaseOrder?.serial_encoder.quote_id || 0);
    const { data: orderDetailsData } = useOrder(purchaseOrder?.serial_encoder.order_id || 0);

    const handleCustomerSelect = React.useCallback((customer: Customer) => {
        setSelectedCustomerID(customer.pk_customer_id);
        setSelectedCustomer(customer);
        setShowCustomerSearch(false);
    }, []);

    const clearCustomerSelection = React.useCallback(() => {
        setSelectedCustomerID(0);
        setSelectedCustomer(null);
    }, []);

    const handleUpdatePurchaseOrder = React.useCallback(async () => {
        try {
            await updatePurchaseOrder({ 
                id: purchaseOrder?.pk_purchase_order_id || 0, 
                data: {
                    fkCustomerID: selectedCustomerID,
                    fkVendorID: selectedVendorID,
                    fkLocationTypeID: purchaseOrderData.locationTypeId,
                    fkShippingMethodID: 0,
                    status: status,
                    priority: purchaseOrderData.priority,
                    clientName: purchaseOrderData.clientName,
                    clientDescription: purchaseOrderData.clientDescription,
                    quoteApprovedDate: purchaseOrderData.quoteApproveDate,
                    pdSignedDate: purchaseOrderData.pdSignedDate,
                    shippingDate: purchaseOrderData.shippingDate,
                    totalQuantity: purchaseOrderData.totalQuantity,
                    notes: notes,
                },
            });

            if (statusChange) {
                await createActivityHistory({
                    documentID: purchaseOrder?.pk_purchase_order_id || 0,
                    activity: `Update Purchase Order #${purchaseOrder?.purchase_order_number} Status to ${statusText}`,
                    activityType: `Update`,
                    customerID: purchaseOrder?.customer.id || 0,
                    status: status,
                    documentType: `PurchaseOrders`,
                    userOwner: fullname,
                    tags: JSON.stringify({}),
                });
            } else {
                await createActivityHistory({
                    documentID: purchaseOrder?.pk_purchase_order_id || 0,
                    activity: `Update Purchase Order #${purchaseOrder?.purchase_order_number}`,
                    activityType: `Update`,
                    customerID: purchaseOrder?.customer.id || 0,
                    status: status,
                    documentType: `PurchaseOrders`,
                    userOwner: fullname,
                    tags: JSON.stringify({}),
                });
            }

            console.log(`Purchase order #${purchaseOrder?.purchase_order_number} updated successfully.`);
        } catch (error) {
            console.error("Error updating purchase order:", error);
            toast.error("Error updating purchase order.");
        } finally {
            return Promise.resolve();
        }
    }, [purchaseOrderData, statusChange, notes, isModifyFlag]);

    const handleUpdateBillingContact = React.useCallback(async () => {
        try {
            await updateContact({
                id: purchaseOrderBillingContact?.pk_contact_id || 0,
                data: {
                    firstname: billingValues.contactFirstname,
                    lastname: billingValues.contactLastname,
                    email: billingValues.contactEmail,
                    phoneNumber: billingValues.contactPhoneNumber,
                    mobileNumber: billingValues.contactMobileNumber,
                    positionTitle: billingValues.contactPositionTitle,
                },
            });
            
            await updateAddress({
                id: purchaseOrderBillingAddress?.pk_address_id || 0,
                data: {
                    address1: billingValues.addressLine1,
                    city: billingValues.city,
                    state: billingValues.state,
                    country: billingValues.country,
                    zip: billingValues.zip,
                },
            });
        } catch (error) {
            console.error("Error updating billing contact and address:", error);
            toast.error("Error updating billing contact and address.");
        } finally {
            setModifyBillingFlag(false);
        }
    }, [billingValues]);

    const handleUpdateShippingContact = React.useCallback(async () => {
        try {
            await updateContact({
                id: purchaseOrderShippingContact?.pk_contact_id || 0,
                data: {
                    firstname: shippingValues.contactFirstname,
                    lastname: shippingValues.contactLastname,
                    email: shippingValues.contactEmail,
                    phoneNumber: shippingValues.contactPhoneNumber,
                    mobileNumber: shippingValues.contactMobileNumber,
                    positionTitle: shippingValues.contactPositionTitle,
                },
            });

            await updateAddress({
                id: purchaseOrderShippingAddress?.pk_address_id || 0,
                data: {
                    address1: shippingValues.addressLine1,
                    city: shippingValues.city,
                    state: shippingValues.state,
                    country: shippingValues.country,
                    zip: shippingValues.zip,
                },
            });
        } catch (error) {
            console.error("Error updating shipping contact and address:", error);
            toast.error("Error updating shipping contact and address.");
        } finally {
            setModifyShippingFlag(false);
        }
    }, [shippingValues]);

    const handleUpdatePurchaseOrderItems = React.useCallback(async () => {
        try {
            const updatePOItems = purchaseOrderItems.filter(data => data.purchaseOrderItemID !== -1 && data.actionEdited);

            if (updatePOItems.length > 0) {
                await Promise.all(updatePOItems.map(async (item) => {
                    return updatePurchaseOrderItems.mutateAsync({
                        id: item.purchaseOrderItemID,
                        data: {
                            productID: item.productID,
                            itemSku: item.itemSku,
                            itemName: item.itemName,
                            itemDescription: item.itemDescription,
                            itemSpecifications: JSON.stringify(item.itemSpecifications),
                            itemNotes: item.itemNotes,
                            packagingInstructions: JSON.stringify(item.packagingInstructions),
                            quantity: item.quantity,
                            unitPrice: Number(item.unitPrice),
                            rate: 0,
                            currency: 'USD',
                        },
                    });
                }));
            }
        } catch (error) {
            console.error("Error updating purchase order items:", error);
            toast.error("Error updating purchase order items.");
        } finally {
            return Promise.resolve();
        } 
    }, [purchaseOrderItems]);

    const handleCreatePurchaseOrderItems = React.useCallback(async () => {
        try {
            const newPOItems = purchaseOrderItems.filter(data => data.purchaseOrderItemID === 0 && data.actionCreate);

            if (newPOItems.length > 0) {
                const createPromises = await Promise.all(newPOItems.map(async (item) => {
                    return createPurchaseOrderItems.mutateAsync({
                        purchaseOrderID: purchaseOrder?.pk_purchase_order_id || 0,
                        productID: item.productID,
                        itemSku: item.itemSku,
                        itemName: item.itemName,
                        itemDescription: item.itemDescription,
                        itemSpecifications: JSON.stringify(item.itemSpecifications),
                        itemNotes: item.itemNotes,
                        // packagingInstructions: JSON.stringify(item.packagingInstructions),
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        rate: 0,
                        currency: 'USD',
                    });
                }));

                // toast.success("Purchase order items created successfully.");
                console.log("Purchase order items created successfully.");

                let uploadedImages = [];
                const po_item_ids = createPromises.map(data => data.pk_purchase_order_item_id);

                for (let i = 0; i < newPOItems.length; i++) {
                    const data = newPOItems[i];

                    if (!data || !data.images || data.images.length === 0) continue;

                    const po_item_id = Number(po_item_ids[i]);

                    for (let j = 0; j < data.images.length; j++) {
                        const dataImage = data.images[j];
                        const imageType = dataImage.typeImage === Type.LOGO ? Type.LOGO :
                            (dataImage.typeImage === Type.ARTWORK ? Type.ARTWORK : Type.OTHER);

                        const createImageParams = {
                            fkItemID: po_item_id,
                            fkItemType: FKItemType.PURCHASE_ORDERS,
                            imageFile: dataImage,
                            description: dataImage.name || `Image ${j+1} for item #${po_item_id}`,
                            type: imageType
                        }

                        try {
                            // Attempt to upload with retry logic
                            const uploadedImage = await uploadSingleImage(createImageParams, createImage);

                            if (uploadedImage) {
                                uploadedImages.push(uploadedImage);
                            }

                        } catch (uploadError) {
                            console.error(`Failed to process image ${j+1} for purchase order item #${po_item_id}:`, uploadError);
                            toast.error(`Failed to process image ${j+1} for purchase order item #${po_item_id}`);
                        }
                    }
                }
            }

            setPurchaseOrderItems(prevState => prevState.map(data => {
                return { ...data, actionCreate: false };
            }));

        } catch (error) {
            console.error("Error creating purchase order items:", error);
            toast.error("Error creating purchase order items.");
            
        } finally {
            return Promise.resolve();
        } 
    }, [purchaseOrderItems]);

    const handleDeletePurchaseOrderItems = React.useCallback(async () => {
        try {
            if (deleteItems.length > 0) {
                await Promise.all(deleteItems.map(async (item) => {
                    return deletePurchaseOrderItem(item);
                }));

                console.log("Purchase order items deleted successfully.");
                setDeleteItems([]);
            }
        } catch (error) {
            console.error("Error deleting purchase order items:", error);
            toast.error("Error deleting purchase order items.");
        } finally {
            return Promise.resolve();
        }
    }, [purchaseOrderItems]);

    const handleUpdateClick = async () => {
        try {
            setIsSaving(true);

            if (!selectedCustomerID || selectedCustomerID <= 0) {
                toast.error("Please select a customer.");
                return;
            }

            if (!selectedVendorID || selectedVendorID <= 0) {
                toast.error("Please select a vendor.");
                return;
            }

            await handleUpdatePurchaseOrder();
            await handleCreatePurchaseOrderItems();
            await handleUpdatePurchaseOrderItems();
            await handleDeletePurchaseOrderItems();

            if (modifyBillingFlag) {
                await handleUpdateBillingContact();
            }

            if (modifyShippingFlag) {
                await handleUpdateShippingContact();
            }

            toast.success(`Purchase order #${purchaseOrder?.purchase_order_number} updated successfully.`);
            console.log(`Purchase order #${purchaseOrder?.purchase_order_number} updated successfully.`);
        } catch (error) {
            console.error("Error updating purchase order:", error);
            toast.error("Error updating purchase order.");
        } finally {
            setToggleRefetch(prevState => !prevState);
            setIsModifyFlag(false);
            setIsSaving(false);
            setStatusChange(false);
        }
    };

    const handleDeletePurchaseOrder = React.useCallback(async () => {
        try {
            for (const item of purchaseOrderItems) {
                await deletePurchaseOrderItem(item.purchaseOrderItemID);
            }

            await deletePurchaseOrder(Number(id));
            
            toast.success(`Purchase order #${purchaseOrder?.purchase_order_number} and order items ${purchaseOrderItems.map(item => item.purchaseOrderItemID).join(', ')} deleted successfully.`);
            console.log(`Purchase order #${purchaseOrder?.purchase_order_number} and order items ${purchaseOrderItems.map(item => item.purchaseOrderItemID).join(', ')} deleted successfully.`);
            
            router.push("/production/purchase-orders");
        } catch (error) {
            console.error("Error deleting purchase order:", error);
            toast.error("Error deleting purchase order.");
        }
    }, [purchaseOrderData, purchaseOrderItems]);
    
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
        if (purchaseOrder) {
            setSelectedCustomerID(purchaseOrder?.customer.id || 0);
            setSelectedVendorID(purchaseOrder?.vendor.id || 0);
            setStatus(Number(purchaseOrder.status.id));
            setNotes(purchaseOrder?.notes || '');
            setPurchaseOrderData({
                clientName: purchaseOrder?.client_name || '',
                clientDescription: purchaseOrder?.client_description || '',
                quoteApproveDate: purchaseOrder?.quote_approved_date || '',
                pdSignedDate: purchaseOrder?.pd_signed_date || '',
                shippingDate: purchaseOrder?.shipping_date || '',
                totalQuantity: purchaseOrder?.total_quantity || 0,
                userOwner: purchaseOrder?.user_owner || '',
                locationTypeId: purchaseOrder?.location_type.id || 0,
                priority: purchaseOrder?.priority || PurchaseOrderPriority.NORMAL,
            }); 
        }
    }, [purchaseOrder]);

    React.useEffect(() => {
        if (customerData) {
            setSelectedCustomer(customerData);
        }
    }, [customerData]);
    
    React.useEffect(() => {
        if (vendorData) {
            setSelectedVendor(vendorData);
        }
    }, [vendorData]);

    React.useEffect(() => {
        if (purchaseOrderBillingAddress || purchaseOrderBillingContact) {
            setBillingValues({
                contactFirstname: purchaseOrderBillingContact?.first_name || '',
                contactLastname: purchaseOrderBillingContact?.last_name || '',
                contactEmail: purchaseOrderBillingContact?.email || '',
                contactPhoneNumber: purchaseOrderBillingContact?.phone_number || '',
                contactMobileNumber: purchaseOrderBillingContact?.mobile_number || '',
                contactPositionTitle: purchaseOrderBillingContact?.position_title || '',
                addressLine1: purchaseOrderBillingAddress?.address1 || '',
                city: purchaseOrderBillingAddress?.city || '',
                state: purchaseOrderBillingAddress?.state || '',
                country: purchaseOrderBillingAddress?.country || '',
                zip: purchaseOrderBillingAddress?.zip || '',
            });
        }

        if (purchaseOrderShippingAddress || purchaseOrderShippingContact) {
            setShippingValues({
                contactFirstname: purchaseOrderShippingContact?.first_name || '',
                contactLastname: purchaseOrderShippingContact?.last_name || '',
                contactEmail: purchaseOrderShippingContact?.email || '',
                contactPhoneNumber: purchaseOrderShippingContact?.phone_number || '',
                contactMobileNumber: purchaseOrderShippingContact?.mobile_number || '',
                contactPositionTitle: purchaseOrderShippingContact?.position_title || '',
                addressLine1: purchaseOrderShippingAddress?.address1 || '',  
                city: purchaseOrderShippingAddress?.city || '',
                state: purchaseOrderShippingAddress?.state || '',
                country: purchaseOrderShippingAddress?.country || '',
                zip: purchaseOrderShippingAddress?.zip || '',
            });
        }
    }, [
        purchaseOrderBillingContact, 
        purchaseOrderShippingContact, 
        purchaseOrderBillingAddress, 
        purchaseOrderShippingAddress,
        purchaseOrder,
    ]);

    React.useEffect(() => {
        if (purchaseOrderItemsData) {
            setPurchaseOrderItems(prevItems => {
                // Create a map of existing images by item ID
                const existingImages = new Map();
                prevItems.forEach(item => {
                    if (item.images && item.images.length > 0) {
                        existingImages.set(item.purchaseOrderItemID, {
                            images: item.images,
                            imagesLoaded: item.imagesLoaded
                        });
                    }
                });

                return purchaseOrderItemsData.items.map(item => {
                    const existingImageData = existingImages.get(item.pk_purchase_order_item_id);
                    
                    return {
                        purchaseOrderItemID: item.pk_purchase_order_item_id,
                        purchaseOrderID: item.fk_purchase_order_id,
                        categoryID: item.product.category.id,
                        categoryName: item.product.category.name,
                        productID: item.product.id,
                        itemNumber: item.item_number,
                        itemSku: item.item_sku,
                        itemName: item.item_name,
                        itemDescription: item.item_description,
                        itemSpecifications: typeof item.item_specifications === 'string' 
                            ? JSON.parse(item.item_specifications)
                            : Array.isArray(item.item_specifications) 
                                ? item.item_specifications
                                : Object.entries(item.item_specifications || {}).map(([key, value]) => ({ key, value: String(value) })),
                        itemNotes: item.item_notes,
                        packagingInstructions: typeof item.packaging_instructions === 'string' 
                            ? item.packaging_instructions
                            : JSON.stringify(item.packaging_instructions),
                        quantity: item.quantity,
                        unitPrice: item.unit_price,
                        total: item.line_total,
                        rate: item.rate,
                        images: existingImageData?.images || [],
                        imagesLoaded: existingImageData?.imagesLoaded || false,
                        actionCreate: false,
                        actionModify: false,
                        actionEdited: false,
                        errorState: [],
                        modifyList: [],
                    };
                });
            });
        }
    }, [purchaseOrderItemsData]);

    React.useEffect(() => {
        if (purchaseOrderItems) {
            setPurchaseOrderSummary({
                addedQuantity: purchaseOrderItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0),
                addedUnitPrice: purchaseOrderItems.reduce((acc, item) => acc + Number(item.unitPrice || 0), 0),
                addedTaxRate: 0.08,
                addedLineTotal: purchaseOrderItems.reduce((acc, item) => acc + Number(item.total || 0), 0),
                paid: 0,
            });
        }
    }, [purchaseOrderItems]);

    React.useEffect(() => {
        if (purchaseOrderItems && purchaseOrderItems.length > 0 && currentImageFetchIndex < purchaseOrderItems.length) {
          const currentItem = purchaseOrderItems[currentImageFetchIndex];

          if (currentItem?.purchaseOrderItemID && currentItem.purchaseOrderItemID > 0) {
            setFKPurchaseOrderItemID(currentItem.purchaseOrderItemID);
          }
        }
    }, [purchaseOrderItems, currentImageFetchIndex]);

    React.useEffect(() => {
        if (fkPurchaseOrderItemID > 0) {
            const currentItem = purchaseOrderItems.find(item => item.purchaseOrderItemID === fkPurchaseOrderItemID);

            // Skip if item already has images loaded
            if (currentItem?.imagesLoaded) {
                setTimeout(() => {
                    setCurrentImageFetchIndex(prevIndex => {
                        const nextIndex = prevIndex + 1;
                        return nextIndex >= purchaseOrderItems.length ? prevIndex : nextIndex;
                    });
                }, 100);
                return;
            }

            // Don't process if still loading
            if (isLoadingPurchaseOrderItemsImage) {
                return;
            }

            // Handle error case first
            if (errorPurchaseOrderItemsImage) {
                const currentRetryCount = retryCount[fkPurchaseOrderItemID] || 0;
                
                if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
                    setRetryCount(prev => ({ 
                        ...prev, 
                        [fkPurchaseOrderItemID]: currentRetryCount + 1 
                    }));
                    
                    setTimeout(() => {
                        console.warn(`Retrying image fetch for item ${fkPurchaseOrderItemID} due to error. Attempt ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
                        refetchPurchaseOrderItemsImage();
                    }, RETRY_DELAY);
                } else {
                    // Max retries reached, mark as failed and move to next
                    console.error(`Failed to fetch images for item ${fkPurchaseOrderItemID} after ${MAX_RETRY_ATTEMPTS} attempts`);
                    setPurchaseOrderItems(prevItems =>
                        prevItems.map(item =>
                            item.purchaseOrderItemID === fkPurchaseOrderItemID
                                ? { ...item, imagesLoaded: true, images: [] }
                                : item
                        )
                    );
                    
                    setTimeout(() => {
                        setCurrentImageFetchIndex(prevIndex => {
                            const nextIndex = prevIndex + 1;
                            return nextIndex >= purchaseOrderItems.length ? prevIndex : nextIndex;
                        });
                    }, 500);
                }
                return;
            }

            // Handle successful response - CRITICAL: Validate the response matches current item
            if (dataPurchaseOrderItemsImage !== undefined) {
                // Validate that the response is for the current item ID
                const responseMatchesCurrentItem = dataPurchaseOrderItemsImage?.items?.some(img => 
                    img.fk_item_id === fkPurchaseOrderItemID
                ) || dataPurchaseOrderItemsImage?.items?.length === 0;

                if (!responseMatchesCurrentItem) {
                    console.warn(`Received images for different item. Expected: ${fkPurchaseOrderItemID}, got images for other items. Ignoring response.`);
                    return;
                }

                // Check if data is empty and should retry
                if (!dataPurchaseOrderItemsImage?.items || dataPurchaseOrderItemsImage.items.length === 0) {
                    const currentRetryCount = retryCount[fkPurchaseOrderItemID] || 0;
                    
                    if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
                        setRetryCount(prev => ({ 
                            ...prev, 
                            [fkPurchaseOrderItemID]: currentRetryCount + 1 
                        }));
                        
                        setTimeout(() => {
                            console.warn(`Retrying image fetch for item ${fkPurchaseOrderItemID} due to empty response. Attempt ${currentRetryCount + 1}/${MAX_RETRY_ATTEMPTS}`);
                            refetchPurchaseOrderItemsImage();
                        }, RETRY_DELAY);
                    } else {
                        // Max retries reached, mark as no images and move to next
                        console.info(`No images found for item ${fkPurchaseOrderItemID} after ${MAX_RETRY_ATTEMPTS} attempts`);
                        setPurchaseOrderItems(prevItems =>
                            prevItems.map(item =>
                                item.purchaseOrderItemID === fkPurchaseOrderItemID
                                    ? { ...item, imagesLoaded: true, images: [] }
                                    : item
                            )
                        );
                        
                        setTimeout(() => {
                            setCurrentImageFetchIndex(prevIndex => {
                                const nextIndex = prevIndex + 1;
                                return nextIndex >= purchaseOrderItems.length ? prevIndex : nextIndex;
                            });
                        }, 500);
                    }
                } else {
                    // Success: Update item with images and move to next
                    setRetryCount(prev => ({ ...prev, [fkPurchaseOrderItemID]: 0 }));
                    
                    setPurchaseOrderItems(prevItems =>
                        prevItems.map(item =>
                            item.purchaseOrderItemID === fkPurchaseOrderItemID
                                ? {
                                    ...item,
                                    images: convertImageGalleryToExtendedFile(dataPurchaseOrderItemsImage.items),
                                    imagesLoaded: true
                                }
                                : item
                        )
                    );

                    setTimeout(() => {
                        setCurrentImageFetchIndex(prevIndex => {
                            const nextIndex = prevIndex + 1;
                            return nextIndex >= purchaseOrderItems.length ? prevIndex : nextIndex;
                        });
                    }, 500);
                }
            }
        }
    }, [
        dataPurchaseOrderItemsImage, 
        errorPurchaseOrderItemsImage, 
        isLoadingPurchaseOrderItemsImage, 
        fkPurchaseOrderItemID, 
        purchaseOrderItems, 
        retryCount, 
        refetchPurchaseOrderItemsImage
    ]);

    // Show skeleton while loading
    if (isLoadingPurchaseOrder) {
        return <PurchaseOrderDetailsSkeleton />;
    }

    return (
        <div className="space-y-6">
            <PurchaseOrderDetailsHeaders
                add={false}
                status={status}
                setStatus={setStatus}
                setStatusText={setStatusText}
                handleUpdateClick={handleUpdateClick}
                isSaving={isSaving}
                modifyFlag={isModifyFlag || modifyBillingFlag || modifyShippingFlag}
                setModifyFlag={setIsModifyFlag}
                handleDeleteOrder={handleDeletePurchaseOrder}
                setStatusChange={setStatusChange}
            />

            {/* Quote Info */}
            <InfoBox
                title={`Purchase Order #${purchaseOrder?.purchase_order_number}`}
                subtitle={
                <div className="flex flex-col gap-0 pl-6">
                    <div className="flex flex-row gap-x-2">
                        <p className="text-sm text-blue-500">Created at {infoBoxFormatDate(purchaseOrder?.created_at || "")}</p>
                        <p className="text-sm text-blue-500">{`|`}</p>
                        <p className="text-sm text-blue-500"> Created by {purchaseOrder?.user_owner}</p>
                    </div>
                    <p className="text-sm text-blue-500 hidden">Updated At {infoBoxFormatDate(purchaseOrder?.updated_at || "")}</p>
                    {purchaseOrder?.serial_encoder.order_id && orderDetailsData &&
                        <Link href={`/crm/orders/${purchaseOrder?.serial_encoder.order_id}`}>
                            <p className="text-sm text-blue-500 hover:underline">{`Converted from Order #${orderDetailsData?.order_number}`}</p>
                        </Link>
                    }
                    {purchaseOrder?.serial_encoder.quote_id && quoteDetailsData &&
                        <Link href={`/crm/quotes/${purchaseOrder?.serial_encoder.quote_id}`}>
                            <p className="text-sm text-blue-500 hover:underline">{`Converted from Quote #${quoteDetailsData.quote_number}`}</p>
                        </Link>
                    }

                    {purchaseOrder?.serial_encoder.invoice_ids && 
                        purchaseOrder
                            .serial_encoder
                            .invoice_ids
                            .filter((data) => data !== purchaseOrder.pk_purchase_order_id)
                            .length > 0 && (
                      <div className="flex flex-col gap-y-0">
                        <p className="text-sm text-blue-500">Other Invoices:</p>
                        {purchaseOrder.serial_encoder.invoice_ids
                          .filter((data) => data !== purchaseOrder.pk_purchase_order_id)
                          .map((data, index) => (
                            <Link href={`/crm/invoices/${data}`} key={index}>
                              <p className="text-sm text-blue-500 ml-2">Invoice #{data}</p>
                            </Link>
                        ))}
                      </div>
                    )}
                    {purchaseOrder?.serial_encoder.purchase_order_ids && 
                        purchaseOrder
                            .serial_encoder
                            .purchase_order_ids
                            .filter((data) => data !== purchaseOrder.pk_purchase_order_id)
                            .length > 0 && (
                      <div className="flex flex-col gap-y-0">
                        <p className="text-sm text-blue-500">Other Purchase Orders:</p>
                        {purchaseOrder.serial_encoder.purchase_order_ids
                            .filter((data) => data !== purchaseOrder.pk_purchase_order_id)
                            .map((data, index) => (
                          <Link href={`/production/purchase-orders/${data}`} key={index}>
                            <p className="text-sm text-blue-500 ml-2">Purchase Order #{data}</p>
                          </Link>
                        ))}
                      </div>
                    )}
                </div>}
            />

            {orgData && (
                <CompanyInfo orgData={orgData} orgLoading={orgLoading} />
            )}

            <div className="flex flex-row gap-2 flex-wrap">
                <CustomerSelectDetailsCard 
                    selectedCustomer={selectedCustomer}
                    showSearch={showCustomerSearch}
                    onShowSearchChange={setShowCustomerSearch}
                    onCustomerSelect={handleCustomerSelect}
                    onClearSelection={clearCustomerSelection}
                    customerAddress={customerBillingAddress}
                    setModifyFlag={setIsModifyFlag}
                />
                <VendorSelectDetailsCard 
                    selectedVendor={selectedVendor}
                    showSearch={showVendorSearch}
                    onShowSearchChange={setShowVendorSearch}
                    onVendorSelect={setSelectedVendor}
                    onClearSelection={() => setSelectedVendor(null)}
                    vendorAddress={vendorBillingAddress}
                    setModifyFlag={setIsModifyFlag}
                />
            </div>

            <VendorContent
                addMode={false}
                customerID={selectedCustomerID}
                purchaseOrderData={purchaseOrderData}
                setPurchaseOrderData={setPurchaseOrderData}
                billingValues={billingValues}
                setBillingValues={setBillingValues}
                shippingValues={shippingValues}
                setShippingValues={setShippingValues}
                notes={notes}
                setNotes={setNotes}
                setModifyFlag={setIsModifyFlag}
                setModifyBillingFlag={setModifyBillingFlag}
                setModifyShippingFlag={setModifyShippingFlag}
            />    

            <POVendorsItemsTable
                poVendorsItems={purchaseOrderItems}
                setPoVendorsItems={setPurchaseOrderItems}
                setModifyFlag={setIsModifyFlag}
                setDeletedPoItems={setDeleteItems}
            />

            <ItemsSummary
                addedQuantity={purchaseOrderSummary.addedQuantity}
                addedUnitPrice={purchaseOrderSummary.addedUnitPrice}
                addedTaxRate={purchaseOrderSummary.addedTaxRate}
                addedLineTotal={purchaseOrderSummary.addedLineTotal}
                paid={purchaseOrderSummary.paid}
            />

            <ActivityHistory
                documentID={Number(id)}
                toggleRefetch={toggleRefetch}
            />
        </div>
    );
};

export default PurchaseOrderDetails;
