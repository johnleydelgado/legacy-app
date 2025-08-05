"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { User, MapPin, Contact, Mail, Phone, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Complete country list based on CountryCode.org data
const countries = [
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "DZ", name: "Algeria" },
  { code: "AS", name: "American Samoa" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AI", name: "Anguilla" },
  { code: "AQ", name: "Antarctica" },
  { code: "AG", name: "Antigua and Barbuda" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AW", name: "Aruba" },
  { code: "AU", name: "Australia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BS", name: "Bahamas" },
  { code: "BH", name: "Bahrain" },
  { code: "BD", name: "Bangladesh" },
  { code: "BB", name: "Barbados" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BM", name: "Bermuda" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "IO", name: "British Indian Ocean Territory" },
  { code: "VG", name: "British Virgin Islands" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CV", name: "Cape Verde" },
  { code: "KY", name: "Cayman Islands" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CX", name: "Christmas Island" },
  { code: "CC", name: "Cocos Islands" },
  { code: "CO", name: "Colombia" },
  { code: "KM", name: "Comoros" },
  { code: "CK", name: "Cook Islands" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CU", name: "Cuba" },
  { code: "CW", name: "Curacao" },
  { code: "CY", name: "Cyprus" },
  { code: "CZ", name: "Czech Republic" },
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DM", name: "Dominica" },
  { code: "DO", name: "Dominican Republic" },
  { code: "TL", name: "East Timor" },
  { code: "EC", name: "Ecuador" },
  { code: "EG", name: "Egypt" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "ET", name: "Ethiopia" },
  { code: "FK", name: "Falkland Islands" },
  { code: "FO", name: "Faroe Islands" },
  { code: "FJ", name: "Fiji" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "PF", name: "French Polynesia" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GI", name: "Gibraltar" },
  { code: "GR", name: "Greece" },
  { code: "GL", name: "Greenland" },
  { code: "GD", name: "Grenada" },
  { code: "GU", name: "Guam" },
  { code: "GT", name: "Guatemala" },
  { code: "GG", name: "Guernsey" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HT", name: "Haiti" },
  { code: "HN", name: "Honduras" },
  { code: "HK", name: "Hong Kong" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "IN", name: "India" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IQ", name: "Iraq" },
  { code: "IE", name: "Ireland" },
  { code: "IM", name: "Isle of Man" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "CI", name: "Ivory Coast" },
  { code: "JM", name: "Jamaica" },
  { code: "JP", name: "Japan" },
  { code: "JE", name: "Jersey" },
  { code: "JO", name: "Jordan" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KI", name: "Kiribati" },
  { code: "XK", name: "Kosovo" },
  { code: "KW", name: "Kuwait" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MO", name: "Macao" },
  { code: "MK", name: "Macedonia" },
  { code: "MG", name: "Madagascar" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "MV", name: "Maldives" },
  { code: "ML", name: "Mali" },
  { code: "MT", name: "Malta" },
  { code: "MH", name: "Marshall Islands" },
  { code: "MR", name: "Mauritania" },
  { code: "MU", name: "Mauritius" },
  { code: "YT", name: "Mayotte" },
  { code: "MX", name: "Mexico" },
  { code: "FM", name: "Micronesia" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MS", name: "Montserrat" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NR", name: "Nauru" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "AN", name: "Netherlands Antilles" },
  { code: "NC", name: "New Caledonia" },
  { code: "NZ", name: "New Zealand" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "NU", name: "Niue" },
  { code: "KP", name: "North Korea" },
  { code: "MP", name: "Northern Mariana Islands" },
  { code: "NO", name: "Norway" },
  { code: "OM", name: "Oman" },
  { code: "PK", name: "Pakistan" },
  { code: "PW", name: "Palau" },
  { code: "PS", name: "Palestine" },
  { code: "PA", name: "Panama" },
  { code: "PG", name: "Papua New Guinea" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PH", name: "Philippines" },
  { code: "PN", name: "Pitcairn" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Puerto Rico" },
  { code: "QA", name: "Qatar" },
  { code: "CG", name: "Republic of the Congo" },
  { code: "RE", name: "Reunion" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "BL", name: "Saint Barthelemy" },
  { code: "SH", name: "Saint Helena" },
  { code: "KN", name: "Saint Kitts and Nevis" },
  { code: "LC", name: "Saint Lucia" },
  { code: "MF", name: "Saint Martin" },
  { code: "PM", name: "Saint Pierre and Miquelon" },
  { code: "VC", name: "Saint Vincent and the Grenadines" },
  { code: "WS", name: "Samoa" },
  { code: "SM", name: "San Marino" },
  { code: "ST", name: "Sao Tome and Principe" },
  { code: "SA", name: "Saudi Arabia" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SC", name: "Seychelles" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SX", name: "Sint Maarten" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SB", name: "Solomon Islands" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "KR", name: "South Korea" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "LK", name: "Sri Lanka" },
  { code: "SD", name: "Sudan" },
  { code: "SR", name: "Suriname" },
  { code: "SJ", name: "Svalbard and Jan Mayen" },
  { code: "SZ", name: "Swaziland" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "SY", name: "Syria" },
  { code: "TW", name: "Taiwan" },
  { code: "TJ", name: "Tajikistan" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TG", name: "Togo" },
  { code: "TK", name: "Tokelau" },
  { code: "TO", name: "Tonga" },
  { code: "TT", name: "Trinidad and Tobago" },
  { code: "TN", name: "Tunisia" },
  { code: "TR", name: "Turkey" },
  { code: "TM", name: "Turkmenistan" },
  { code: "TC", name: "Turks and Caicos Islands" },
  { code: "TV", name: "Tuvalu" },
  { code: "VI", name: "U.S. Virgin Islands" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "GB", name: "United Kingdom" },
  { code: "US", name: "United States" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VU", name: "Vanuatu" },
  { code: "VA", name: "Vatican" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "WF", name: "Wallis and Futuna" },
  { code: "EH", name: "Western Sahara" },
  { code: "YE", name: "Yemen" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

// Form schema with validation
const contactAddressSchema = z.object({
  // Contact fields
  contactFirstname: z.string().min(2, {
    message: "First name must be at least 2 characters.",
  }),
  contactLastname: z.string().min(2, {
    message: "Last name must be at least 2 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  contactMobileNumber: z.string().min(10, {
    message: "Mobile number must be at least 10 digits.",
  }),
  contactPositionTitle: z.string().min(2, {
    message: "Position title must be at least 2 characters.",
  }),
  // Address fields
  addressLine1: z.string().min(5, {
    message: "Address line 1 must be at least 5 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  state: z.string().min(2, {
    message: "State must be at least 2 characters.",
  }),
  country: z.string().min(2, {
    message: "Country must be at least 2 characters.",
  }),
  zip: z.string().min(3, {
    message: "ZIP code must be at least 5 characters.",
  }),
});

export type ContactAddressFormValues = z.infer<typeof contactAddressSchema>;

interface ContactAddressFormProps {
  onSubmit: (data: ContactAddressFormValues) => void | Promise<void>;
  haveDefaultData?: boolean;
  defaultValues?: Partial<ContactAddressFormValues>;
  isLoading?: boolean;
  isEdit?: boolean;
  setIsEdit?: (isEdit: boolean) => void;
}

export const defaultFormValues: Partial<ContactAddressFormValues> = {
    contactFirstname: "",
    contactLastname: "", 
    contactEmail: "",
    contactPhoneNumber: "",
    contactMobileNumber: "",
    contactPositionTitle: "---",
    addressLine1: "",
    city: "",
    state: "",
    country: "",
    zip: "",
};

// Section header component
function SectionHeader({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="pt-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-5 w-5" />
        {label}
      </div>
      <hr className="mt-2 border-t border-muted-foreground/30" />
    </div>
  );
}

export function ContactAddressForm({
  onSubmit,
  defaultValues,
  haveDefaultData = false,
  isLoading = false,
  isEdit = false,
  setIsEdit,
}: ContactAddressFormProps) {
  const form = useForm<ContactAddressFormValues>({
    resolver: zodResolver(contactAddressSchema),
    defaultValues: {
      contactFirstname: "",
      contactLastname: "",
      contactEmail: "",
      contactPhoneNumber: "",
      contactMobileNumber: "",
      contactPositionTitle: "---",
      addressLine1: "",
      city: "",
      state: "",
      country: "",
      zip: "",
    },
  });

  // Reset form when defaultValues change
  React.useEffect(() => {
    if (defaultValues) {
        form.reset({
            contactFirstname: defaultValues.contactFirstname || "",
            contactLastname: defaultValues.contactLastname || "",
            contactEmail: defaultValues.contactEmail || "",
            contactPhoneNumber: defaultValues.contactPhoneNumber || "",
            contactMobileNumber: defaultValues.contactMobileNumber || "",
            contactPositionTitle: defaultValues.contactPositionTitle || "",
            addressLine1: defaultValues.addressLine1 || "",
            city: defaultValues.city || "",
            state: defaultValues.state || "",
            country: defaultValues.country || "",
            zip: defaultValues.zip || "",
        });
    }
  }, [defaultValues, form]);

  const handleSubmit = async (data: ContactAddressFormValues) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="space-y-6">
      {haveDefaultData ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Contact Information Section */}
            <div className="space-y-1">
              <SectionHeader icon={User} label="Contact Details" />
                {isEdit ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactFirstname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactLastname"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>  
                 ) : (
                   <div className="flex flex-row gap-x-2 items-center">
                     <Contact className="w-5 h-5 text-gray-500" />
                     <p className="text-sm font-normal text-gray-900">{`${form.getValues('contactFirstname')} ${form.getValues('contactLastname')}`}</p>
                   </div>
                 )}
              
                 {isEdit ? (
                     <FormField
                         control={form.control}
                         name="contactEmail"
                         render={({ field }) => (
                         <FormItem>
                             <FormLabel>Email Address</FormLabel>
                             <FormControl>
                             <Input 
                                 type="email" 
                                 placeholder="Enter email address" 
                                 {...field} 
                             />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                         )}
                     />
                 ) : (
                   <div className="flex flex-row gap-x-2 items-center">
                     <Mail className="w-5 h-5 text-gray-500" />
                     <p className="text-sm font-normal text-gray-900">{form.getValues('contactEmail')}</p>
                   </div>
                 )}
 
                 {isEdit ? (
                     <FormField
                         control={form.control}
                         name="contactPhoneNumber"
                         render={({ field }) => (
                             <FormItem>
                             <FormLabel>Phone Number</FormLabel>
                             <FormControl>
                                 <Input 
                                 type="tel" 
                                 placeholder="Enter phone number" 
                                 {...field} 
                                 />
                             </FormControl>
                             <FormMessage />
                             </FormItem>
                         )}
                     />     
                 ) : (
                   <div className="flex flex-row gap-x-2 items-center">
                     <Phone className="w-5 h-5 text-gray-500" />
                     <p className="text-sm font-normal text-gray-900">{form.getValues('contactPhoneNumber')}</p>
                   </div>
                 )}
 
                 {isEdit ? (
                     <FormField
                         control={form.control}
                         name="contactMobileNumber"
                         render={({ field }) => (
                             <FormItem>
                             <FormLabel>Mobile Number</FormLabel>
                             <FormControl>
                                 <Input 
                                 type="tel" 
                                 placeholder="Enter mobile number" 
                                 {...field} 
                                 />
                             </FormControl>
                             <FormMessage />
                             </FormItem>
                         )}
                     />
                 ) : (
                   <div className="flex flex-row gap-x-2 items-center">
                     <Smartphone className="w-5 h-5 text-gray-500" />
                     <p className="text-sm font-normal text-gray-900">{form.getValues('contactMobileNumber')}</p>
                   </div>
                 )}
           </div>
 
           {/* Address Information Section */}
           <div className="space-y-4">
             <SectionHeader icon={MapPin} label="Address Details" />
 
             {isEdit ? (
                 <div className="space-y-4">
                     <FormField
                         control={form.control}
                         name="addressLine1"
                         render={({ field }) => (
                         <FormItem>
                             <FormLabel>Address Line 1</FormLabel>
                             <FormControl>
                             <Input placeholder="Enter street address" {...field} />
                             </FormControl>
                             <FormMessage />
                         </FormItem>
                         )}
                     />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                             control={form.control}
                             name="city"
                             render={({ field }) => (
                                 <FormItem>
                                     <FormLabel>City</FormLabel>
                                     <FormControl>
                                         <Input placeholder="Enter city" {...field} />
                                     </FormControl>
                                     <FormMessage />
                                 </FormItem>
                             )}
                         />
                         <FormField
                             control={form.control}
                             name="state"
                             render={({ field }) => (
                              <FormItem>
                                <FormLabel>State</FormLabel>
                                <FormControl>
                                  <Input placeholder="Enter state" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                             )}
                          />
                     </div>    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <FormField
                             control={form.control}
                             name="country"
                             render={({ field }) => (
                                 <FormItem>
                                 <FormLabel>Country</FormLabel>
                                 <FormControl>
                                     <Select onValueChange={field.onChange} defaultValue={field.value}>
                                     <SelectTrigger>
                                         <SelectValue placeholder="Select country" />
                                     </SelectTrigger>
                                     <SelectContent className="max-h-60">
                                         {countries.map((country) => (
                                         <SelectItem key={country.code} value={country.code}>
                                             {country.name}
                                         </SelectItem>
                                         ))}
                                     </SelectContent>
                                     </Select>
                                 </FormControl>
                                 <FormMessage />
                                 </FormItem>
                             )}
                         />
 
                         <FormField
                             control={form.control}
                             name="zip"
                             render={({ field }) => (
                                 <FormItem>
                                 <FormLabel>ZIP Code</FormLabel>
                                 <FormControl>
                                     <Input placeholder="Enter ZIP code" {...field} />
                                 </FormControl>
                                 <FormMessage />
                                 </FormItem>
                             )}
                         />
                     </div>
                 </div>
             ) : (
                 <div className="flex flex-row gap-x-2 items-center">
                     <MapPin className="w-5 h-5 text-gray-500" />
                     <div className="flex flex-row flex-wrap max-w-[300px]">
                         <p className="text-sm font-normal text-gray-900">{form.getValues('addressLine1')},</p>
                         <p className="text-sm font-normal text-gray-900">{`${form.getValues('city')}, ${form.getValues('state')}`}</p>
                         <p className="text-sm font-normal text-gray-900">{`${form.getValues('country')}, ${form.getValues('zip')}`}</p>
                     </div>
                 </div>
             )}
           </div>
 
           {/* Submit Button */}
           {isEdit && (
             <div className="flex justify-end space-x-4">
                 <Button
                     type="button"
                     variant="outline"
                     className="bg-gray-100 text-gray-800 w-[100px] cursor-pointer"
                     onClick={() => {
                         form.reset();
                         setIsEdit && setIsEdit(false);
                     }}
                     disabled={isLoading}
                 >
                     Cancel            
                 </Button>
                 <Button 
                     className="bg-blue-500 text-white hover:bg-blue-600 w-[100px] cursor-pointer"
                     type="submit" 
                     disabled={isLoading}
                 >
                     {isLoading ? "Submitting..." : "Save"}
                 </Button>
             </div>
           )}
         </form>
       </Form>   
      ) : (
        <p className="text-sm font-medium text-gray-500 ml-6">No Customer Selected</p>
      )}
    </div>
  );
}
