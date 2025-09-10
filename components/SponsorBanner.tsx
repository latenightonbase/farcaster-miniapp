import { useState, useEffect } from 'react';
import axios from 'axios';
import { PiCursorClickFill } from 'react-icons/pi';

export default function SponsorBanner() {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSponsorImage = async () => {
      try {
        const response = await axios.get("/api/getImage");

        if (response.status === 200 && response.data.imageUrl) {
          setUploadedImage(response.data.imageUrl);
          setName(response.data.name || "");
          setUrl(response.data.url || "#"); // Default to "#" if no URL is provided
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

    fetchSponsorImage();
  }, []);

  return (
    <div className='p-3'>
      {loading
        ? null
        : uploadedImage && (
            <a href={url || "#"} target="_blank" rel="noopener noreferrer">
              <div className="relative">
                <img
                  src={`${uploadedImage}?v=${Date.now()}`}
                  alt="Sponsor Banner"
                  className="mx-auto mt-4 h-[200px] w-full object-cover overflow-hidden rounded-lg shadow-xl shadow-red-600/20 active:scale-95  hover:scale-95 duration-200"
                />
                {url !== "#" && (
                  <span className="bg-black/50 text-sm absolute rounded-full text-white px-2 bottom-1 right-1 flex items-center justify-center gap-1">
                    <PiCursorClickFill /> Click for more info
                  </span>
                )}
              </div>

              <div className="flex flex-col mt-2">
                <span className="text-white/80 text-sm">
                  Today&apos;s Highlighted Project:
                </span>
                <span className="text-2xl font-bold bg-gradient-to-br from-yellow-500 via-yellow-300 to-yellow-700 text-transparent bg-clip-text">
                  {name}
                </span>
              </div>
            </a>
          )}
    </div>
  );
}
