// client/src/pages/Admin/AdminUserList.jsx
import React, { useState, useEffect } from "react";
import {
  FaChartLine,
  FaTags,
  FaHistory,
  FaMagic,
  FaUserTie,
  FaTimes,
  FaPaperPlane,
  FaSpinner,
} from "react-icons/fa";
import api from "../../services/api";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- STATE CHO POPUP AI MARKETING ---
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [aiContent, setAiContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ✅ THÊM: State để tạo hiệu ứng xoay xoay khi đang gửi email
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchCRMUsers = async () => {
      try {
        const { data } = await api.get("/users/crm");
        setUsers(data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu người dùng:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCRMUsers();
  }, []);

  const getSegment = (totalSpent, orderCount) => {
    if (totalSpent > 20000000)
      return {
        label: "Khách VIP - Cá Mập",
        color: "text-purple-600 bg-purple-100",
      };
    if (totalSpent > 5000000)
      return {
        label: "Khách hàng Thân thiết",
        color: "text-blue-600 bg-blue-100",
      };
    if (orderCount > 0)
      return { label: "Khách Tiềm năng", color: "text-green-600 bg-green-100" };
    return {
      label: "Khách Mới (Chưa mua)",
      color: "text-gray-600 bg-gray-100",
    };
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString("vi-VN") : "Chưa có đơn hàng";

  // --- HÀM XỬ LÝ KHI BẤM NÚT "TẠO KỊCH BẢN" (GỌI GEMINI) ---
  const handleGenerateAI_Campaign = async (user) => {
    setSelectedUser(user);
    setAiContent("");
    setShowModal(true);
    setIsGenerating(true);

    try {
      const segment = getSegment(user.totalSpent, user.orderCount).label;
      const { data } = await api.post("/ai/generate-email", {
        name: user.name,
        totalSpent: user.totalSpent,
        orderCount: user.orderCount,
        segment: segment,
      });

      setAiContent(data.emailContent);
    } catch (error) {
      console.error("Lỗi gọi AI:", error);
      setAiContent("Xin lỗi, có lỗi xảy ra khi gọi AI. Vui lòng thử lại!");
    } finally {
      setIsGenerating(false);
    }
  };

  // ✅ THÊM: HÀM XỬ LÝ KHI BẤM NÚT "GỬI EMAIL NGAY"
  const handleSendEmail = async () => {
    if (!aiContent || !selectedUser) return;
    
    setIsSending(true);
    try {
      // Gọi API xuống Backend để gửi mail bằng nodemailer
      await api.post('/users/send-email', {
        email: selectedUser.email,
        subject: `TechZone tri ân đặc biệt dành riêng cho ${selectedUser.name}`,
        content: aiContent
      });
      
      alert(`Đã gửi Email thành công tới: ${selectedUser.email}`);
      setShowModal(false); // Gửi xong thì đóng Popup
    } catch (error) {
      console.error(error);
      alert('Lỗi khi gửi email! Hãy kiểm tra lại Backend (mật khẩu ứng dụng Gmail).');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaUserTie className="text-[#724ae8]" /> Quản trị Khách hàng (CRM
            360°)
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Dữ liệu thực từ Database & Phân tích hành vi
          </p>
        </div>
      </div>

      {/* --- BẢNG DỮ LIỆU --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-500">
            Đang tải dữ liệu từ Database...
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Khách hàng</th>
                <th className="p-4 font-semibold">Phân loại</th>
                <th className="p-4 font-semibold">Đơn hàng & Hành vi</th>
                <th className="p-4 font-semibold text-center">AI Tiếp thị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const segment = getSegment(user.totalSpent, user.orderCount);
                return (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{user.name}</div>
                      <div className="text-xs text-gray-500 mb-1">
                        {user.email}
                      </div>
                      <div className="text-[10px] text-gray-400">
                        Tham gia: {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 w-max ${segment.color}`}
                      >
                        <FaTags /> {segment.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1 text-sm text-gray-700">
                        <span className="flex items-center gap-2 text-red-600 font-bold">
                          <FaChartLine /> Đã chi:{" "}
                          {formatPrice(user.totalSpent || 0)}
                        </span>
                        <span className="text-xs text-gray-500">
                          Tổng: <b>{user.orderCount}</b> đơn
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleGenerateAI_Campaign(user)}
                        className="bg-purple-50 text-[#724ae8] border border-purple-200 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#724ae8] hover:text-white transition-colors flex items-center gap-2 mx-auto"
                      >
                        <FaMagic /> AI Tạo kịch bản
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* =======================================================
          MODAL (POPUP) HIỂN THỊ EMAIL AI VIẾT
      ======================================================= */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header Popup */}
            <div className="bg-[#724ae8] px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FaMagic /> Cá nhân hóa Email cho: {selectedUser?.name}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="hover:text-red-300 transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Body Popup */}
            <div className="p-6 flex-1 bg-gray-50">
              <div className="mb-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <p>
                  <strong>Nhóm khách hàng:</strong>{" "}
                  {
                    getSegment(
                      selectedUser?.totalSpent,
                      selectedUser?.orderCount,
                    ).label
                  }
                </p>
                <p>
                  <strong>Lịch sử chi tiêu:</strong>{" "}
                  {formatPrice(selectedUser?.totalSpent || 0)}
                </p>
              </div>

              <label className="block text-sm font-bold text-gray-700 mb-2">
                Nội dung thư (Có thể chỉnh sửa):
              </label>

              <div className="relative">
                <textarea
                  className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#724ae8] focus:border-transparent resize-none text-sm text-gray-800 leading-relaxed"
                  value={aiContent}
                  onChange={(e) => setAiContent(e.target.value)}
                  disabled={isGenerating || isSending}
                />

                {isGenerating && (
                  <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center rounded-xl">
                    <FaSpinner className="animate-spin text-4xl text-[#724ae8] mb-3" />
                    <p className="text-sm font-bold text-gray-600 animate-pulse">
                      Gemini đang soạn thảo thư...
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Popup */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-white">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold transition-colors"
                disabled={isSending}
              >
                Hủy bỏ
              </button>
              
              {/* ✅ SỬA Ở ĐÂY: Gắn sự kiện onClick và đổi chữ khi đang gửi */}
              <button
                onClick={handleSendEmail}
                disabled={isGenerating || isSending}
                className="px-6 py-2 bg-[#724ae8] text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-md"
              >
                {isSending ? (
                  <>
                    <FaSpinner className="animate-spin" /> Đang gửi đi...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Gửi Email Ngay
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserList;