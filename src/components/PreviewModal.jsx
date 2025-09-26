import React from 'react';

function PreviewModal({ show, onClose, onConfirm, staffData, dependents, isSubmitting }) {
  if (!show) return null;

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      onClose();
    }
  };

  return (
    <div 
      className="modal show" 
      aria-hidden="false" 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="previewTitle"
    >
      <div className="modal-backdrop" onClick={handleBackdropClick}></div>
      <div className="modal-content" role="document">
        <div className="modal-header">
          <h2 id="previewTitle">Xem lại thông tin</h2>
          <button 
            type="button" 
            className="btn btn-sm btn-secondary" 
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
        <div className="modal-body">
          <div className="card">
            <h3>Thông tin cán bộ</h3>
            <div className="preview-kv">
              <div><strong>Họ tên cán bộ</strong></div>
              <div>{staffData.fullName || ''}</div>
              <div><strong>Mã cán bộ</strong></div>
              <div>{staffData.code || ''}</div>
              <div><strong>Mã số thuế</strong></div>
              <div>{staffData.taxCode || ''}</div>
              <div><strong>CCCD</strong></div>
              <div>{staffData.cccd || ''}</div>
            </div>
          </div>
          <div className="card">
            <h3>Danh sách người phụ thuộc</h3>
            {dependents.map((dependent, index) => (
              <div key={index} className="preview-item">
                <div style={{ marginBottom: '8px' }}>
                  <strong>#{index + 1}. {dependent.fullName}</strong>
                </div>
                <div className="preview-kv">
                  <div><strong>Ngày sinh</strong></div>
                  <div>{dependent.dob || ''}</div>
                  <div><strong>Quan hệ</strong></div>
                  <div>{dependent.relationship || ''}</div>
                  <div><strong>CCCD</strong></div>
                  <div>{dependent.cccd || ''}</div>
                  <div><strong>Địa chỉ</strong></div>
                  <div>
                    {[dependent.street, dependent.ward, dependent.cityProvince]
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={onClose}
          >
            Quay lại chỉnh sửa
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            Xác nhận gửi
          </button>
        </div>
      </div>
    </div>
  );
}

export default PreviewModal;
