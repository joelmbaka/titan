"use client"

import { useState, useEffect } from "react"
import { useMutation } from "@apollo/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { gql } from "@apollo/client"
import { ProductType } from "@/lib/types"
import { AIProductModal } from "@/components/ai-product-modal"
import { CheckCircle } from "lucide-react"
import { SuccessModal } from "@/components/success-modal"

interface AddProductModalProps {
  open: boolean
  onClose: () => void
  onProductAdded: () => void
  storeId: string
}

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      name
      description
      price
      sku
      category
      storeId
      createdAt
      updatedAt
      inventory
      status
    }
  }
`;

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
  const [showAIModal, setShowAIModal] = useState(false)
  const [internalOpen, setInternalOpen] = useState(false)
  
  // Sync the internal open state with the prop
  useEffect(() => {
    if (open) {
      setInternalOpen(true);
    }
  }, [open]);

  const [createProduct, { loading }] = useMutation(CREATE_PRODUCT_MUTATION, {
    onCompleted: (data) => {
      console.log("Product created successfully:", data.createProduct);
      setCreatedProduct(data.createProduct);
      setShowSuccess(true);
      onProductAdded();
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      setError(error.message || "Failed to create product. Please try again.");
    },
  });

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

  const handleAIGenerate = (title: string, description: string) => {
    setName(title)
    setDescription(description)
  }

  const handleClose = () => {
    // If showing success, don't close the modal
    if (showSuccess) {
      return;
    }
    
    // Otherwise, close the modal and reset the form
    setInternalOpen(false);
    resetForm();
    onClose();
  }

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setCategory("")
    setSku("")
    setShowSuccess(false)
    setCreatedProduct(null)
  }

  const handleAddAnother = () => {
    resetForm();
  }

  const handleViewProducts = () => {
    setInternalOpen(false);
    resetForm();
    onClose();
    router.push(`/dashboard/stores/${storeId}/products`);
  }

  return (
    <>
      <Dialog open={internalOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          handleClose();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              {showSuccess ? "Product Created!" : "Add New Product"}
              {!showSuccess && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowAIModal(true)}
                >
                  Use AI
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {showSuccess && createdProduct ? (
            <div className="text-center space-y-4 py-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-xl font-semibold">🎉 Congratulations!</p>
              <p className="text-gray-600">Your product has been successfully created</p>
              
              <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2 my-4">
                <p><span className="font-medium">Name:</span> {createdProduct.name}</p>
                <p><span className="font-medium">SKU:</span> {createdProduct.sku}</p>
                <p><span className="font-medium">Price:</span> ${createdProduct.price}</p>
                {createdProduct.category && (
                  <p><span className="font-medium">Category:</span> {createdProduct.category}</p>
                )}
              </div>
              
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  onClick={handleAddAnother}
                >
                  Add Another
                </Button>
                <Button
                  onClick={handleViewProducts}
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
                  onClick={handleClose}
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

      <AIProductModal
        open={showAIModal}
        onClose={() => setShowAIModal(false)}
        onGenerate={handleAIGenerate}
      />

      {showSuccess && (
        <SuccessModal 
          onClose={() => {
            setShowSuccess(false);
            resetForm();
          }} 
        />
      )}
    </>
  )
} 