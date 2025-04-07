import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
const api = axios.create({
  baseURL: "http://127.0.0.1:5000/reciepts",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

const ImageReciept: React.FC = () => {
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await api.get("/reciept_img", {
          params: { id },
        });
        setImg(`data:image/jpeg;base64,${response.data.image}`);
      } catch (error) {
        setError("Failed to fetch reciept image");
        console.error("Error fetching receipts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchImage();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mx-4 my-4">
        {error}
      </div>
    );
  }
  return (
    <div className="flex justify-center items-center h-screen">
      {img ? (
        <img src={img} alt="Reciept" className="max-w-full max-h-full" />
      ) : (
        <p>No image available</p>
      )}
    </div>
  );
};

export default ImageReciept;
