"use client"

import { useState } from "react"
import { useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CREATE_PRODUCT_MUTATION } from "@/lib/graphql/mutations"
import { ProductType } from "@/lib/types"

interface AddProductModalProps {
  open: boolean
  onClose: () => void
  onProductAdded: () => void
  storeId: string
}

export function AddProductModal({ 
  open,
  onClose,
  onProductAdded,
  storeId
}: AddProductModalProps) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState("")
  const [sku, setSku] = useState("")
  const [error, setError] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdProduct, setCreatedProduct] = useState<ProductType | null>(null)

  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT_MUTATION, {
    onCompleted: (data) => {
      setCreatedProduct(data.createProduct)
      setShowSuccess(true)
      onProductAdded()
    },
    onError: (error) => {
      setError(error.message || "Failed to create product. Please try again.")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    try {
      await createProduct({
        variables: {
          input: {
            name,
            description,
            price: parseFloat(price),
            category,
            sku,
            storeId
          }
        }
      })
    } catch (error) {
      console.error("Error creating product:", error)
      setError("Failed to create product. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {showSuccess ? "Product Created!" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>
        
        {showSuccess ? (
          <div className="text-center space-y-4">
            <p className="text-lg font-semibold">🎉 Product Created Successfully!</p>
            <div className="text-left space-y-2">
              <p><span className="font-medium">Name:</span> {createdProduct?.name}</p>
              <p><span className="font-medium">SKU:</span> {createdProduct?.sku}</p>
              <p><span className="font-medium">Price:</span> ${createdProduct?.price}</p>
              <p><span className="font-medium">Category:</span> {createdProduct?.category}</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setName("")
                  setDescription("")
                  setPrice("")
                  setCategory("")
                  setSku("")
                  setShowSuccess(false)
                }}
              >
                Add Another
              </Button>
              <Button
                onClick={() => {
                  onClose()
                  router.push(`/dashboard/stores/${storeId}/products`)
                }}
              >
                View Products
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 