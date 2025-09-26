import React from 'react';

function StaffForm({ staffData, setStaffData }) {
  const handleChange = (field, value) => {
    setStaffData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <section className="card">
      <h2>Thông tin cán bộ</h2>
      <div className="grid">
        <label className="field">
          <span>Họ và tên cán bộ <span className="req">*</span></span>
          <input 
            type="text" 
            value={staffData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="VD: Nguyễn Văn A" 
            required
          />
        </label>
        <label className="field">
          <span>Mã cán bộ <span className="req">*</span></span>
          <input 
            type="text" 
            value={staffData.code}
            onChange={(e) => handleChange('code', e.target.value)}
            placeholder="VD: 00001"
            required
          />
        </label>
        <label className="field">
          <span>Mã số thuế <span className="req">*</span></span>
          <input 
            type="text" 
            value={staffData.taxCode}
            onChange={(e) => handleChange('taxCode', e.target.value)}
            placeholder="VD: 0123456789"
            required
          />
        </label>
        <label className="field">
          <span>CCCD <span className="req">*</span></span>
          <input 
            type="text" 
            value={staffData.cccd}
            onChange={(e) => handleChange('cccd', e.target.value)}
            placeholder="12 chữ số"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength="12"
            required
          />
        </label>
      </div>
    </section>
  );
}

export default StaffForm;
