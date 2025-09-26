import React, { useState, useEffect } from 'react';
import StaffForm from './components/StaffForm';
import DependentsList from './components/DependentsList';
import PreviewModal from './components/PreviewModal';
import ResultModal from './components/ResultModal';
import './App.css';

function App() {
  const [staffData, setStaffData] = useState(() => {
    try {
      const savedStaffData = localStorage.getItem('nnttu-staffData');
      return savedStaffData ? JSON.parse(savedStaffData) : {
        fullName: '',
        code: '',
        cccd: ''
      };
    } catch (error) {
      console.error("Failed to parse staffData from localStorage", error);
      return {
        fullName: '',
        code: '',
        cccd: ''
      };
    }
  });
  
  const [dependents, setDependents] = useState(() => {
    try {
      const savedDependents = localStorage.getItem('nnttu-dependents');
      return savedDependents ? JSON.parse(savedDependents) : [{
        fullName: '',
        dob: '',
        relationship: '',
        deductionStartDate: '',
        cccd: '',
        street: '',
        ward: '',
        cityProvince: ''
      }];
    } catch (error) {
      console.error("Failed to parse dependents from localStorage", error);
      return [{
        fullName: '',
        dob: '',
        relationship: '',
        deductionStartDate: '',
        cccd: '',
        street: '',
        ward: '',
        cityProvince: ''
      }];
    }
  });

  // Effect to save data to localStorage
  useEffect(() => {
    localStorage.setItem('nnttu-staffData', JSON.stringify(staffData));
  }, [staffData]);

  useEffect(() => {
    localStorage.setItem('nnttu-dependents', JSON.stringify(dependents));
  }, [dependents]);
  
  const [showPreview, setShowPreview] = useState(false);
  const [status, setStatus] = useState({ message: '', type: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState({ type: '', message: '', details: null });

  const addDependent = () => {
    setDependents([...dependents, {
      fullName: '',
      dob: '',
      relationship: '',
      deductionStartDate: '',
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
      QuanHe: dep.relationship,
      ThoiDiemGiamTru: dep.deductionStartDate,
      CCCD_NPT: dep.cccd,
      SoNha: dep.street,
      PHuongXa: dep.ward,
      TinhThanhPho: dep.cityProvince
    }));

    return {
      TenCB: staffData.fullName,
      MACB: staffData.code,
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
    if (!staffData.cccd.trim()) return false;
    
    // Check all dependents have required fields
    return dependents.every(dep => 
      dep.fullName.trim() && 
      validateDate(dep.dob) &&
      dep.relationship.trim() &&
      dep.deductionStartDate.trim() &&
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
    
    console.log('Sending data to webhook:', data);
    console.log('Webhook URL:', getWebhookUrl());
    
    try {
      setIsSubmitting(true);
      setShowPreview(false); // Close preview modal immediately
      const res = await submitToWebhook(data);
      
      console.log('Response Status:', res.status);
      
      if (res.ok) {
        // On any successful response, clear the cache.
        localStorage.removeItem('nnttu-staffData');
        localStorage.removeItem('nnttu-dependents');

        let responsePayload;
        try {
          responsePayload = await res.json();
          console.log('Response Data:', responsePayload);
        } catch (e) {
          try {
            responsePayload = await res.text();
            console.log('Response Text:', responsePayload);
          } catch (e) {
            responsePayload = 'No response body';
          }
        }

        const successMessage = (typeof responsePayload === 'object' && responsePayload.message) 
                               ? responsePayload.message 
                               : (typeof responsePayload === 'string' && responsePayload)
                                 ? responsePayload
                                 : 'Gửi thành công! Cảm ơn bạn.';

        setResult({ type: 'success', message: successMessage, details: { status: res.status, response: responsePayload } });
        setShowResult(true);

      } else { // res.ok is false
        let errorPayload;
        try {
          errorPayload = await res.json();
          console.log('Error Response Data:', errorPayload);
        } catch (e) {
          try {
            errorPayload = await res.text();
             console.log('Error Response Text:', errorPayload);
          } catch (e) {
            errorPayload = 'Could not read error response.';
          }
        }
        
        const errorMessage = (typeof errorPayload === 'object' && (errorPayload.message || errorPayload.error))
                             ? (errorPayload.message || errorPayload.error)
                             : (typeof errorPayload === 'string' && errorPayload)
                               ? errorPayload
                               : 'Có lỗi xảy ra từ server.';

        setResult({ type: 'error', message: `Lỗi ${res.status}: ${errorMessage}`, details: { status: res.status, response: errorPayload } });
        setShowResult(true);
      }
    } catch (err) {
      console.log('Network/Request Error:', err);
      setResult({ type: 'error', message: `Lỗi mạng hoặc kết nối: ${err.message}`, details: { error: err.message } });
      setShowResult(true);
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
      </form>

      <PreviewModal
        show={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={handleConfirmSend}
        staffData={staffData}
        dependents={dependents}
        isSubmitting={isSubmitting}
      />

      <ResultModal
        show={showResult}
        onClose={() => {
          setShowResult(false);
          if (result.type === 'success') {
            window.location.reload();
          }
        }}
        result={result}
      />
    </div>
  );
}

export default App;
