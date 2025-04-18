"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2, Upload, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GamingButton } from "@/components/ui/gaming-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { type Category, categoryService, FIXED_PARENT_CATEGORIES } from "@/lib/category-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(/^[a-z0-9-]+$/, {
      message: "Slug can only contain lowercase letters, numbers, and hyphens",
    }),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean().default(true),
  show_in_navbar: z.boolean().default(false),
  icon: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface CategoryFormProps {
  category?: Category
  parentCategories?: Category[]
}

export function CategoryForm({ category, parentCategories = [] }: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(category?.image || null)

  // Check if this is a fixed parent category
  const isFixedParent = category?.parent_id === null && FIXED_PARENT_CATEGORIES.includes(category?.slug || "")

  // Check if we're creating a new category (not editing)
  const isNewCategory = !category

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      parent_id: category?.parent_id || undefined,
      display_order: category?.display_order || 0,
      is_active: category?.is_active ?? true,
      show_in_navbar: category?.show_in_navbar ?? false,
      icon: category?.icon || "",
    },
  })

  // Auto-generate slug from name
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name && !category) {
        const slug = value.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
        form.setValue("slug", slug, { shouldValidate: true })
      }
    })
    return () => subscription.unsubscribe()
  }, [form, category])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setImageFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      if (category) {
        // Update existing category
        await categoryService.updateCategory(category.id, data, imageFile || undefined)
        toast({
          title: "Category updated",
          description: "The category has been updated successfully.",
        })
      } else {
        // Create new category
        await categoryService.createCategory(data as any, imageFile || undefined)
        toast({
          title: "Category created",
          description: "The category has been created successfully.",
        })
      }
      router.push("/admin/categories")
      router.refresh()
    } catch (error: any) {
      console.error("Error saving category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {isNewCategory && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              You can only create subcategories under the 5 fixed parent categories. New top-level categories cannot be
              created.
            </AlertDescription>
          </Alert>
        )}

        {isFixedParent && (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Fixed Parent Category</AlertTitle>
            <AlertDescription>
              This is one of the 5 fixed parent categories. You can edit its details, but you cannot change its
              parent-child relationship.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="category-slug" {...field} />
                  </FormControl>
                  <FormDescription>Used in URLs. Only lowercase letters, numbers, and hyphens.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isFixedParent && (
              <FormField
                control={form.control}
                name="parent_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isNewCategory ? false : isFixedParent}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parent category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isNewCategory
                          ? // For new categories, only show the 5 fixed parent categories
                            parentCategories
                              .filter((parent) => FIXED_PARENT_CATEGORIES.includes(parent.slug))
                              .map((parent) => (
                                <SelectItem key={parent.id} value={parent.id}>
                                  {parent.name}
                                </SelectItem>
                              ))
                          : // For existing categories, show all parents except self
                            parentCategories
                              .filter((parent) => parent.id !== category?.id)
                              .map((parent) => (
                                <SelectItem key={parent.id} value={parent.id}>
                                  {parent.name}
                                </SelectItem>
                              ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {isNewCategory
                        ? "Select one of the 5 fixed parent categories."
                        : "Optional. Select a parent category to create a subcategory."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Display Order</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>Controls the order in which categories are displayed.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="lucide-icon-name" {...field} />
                  </FormControl>
                  <FormDescription>Enter a Lucide icon name (e.g., "shopping-bag", "gift", "tv")</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="space-y-6">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter category description (optional)"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div>
                <Label>Category Image (Optional)</Label>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Category preview"
                        width={200}
                        height={200}
                        className="rounded-md object-cover"
                      />
                      <button
                        type="button"
                        onClick={clearImage}
                        className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex h-[200px] w-[200px] items-center justify-center rounded-md border border-dashed border-border bg-muted/50">
                      <label className="flex cursor-pointer flex-col items-center justify-center p-4 text-center">
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Click to upload image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                      </label>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Recommended size: 400x400px. Max size: 5MB.</p>
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                      <FormDescription>Inactive categories will not be displayed on the site.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="show_in_navbar"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Show in Navbar</FormLabel>
                      <FormDescription>Display this category in the main navigation menu.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <GamingButton type="button" variant="outline" onClick={() => router.push("/admin/categories")}>
            Cancel
          </GamingButton>
          <GamingButton type="submit" variant="amber" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {category ? "Update Category" : "Create Category"}
          </GamingButton>
        </div>
      </form>
    </Form>
  )
}
