import React, { useState } from 'react';
import StaffForm from './components/StaffForm';
import DependentsList from './components/DependentsList';
import PreviewModal from './components/PreviewModal';
import './App.css';

function App() {
  const [staffData, setStaffData] = useState({
    fullName: '',
    code: '',
    taxCode: '',
    cccd: ''
  });
  
  const [dependents, setDependents] = useState([{
    fullName: '',
    dob: '',
    cccd: '',
    street: '',
    ward: '',
    cityProvince: ''
  }]);
  
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addDependent = () => {
    setDependents([...dependents, {
      fullName: '',
      dob: '',
      cccd: '',
      street: '',
      ward: '',
      cityProvince: ''
    }]);
    setStatus({ message: '', type: '' });
  };

  const removeDependent = (index) => {
    if (dependents.length <= 1) {
      setStatus({ message: 'Cần ít nhất 1 người phụ thuộc.', type: 'warn' });
      return;
    }
    const newDependents = dependents.filter((_, i) => i !== index);
    setDependents(newDependents);
  };

  const updateDependent = (index, field, value) => {
    const newDependents = [...dependents];
    newDependents[index][field] = value;
    setDependents(newDependents);
  };

  const convertDateFormat = (ddmmyyyy) => {
    if (!ddmmyyyy || ddmmyyyy.length !== 10) return ddmmyyyy;
    
    const [day, month, year] = ddmmyyyy.split('/');
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    return ddmmyyyy;
  };

  const collectFormData = () => {
    const processedDependents = dependents.map(dep => ({
      HotenNPT: dep.fullName,
      NgaySinh_NPT: convertDateFormat(dep.dob),
      CCCD_NPT: dep.cccd,
      SoNha: dep.street,
      PHuongXa: dep.ward,
      TinhThanhPho: dep.cityProvince
    }));

    return {
      TenCB: staffData.fullName,
      MACB: staffData.code,
      MaSoThue: staffData.taxCode,
      CCCD_CB: staffData.cccd,
      NguoiPhuThuoc: processedDependents,
      submittedAt: new Date().toISOString()
    };
  };

  const validateDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 10) return false;
    
    // Check if it's in dd/mm/yyyy format
    const [day, month, year] = dateStr.split('/');
    if (!day || !month || !year) return false;
    
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    
    // Basic validation
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 1900 || yearNum > new Date().getFullYear()) return false;
    
    // Check if date is valid
    const date = new Date(yearNum, monthNum - 1, dayNum);
    return date.getDate() === dayNum && 
           date.getMonth() === monthNum - 1 && 
           date.getFullYear() === yearNum;
  };

  const validateForm = () => {
    // Check all staff fields are required
    if (!staffData.fullName.trim()) return false;
    if (!staffData.code.trim()) return false;
    if (!staffData.taxCode.trim()) return false;
    if (!staffData.cccd.trim()) return false;
    
    // Check all dependents have required fields
    return dependents.every(dep => 
      dep.fullName.trim() && 
      validateDate(dep.dob) &&
      dep.cccd.trim() && 
      dep.street.trim() && 
      dep.ward.trim() && 
      dep.cityProvince.trim()
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ message: '', type: '' });

    if (!validateForm()) {
      setStatus({ message: 'Vui lòng điền đầy đủ các trường bắt buộc.', type: 'error' });
      return;
    }

    const data = collectFormData();
    setShowPreview(true);
  };

  const getWebhookUrl = () => {
    if (!window.APP_CONFIG || !window.APP_CONFIG.WEBHOOK_URL) {
      throw new Error('Chưa cấu hình WEBHOOK_URL trong file public/config.js');
    }
    return window.APP_CONFIG.WEBHOOK_URL;
  };

  const submitToWebhook = async (payload) => {
    const url = getWebhookUrl();
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    return response;
  };

  const handleConfirmSend = async () => {
    const data = collectFormData();
    try {
      setIsSubmitting(true);
      const res = await submitToWebhook(data);
      if (res.ok) {
        try {
          const responseData = await res.json();
          if (responseData.status === 'ok' && responseData.message) {
            setStatus({ message: responseData.message, type: 'success' });
          } else {
            setStatus({ message: 'Gửi thành công! Cảm ơn bạn.', type: 'success' });
          }
        } catch (parseError) {
          setStatus({ message: 'Gửi thành công! Cảm ơn bạn.', type: 'success' });
        }
        
        // Reset form
        setStaffData({ fullName: '', code: '', taxCode: '', cccd: '' });
        setDependents([{
          fullName: '',
          dob: '',
          cccd: '',
          street: '',
          ward: '',
          cityProvince: ''
        }]);
        setShowPreview(false);
      } else {
        const text = await res.text().catch(() => '');
        setStatus({ 
          message: `Gửi thất bại (${res.status}). ${text || 'Vui lòng thử lại.'}`, 
          type: 'error' 
        });
      }
    } catch (err) {
      setStatus({ message: `Lỗi khi gửi dữ liệu: ${err.message}`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container">
      <h1>Nhập thông tin người phụ thuộc</h1>

      <form onSubmit={handleSubmit}>
        <StaffForm 
          staffData={staffData} 
          setStaffData={setStaffData} 
        />

        <section className="card">
          <div className="section-header">
            <h2>Người phụ thuộc</h2>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={addDependent}
            >
              + Thêm người phụ thuộc
            </button>
          </div>
          <DependentsList 
            dependents={dependents}
            updateDependent={updateDependent}
            removeDependent={removeDependent}
          />
        </section>

        <div className="actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi thông tin'}
          </button>
        </div>
        
        {status.message && (
          <p className={`status ${status.type}`} role="alert" aria-live="polite">
            {status.message}
          </p>
        )}
      </form>

      <PreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSend}
        staffData={staffData}
        dependents={dependents}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default App;
