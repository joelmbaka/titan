"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState } from "react"
import { AddProductModal } from "@/components/add-product-modal"
import { useParams } from "next/navigation"
import { ProductType } from "@/lib/types"
import { useQuery } from "@apollo/client"
import { GET_PRODUCTS_QUERY } from "@/lib/graphql/queries"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ProductsPage() {
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const params = useParams()
  const storeId = params.storeId as string

  const { loading, error, data, refetch } = useQuery(GET_PRODUCTS_QUERY, {
    variables: { storeId },
    fetchPolicy: "cache-and-network"
  });

  const products: ProductType[] = data?.products || []

  if (loading) return <LoadingSpinner />
  if (error) return <div className="p-6 text-red-500">Error loading products: {error.message}</div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={() => setShowAddProductModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <div className="text-sm text-muted-foreground">
                {product.category} • ${product.price}
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-3">{product.description}</p>
              <div className="mt-2 text-sm">
                <div>SKU: {product.sku}</div>
                <div>Stock: {product.inventory}</div>
                <div>Status: {product.status}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AddProductModal
        open={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onProductAdded={refetch}
        storeId={storeId}
      />
    </div>
  )
} 