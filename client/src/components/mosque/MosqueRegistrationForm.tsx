import { useState } from "react";
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

const formSchema = insertMosqueSchema.extend({
  confirmAuthorized: z.boolean().refine(val => val === true, {
    message: "You must confirm that you are authorized to represent this mosque",
  }),
  // For prayer times
  fajr: z.string().min(1, { message: "Fajr time is required" }),
  dhuhr: z.string().min(1, { message: "Dhuhr time is required" }),
  asr: z.string().min(1, { message: "Asr time is required" }),
  maghrib: z.string().min(1, { message: "Maghrib time is required" }),
  isha: z.string().min(1, { message: "Isha time is required" }),
  jummuah: z.string().optional(),
  fajrDays: z.string().default("Daily"),
  dhuhrDays: z.string().default("Daily"),
  asrDays: z.string().default("Daily"),
  maghribDays: z.string().default("Daily"),
  ishaDays: z.string().default("Daily"),
});

type FormData = z.infer<typeof formSchema>;

const MosqueRegistrationForm = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

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
      imageUrl: "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f",
      additionalImages: [],
      hasWomensSection: false,
      hasAccessibleEntrance: false,
      hasParking: false,
      hasWuduFacilities: false,
      hasQuranClasses: false,
      hasCommunityHall: false,
      confirmAuthorized: false,
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
    },
  });

  const createMosque = useMutation({
    mutationFn: async (data: FormData) => {
      setSubmitting(true);
      
      // Extract prayer time data
      const { 
        fajr, dhuhr, asr, maghrib, isha, jummuah,
        fajrDays, dhuhrDays, asrDays, maghribDays, ishaDays,
        confirmAuthorized, 
        ...mosqueData 
      } = data;
      
      // First create the mosque
      const response = await apiRequest("POST", "/api/mosques", mosqueData);
      const mosque = await response.json();
      
      // Then create prayer times for the mosque
      const prayerTimesResponse = await apiRequest("POST", `/api/mosques/${mosque.id}/prayer-times`, {
        mosqueId: mosque.id,
        fajr,
        dhuhr,
        asr,
        maghrib,
        isha,
        jummuah,
        fajrDays,
        dhuhrDays,
        asrDays,
        maghribDays,
        ishaDays,
      });
      
      return { mosque, prayerTimes: await prayerTimesResponse.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mosques'] });
      toast({
        title: "Success!",
        description: "Mosque registration submitted for verification.",
      });
      form.reset();
      setSubmitting(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to register mosque. Please try again.",
        variant: "destructive",
      });
      setSubmitting(false);
    },
  });

  function onSubmit(data: FormData) {
    createMosque.mutate(data);
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        form.setValue("latitude", position.coords.latitude.toString());
        form.setValue("longitude", position.coords.longitude.toString());
        
        toast({
          title: "Location Found",
          description: "Your current coordinates have been added to the form.",
        });
      }, () => {
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please enter coordinates manually.",
          variant: "destructive",
        });
      });
    } else {
      toast({
        title: "Geolocation Not Supported",
        description: "Your browser doesn't support geolocation. Please enter coordinates manually.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Mosque Information</h3>
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Mosque Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                    <Input {...field} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button type="button" variant="outline" onClick={getLocation} className="w-full mb-4">
              <i className="fas fa-location-arrow mr-2"></i> Use Current Location
            </Button>
          </div>
          
          <div>
            <h3 className="font-heading text-xl font-bold mb-4 border-b border-gray-200 pb-2">Prayer Times</h3>
            
            <FormField
              control={form.control}
              name="fajr"
              render={({ field }) => (
                <FormItem className="mb-4">
                  <FormLabel>Fajr <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Dhuhr <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Asr <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Maghrib <span className="text-red-500">*</span></FormLabel>
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
                  <FormLabel>Isha <span className="text-red-500">*</span></FormLabel>
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
                      <div className="flex flex-col w-full h-32 border-2 border-dashed border-primary/50 rounded-lg hover:bg-neutral-light cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-7">
                          <i className="fas fa-cloud-upload-alt text-3xl text-primary mb-2"></i>
                          <p className="text-sm text-neutral-dark">
                            {field.value ? "Image URL added" : "Enter mosque exterior photo URL"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <FormControl>
                      <Input 
                        type="text" 
                        {...field} 
                        placeholder="Enter image URL" 
                        className="mt-2"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div>
              <FormLabel>Additional Images (URLs, comma separated)</FormLabel>
              <div className="flex items-center justify-center w-full">
                <div className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-neutral-light cursor-pointer">
                  <div className="flex flex-col items-center justify-center pt-7">
                    <i className="fas fa-images text-3xl text-neutral-dark/50 mb-2"></i>
                    <p className="text-sm text-neutral-dark">Optional additional image URLs</p>
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
