import React from 'react';

function ResultModal({ show, onClose, result }) {
  if (!show) return null;

  const { type, message, details } = result;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Thành công';
      case 'error':
        return 'Có lỗi xảy ra';
      case 'warning':
        return 'Cảnh báo';
      default:
        return 'Thông báo';
    }
  };

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
      aria-labelledby="resultTitle"
    >
      <div className="modal-backdrop" onClick={handleBackdropClick}></div>
      <div className="modal-content" role="document">
        <div className="modal-header">
          <h2 id="resultTitle" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '24px' }}>{getIcon()}</span>
            {getTitle()}
          </h2>
          <button 
            type="button" 
            className="btn btn-sm btn-secondary" 
            onClick={onClose}
          >
            Đóng
          </button>
        </div>
        <div className="modal-body">
          <div className="result-content">
            <div className="result-message">
              <p style={{ 
                fontSize: '16px', 
                lineHeight: '1.5', 
                margin: '0 0 16px',
                color: type === 'success' ? '#065f46' : type === 'error' ? '#b91c1c' : '#374151'
              }}>
                {message}
              </p>
            </div>
            
            {details && (
              <div className="result-details">
                <h4 style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  margin: '16px 0 8px',
                  color: '#6b7280'
                }}>
                  Chi tiết kỹ thuật:
                </h4>
                <div style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  color: '#374151',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Đã hiểu
          </button>
        </div>
      </div>
    </div>
  );
}

export default ResultModal;
