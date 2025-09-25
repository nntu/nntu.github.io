(function () {
	'use strict';

	/**
	 * Cấu hình URL webhook từ window.APP_CONFIG
	 */
	function getWebhookUrl() {
		if (!window.APP_CONFIG || !window.APP_CONFIG.WEBHOOK_URL) {
			throw new Error('Chưa cấu hình WEBHOOK_URL trong file public/config.js');
		}
		return window.APP_CONFIG.WEBHOOK_URL;
	}

	/**
	 * Tạo một nhóm input cho 1 người phụ thuộc
	 */
	function createDependentGroup(index) {
		const wrapper = document.createElement('div');
		wrapper.className = 'dependent card subtle';
		wrapper.dataset.index = String(index);

		wrapper.innerHTML = `
			<div class="dependent-header">
				<h3>Người phụ thuộc #${index + 1}</h3>
				<button type="button" class="btn btn-danger btn-sm remove-dependent">Xóa</button>
			</div>
			<div class="grid">
				<label class="field">
					<span>Họ và tên <span class="req">*</span></span>
					<input type="text" name="fullName" placeholder="VD: Trần Thị B" required>
				</label>
				<label class="field">
					<span>Ngày tháng năm sinh <span class="req">*</span></span>
					<input type="date" name="dob" required>
				</label>
				<label class="field">
					<span>CCCD <span class="req">*</span></span>
					<input type="text" name="cccd" inputmode="numeric" pattern="[0-9]*" placeholder="12 chữ số" maxlength="12" required>
				</label>
				<label class="field">
					<span>Số nhà, đường <span class="req">*</span></span>
					<input type="text" name="street" placeholder="VD: 12 Nguyễn Huệ" required>
				</label>
				<label class="field">
					<span>Xã/Phường <span class="req">*</span></span>
					<input type="text" name="ward" placeholder="VD: Phường Bến Nghé" required>
				</label>
				<label class="field">
					<span>Thành phố/Tỉnh <span class="req">*</span></span>
					<input type="text" name="cityProvince" placeholder="VD: Cần tho" required>
				</label>
			</div>
		`;

		return wrapper;
	}

	/**
	 * Thu thập dữ liệu từ DOM thành JSON
	 */
	function collectFormData() {
		const staffFullName = document.getElementById('staffFullName').value.trim();
		const staffCode = document.getElementById('staffCode').value.trim();

		const dependentNodes = document.querySelectorAll('#dependentsContainer .dependent');
		const dependents = [];
		for (const node of dependentNodes) {
			const fullName = node.querySelector('input[name="fullName"]').value.trim();
			const dob = node.querySelector('input[name="dob"]').value;
			const cccd = node.querySelector('input[name="cccd"]').value.trim();
			const street = node.querySelector('input[name="street"]').value.trim();
			const ward = node.querySelector('input[name="ward"]').value.trim();
			const cityProvince = node.querySelector('input[name="cityProvince"]').value.trim();

			dependents.push({
				HotenNPT: fullName,
				NgaySinh_NPT: dob,
				CCCD_NPT: cccd,
				SoNha: street,
				PHuongXa: ward,
				TinhThanhPho: cityProvince
			});
		}

		return {
			TenCB: staffFullName,
			MACB: staffCode || null,
			NguoiPhuThuoc: dependents,
			submittedAt: new Date().toISOString()
		};
	}

	function validateForm() {
		const form = document.getElementById('dependents-form');
		return form.checkValidity();
	}

	function setStatus(message, type) {
		const el = document.getElementById('statusMessage');
		el.textContent = message || '';
		el.className = `status ${type || ''}`;
	}

	function renumberDependents() {
		const nodes = document.querySelectorAll('#dependentsContainer .dependent');
		nodes.forEach((node, idx) => {
			node.dataset.index = String(idx);
			const title = node.querySelector('.dependent-header h3');
			if (title) title.textContent = `Người phụ thuộc #${idx + 1}`;
		});
	}

	function addDependent() {
		const container = document.getElementById('dependentsContainer');
		const index = container.children.length;
		const group = createDependentGroup(index);
		container.appendChild(group);
		attachGroupHandlers(group);
	}

	function removeDependent(group) {
		group.remove();
		renumberDependents();
	}

	function attachGroupHandlers(group) {
		const removeBtn = group.querySelector('.remove-dependent');
		removeBtn.addEventListener('click', function () {
			const container = document.getElementById('dependentsContainer');
			if (container.children.length <= 1) {
				setStatus('Cần ít nhất 1 người phụ thuộc.', 'warn');
				return;
			}
			removeDependent(group);
		});
	}

	async function submitToWebhook(payload) {
		const url = getWebhookUrl();
		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		});
		return response;
	}

	function setSubmitting(isSubmitting) {
		const btn = document.getElementById('submitBtn');
		btn.disabled = isSubmitting;
		btn.textContent = isSubmitting ? 'Đang gửi...' : 'Gửi thông tin';
	}

	// ========== Modal xem lại ==========
	let pendingPayload = null;

	function renderPreview(payload) {
		const staffEl = document.getElementById('previewStaff');
		const depsEl = document.getElementById('previewDependents');

		staffEl.innerHTML = `
			<div class="preview-kv">
				<div><strong>Họ tên cán bộ</strong></div><div>${payload.TenCB || ''}</div>
				<div><strong>Mã cán bộ</strong></div><div>${payload.MACB || ''}</div>
			</div>
		`;

		depsEl.innerHTML = '';
		payload.NguoiPhuThuoc.forEach((d, i) => {
			const item = document.createElement('div');
			item.className = 'preview-item';
			item.innerHTML = `
				<div style="margin-bottom:8px;"><strong>#${i + 1}. ${d.HotenNPT}</strong></div>
				<div class="preview-kv">
					<div><strong>Ngày sinh</strong></div><div>${d.NgaySinh_NPT || ''}</div>
					<div><strong>CCCD</strong></div><div>${d.CCCD_NPT || ''}</div>
					<div><strong>Địa chỉ</strong></div><div>${d.SoNha || ''}, ${d.PHuongXa || ''}, ${d.TinhThanhPho || ''}</div>
				</div>
			`;
			depsEl.appendChild(item);
		});
	}

	function openPreview(payload) {
		pendingPayload = payload;
		renderPreview(payload);
		document.getElementById('previewModal').classList.add('show');
		document.getElementById('previewModal').setAttribute('aria-hidden', 'false');
	}

	function closePreview() {
		document.getElementById('previewModal').classList.remove('show');
		document.getElementById('previewModal').setAttribute('aria-hidden', 'true');
	}

	function init() {
		// Khởi tạo 1 nhóm mặc định
		addDependent();

		document.getElementById('addDependentBtn').addEventListener('click', function () {
			addDependent();
			setStatus('', '');
		});

		document.getElementById('dependents-form').addEventListener('submit', async function (e) {
			e.preventDefault();
			setStatus('', '');

			if (!validateForm()) {
				setStatus('Vui lòng điền đầy đủ các trường bắt buộc.', 'error');
				this.reportValidity();
				return;
			}

			// Lần nộp đầu: mở modal xem lại
			const data = collectFormData();
			openPreview(data);
		});

		// Modal handlers
		document.getElementById('closePreviewBtn').addEventListener('click', function () {
			closePreview();
		});

		document.querySelector('#previewModal .modal-backdrop').addEventListener('click', function () {
			closePreview();
		});

		document.getElementById('editBackBtn').addEventListener('click', function () {
			closePreview();
		});

		document.getElementById('confirmSendBtn').addEventListener('click', async function () {
			if (!pendingPayload) return;
			try {
				setSubmitting(true);
				const res = await submitToWebhook(pendingPayload);
				if (res.ok) {
					// Thử parse response JSON từ n8n
					try {
						const responseData = await res.json();
						if (responseData.status === 'ok' && responseData.message) {
							setStatus(responseData.message, 'success');
						} else {
							setStatus('Gửi thành công! Cảm ơn bạn.', 'success');
						}
					} catch (parseError) {
						// Nếu không parse được JSON, dùng message mặc định
						setStatus('Gửi thành công! Cảm ơn bạn.', 'success');
					}
					
					// reset form
					document.getElementById('dependents-form').reset();
					document.getElementById('dependentsContainer').innerHTML = '';
					addDependent();
					closePreview();
					pendingPayload = null;
				} else {
					const text = await res.text().catch(() => '');
					setStatus(`Gửi thất bại (${res.status}). ${text || 'Vui lòng thử lại.'}`, 'error');
				}
			} catch (err) {
				setStatus(`Lỗi khi gửi dữ liệu: ${err.message}`, 'error');
			} finally {
				setSubmitting(false);
			}
		});
	}

	document.addEventListener('DOMContentLoaded', init);
})(); 