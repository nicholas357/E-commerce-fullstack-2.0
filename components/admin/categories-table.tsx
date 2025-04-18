"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Edit, Eye, Trash2, Plus, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { GamingButton } from "@/components/ui/gaming-button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { type Category, categoryService, FIXED_PARENT_CATEGORIES } from "@/lib/category-service"

interface CategoriesTableProps {
  categories: Category[]
  onCategoryDeleted: () => void
}

export function CategoriesTable({ categories, onCategoryDeleted }: CategoriesTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!categoryToDelete) return

    setIsDeleting(true)
    try {
      await categoryService.deleteCategory(categoryToDelete.id)
      toast({
        title: "Category deleted",
        description: "The category has been deleted successfully.",
      })
      onCategoryDeleted()
    } catch (error: any) {
      console.error("Error deleting category:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete category. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  // Group categories by parent/child relationship
  const parentCategories = categories.filter((cat) => cat.parent_id === null)
  const childCategories = categories.filter((cat) => cat.parent_id !== null)

  // Create a map of parent IDs to their children
  const childrenByParent = childCategories.reduce(
    (acc, child) => {
      if (!child.parent_id) return acc
      if (!acc[child.parent_id]) {
        acc[child.parent_id] = []
      }
      acc[child.parent_id].push(child)
      return acc
    },
    {} as Record<string, Category[]>,
  )

  return (
    <div className="rounded-md border border-border bg-card">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Categories</h2>
        <GamingButton onClick={() => router.push("/admin/categories/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Add Subcategory
        </GamingButton>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Display Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {parentCategories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No categories found
              </TableCell>
            </TableRow>
          ) : (
            // Render parent categories first, then their children
            parentCategories.map((category) => (
              <>
                <TableRow key={category.id} className="bg-muted/30">
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Parent</Badge>
                    {FIXED_PARENT_CATEGORIES.includes(category.slug) && (
                      <Badge variant="secondary" className="ml-2">
                        Fixed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {category.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="destructive">Inactive</Badge>
                    )}
                    {category.show_in_navbar && (
                      <Badge variant="outline" className="ml-2">
                        Navbar
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{category.display_order}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link href={`/admin/categories/${category.id}`} passHref>
                        <GamingButton size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </GamingButton>
                      </Link>
                      <Link href={`/admin/categories/edit/${category.id}`} passHref>
                        <GamingButton size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </GamingButton>
                      </Link>
                      {!FIXED_PARENT_CATEGORIES.includes(category.slug) && (
                        <GamingButton size="sm" variant="destructive" onClick={() => confirmDelete(category)}>
                          <Trash2 className="h-4 w-4" />
                        </GamingButton>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                {/* Render children of this parent */}
                {childrenByParent[category.id]?.map((child) => (
                  <TableRow key={child.id}>
                    <TableCell className="pl-8 font-medium">— {child.name}</TableCell>
                    <TableCell>{child.slug}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Subcategory</Badge>
                    </TableCell>
                    <TableCell>
                      {child.is_active ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="destructive">Inactive</Badge>
                      )}
                      {child.show_in_navbar && (
                        <Badge variant="outline" className="ml-2">
                          Navbar
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{child.display_order}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Link href={`/admin/categories/${child.id}`} passHref>
                          <GamingButton size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </GamingButton>
                        </Link>
                        <Link href={`/admin/categories/edit/${child.id}`} passHref>
                          <GamingButton size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
                          </GamingButton>
                        </Link>
                        <GamingButton size="sm" variant="destructive" onClick={() => confirmDelete(child)}>
                          <Trash2 className="h-4 w-4" />
                        </GamingButton>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </>
            ))
          )}
        </TableBody>
      </Table>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-destructive" />
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? This action cannot be undone.
              {categoryToDelete && childrenByParent[categoryToDelete.id]?.length > 0 && (
                <div className="mt-2 rounded-md bg-destructive/10 p-3 text-destructive">
                  <strong>Warning:</strong> This category has subcategories that will also be deleted.
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
