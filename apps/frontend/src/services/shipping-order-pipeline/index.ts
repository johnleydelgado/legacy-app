// services/shipping-order-pipeline/index.ts

import { toast } from "sonner";
import {
  CreateShippingOrderRequest,
  ShippingOrderTypes,
} from "../shipping-orders/types";
import {
  CreateShippingOrderItemRequest,
  ShippingOrderItem,
} from "../shipping-order-items/types";
import {
  CreateShippingPackageSpecificationsRequest,
  UpdateShippingPackageSpecificationsRequest,
} from "../shipping-package-specifications/types";

// Types
export interface ShippingPipelineData {
  customerID: number;
  shippingStatus: number;
  shippingData: any;
  shippingItems: any[];
  packages: any[];
  taxRate: number;
  fullname: string;
  orderID?: number; // NEW - for linking to source order
  calculateShippingOrderTotals: {
    subtotal: number;
    tax: number;
    shipping: number;
    total: number;
  };
}

export interface PipelineHooks {
  createShippingOrder: any;
  createShippingOrderItem: any;
  createShippingPackageSpecification: any;
  createShippingPackageSpecItem: any;
  createActivityHistory: any;
  createImage: any;
  createImageFromUrl: any;
  deleteShippingOrder: any;
  deleteShippingOrderItem: any;
  deleteShippingPackageSpecification: any;
  deleteShippingPackageSpecItem: any;
}

export interface CreatedEntities {
  shippingOrder: any;
  shippingOrderItems: any[];
  packageSpecifications: any[];
  packageSpecItems: any[];
  uploadedImages: any[];
}

// Validation function
export const validatePackageAssignments = (
  data: ShippingPipelineData
): void => {
  if (data.packages.length === 0) {
    return; // No packages to validate
  }

  // Check if any packages have no items assigned
  const packagesWithNoItems = data.packages.filter((pkg) => {
    const itemsInPackage = data.shippingItems.filter(
      (item) => item.packageQuantities?.[pkg.id]
    );
    return itemsInPackage.length === 0;
  });

  if (packagesWithNoItems.length > 0) {
    const packageNames = packagesWithNoItems.map((pkg) => pkg.name).join(", ");
    throw new Error(
      `The following packages have no items assigned: ${packageNames}. Please assign items to all packages or remove empty packages.`
    );
  }
};

// Step 1: Create Shipping Order
export const createShippingOrderStep = async (
  data: ShippingPipelineData,
  hooks: PipelineHooks
): Promise<any> => {
  console.log("🚀 Step 1: Creating shipping order...");

  const shippingOrderData: CreateShippingOrderRequest = {
    customerID: data.customerID,
    statusID: data.shippingStatus,
    orderID: data.orderID, // NEW - link to source order if present
    // shippingOrderNumber removed - backend auto-generates from serial encoder
    orderDate: new Date().toISOString().split("T")[0],
    expectedShipDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    subtotal: data.calculateShippingOrderTotals.subtotal,
    taxTotal: data.calculateShippingOrderTotals.tax,
    currency: "USD",
    notes: "",
    terms: "",
    tags: {},
    userOwner: data.fullname || "Undefined User",
  };

  try {
    const createdShippingOrder = await hooks.createShippingOrder.mutateAsync(
      shippingOrderData
    );

    console.log(
      `✅ Shipping Order #${createdShippingOrder.shipping_order_number} created successfully`
    );

    return createdShippingOrder;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create shipping order:", error);
    throw new Error(`Failed to create shipping order: ${errorMessage}`);
  }
};

// Step 2: Create Shipping Order Items
export const createShippingOrderItemsStep = async (
  data: ShippingPipelineData,
  shippingOrder: any,
  hooks: PipelineHooks,
  createdEntities: CreatedEntities
): Promise<any[]> => {
  if (data.shippingItems.length === 0) {
    return [];
  }

  console.log(
    `🚀 Step 3: Creating ${data.shippingItems.length} shipping order items...`
  );

  // Debug logging
  console.log("📦 Debug - Packages data:", data.packages);
  console.log(
    "📦 Debug - Created package specifications:",
    createdEntities.packageSpecifications
  );
  console.log(
    "📦 Debug - Shipping items with package quantities:",
    data.shippingItems.map((item) => ({
      itemName: item.item_name,
      packageQuantities: item.packageQuantities,
    }))
  );

  try {
    const createPromises = await Promise.all(
      data.shippingItems.map(async (item) => {
        // Map the temporary package ID to the actual created package ID
        const packageSpec = data.packages.find((p) => p.id === item.packageID);
        const packageIndex = packageSpec
          ? data.packages.indexOf(packageSpec)
          : -1;
        const createdPackage =
          packageIndex >= 0
            ? createdEntities.packageSpecifications[packageIndex]
            : null;

        console.log(`🔍 Debug - Item "${item.item_name}":`, {
          itemPackageID: item.packageID,
          foundPackageSpec: packageSpec,
          packageIndex,
          createdPackage: createdPackage?.pk_shipping_package_spec_id,
        });

        const createData: CreateShippingOrderItemRequest = {
          fkShippingOrderID: shippingOrder.pk_shipping_order_id,
          fkProductID: item.productID ? Number(item.productID) : undefined,
          fkTrimID: item.trimsID ? Number(item.trimsID) : undefined,
          fkYarnID: item.yarnID ? Number(item.yarnID) : undefined,
          fkPackagingID: item.packagingID
            ? Number(item.packagingID)
            : undefined,
          itemNumber:
            item.itemNumber ||
            `SO-ITEM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          itemName: item.item_name,
          itemDescription: item.item_description || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price),
          taxRate: Number(data.taxRate),
        };

        console.log(`📝 Debug - Creating item with data:`, createData);

        return hooks.createShippingOrderItem.mutateAsync(createData);
      })
    );

    console.log(
      `✅ Created ${createPromises.length} shipping order items successfully`
    );

    return createPromises;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create shipping order items:", error);
    throw new Error(`Failed to create shipping order items: ${errorMessage}`);
  }
};

// Step 3: Create Package Specifications
export const createPackageSpecificationsStep = async (
  data: ShippingPipelineData,
  shippingOrder: any,
  shippingOrderItems: any[], // Keep parameter for backward compatibility
  hooks: PipelineHooks,
  labelResults?: Map<number, any> // Add label results parameter
): Promise<any[]> => {
  if (data.packages.length === 0) {
    return [];
  }

  console.log(
    `🚀 Step 2: Creating ${data.packages.length} package specifications...`
  );

  // Debug logging
  console.log("📦 Debug - Package specifications to create:", data.packages);

  try {
    const packagePromises = await Promise.all(
      data.packages.map(async (packageSpec) => {
        // Get label data for this package if available
        const labelData = labelResults?.get(packageSpec.id);

        const packageData: CreateShippingPackageSpecificationsRequest = {
          fkShippingOrderId: shippingOrder.pk_shipping_order_id,
          name: packageSpec.name,
          companyName: packageSpec.company_name,
          phoneNumber: packageSpec.phone_number,
          length: packageSpec.length,
          width: packageSpec.width,
          height: packageSpec.height,
          weight: packageSpec.weight,
          measurementUnit: packageSpec.measurement_unit,
          // Preset ID fields
          fkDimensionPresetId: packageSpec.fk_dimension_preset_id,
          fkWeightPresetId: packageSpec.fk_weight_preset_id,
          address: packageSpec.address,
          city: packageSpec.city,
          state: packageSpec.state,
          zip: packageSpec.zip,
          country: packageSpec.country,
          // Shipping rate fields
          carrier: packageSpec.carrier,
          service: packageSpec.service,
          carrierDescription: packageSpec.carrier_description,
          shippingRateId: packageSpec.shipping_rate_id,
          easypostShipmentId: packageSpec.easypost_shipment_id,
          easypostShipmentRateId: packageSpec.easypost_shipment_rate_id,
          // Label data from EasyPost
          trackingCode: labelData?.trackingCode || packageSpec.tracking_code,
          labelUrl: labelData?.labelUrl || packageSpec.label_url,
          shipmentStatus:
            labelData?.shipmentStatus || packageSpec.shipment_status,
          estimatedDeliveryDays: packageSpec.estimated_delivery_days,
        };

        console.log(
          `📦 Debug - Creating package "${packageSpec.name}" with data:`,
          packageData
        );

        const createdPackage =
          await hooks.createShippingPackageSpecification.mutateAsync(
            packageData
          );

        console.log(
          `📦 Debug - Created package "${packageSpec.name}" with ID:`,
          createdPackage.pk_shipping_package_spec_id
        );

        return createdPackage;
      })
    );

    console.log(
      `✅ Created ${packagePromises.length} package specifications successfully`
    );

    return packagePromises;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create package specifications:", error);
    throw new Error(`Failed to create package specifications: ${errorMessage}`);
  }
};

// Step 4: Create Package Spec Items
export const createPackageSpecItemsStep = async (
  data: ShippingPipelineData,
  shippingOrder: any,
  shippingOrderItems: any[],
  createdEntities: CreatedEntities,
  hooks: PipelineHooks
): Promise<any[]> => {
  console.log("🚀 Step 4: Creating package spec items...");

  const packageSpecItems: any[] = [];

  try {
    // For each package specification, create package spec items for assigned items
    for (const packageSpec of data.packages) {
      const createdPackage = createdEntities.packageSpecifications.find(
        (p) => p.name === packageSpec.name
      );

      if (!createdPackage) {
        console.warn(
          `⚠️ Package specification not found for ${packageSpec.name}`
        );
        continue;
      }

      // Find items assigned to this package
      const assignedItems = data.shippingItems.filter(
        (item) => item.packageQuantities?.[packageSpec.id]
      );

      for (const item of assignedItems) {
        const createdItem = shippingOrderItems.find(
          (createdItem) => createdItem.item_name === item.item_name
        );

        if (!createdItem) {
          console.warn(
            `⚠️ Shipping order item not found for ${item.item_name}`
          );
          continue;
        }

        const quantity = item.packageQuantities?.[packageSpec.id] || 1;

        const packageSpecItemData = {
          fkShippingPackageSpecId: createdPackage.pk_shipping_package_spec_id,
          fkShippingOrderItemId: createdItem.pk_shipping_order_item_id,
          qty: quantity,
        };

        console.log(
          `📦 Debug - Creating package spec item for "${item.item_name}" with data:`,
          packageSpecItemData
        );

        const createdPackageSpecItem =
          await hooks.createShippingPackageSpecItem.mutateAsync(
            packageSpecItemData
          );

        console.log(
          `📦 Debug - Created package spec item with ID:`,
          createdPackageSpecItem.pk_sp_item_id
        );

        packageSpecItems.push(createdPackageSpecItem);
      }
    }

    console.log(
      `✅ Created ${packageSpecItems.length} package spec items successfully`
    );

    return packageSpecItems;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to create package spec items:", error);
    throw new Error(`Failed to create package spec items: ${errorMessage}`);
  }
};

// Step 5: Process Images (Non-critical)
export const processImagesStep = async (
  data: ShippingPipelineData,
  shippingOrder: any,
  shippingOrderItems: any[],
  hooks: PipelineHooks,
  uploadSingleImage: any,
  Type: any,
  FKItemType: any
): Promise<any[]> => {
  console.log("🚀 Step 4: Processing images...");

  const uploadedImages: any[] = [];
  const shipping_order_item_ids = shippingOrderItems.map(
    (item) => item.pk_shipping_order_item_id
  );

  for (let i = 0; i < data.shippingItems.length; i++) {
    const itemData = data.shippingItems[i];
    if (!itemData || !itemData.images || itemData.images.length === 0) continue;

    const shipping_order_item_id = Number(shipping_order_item_ids[i]);

    for (let j = 0; j < itemData.images.length; j++) {
      const dataImage = itemData.images[j];
      const imageType =
        dataImage.typeImage === Type.LOGO
          ? Type.LOGO
          : dataImage.typeImage === Type.ARTWORK
          ? Type.ARTWORK
          : Type.OTHER;

      try {
        let uploadedImage = null;

        // Check if this is a File object (new upload) or ExtendedFile (already uploaded)
        const isFile = dataImage instanceof File;

        if (isFile) {
          // Use uploadSingleImage for File objects
          const createImageParams = {
            fkItemID: shipping_order_item_id,
            fkItemType: FKItemType.SHIPPING,
            imageFile: dataImage,
            description:
              dataImage.name ||
              `Image ${j + 1} for item #${shipping_order_item_id}`,
            type: imageType,
          };

          uploadedImage = await uploadSingleImage(
            createImageParams,
            hooks.createImage
          );
        } else {
          // Use createImageFromUrl for already uploaded images (ExtendedFile objects)
          const imageUrl =
            dataImage.preview || dataImage.url || dataImage.image_url || "";
          const imageName =
            dataImage.name ||
            dataImage.filename ||
            `Image ${j + 1} for item #${shipping_order_item_id}`;

          // Call createImageFromUrl directly since it's not a mutation hook
          uploadedImage = await hooks.createImageFromUrl({
            url: imageUrl,
            fkItemID: shipping_order_item_id,
            fkItemType: FKItemType.SHIPPING,
            description: imageName,
            type: imageType,
          });
        }

        if (uploadedImage) {
          uploadedImages.push(uploadedImage);
        }
      } catch (uploadError) {
        console.error(
          `⚠️ Failed to process image ${
            j + 1
          } for shipping order item #${shipping_order_item_id}:`,
          uploadError
        );
        // Don't throw error for image failures - they're not critical
      }
    }
  }

  console.log(
    `✅ Upload process completed: ${uploadedImages.length} images successfully uploaded`
  );

  if (uploadedImages.length > 0) {
    // Images uploaded successfully
  }

  return uploadedImages;
};

// Step 5: Create Activity History (Non-critical)
export const createActivityHistoryStep = async (
  data: ShippingPipelineData,
  createdEntities: CreatedEntities,
  hooks: PipelineHooks
): Promise<void> => {
  console.log("🚀 Step 5: Creating activity history...");

  try {
    await hooks.createActivityHistory.mutateAsync({
      customerID: data.customerID,
      status: data.shippingStatus,
      tags: "",
      activity: `Created new Shipping Order #${createdEntities.shippingOrder.shipping_order_number} with ${createdEntities.shippingOrderItems.length} items, ${createdEntities.packageSpecifications.length} packages, and ${createdEntities.uploadedImages.length} images`,
      activityType: `Create`,
      documentID: createdEntities.shippingOrder.pk_shipping_order_id,
      documentType: "Shipping",
      userOwner: data.fullname || "Undefined User",
    });

    console.log("✅ Activity history created successfully");
  } catch (activityError) {
    console.error(
      "⚠️ Failed to create activity history (non-critical):",
      activityError
    );
    // Activity history failure is non-critical, don't throw
  }
};

// Step 2.5: Buy Labels for Packages with Shipping Rates
export const buyLabelsStep = async (
  data: ShippingPipelineData,
  hooks: PipelineHooks
): Promise<Map<number, any>> => {
  console.log("🚀 Step 2.5: Buying labels for packages with shipping rates...");

  const labelResults = new Map<number, any>();
  const packagesWithRates = data.packages.filter(
    (pkg) => pkg.easypost_shipment_id && pkg.easypost_shipment_rate_id
  );

  if (packagesWithRates.length === 0) {
    console.log("ℹ️ No packages with shipping rates to buy labels for");
    return labelResults;
  }

  try {
    const buyLabelPromises = packagesWithRates.map(async (pkg) => {
      try {
        console.log(
          `🏷️ Buying label for package "${pkg.name}" with shipment ID: ${pkg.easypost_shipment_id}`
        );

        // Import the EasyPost service dynamically to avoid circular dependencies
        const { easyPostService } = await import("../easypost");

        const labelData = await easyPostService.buyLabel(
          pkg.easypost_shipment_id,
          pkg.easypost_shipment_rate_id
        );

        console.log(
          `✅ Successfully bought label for package "${pkg.name}":`,
          labelData
        );

        // Store the label data with the package ID as key
        labelResults.set(pkg.id, {
          ...labelData,
          packageName: pkg.name,
        });

        return { packageId: pkg.id, labelData };
      } catch (error) {
        console.error(
          `❌ Failed to buy label for package "${pkg.name}":`,
          error
        );
        throw new Error(
          `Failed to buy label for package "${pkg.name}": ${
            error instanceof Error ? error.message : String(error)
          }`
        );
      }
    });

    await Promise.all(buyLabelPromises);

    console.log(`✅ Successfully bought ${labelResults.size} labels`);

    return labelResults;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("❌ Failed to buy labels:", error);
    throw new Error(`Failed to buy labels: ${errorMessage}`);
  }
};

// Rollback Logic
export const rollbackCreatedEntities = async (
  createdEntities: CreatedEntities,
  hooks: PipelineHooks
): Promise<string[]> => {
  console.log("🔄 Starting rollback process...");
  const rollbackErrors: string[] = [];

  // Step 3: Delete shipping order items (if any were created)
  if (createdEntities.shippingOrderItems.length > 0) {
    console.log(
      `🔄 Rolling back ${createdEntities.shippingOrderItems.length} shipping order items...`
    );

    for (const item of createdEntities.shippingOrderItems) {
      try {
        await hooks.deleteShippingOrderItem.mutateAsync(
          item.pk_shipping_order_item_id
        );
        console.log(`✅ Deleted shipping order item: ${item.item_name}`);
      } catch (rollbackError) {
        console.error(
          `❌ Failed to delete shipping order item ${item.item_name}:`,
          rollbackError
        );
        rollbackErrors.push(
          `Failed to delete shipping order item ${item.item_name}`
        );
      }
    }
  }

  // Step 1: Delete package spec items (if any were created)
  if (createdEntities.packageSpecItems.length > 0) {
    console.log(
      `🔄 Rolling back ${createdEntities.packageSpecItems.length} package spec items...`
    );

    for (const packageSpecItem of createdEntities.packageSpecItems) {
      try {
        await hooks.deleteShippingPackageSpecItem.mutateAsync(
          packageSpecItem.pk_sp_item_id
        );
        console.log(
          `✅ Deleted package spec item: ${packageSpecItem.pk_sp_item_id}`
        );
      } catch (rollbackError) {
        console.error(
          `❌ Failed to delete package spec item ${packageSpecItem.pk_sp_item_id}:`,
          rollbackError
        );
        rollbackErrors.push(
          `Failed to delete package spec item ${packageSpecItem.pk_sp_item_id}`
        );
      }
    }
  }

  // Step 2: Delete package specifications (if any were created)
  if (createdEntities.packageSpecifications.length > 0) {
    console.log(
      `🔄 Rolling back ${createdEntities.packageSpecifications.length} package specifications...`
    );

    for (const packageSpec of createdEntities.packageSpecifications) {
      try {
        await hooks.deleteShippingPackageSpecification.mutateAsync(
          packageSpec.pk_shipping_package_spec_id
        );
        console.log(`✅ Deleted package specification: ${packageSpec.name}`);
      } catch (rollbackError) {
        console.error(
          `❌ Failed to delete package specification ${packageSpec.name}:`,
          rollbackError
        );
        rollbackErrors.push(
          `Failed to delete package specification ${packageSpec.name}`
        );
      }
    }
  }

  // Step 2: Delete shipping order (if it was created)
  if (createdEntities.shippingOrder) {
    console.log(
      `🔄 Rolling back shipping order #${createdEntities.shippingOrder.shipping_order_number}...`
    );

    try {
      await hooks.deleteShippingOrder.mutateAsync(
        createdEntities.shippingOrder.pk_shipping_order_id
      );
      console.log(
        `✅ Deleted shipping order: ${createdEntities.shippingOrder.shipping_order_number}`
      );
    } catch (rollbackError) {
      console.error(
        `❌ Failed to delete shipping order ${createdEntities.shippingOrder.shipping_order_number}:`,
        rollbackError
      );
      rollbackErrors.push(
        `Failed to delete shipping order ${createdEntities.shippingOrder.shipping_order_number}`
      );
    }
  }

  return rollbackErrors;
};

// Main Pipeline Orchestrator
export const executeShippingOrderPipeline = async (
  data: ShippingPipelineData,
  hooks: PipelineHooks,
  uploadSingleImage: any,
  Type: any,
  FKItemType: any
): Promise<any> => {
  const createdEntities: CreatedEntities = {
    shippingOrder: null,
    shippingOrderItems: [],
    packageSpecifications: [],
    packageSpecItems: [],
    uploadedImages: [],
  };

  try {
    // Validate package assignments before creating anything
    validatePackageAssignments(data);

    // Step 1: Create Shipping Order
    createdEntities.shippingOrder = await createShippingOrderStep(data, hooks);

    // Step 2: Buy Labels for Packages with Shipping Rates
    const labelResults = await buyLabelsStep(data, hooks);

    // Step 3: Create Package Specifications (with label data)
    createdEntities.packageSpecifications =
      await createPackageSpecificationsStep(
        data,
        createdEntities.shippingOrder,
        [], // Empty array since items don't exist yet
        hooks,
        labelResults // Pass label results to include tracking codes and label URLs
      );

    // Step 4: Create Shipping Order Items (with package IDs)
    createdEntities.shippingOrderItems = await createShippingOrderItemsStep(
      data,
      createdEntities.shippingOrder,
      hooks,
      createdEntities
    );

    // Step 5: Create Package Spec Items
    createdEntities.packageSpecItems = await createPackageSpecItemsStep(
      data,
      createdEntities.shippingOrder,
      createdEntities.shippingOrderItems,
      createdEntities,
      hooks
    );

    // Step 6: Process Images (Non-critical)
    createdEntities.uploadedImages = await processImagesStep(
      data,
      createdEntities.shippingOrder,
      createdEntities.shippingOrderItems,
      hooks,
      uploadSingleImage,
      Type,
      FKItemType
    );

    // Step 5: Create Activity History (Non-critical)
    await createActivityHistoryStep(data, createdEntities, hooks);

    console.log("🎉 All steps completed successfully!");

    return createdEntities.shippingOrder;
  } catch (error) {
    console.error(
      "💥 Critical error in shipping order creation pipeline:",
      error
    );

    // Rollback
    const rollbackErrors = await rollbackCreatedEntities(
      createdEntities,
      hooks
    );

    // Report rollback results
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (rollbackErrors.length > 0) {
      console.error("⚠️ Some rollback operations failed:", rollbackErrors);
      toast.error(
        `Creation failed and some cleanup operations also failed. Please contact support. Error: ${errorMessage}`
      );
    } else {
      console.log("✅ Rollback completed successfully");
      toast.error(
        `Creation failed but all data was cleaned up successfully. Please try again. Error: ${errorMessage}`
      );
    }

    throw error;
  }
};
