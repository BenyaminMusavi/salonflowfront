"use client";

import { useEffect, useState } from "react";
import axios from "@/services/common/axios-instance";

export default function CategoriesSection() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    axios.get("/api/service-type").then((res) => {
      setItems(res.data.data || []);
    });
  }, []);

  return (
    <div className="mt-12">

      <h2 className="text-lg font-semibold text-gray-900 mb-5">
        دسته‌بندی خدمات
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

        {items.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-100 rounded-2xl p-5 text-center hover:shadow-md hover:border-blue-200 transition cursor-pointer"
          >
            <div className="text-blue-600 font-medium">
              {item.name}
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}