import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaSave, FaCloudUploadAlt, FaImage } from "react-icons/fa";

const AdminProductForm = () => {
  const { id } = useParams(); // Lấy ID từ URL (nếu có)
  const navigate = useNavigate();

  // Xác định chế độ: Nếu có ID là Sửa, không có là Thêm mới
  const isEditMode = !!id;

  // --- STATE QUẢN LÝ FORM ---
  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [category, setCategory] = useState("");
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState("");
  const [discount, setDiscount] = useState(0); // Thêm trường giảm giá nếu cần

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  // --- 1. LOAD DỮ LIỆU KHI SỬA ---
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
          // Đổ dữ liệu vào form
          setName(data.name);
          setPrice(data.price);
          setImage(data.image);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setDescription(data.description);
          setDiscount(data.discount || 0);
          setLoading(false);
        } catch (err) {
          console.error(err); // <--- THÊM DÒNG NÀY (Để biến err được sử dụng)
          setError("Không tìm thấy sản phẩm hoặc lỗi kết nối.");
          setLoading(false);
        }
      };
      fetchProduct();
    }
  }, [id, isEditMode]);

  // --- 2. XỬ LÝ UPLOAD ẢNH (Nếu backend có hỗ trợ upload) ---
  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);

    try {
      const config = { headers: { "Content-Type": "multipart/form-data" } };
      // Gọi API Upload (Bạn cần đảm bảo Backend có route này, nếu chưa thì nhập link tay)
      const { data } = await axios.post("http://localhost:5000/api/upload", formData, config);
      
      setImage(data); // Backend trả về đường dẫn ảnh
      setUploading(false);
    } catch (error) {
      console.error(error);
      setUploading(false);
      // Nếu lỗi upload, nhắc người dùng nhập link
      alert("Chưa cấu hình API Upload. Vui lòng nhập link ảnh trực tiếp vào ô bên cạnh!");
    }
  };

  // --- 3. XỬ LÝ LƯU (SUBMIT) ---
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Lấy Token của Admin từ LocalStorage ra
      const userInfo = localStorage.getItem("userInfo")
        ? JSON.parse(localStorage.getItem("userInfo"))
        : null;

      // 2. Cấu hình Header gửi kèm Token
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.token}`, // <--- QUAN TRỌNG: Gửi "thẻ bài" đi
        },
      };

      const productData = {
        name,
        price,
        image,
        category,
        description,
        countInStock,
        discount
      };

      if (isEditMode) {
        // Cập nhật (PUT) - Có gửi kèm config
        await axios.put(`http://localhost:5000/api/products/${id}`, productData, config);
        alert("Cập nhật thành công!");
      } else {
        // Tạo mới (POST) - Có gửi kèm config
        await axios.post("http://localhost:5000/api/products", productData, config);
        alert("Thêm mới thành công!");
      }
      
      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      // Hiển thị lỗi chi tiết từ Backend nếu có
      const message = err.response && err.response.data.message 
        ? err.response.data.message 
        : "Lỗi khi lưu sản phẩm. Bạn có phải là Admin không?";
      setError(message);
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link to="/admin/products" className="text-gray-500 hover:text-[#724ae8] flex items-center gap-2 mb-2 transition">
            <FaArrowLeft /> Quay lại danh sách
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isEditMode ? `Cập nhật sản phẩm: ${id}` : "Thêm sản phẩm mới"}
          </h1>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* FORM CONTAINER */}
      <form onSubmit={submitHandler} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN CHUNG */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Thông tin cơ bản</h3>
            
            {/* Tên sản phẩm */}
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">Tên sản phẩm</label>
              <input
                type="text"
                placeholder="Ví dụ: iPhone 15 Pro Max..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] focus:border-transparent outline-none transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Mô tả */}
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">Mô tả chi tiết</label>
              <textarea
                placeholder="Nhập mô tả sản phẩm..."
                rows="5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] focus:border-transparent outline-none transition"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Giá & Kho hàng</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Giá */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Giá bán (VNĐ)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] outline-none"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  min="0"
                />
              </div>
              
               {/* Giảm giá */}
               <div>
                <label className="block text-gray-600 font-medium mb-2">Giảm giá (%)</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] outline-none"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>

              {/* Tồn kho */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Số lượng trong kho</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] outline-none"
                  value={countInStock}
                  onChange={(e) => setCountInStock(e.target.value)}
                  min="0"
                />
              </div>

              {/* Danh mục */}
              <div>
                <label className="block text-gray-600 font-medium mb-2">Danh mục</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Điện thoại, Laptop..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: HÌNH ẢNH & TÁC VỤ */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Hình ảnh</h3>
            
            {/* Input Link Ảnh */}
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">Link Ảnh (URL)</label>
              <input
                type="text"
                placeholder="https://..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#724ae8] outline-none text-sm"
                value={image}
                onChange={(e) => setImage(e.target.value)}
              />
            </div>

            {/* Input File (Upload) */}
            <div className="mb-4">
              <label className="block text-gray-600 font-medium mb-2">Hoặc tải lên</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {uploading ? (
                         <p className="text-sm text-gray-500">Đang tải lên...</p>
                    ) : (
                        <>
                            <FaCloudUploadAlt className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="text-sm text-gray-500"><span className="font-semibold">Click để tải ảnh</span></p>
                        </>
                    )}
                </div>
                <input type="file" className="hidden" onChange={uploadFileHandler} />
              </label>
            </div>

            {/* Preview Ảnh */}
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Xem trước:</p>
              <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-contain" />
                ) : (
                  <div className="text-gray-400 flex flex-col items-center">
                    <FaImage className="text-4xl mb-2" />
                    <span>Chưa có ảnh</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nút Submit */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#724ae8] hover:bg-[#5f3dc4] text-white font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Đang xử lý...</span>
              ) : (
                <>
                  <FaSave /> {isEditMode ? "Cập Nhật Sản Phẩm" : "Lưu Sản Phẩm"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AdminProductForm;