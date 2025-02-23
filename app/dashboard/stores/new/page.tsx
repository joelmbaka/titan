"use client"

import { useMutation } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { gql } from "@apollo/client";

const CREATE_STORE_MUTATION = gql`
  mutation CreateStore($input: CreateStoreInput!) {
    createStore(input: $input) {
      id
      name
      industry
      subdomain
      metrics {
        sales
        visitors
        conversion
      }
      createdAt
      updatedAt
    }
  }
`;

export default function NewStorePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("CROP_PRODUCTION");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");

  const [createStore, { loading }] = useMutation(CREATE_STORE_MUTATION, {
    onCompleted: (data) => {
      console.log("Store created successfully:", data.createStore);
      router.push(`/dashboard/stores/${data.createStore.id}`);
    },
    onError: (error) => {
      console.error("Error creating store:", error);
      setError(error.message || "Failed to create store. Please try again.");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await createStore({
        variables: {
          input: {
            name,
            industry,
            subdomain,
          },
        },
      });
    } catch (error) {
      console.error("Error creating store:", error);
      setError("Failed to create store. Please try again.");
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create a New Store</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Store Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <select
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="block w-full p-2 border rounded"
            required
          >
            <option value="CROP_PRODUCTION">Crop Production</option>
            <option value="ANIMAL_PRODUCTION">Animal Production</option>
            <option value="FORESTRY_LOGGING">Forestry Logging</option>
          </select>
        </div>
        <div>
          <Label htmlFor="subdomain">Subdomain</Label>
          <Input
            id="subdomain"
            value={subdomain}
            onChange={(e) => setSubdomain(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Store"}
        </Button>
      </form>
    </div>
  );
} 