import { useState, useRef, ChangeEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { insertMosqueSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getCurrentPosition, DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "@/lib/maps";

const formSchema = insertMosqueSchema.extend({
  confirmAuthorized: z.boolean().refine(val => val === true, {
    message: "You must confirm that you are authorized to represent this mosque",
  }),
  // For prayer times (Azaan/Adhan times)
  fajrAzaan: z.string().min(1, { message: "Fajr Azaan time is required" }),
  dhuhrAzaan: z.string().min(1, { message: "Dhuhr Azaan time is required" }),
  asrAzaan: z.string().min(1, { message: "Asr Azaan time is required" }),
  maghribAzaan: z.string().min(1, { message: "Maghrib Azaan time is required" }),
  ishaAzaan: z.string().min(1, { message: "Isha Azaan time is required" }),
  
  // For prayer times (Jamaat/Namaz times)
  fajr: z.string().min(1, { message: "Fajr Jamaat time is required" }),
  dhuhr: z.string().min(1, { message: "Dhuhr Jamaat time is required" }),
  asr: z.string().min(1, { message: "Asr Jamaat time is required" }),
  maghrib: z.string().min(1, { message: "Maghrib Jamaat time is required" }),
  isha: z.string().min(1, { message: "Isha Jamaat time is required" }),
  jummuah: z.string().optional(),
  fajrDays: z.string().default("Daily"),
  dhuhrDays: z.string().default("Daily"),
  asrDays: z.string().default("Daily"),
  maghribDays: z.string().default("Daily"),
  ishaDays: z.string().default("Daily"),
  
  // For image upload
  imageFile: z.instanceof(File).optional(),
});

type FormData = z.infer<typeof formSchema>;

const MosqueRegistrationForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        form.setValue("imageUrl", "");
      };
      reader.readAsDataURL(file);
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      city: "",
      contactNumber: "",
      email: "",
      latitude: "",
      longitude: "",
      imageUrl: "",
      additionalImages: [],
      hasWomensSection: false,
      hasAccessibleEntrance: false,
      hasParking: false,
      hasWuduFacilities: false,
      hasQuranClasses: false,
      hasCommunityHall: false,
      fajrAzaan: "",
      dhuhrAzaan: "",
      asrAzaan: "",
      maghribAzaan: "",
      ishaAzaan: "",
      fajr: "",
      dhuhr: "",
      asr: "",
      maghrib: "",
      isha: "",
      jummuah: "",
      fajrDays: "Daily",
      dhuhrDays: "Daily",
      asrDays: "Daily",
      maghribDays: "Daily",
      ishaDays: "Daily",
      confirmAuthorized: false,
    },
  });

  const createMosque = useMutation({
    mutationFn: async (data: FormData) => {
      setSubmitting(true);
      
      // Handle mosque creation
      const mosqueData = {
        name: data.name,
        address: data.address,
        city: data.city,
        contactNumber: data.contactNumber,
        email: data.email,
        latitude: data.latitude,
        longitude: data.longitude,
        imageUrl: data.imageUrl || (imagePreview || ""),
        additionalImages: data.additionalImages,
        hasWomensSection: data.hasWomensSection,
        hasAccessibleEntrance: data.hasAccessibleEntrance,
        hasParking: data.hasParking,
        hasWuduFacilities: data.hasWuduFacilities,
        hasQuranClasses: data.hasQuranClasses,
        hasCommunityHall: data.hasCommunityHall,
      };
      
      const response = await apiRequest(
        "POST",
        "/api/mosques", 
        mosqueData
      );
      
      // Parse the response to JSON to get the ID
      const createdMosque = await response.json();
      
      // Then create prayer times
      const prayerTimesData = {
        mosqueId: createdMosque.id,
        fajrAzaan: data.fajrAzaan,
        dhuhrAzaan: data.dhuhrAzaan,
        asrAzaan: data.asrAzaan,
        maghribAzaan: data.maghribAzaan,
        ishaAzaan: data.ishaAzaan,
        fajr: data.fajr,
        dhuhr: data.dhuhr,
        asr: data.asr,
        maghrib: data.maghrib,
        isha: data.isha,
        jummuah: data.jummuah,
        fajrDays: data.fajrDays,
        dhuhrDays: data.dhuhrDays,
        asrDays: data.asrDays,
        maghribDays: data.maghribDays,
        ishaDays: data.ishaDays,
      };
      
      await apiRequest(
        "POST",
        `/api/mosques/${createdMosque.id}/prayer-times`, 
        prayerTimesData
      );
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mosques"] });
      toast({
        title: "Mosque Registration Successful",
        description: "Thank you for registering your mosque. It will be verified soon.",
      });
      form.reset();
      setImagePreview(null);
      setSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: "Error registering mosque. Please try again.",
        variant: "destructive",
      });
      console.error("Error registering mosque:", error);
      setSubmitting(false);
    },
  });

  function onSubmit(data: FormData) {
    createMosque.mutate(data);
  }

  const handleGetCurrentLocation = async () => {
    try {
      const position = await getCurrentPosition();
      form.setValue("latitude", position.coords.latitude.toString());
      form.setValue("longitude", position.coords.longitude.toString());
      
      // If we have default/fallback values, let the user know
      if (position.coords.latitude === DEFAULT_LATITUDE && 
          position.coords.longitude === DEFAULT_LONGITUDE) {
        toast({
          title: "Using Default Location",
          description: "We're using default coordinates (New York City). You can manually update the coordinates if needed.",
        });
      } else {
        toast({
          title: "Location Retrieved",
          description: "We've set your current location coordinates.",
        });
      }
    } catch (error) {
      // This should never happen now since we always return a position object
      // with fallback values, but we'll keep this for extra safety
      toast({
        title: "Location Error",
        description: "Could not get your location. Please enter coordinates manually.",
        variant: "destructive",
      });
      console.error("Error getting location:", error);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Mosque Information</h3>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Mosque Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter mosque name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Address <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter street address" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>City <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Enter city" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" {...field} placeholder="Enter mosque email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter contact number" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Location Coordinates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <FormField
              control={form.control}
              name="latitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Latitude <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter latitude coordinates" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="longitude"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Longitude <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter longitude coordinates" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGetCurrentLocation}
            >
              <i className="fas fa-location-arrow mr-2"></i> Use Current Location
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Prayer Times</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
              <h4 className="font-semibold text-md mb-3 text-gray-700">Azaan Times (Adhan)</h4>
              
              <FormField
                control={form.control}
                name="fajrAzaan"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Fajr Azaan <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="flex-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dhuhrAzaan"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Dhuhr Azaan <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="flex-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="asrAzaan"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Asr Azaan <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="flex-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maghribAzaan"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Maghrib Azaan <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="flex-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="ishaAzaan"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Isha Azaan <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input type="time" {...field} className="flex-1" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <h4 className="font-semibold text-md mb-3 text-gray-700">Jamaat Times (Namaz)</h4>
              
              <FormField
                control={form.control}
                name="fajr"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Fajr Jamaat <span className="text-red-500">*</span></FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="time" {...field} className="flex-1" />
                      </FormControl>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        value={form.watch("fajrDays")}
                        onChange={(e) => form.setValue("fajrDays", e.target.value)}
                      >
                        <option>Daily</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                      </select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="dhuhr"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Dhuhr Jamaat <span className="text-red-500">*</span></FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="time" {...field} className="flex-1" />
                      </FormControl>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        value={form.watch("dhuhrDays")}
                        onChange={(e) => form.setValue("dhuhrDays", e.target.value)}
                      >
                        <option>Daily</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                      </select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="asr"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Asr Jamaat <span className="text-red-500">*</span></FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="time" {...field} className="flex-1" />
                      </FormControl>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        value={form.watch("asrDays")}
                        onChange={(e) => form.setValue("asrDays", e.target.value)}
                      >
                        <option>Daily</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                      </select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maghrib"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Maghrib Jamaat <span className="text-red-500">*</span></FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="time" {...field} className="flex-1" />
                      </FormControl>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        value={form.watch("maghribDays")}
                        onChange={(e) => form.setValue("maghribDays", e.target.value)}
                      >
                        <option>Daily</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                      </select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isha"
                render={({ field }) => (
                  <FormItem className="mb-4">
                    <FormLabel>Isha Jamaat <span className="text-red-500">*</span></FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="time" {...field} className="flex-1" />
                      </FormControl>
                      <select 
                        className="px-3 py-2 border border-gray-300 rounded-lg"
                        value={form.watch("ishaDays")}
                        onChange={(e) => form.setValue("ishaDays", e.target.value)}
                      >
                        <option>Daily</option>
                        <option>Weekdays</option>
                        <option>Weekends</option>
                      </select>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="jummuah"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jumu'ah</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input type="time" {...field} className="flex-1" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Facilities & Amenities</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <FormField
              control={form.control}
              name="hasWomensSection"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Women's Section</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasAccessibleEntrance"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Accessible Entrance</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasParking"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Parking Available</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasWuduFacilities"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Wudu Facilities</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasQuranClasses"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Quran Classes</FormLabel>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="hasCommunityHall"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm">Community Hall</FormLabel>
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Mosque Images</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <FormLabel>Main Image <span className="text-red-500">*</span></FormLabel>
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-center w-full">
                      <div 
                        className="flex flex-col w-full h-32 border-2 border-dashed border-primary/50 rounded-lg hover:bg-neutral-light cursor-pointer overflow-hidden relative" 
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {imagePreview ? (
                          <img 
                            src={imagePreview} 
                            alt="Image preview" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full">
                            <i className="fas fa-cloud-upload-alt text-3xl text-primary mb-2"></i>
                            <p className="text-sm text-neutral-dark">
                              Click to upload mosque exterior photo
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 mt-2">
                      <FormControl>
                        <Input 
                          type="text" 
                          {...field} 
                          placeholder="Or enter image URL" 
                          className="flex-1"
                        />
                      </FormControl>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Browse
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Additional Images (Optional)</FormLabel>
              <div className="flex items-center justify-center w-full">
                <div className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-neutral-light cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <i className="fas fa-images text-3xl text-neutral-dark/50 mb-2"></i>
                    <p className="text-sm text-neutral-dark">Optional additional images</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="confirmAuthorized"
          render={({ field }) => (
            <FormItem className="mb-4">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox 
                    checked={field.value} 
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>
                  I confirm that I am authorized to represent this mosque and all information provided is accurate.
                </FormLabel>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="bg-primary hover:bg-primary/90 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-md w-full md:w-auto"
          disabled={submitting}
        >
          {submitting ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i> Submitting...
            </>
          ) : (
            "Submit for Verification"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default MosqueRegistrationForm;