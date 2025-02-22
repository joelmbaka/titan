"use client"; // Mark this as a Client Component
import { useMutation, useQuery } from "@apollo/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gql } from "@apollo/client";
import { useRef, useState } from "react";
import { Pencil } from "lucide-react"; // Import the pencil icon
import { signOut } from "next-auth/react"; // Import signOut from next-auth/react

// Define the GraphQL mutation for updating the user
const UPDATE_USER_MUTATION = gql`
  mutation UpdateUser($input: UpdateUserInput!) {
    updateUser(input: $input) {
      id
      name
      email
      image
    }
  }
`;

// Define the GraphQL query for fetching the user
const GET_USER_QUERY = gql`
  query GetUser {
    me {
      id
      name
      email
      image
    }
  }
`;

export default function Profile() {
  const { data, loading, error, refetch } = useQuery(GET_USER_QUERY);
  const [updateUser] = useMutation(UPDATE_USER_MUTATION);
  const formRef = useRef<HTMLFormElement>(null);
  const [isEditing, setIsEditing] = useState(false); // State to control form visibility

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;

    try {
      await updateUser({
        variables: {
          input: { 
            name,
            email,
            image: data?.me?.image  // Preserve existing image
          },
        },
      });
      await refetch(); // Refetch the user data to display the updated name
      if (formRef.current) {
        formRef.current.reset(); // Clear the form
      }
      setIsEditing(false); // Hide the form after successful update
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const user = data?.me;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Profile</h1>
      {user?.image && (
        <img
          src={user.image}
          alt="Profile Avatar"
          className="w-24 h-24 rounded-full"
          referrerPolicy="no-referrer"
        />
      )}
      <p className="text-muted-foreground">
        Name: {user?.name || "Not provided"}
      </p>
      <p className="text-muted-foreground">
        Email: {user?.email || "Not provided"}
      </p>
      {!isEditing ? (
        <Button onClick={() => setIsEditing(true)}>
          <Pencil className="mr-2 h-4 w-4" /> Edit Profile
        </Button>
      ) : (
        <form ref={formRef} onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
          <Input
            type="text"
            name="name"
            placeholder="Enter your name"
            defaultValue={user?.name || ""}
          />
          <Input
            type="email"
            name="email"
            placeholder="Enter your email"
            defaultValue={user?.email || ""}
          />
          <div className="flex gap-2">
            <Button type="submit">Update Profile</Button>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}
      <Button onClick={() => signOut({ redirectTo: "/" })}>Sign Out</Button>
    </div>
  );
}
