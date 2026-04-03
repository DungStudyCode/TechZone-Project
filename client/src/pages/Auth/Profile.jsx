// client/src/pages/Auth/Profile.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext'; 
import api from '../../services/api';
import { 
  FaUser, FaMapMarkerAlt, FaTicketAlt, FaShieldAlt, 
  FaCamera, FaCrown, FaEnvelope, FaLock, FaEdit, 
  FaSave, FaTimes, FaCheckCircle, FaStar, FaTrash, FaPlus
} from 'react-icons/fa';

const Profile = () => {
  const { user, logout } = useAuth(); 
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // ==========================================
  // STATES CHO TAB 1: THÔNG TIN TÀI KHOẢN
  // ==========================================
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ==========================================
  // STATES CHO TAB 2: SỔ ĐỊA CHỈ
  // ==========================================
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '', phoneNumber: '', street: '', city: '', isDefault: false
  });

  // Nạp dữ liệu khi load trang
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setAddresses(user.addresses || []);
    }
  }, [user]);

  // ==========================================
  // LOGIC: CẬP NHẬT THÔNG TIN CÁ NHÂN
  // ==========================================
  const submitHandler = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await api.put('/users/profile', { name, email, password }, config);
      setMessage({ type: 'success', text: 'Cập nhật thành công!' });
      setPassword(''); setConfirmPassword('');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Lỗi cập nhật.' });
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOGIC: QUẢN LÝ SỔ ĐỊA CHỈ
  // ==========================================
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let updatedAddresses = [...addresses];
      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({ ...addr, isDefault: false }));
      }
      if (updatedAddresses.length === 0) newAddress.isDefault = true;

      updatedAddresses.push(newAddress);

      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put('/users/profile', { addresses: updatedAddresses }, config);
      
      // ✅ THÊM DÒNG NÀY: Ép trình duyệt nhớ dữ liệu mới
      localStorage.setItem('userInfo', JSON.stringify(data));

      setAddresses(data.addresses);
      setShowAddressForm(false);
      setNewAddress({ recipientName: '', phoneNumber: '', street: '', city: '', isDefault: false });
      setMessage({ type: 'success', text: 'Thêm địa chỉ thành công!' });
      
      // ✅ THÊM DÒNG NÀY: Tải lại trang nhẹ để Context cập nhật toàn hệ thống
      setTimeout(() => window.location.reload(), 1000);
      
    } catch (error) {
      console.error(error); // <--- THÊM DÒNG NÀY VÀO
      setMessage({ type: 'error', text: 'Lỗi thêm địa chỉ.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (indexToDelete) => {
    if(!window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) return;
    setLoading(true);
    try {
      const updatedAddresses = addresses.filter((_, index) => index !== indexToDelete);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put('/users/profile', { addresses: updatedAddresses }, config);
      
      // ✅ THÊM DÒNG NÀY
      localStorage.setItem('userInfo', JSON.stringify(data));
      setAddresses(data.addresses);
      setMessage({ type: 'success', text: 'Đã xóa địa chỉ!' });
      
      setTimeout(() => window.location.reload(), 1000); // ✅ Tải lại UI
    } catch (error) {
      console.error(error); // <--- THÊM DÒNG NÀY VÀO
      setMessage({ type: 'error', text: 'Lỗi xóa địa chỉ.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultAddress = async (indexToDefault) => {
    setLoading(true);
    try {
      const updatedAddresses = addresses.map((addr, index) => ({
        ...addr,
        isDefault: index === indexToDefault
      }));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await api.put('/users/profile', { addresses: updatedAddresses }, config);
      
      // ✅ THÊM DÒNG NÀY
      localStorage.setItem('userInfo', JSON.stringify(data));
      setAddresses(data.addresses);
      
      setTimeout(() => window.location.reload(), 500); // ✅ Tải lại UI
    } catch (error) {
      console.error(error); // <--- THÊM DÒNG NÀY VÀO
      setMessage({ type: 'error', text: 'Lỗi đặt mặc định.' });
    } finally {
      setLoading(false);
    }
  };
  // Tính hạng thẻ
  const getVipTier = (score, segment) => {
    if (segment === 'VIP' || score >= 5000) return { name: 'Thẻ Kim Cương', color: 'from-blue-400 to-blue-600', icon: <FaCrown /> };
    if (segment === 'Potential' || score >= 2000) return { name: 'Thẻ Vàng', color: 'from-yellow-400 to-yellow-600', icon: <FaCrown /> };
    if (score >= 500) return { name: 'Thẻ Bạc', color: 'from-gray-300 to-gray-500', icon: <FaCrown /> };
    return { name: 'Thành viên mới', color: 'from-green-400 to-green-600', icon: <FaUser /> };
  };
  const vipTier = getVipTier(user?.loyaltyScore || 0, user?.customerSegment);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 font-sans">
      <div className="max-w-6xl mx-auto animate-fade-in-up">
        
        {/* HEADER DASHBOARD */}
        <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group shrink-0">
            {user.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-28 h-28 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-white text-4xl font-black shadow-lg border-4 border-white transform transition group-hover:rotate-6">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <button className="absolute bottom-0 right-0 bg-white p-2.5 rounded-full shadow-lg text-purple-600 hover:bg-purple-600 hover:text-white transition-all transform hover:scale-110 border border-gray-100" title="Đổi ảnh">
              <FaCamera size={14} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-black text-gray-800">{user.name}</h1>
              {user.isAdmin && (
                <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-red-200">
                  <FaShieldAlt /> Admin
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-bold bg-gradient-to-r ${vipTier.color} shadow-sm`}>
                {vipTier.icon} {vipTier.name}
              </span>
              <span className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-50 text-yellow-700 text-xs font-bold border border-yellow-200">
                <FaStar className="text-yellow-500"/> {user.loyaltyScore || 0} Điểm tích lũy
              </span>
            </div>
          </div>
          
          <button onClick={logout} className="shrink-0 flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-600 hover:text-white transition-all">
            <FaTimes /> Đăng xuất
          </button>
        </div>

        {/* THÂN DASHBOARD */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* SIDEBAR */}
          <div className="lg:w-1/4 shrink-0">
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 sticky top-28 space-y-2">
              <button onClick={() => {setActiveTab('info'); setShowAddressForm(false);}} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'info' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}>
                <FaUser /> Thông tin tài khoản
              </button>
              <button onClick={() => setActiveTab('address')} className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'address' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}>
                <div className="flex items-center gap-3"><FaMapMarkerAlt /> Sổ địa chỉ</div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${activeTab === 'address' ? 'bg-white text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                  {addresses.length}
                </span>
              </button>
              <button onClick={() => {setActiveTab('vouchers'); setShowAddressForm(false);}} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === 'vouchers' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'}`}>
                <FaTicketAlt /> Kho Voucher
              </button>
            </div>
          </div>

          {/* CONTENT TƯƠNG ỨNG */}
          <div className="lg:w-3/4 flex-1">
            
            {/* THÔNG BÁO CHUNG */}
            {message && (
              <div className={`mb-6 p-4 rounded-2xl flex items-center gap-3 font-bold text-sm animate-fade-in ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <FaCheckCircle className="text-lg shrink-0" /> {message.text}
              </div>
            )}

            {/* TAB 1: THÔNG TIN */}
            {activeTab === 'info' && (
               <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 animate-fade-in">
                 <div className="flex items-center gap-3 border-b border-gray-100 pb-6 mb-8">
                   <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><FaEdit size={20} /></div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-800">Chỉnh sửa hồ sơ</h3>
                     <p className="text-xs text-gray-400 mt-1">Cập nhật thông tin để chúng tôi phục vụ bạn tốt hơn</p>
                   </div>
                 </div>
                 <form onSubmit={submitHandler} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Họ tên của bạn</label>
                       <div className="relative">
                         <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                         <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Địa chỉ Email</label>
                       <div className="relative">
                         <FaEnvelope className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-gray-50 border-2 border-transparent focus:border-purple-200 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700" />
                       </div>
                     </div>
                   </div>
                   <div className="relative py-6">
                     <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                     <div className="relative flex justify-center"><span className="bg-white px-4 text-xs font-black text-gray-300 uppercase">Hoặc Đổi Mật Khẩu</span></div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-purple-500 uppercase ml-2">Mật khẩu mới</label>
                       <div className="relative">
                         <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300" />
                         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Bỏ trống nếu không đổi" className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-300 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700" />
                       </div>
                     </div>
                     <div className="space-y-2">
                       <label className="text-[10px] font-black text-purple-500 uppercase ml-2">Xác nhận mật khẩu</label>
                       <div className="relative">
                         <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-300" />
                         <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Nhập lại mật khẩu..." className="w-full bg-purple-50/50 border-2 border-transparent focus:border-purple-300 rounded-2xl py-4 pl-12 pr-4 outline-none font-bold text-gray-700" />
                       </div>
                     </div>
                   </div>
                   <div className="pt-6 border-t border-gray-100 mt-8">
                     <button type="submit" disabled={loading} className="w-full md:w-auto px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-3 uppercase text-sm">
                       {loading ? 'Đang xử lý...' : <><FaSave /> Lưu Thay Đổi</>}
                     </button>
                   </div>
                 </form>
               </div>
            )}

            {/* TAB 2: SỔ ĐỊA CHỈ */}
            {activeTab === 'address' && (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 animate-fade-in">
                
                {/* Header Sổ địa chỉ */}
                <div className="flex justify-between items-center border-b border-gray-100 pb-6 mb-8">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Sổ địa chỉ nhận hàng</h3>
                    <p className="text-xs text-gray-400 mt-1">Quản lý các địa chỉ giao hàng của bạn</p>
                  </div>
                  {!showAddressForm && (
                    <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 bg-purple-100 text-purple-700 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-600 hover:text-white transition-all">
                      <FaPlus /> Thêm địa chỉ mới
                    </button>
                  )}
                </div>

                {/* FORM THÊM ĐỊA CHỈ (Chỉ hiện khi bấm nút Thêm) */}
                {showAddressForm ? (
                  <form onSubmit={handleSaveAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 mb-8 animate-fade-in">
                    <h4 className="font-bold text-gray-800 mb-4">Thêm địa chỉ giao hàng mới</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <input required type="text" placeholder="Tên người nhận" value={newAddress.recipientName} onChange={(e) => setNewAddress({...newAddress, recipientName: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none" />
                      </div>
                      <div>
                        <input required type="text" placeholder="Số điện thoại" value={newAddress.phoneNumber} onChange={(e) => setNewAddress({...newAddress, phoneNumber: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <input required type="text" placeholder="Địa chỉ cụ thể (Số nhà, tên đường...)" value={newAddress.street} onChange={(e) => setNewAddress({...newAddress, street: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none" />
                      </div>
                      <div className="md:col-span-2">
                        <input required type="text" placeholder="Tỉnh / Thành phố" value={newAddress.city} onChange={(e) => setNewAddress({...newAddress, city: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-6">
                      <input type="checkbox" id="isDefault" checked={newAddress.isDefault} onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})} className="w-4 h-4 text-purple-600" />
                      <label htmlFor="isDefault" className="text-sm font-medium text-gray-700 cursor-pointer">Đặt làm địa chỉ mặc định</label>
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={loading} className="bg-purple-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-purple-700 transition-colors">
                        {loading ? 'Đang lưu...' : 'Lưu địa chỉ'}
                      </button>
                      <button type="button" onClick={() => setShowAddressForm(false)} className="bg-white border border-gray-200 text-gray-600 px-6 py-2.5 rounded-xl font-bold hover:bg-gray-100 transition-colors">
                        Hủy
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    {/* DANH SÁCH ĐỊA CHỈ */}
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <FaMapMarkerAlt className="mx-auto text-5xl text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">Bạn chưa có địa chỉ nào được lưu.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {addresses.map((addr, index) => (
                          <div key={index} className={`p-6 rounded-2xl border-2 transition-all ${addr.isDefault ? 'border-purple-400 bg-purple-50/30' : 'border-gray-100 hover:border-purple-200 bg-white'}`}>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-black text-gray-800 text-lg">{addr.recipientName}</h4>
                                  {addr.isDefault && (
                                    <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Mặc định
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-600 space-y-1 text-sm font-medium">
                                  <p>📞 Điện thoại: {addr.phoneNumber}</p>
                                  <p>📍 Địa chỉ: {addr.street}, {addr.city}</p>
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-2 shrink-0">
                                {!addr.isDefault && (
                                  <button onClick={() => handleSetDefaultAddress(index)} className="text-sm font-bold text-purple-600 hover:underline">
                                    Thiết lập mặc định
                                  </button>
                                )}
                                <button onClick={() => handleDeleteAddress(index)} className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-colors">
                                  <FaTrash />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* TAB 3: KHO VOUCHER */}
            {activeTab === 'vouchers' && (
              <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 animate-fade-in">
                <div className="border-b border-gray-100 pb-6 mb-8">
                  <h3 className="text-xl font-bold text-gray-800">Kho Voucher của tôi</h3>
                  <p className="text-xs text-gray-400 mt-1">Các mã giảm giá bạn đã thu thập</p>
                </div>
                <div className="text-center py-12">
                  <FaTicketAlt className="mx-auto text-5xl text-gray-200 mb-4" />
                  <p className="text-gray-500 font-medium">Chức năng này sẽ sớm ra mắt!</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;