// Helper function for uploading a single image with retry logic
import {CreateImageGalleryParams} from "../../../../../services/image-gallery/types";
import {toast} from "sonner";

// Modified to accept the createImage function as a parameter instead of using a hook
const uploadSingleImage = async (
    createParams: CreateImageGalleryParams,
    createImageFn: (params: CreateImageGalleryParams) => Promise<any>,
    retryCount = 0,
    maxRetries = 2
) => {
    try {
        // Show loading toast for better user feedback
       const toastId = toast.loading(`Uploading image: ${createParams.description}...`);

        // Attempt to upload the image using the passed function
        const result = await createImageFn(createParams);

        // Update toast on success
        toast.success(`Successfully uploaded: ${createParams.description}`, {
            id: toastId
        });

        return result;
    } catch (error) {
        console.error(`Error uploading image (attempt ${retryCount + 1}):`, error);

        // If we haven't exceeded max retries, try again
        if (retryCount < maxRetries) {
            toast.warning(`Retrying upload for: ${createParams.description} (${retryCount + 1}/${maxRetries})`, {
                duration: 3000
            });
            return uploadSingleImage(createParams, createImageFn, retryCount + 1, maxRetries);
        }

        // Log failure but don't fail the entire operation (fault tolerance)
        toast.error(`Failed to upload: ${createParams.description} after ${maxRetries + 1} attempts`);
        return null; // Return null to indicate failure
    }
};

export {
    uploadSingleImage
}
