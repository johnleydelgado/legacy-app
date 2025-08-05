import {ExtendedFile} from "../../quotes-details/sections/image-upload-dropzone";

export interface TableOrdersItems {
    ordersItemsID: number;
    quotesItemsID?: number;
    orderID: number;
    categoryID: number;
    categoryName: string;
    productID: number;
    itemNumber: string;
    itemName: string;
    itemDescription: string;
    images?: ExtendedFile[];
    imagesLoaded?: boolean;
    packagingID: number;
    packagingName: string;
    trimID: number;
    trimName: string;
    yarnID: number;
    yarnName: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    total: number;
    actionCreate: boolean;
    actionModify: boolean;
    actionEdited: boolean;
    errorState: string[];
    modifyList?: string[];
}
