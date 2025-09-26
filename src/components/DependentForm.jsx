import React from 'react';
import CustomDatePicker from './CustomDatePicker';

function DependentForm({ index, dependent, updateDependent, removeDependent }) {
  const handleChange = (field, value) => {
    updateDependent(index, field, value);
  };

  return (
    <div className="dependent card subtle">
      <div className="dependent-header">
        <h3>Người phụ thuộc #{index + 1}</h3>
        <button 
          type="button" 
          className="btn btn-danger btn-sm remove-dependent"
          onClick={() => removeDependent(index)}
        >
          Xóa
        </button>
      </div>
      <div className="grid">
        <label className="field">
          <span>Họ và tên <span className="req">*</span></span>
          <input 
            type="text" 
            value={dependent.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            placeholder="VD: Trần Thị B" 
            required
          />
        </label>
        <label className="field">
          <span>Ngày tháng năm sinh <span className="req">*</span></span>
          <CustomDatePicker
            value={dependent.dob}
            onChange={(value) => handleChange('dob', value)}
            required
          />
        </label>
        <label className="field">
          <span>Quan hệ với người nộp thuế <span className="req">*</span></span>
          <select
            value={dependent.relationship}
            onChange={(e) => handleChange('relationship', e.target.value)}
            required
            style={{
              padding: '12px 16px',
              border: '2px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              background: '#fff',
              width: '100%'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.boxShadow = '0 0 0 3px rgba(37,99,235,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          >
            <option value="">Chọn quan hệ</option>
            <option value="Con">Con</option>
            <option value="Vợ/Chồng">Vợ/Chồng</option>
            <option value="Cha/Mẹ">Cha/Mẹ</option>
            <option value="Khác">Khác</option>
          </select>
        </label>
        <label className="field">
          <span>CCCD <span className="req">*</span></span>
          <input 
            type="text" 
            value={dependent.cccd}
            onChange={(e) => handleChange('cccd', e.target.value)}
            inputMode="numeric" 
            pattern="[0-9]*" 
            placeholder="12 chữ số" 
            maxLength="12" 
            required
          />
        </label>
        <label className="field">
          <span>Số nhà, đường <span className="req">*</span></span>
          <input 
            type="text" 
            value={dependent.street}
            onChange={(e) => handleChange('street', e.target.value)}
            placeholder="VD: 12 Nguyễn Huệ" 
            required
          />
        </label>
        <label className="field">
          <span>Xã/Phường <span className="req">*</span></span>
          <input 
            type="text" 
            value={dependent.ward}
            onChange={(e) => handleChange('ward', e.target.value)}
            placeholder="VD: Phường Bến Nghé" 
            required
          />
        </label>
        <label className="field">
          <span>Thành phố/Tỉnh <span className="req">*</span></span>
          <input 
            type="text" 
            value={dependent.cityProvince}
            onChange={(e) => handleChange('cityProvince', e.target.value)}
            placeholder="VD: Cần tho" 
            required
          />
        </label>
      </div>
    </div>
  );
}

export default DependentForm;
