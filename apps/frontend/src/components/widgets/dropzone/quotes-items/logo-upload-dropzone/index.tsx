// import React, { useCallback, useState } from "react";
// import { useDropzone } from "react-dropzone";
// import { ImageIcon, UploadIcon, X, FileIcon } from "lucide-react";
// import { ComponentQuoteItem } from "@/components/pages/crm/quotes-[id]/sections/quotes-items";
//
// interface ComponentProps {
//     item: ComponentQuoteItem;
//     index: number;
//     onFileUpload: (files: File[], index: number) => void;
//     isProcessing: boolean;
// }
//
// interface PreviewFile extends File {
//     preview?: string;
// }
//
// const LogoUploadDropzone = ({ item, index, onFileUpload, isProcessing }: ComponentProps) => {
//     const [uploadedFile, setUploadedFile] = useState<PreviewFile | null>(null);
//     const [uploadProgress, setUploadProgress] = useState<number>(0);
//     const [isUploading, setIsUploading] = useState<boolean>(false);
//
//     const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
//         // Handle rejected files
//         if (rejectedFiles.length > 0) {
//             const rejection = rejectedFiles[0];
//             if (rejection.errors.some((error: any) => error.code === 'file-too-large')) {
//                 alert('File is too large. Maximum size is 5MB.');
//                 return;
//             }
//             if (rejection.errors.some((error: any) => error.code === 'file-invalid-type')) {
//                 alert('Invalid file type. Please upload images (PNG, JPG, JPEG, GIF, WEBP) or PDF files only.');
//                 return;
//             }
//         }
//
//         if (acceptedFiles.length > 0) {
//             const file = acceptedFiles[0] as PreviewFile;
//
//             // Create preview for images
//             if (file.type.startsWith('image/')) {
//                 file.preview = URL.createObjectURL(file);
//             }
//
//             setUploadedFile(file);
//             setIsUploading(true);
//             setUploadProgress(0);
//
//             // Simulate upload progress
//             const progressInterval = setInterval(() => {
//                 setUploadProgress(prev => {
//                     if (prev >= 90) {
//                         clearInterval(progressInterval);
//                         return 90;
//                     }
//                     return prev + 10;
//                 });
//             }, 100);
//
//             try {
//                 await onFileUpload([file], index);
//                 setUploadProgress(100);
//                 setTimeout(() => {
//                     setIsUploading(false);
//                     setUploadProgress(0);
//                 }, 500);
//             } catch (error) {
//                 console.error('Upload failed:', error);
//                 setIsUploading(false);
//                 setUploadProgress(0);
//                 setUploadedFile(null);
//                 if (file.preview) {
//                     URL.revokeObjectURL(file.preview);
//                 }
//             } finally {
//                 clearInterval(progressInterval);
//             }
//         }
//     }, [onFileUpload, index]);
//
//     const removeFile = useCallback(() => {
//         if (uploadedFile?.preview) {
//             URL.revokeObjectURL(uploadedFile.preview);
//         }
//         setUploadedFile(null);
//         setUploadProgress(0);
//         setIsUploading(false);
//     }, [uploadedFile]);
//
//     const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
//         onDrop,
//         accept: {
//             'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
//             'application/pdf': ['.pdf']
//         },
//         maxFiles: 1,
//         maxSize: 5 * 1024 * 1024, // 5MB
//         disabled: isProcessing || isUploading,
//         multiple: false
//     });
//
//     // Show existing logo or uploaded file
//     const hasFile = item.logo || uploadedFile;
//     const isImage = uploadedFile ? uploadedFile.type.startsWith('image/') :
//         (typeof item.logo === 'string' && item.logo) ||
//         (typeof item.logo === 'object' && item.logo?.type?.startsWith('image/'));
//
//     return (
//         <div className="max-w-md mx-auto border border-dashed border-gray-500 rounded-lg">
//             {/* Upload Area */}
//             {!hasFile && (
//                 <div
//                     {...getRootProps()}
//                     style={{ width: '150px', height: '50px' }}
//                     className={`relative border-2 border-dashed rounded-lg transition-all duration-200 cursor-pointer flex items-center justify-center
//                         ${isDragActive && !isDragReject
//                         ? "border-blue-500 bg-blue-50 scale-105"
//                         : isDragReject
//                             ? "border-red-500 bg-red-50"
//                             : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
//                     }
//                         ${isProcessing || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
//                     `}
//                 >
//                     <input {...getInputProps()} />
//                     <div className="flex flex-col items-center justify-center text-center">
//                         <div className={`rounded-full flex items-center justify-center transition-colors
//                             ${isDragActive && !isDragReject
//                             ? "bg-blue-100"
//                             : isDragReject
//                                 ? "bg-red-100"
//                                 : "bg-gray-100"
//                         }
//                         `}>
//                             <UploadIcon
//                                 className={`w-6 h-6 transition-colors
//                                     ${isDragActive && !isDragReject
//                                     ? "text-blue-600"
//                                     : isDragReject
//                                         ? "text-red-600"
//                                         : "text-gray-400"
//                                 }
//                                 `}
//                             />
//                         </div>
//
//                         {isDragActive ? (
//                             <p className={`text-sm font-medium mb-2
//                                 ${isDragReject ? "text-red-600" : "text-blue-600"}
//                             `}>
//                                 {isDragReject ? "File type not supported" : "Drop your file here"}
//                             </p>
//                         ) : (
//                             <p className="text-xs">
//                                 Upload Logo
//                             </p>
//                         )}
//
//                         {/*<div className="inline-flex items-center bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">*/}
//                         {/*    Select File*/}
//                         {/*</div>*/}
//
//                         {/*<p className="text-xs text-gray-400 mt-3">*/}
//                         {/*    Supports: PNG, JPG, JPEG, GIF, WEBP, PDF (Max 5MB)*/}
//                         {/*</p>*/}
//                     </div>
//                 </div>
//             )}
//
//             {/* File Preview */}
//             {hasFile && (
//                 <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
//                     <div className="flex items-start space-x-4">
//                         {/* Preview Image/Icon */}
//                         <div className="flex-shrink-0">
//                             {isImage ? (
//                                 <div className="w-20 h-20 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
//                                     <img
//                                         src={uploadedFile?.preview ||
//                                         (typeof item.logo === 'string' ? item.logo : item.logo?.url)}
//                                         alt="Preview"
//                                         className="w-full h-full object-cover"
//                                         onLoad={() => {
//                                             // Revoke preview URL after image loads to free memory
//                                             if (uploadedFile?.preview) {
//                                                 URL.revokeObjectURL(uploadedFile.preview);
//                                             }
//                                         }}
//                                     />
//                                 </div>
//                             ) : (
//                                 <div className="w-20 h-20 rounded-lg border border-gray-200 bg-red-50 flex items-center justify-center">
//                                     <FileIcon className="w-8 h-8 text-red-600" />
//                                 </div>
//                             )}
//                         </div>
//
//                         {/* File Info */}
//                         <div className="flex-1 min-w-0">
//                             <p className="text-sm font-medium text-gray-900 truncate">
//                                 {uploadedFile?.name || 'Current Logo'}
//                             </p>
//                             {uploadedFile && (
//                                 <>
//                                     <p className="text-xs text-gray-500">
//                                         {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
//                                     </p>
//                                     <p className="text-xs text-gray-400 capitalize">
//                                         {uploadedFile.type.split('/')[1]} file
//                                     </p>
//                                 </>
//                             )}
//
//                             {/* Upload Progress */}
//                             {isUploading && (
//                                 <div className="mt-2">
//                                     <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
//                                         <span>Uploading...</span>
//                                         <span>{uploadProgress}%</span>
//                                     </div>
//                                     <div className="w-full bg-gray-200 rounded-full h-1.5">
//                                         <div
//                                             className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
//                                             style={{ width: `${uploadProgress}%` }}
//                                         />
//                                     </div>
//                                 </div>
//                             )}
//
//                             {/* Success Message */}
//                             {!isUploading && uploadedFile && (
//                                 <p className="text-xs text-green-600 mt-1 flex items-center">
//                                     <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>
//                                     Upload complete
//                                 </p>
//                             )}
//                         </div>
//
//                         {/* Remove Button */}
//                         {!isUploading && (
//                             <button
//                                 onClick={removeFile}
//                                 className="flex-shrink-0 p-1 text-gray-400 hover:text-red-600 transition-colors"
//                                 disabled={isProcessing}
//                             >
//                                 <X className="w-5 h-5" />
//                             </button>
//                         )}
//                     </div>
//
//                     {/* Replace File Button */}
//                     {!isUploading && (
//                         <div
//                             {...getRootProps()}
//                             className="mt-4 p-2 border border-dashed border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
//                         >
//                             <input {...getInputProps()} />
//                             <p className="text-xs text-center text-gray-600">
//                                 Click or drag to replace file
//                             </p>
//                         </div>
//                     )}
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default LogoUploadDropzone;
