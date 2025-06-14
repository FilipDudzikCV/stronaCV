import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CloudUpload, X } from "lucide-react";
import { useCreateListing } from "@/hooks/use-listings";
import { insertListingSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const sellFormSchema = insertListingSchema.extend({
  price: z.string().min(1, "Cena jest wymagana"),
});

type SellFormData = z.infer<typeof sellFormSchema>;

const categories = [
  { value: "odziez", label: "Odzież" },
  { value: "obuwie", label: "Obuwie" },
  { value: "akcesoria", label: "Akcesoria" },
  { value: "bizuteria", label: "Biżuteria" },
  { value: "elektronika", label: "Elektronika" },
];

export default function Sell() {
  const { toast } = useToast();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const createListingMutation = useCreateListing();

  const form = useForm<SellFormData>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      category: "",
      negotiable: false,
      userId: 1, // Default user for demo
      images: [],
      // lokalizacja usunięta z defaultValues
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxFiles = 5;

    if (files.length + selectedImages.length > maxFiles) {
      toast({
        title: "Zbyt wiele zdjęć",
        description: `Możesz dodać maksymalnie ${maxFiles} zdjęć`,
        variant: "destructive",
      });
      return;
    }

    const newImages = [...selectedImages, ...files];
    setSelectedImages(newImages);

    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setSelectedImages(newImages);
    setImagePreviews(newPreviews);
  };

  const onSubmit = (data: SellFormData) => {
    const listingData = {
      ...data,
      price: data.price,
      images: imagePreviews, // w prawdziwej apce upload na serwer
    };

    createListingMutation.mutate(listingData, {
      onSuccess: () => {
        toast({
          title: "Sukces!",
          description: "Ogłoszenie zostało opublikowane",
        });
        form.reset();
        setSelectedImages([]);
        setImagePreviews([]);
      },
      onError: () => {
        toast({
          title: "Błąd",
          description: "Nie udało się opublikować ogłoszenia",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Dodaj nowe ogłoszenie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Tytuł ogłoszenia *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Podaj tytuł swojego ogłoszenia"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Kategoria *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz kategorię" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.value} value={category.value}>
                              {category.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Cena *</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.01"
                            {...field}
                          />
                          <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                            zł
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Opis *</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Opisz szczegółowo swój przedmiot..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Zdjęcia
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label htmlFor="photo-upload" className="cursor-pointer">
                      <CloudUpload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 mb-2">
                        Przeciągnij zdjęcia tutaj lub kliknij, aby wybrać
                      </p>
                      <p className="text-sm text-gray-500">
                        Maksymalnie 5 zdjęć, każde do 5MB
                      </p>
                    </label>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="negotiable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          Cena do negocjacji
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={createListingMutation.isPending}
                  >
                    {createListingMutation.isPending
                      ? "Publikowanie..."
                      : "Opublikuj ogłoszenie"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
