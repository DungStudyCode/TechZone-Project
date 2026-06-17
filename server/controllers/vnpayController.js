// server/controllers/vnpayController.js
const moment = require('moment');
const querystring = require('qs');
const crypto = require('crypto');
const Order = require('../models/Order');

// ==================================================
// 1. HÀM TẠO LINK THANH TOÁN
// ==================================================
const createPaymentUrl = async (req, res) => {
  try {
    const { orderId, amount, bankCode } = req.body;

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();
    let createDate = moment(date).format('YYYYMMDDHHmmss');
    
    let ipAddr = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.ip;

    let tmnCode = process.env.VNP_TMNCODE;
    let secretKey = process.env.VNP_HASHSECRET;
    let vnpUrl = process.env.VNP_URL;
    let returnUrl = process.env.VNP_RETURN_URL;

    let vnp_Params = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = tmnCode;
    vnp_Params['vnp_Locale'] = 'vn';
    vnp_Params['vnp_CurrCode'] = 'VND';
    vnp_Params['vnp_TxnRef'] = orderId; 
    vnp_Params['vnp_OrderInfo'] = 'Thanh toan don hang TechZone: ' + orderId;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = amount * 100; 
    vnp_Params['vnp_ReturnUrl'] = returnUrl;
    vnp_Params['vnp_IpAddr'] = ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;
    if (bankCode !== null && bankCode !== '' && bankCode !== undefined) {
      vnp_Params['vnp_BankCode'] = bankCode;
    }

    vnp_Params = sortObject(vnp_Params);

    let signData = querystring.stringify(vnp_Params, { encode: false });
    let hmac = crypto.createHmac("sha512", secretKey);
    let signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex"); 
    vnp_Params['vnp_SecureHash'] = signed;
    vnpUrl += '?' + querystring.stringify(vnp_Params, { encode: false });

    res.status(200).json({ paymentUrl: vnpUrl });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi tạo link thanh toán: ' + error.message });
  }
};

// ==================================================
// 2. HÀM HỨNG KẾT QUẢ TRẢ VỀ TỪ VNPAY
// ==================================================
const vnpayReturn = async (req, res) => {
  try {
    let vnp_Params = req.query;
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    vnp_Params = sortObject(vnp_Params);
    
    const secretKey = process.env.VNP_HASHSECRET;
    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac("sha512", secretKey);
    const signed = hmac.update(new Buffer.from(signData, 'utf-8')).digest("hex");

    if (secureHash === signed) {
      if (vnp_Params['vnp_ResponseCode'] === '00') {
        const orderId = vnp_Params['vnp_TxnRef']; 
        
        const order = await Order.findById(orderId);
        if (order && !order.isPaid) {
          order.isPaid = true;
          order.paidAt = Date.now();
          order.paymentResult = {
            id: vnp_Params['vnp_TransactionNo'],
            status: 'Thành công (VNPay)',
            update_time: vnp_Params['vnp_PayDate'],
          };
          await order.save();
        }

        res.status(200).json({ message: 'Thanh toán thành công', code: '00' });
      } else {
        res.status(200).json({ message: 'Giao dịch thất bại hoặc bị hủy', code: vnp_Params['vnp_ResponseCode'] });
      }
    } else {
      res.status(400).json({ message: 'Cảnh báo: Chữ ký bảo mật không hợp lệ!', code: '97' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server: ' + error.message, code: '99' });
  }
};

// ==================================================
// 3. HÀM HỖ TRỢ SẮP XẾP OBJECT
// ==================================================
function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj){
    if (obj.hasOwnProperty(key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}

// ✅ XUẤT KHẨU ĐẦY ĐỦ 2 HÀM RA NGOÀI
module.exports = { createPaymentUrl, vnpayReturn };