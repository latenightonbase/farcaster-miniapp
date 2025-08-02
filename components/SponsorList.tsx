import { useState, useEffect } from "react";
import { FaBullhorn } from "react-icons/fa";
import { X } from "lucide-react";
import axios from "axios";

import { HiSpeakerphone } from "react-icons/hi";

import { useAccount } from "wagmi";
import { withPaymentInterceptor } from "x402-axios";
import { ethers, Signer, Wallet } from "ethers";
import { createWalletClient, custom } from "viem";
import { baseSepolia } from "viem/chains";
import { RiLoader5Fill } from "react-icons/ri";

export default function AddBanner() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [metaValue, setMetaValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(true); // Added loading state

  const { address } = useAccount();

  useEffect(() => {
    const fetchSponsorImage = async () => {
      try {
        console.log("Fetching sponsor image...");
        const response = await axios.get("/api/sponsor/getImage");
        
        if (response.status === 200 && response.data.imageUrl) {
          setUploadedImage(response.data.imageUrl);
        } else {
          setUploadedImage(null);
        }
      } catch (error) {
        console.error("Error fetching sponsor image:", error);
        setUploadedImage(null);
      } finally {
        setLoading(false); // Set loading to false after API call
      }
    };

    const fetchMetaValue = async () => {
      try {
        console.log("Fetching meta value...");
        const response = await axios.get("/api/getPrice");

        console.log(response)

        if (response.status === 200 && response.data.meta) {
          setMetaValue(response.data.meta.meta_value);
        } else {
          setMetaValue(null);
        }
      } catch (error) {
        console.error("Error fetching meta value:", error);
        setMetaValue(null);
      }
    };

    fetchSponsorImage();
    fetchMetaValue();
  }, []);

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    } else {
      setPreviewImage(null);
    }
  };

  const handleImageUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    setUploading(true);
    event.preventDefault();

    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("image", selectedImage);

    //make a signer using ethers
    if (typeof window.ethereum !== "undefined") {
      //@ts-ignore
      await window.ethereum.request({ method: "eth_requestAccounts" });

      const client = createWalletClient({
        account: address as `0x${string}`,
        chain: baseSepolia,
        transport: custom(window.ethereum)
      });

      
      const api = withPaymentInterceptor(
        axios.create({
          baseURL: process.env.NEXT_PUBLIC_HOST_NAME,
          withCredentials: true,
        }),
        client as any
      );

      try{
        const response: any = await api.post(`/api/sponsor`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (response.status === 200) {
          const data = await response.data;
          console.log("Image uploaded successfully:", data);
          setIsModalOpen(false);
          setSelectedImage(null);
          setPreviewImage(null);
          setUploadedImage(data.imageUrl); // Assuming the response contains the image URL
        } else {
          alert("Failed to upload image");
        }
      }
      catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image");
      }
      finally{
        setUploading(false);
      }
      
    }

  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files[0];
    setSelectedImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <div>
      {loading ? null : uploadedImage ? (
        <img
          src={uploadedImage}
          alt="Sponsor Banner"
          className="w-[300px] h-[100px] mx-auto mt-4 object-cover overflow-hidden rounded-lg"
        />
      ) : (
        <div
          className="flex items-center justify-start border border-white/30 rounded-lg bg-gradient-to-br from-emerald-600 to-green-500 p-3 mx-3 cursor-pointer"
          onClick={() => setIsModalOpen(true)}
        >
          <HiSpeakerphone className="text-white mr-2 -rotate-12" size={24} />
          <div>
          <h2 className="text-white text-xl font-bold">
            SPONSORED SLOT
          </h2>
          <h3 className="text-sm text-white">
            Sponsor this spot
          </h3>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 transition-opacity duration-300 ${
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-b from-black to-orange-950 border-y-2 border-orange-500 p-6 rounded-lg w-96 text-white relative">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-400"
          >
            <X size={24} />
          </button>
          <h2 className="text-lg font-bold mb-4">Upload Banner</h2>
          <div
            className={`border-[1px] ${
              dragging ? "border-orange-500" : "border-gray-400"
            } rounded-lg p-2 mb-4 text-center`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {previewImage ? (
              <img
                src={previewImage}
                alt="Preview"
                className=" rounded-lg w-[300px] h-[100px] mx-auto object-cover overflow-hidden"
              />
            ) : (
              <>
                <p className="text-white/80 mb-2 text-sm">
                  Drag and drop your image here
                </p>
                <p className="text-sm text-gray-400">or</p>
                <label className="bg-orange-500 text-white px-4 py-2 rounded-lg cursor-pointer inline-block mt-2">
                  Choose File
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageSelection}
                  />
                </label>
              </>
            )}
          </div>
          {!uploadedImage && (
            <form onSubmit={handleImageUpload}>
              <ul className="text-gray-400 text-sm list-disc ml-5 mb-5">
                <li>
                  Image must be in .jpg, .jpeg, or .png format and under 5MB in
                  size
                </li>
                <li>Image will be visible on the miniapp for 1 minute</li>
                <li>Image must be 1500x500 dimensions for best visibility</li>
                <li>This action will cost {metaValue !== null ? metaValue : "..."} USDC</li>
              </ul>

              <button
                type="submit"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg w-full flex items-center justify-center"
                disabled={uploading}
              >
                {!uploading ? "Submit" : (
                  <>
                    <RiLoader5Fill className="animate-spin mr-2" />
                    Submitting...
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
