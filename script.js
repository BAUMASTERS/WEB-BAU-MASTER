// ========== QUẢN LÝ TRANG VÀ ĐIỀU HƯỚNG ==========

class AppRouter {
    constructor() {
        this.currentPage = 'login';
        this.pages = {
            'login': 'login.html',
            'dashboard': 'dashboard.html',
            'live-list': 'live-list.html',
            'create-live': 'create-live.html',
            'platform-backgrounds': 'platform-backgrounds.html' // Đã thêm trang mới
        };
        
        this.init();
    }
    
    init() {
        // Xử lý sự kiện hashchange
        window.addEventListener('hashchange', () => this.loadPage());
        
        // Xử lý sự kiện load trang
        window.addEventListener('load', () => {
            if (!window.location.hash) {
                window.location.hash = '#login';
            }
            this.loadPage();
        });
    }
    
    async loadPage() {
        const hash = window.location.hash.substring(1) || 'login';
        const page = this.pages[hash] || this.pages['login'];
        
        try {
            // Load trang từ file HTML
            const response = await fetch(page);
            const html = await response.text();
            
            // Cập nhật nội dung
            document.getElementById('app').innerHTML = html;
            this.currentPage = hash;
            
            // Khởi tạo trang
            this.initializePage(hash);
            
            // Thêm CSS cho trang
            this.addPageStyles(hash);
            
        } catch (error) {
            console.error('Lỗi khi tải trang:', error);
            document.getElementById('app').innerHTML = `
                <div class="error-page">
                    <h1>Lỗi tải trang</h1>
                    <p>Không thể tải trang yêu cầu. Vui lòng thử lại.</p>
                    <button onclick="window.location.hash = 'login'" class="btn btn-primary">
                        Quay về trang đăng nhập
                    </button>
                </div>
            `;
        }
    }
    
    addPageStyles(page) {
        // Xóa các style cũ
        const oldStyles = document.querySelectorAll('style[data-page-style]');
        oldStyles.forEach(style => style.remove());
        
        // Thêm style mới nếu có
        const style = document.createElement('style');
        style.setAttribute('data-page-style', page);
        
        // CSS riêng cho từng trang
        const pageStyles = {
            'dashboard': `
                .dashboard-layout {
                    display: flex;
                    min-height: 100vh;
                }
            `,
            'login': `
                .login-page {
                    min-height: 100vh;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
            `,
            'platform-backgrounds': `
                .platform-bg-page {
                    padding: 20px;
                    max-width: 1400px;
                    margin: 0 auto;
                }
            `
        };
        
        style.textContent = pageStyles[page] || '';
        document.head.appendChild(style);
    }
    
    navigateTo(page) {
        if (this.pages[page]) {
            window.location.hash = page;
            return true;
        }
        return false;
    }
    
    initializePage(page) {
        switch(page) {
            case 'login':
                this.initLoginPage();
                break;
            case 'dashboard':
                this.initDashboardPage();
                break;
            case 'live-list':
                this.initLiveListPage();
                break;
            case 'create-live':
                this.initCreateLivePage();
                break;
            case 'platform-backgrounds':
                this.initPlatformBackgroundsPage();
                break;
        }
    }
    
    // ========== KHỞI TẠO TRANG ĐĂNG NHẬP ==========
    initLoginPage() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const email = document.getElementById('email').value;
                const password = document.getElementById('password').value;
                
                // Kiểm tra đơn giản
                if (email && password) {
                    // Lưu trạng thái đăng nhập
                    localStorage.setItem('isLoggedIn', 'true');
                    localStorage.setItem('userEmail', email);
                    
                    // Chuyển đến dashboard
                    this.navigateTo('dashboard');
                } else {
                    alert('Vui lòng nhập đầy đủ thông tin đăng nhập');
                }
            });
        }
        
        // Xử lý link đăng ký
        const signupLink = document.getElementById('signupLink');
        if (signupLink) {
            signupLink.addEventListener('click', (e) => {
                e.preventDefault();
                alert('Chức năng đăng ký sẽ được phát triển sau!');
            });
        }
    }
    
    // ========== KHỞI TẠO TRANG DASHBOARD ==========
    initDashboardPage() {
        // Kiểm tra đăng nhập
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            this.navigateTo('login');
            return;
        }
        
        // Xử lý toggle sidebar trên mobile
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.querySelector('.sidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
            });
        }
        
        // Xử lý điều hướng sidebar
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page && page !== 'dashboard') {
                    this.navigateTo(page);
                }
                
                // Đóng sidebar trên mobile
                if (window.innerWidth <= 768) {
                    sidebar.classList.remove('active');
                }
            });
        });
        
        // Xử lý logout
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('isLoggedIn');
                this.navigateTo('login');
            });
        }
        
        // Load dữ liệu phiên live gần đây
        this.loadRecentLiveSessions();
    }
    
    // ========== KHỞI TẠO TRANG DANH SÁCH LIVE ==========
    initLiveListPage() {
        // Kiểm tra đăng nhập
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            this.navigateTo('login');
            return;
        }
        
        // Dữ liệu mẫu
        const sampleData = [
            { id: 1, date: '15/08', platform: 'gar', startTime: '09:00', endTime: '11:00', 
              title: 'Giới thiệu sản phẩm mới mùa thu', status: 'ended' },
            { id: 2, date: '18/08', platform: 'mny', startTime: '14:30', endTime: '16:00', 
              title: 'Hướng dẫn sử dụng ứng dụng', status: 'live' },
            { id: 3, date: '20/08', platform: 'oap', startTime: '19:00', endTime: '20:30', 
              title: 'Khuyến mãi đặc biệt cuối tuần', status: 'upcoming' },
            { id: 4, date: '22/08', platform: '3ce', startTime: '10:00', endTime: '12:00', 
              title: 'Q&A với chuyên gia công nghệ', status: 'ended' },
            { id: 5, date: '25/08', platform: 'gar', startTime: '15:00', endTime: '17:00', 
              title: 'Trải nghiệm sản phẩm cao cấp', status: 'upcoming' }
        ];
        
        // Render bảng
        this.renderLiveTable(sampleData);
        
        // Xử lý nút tạo mới
        const createBtn = document.getElementById('createLiveBtn');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.navigateTo('create-live');
            });
        }
        
        // Xử lý nút tạo phiên đầu tiên
        const createFirstBtn = document.getElementById('createFirstLiveBtn');
        if (createFirstBtn) {
            createFirstBtn.addEventListener('click', () => {
                this.navigateTo('create-live');
            });
        }
        
        // Xử lý tìm kiếm
        const searchInput = document.querySelector('.table-search .search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const searchTerm = e.target.value.toLowerCase();
                const filtered = sampleData.filter(item => 
                    item.title.toLowerCase().includes(searchTerm) ||
                    item.platform.toLowerCase().includes(searchTerm)
                );
                this.renderLiveTable(filtered);
            });
        }
    }
    
    renderLiveTable(data) {
        const tableBody = document.getElementById('liveSessionsTable');
        const emptyState = document.getElementById('emptyState');
        const showingCount = document.getElementById('showingCount');
        const totalCount = document.getElementById('totalCount');
        
        if (!tableBody) return;
        
        if (data.length === 0) {
            if (emptyState) emptyState.classList.remove('hidden');
            tableBody.innerHTML = '';
            if (showingCount) showingCount.textContent = '0';
            if (totalCount) totalCount.textContent = '0';
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        tableBody.innerHTML = data.map(item => `
            <tr>
                <td>${item.date}</td>
                <td>
                    <span class="tag tag-${item.platform}">
                        ${this.getPlatformName(item.platform)}
                    </span>
                </td>
                <td>${item.startTime} - ${item.endTime}</td>
                <td>${item.title}</td>
                <td>
                    <span class="status-badge status-${item.status}">
                        ${this.getStatusText(item.status)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view-btn" onclick="app.viewLive(${item.id})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit-btn" onclick="app.editLive(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" onclick="app.deleteLive(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        if (showingCount) showingCount.textContent = data.length;
        if (totalCount) totalCount.textContent = data.length;
    }
    
    // ========== KHỞI TẠO TRANG TẠO LIVE ==========
    initCreateLivePage() {
        // Kiểm tra đăng nhập
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            this.navigateTo('login');
            return;
        }
        
        // Xử lý form
        const form = document.getElementById('liveSessionForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Lấy dữ liệu form
                const formData = {
                    title: document.getElementById('liveTitle').value,
                    description: document.getElementById('liveDescription').value,
                    date: document.getElementById('liveDate').value,
                    startTime: document.getElementById('startTime').value,
                    endTime: document.getElementById('endTime').value,
                    platform: document.getElementById('livePlatform').value,
                    category: document.getElementById('liveCategory').value,
                    background: document.getElementById('liveBackground')?.value,
                    customBackground: document.getElementById('customBgFile')?.files[0]
                };
                
                // Validate
                if (!formData.title || !formData.date || !formData.startTime || 
                    !formData.endTime || !formData.platform) {
                    alert('Vui lòng điền đầy đủ các thông tin bắt buộc (*)');
                    return;
                }
                
                // Xử lý background nếu có
                if (formData.background === 'custom' && formData.customBackground) {
                    // Xử lý upload custom background
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        formData.backgroundUrl = event.target.result;
                        this.saveLiveSession(formData);
                    };
                    reader.readAsDataURL(formData.customBackground);
                } else {
                    this.saveLiveSession(formData);
                }
            });
        }
        
        // Xử lý nút quay lại
        const backBtn = document.getElementById('backToListBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigateTo('live-list');
            });
        }
        
        // Xử lý nút hủy
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (confirm('Bạn có chắc muốn hủy? Thông tin chưa lưu sẽ bị mất.')) {
                    this.navigateTo('live-list');
                }
            });
        }
        
        // Xử lý nút quản lý background
        const manageBgBtn = document.getElementById('manageBackgroundsBtn');
        if (manageBgBtn) {
            manageBgBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateTo('platform-backgrounds');
            });
        }
        
        // Xử lý background selection
        this.initBackgroundSelection();
        
        // Cập nhật preview khi form thay đổi
        const formInputs = form.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            input.addEventListener('input', () => this.updatePreview());
            input.addEventListener('change', () => this.updatePreview());
        });
        
        // Khởi tạo preview
        this.updatePreview();
    }
    
    initBackgroundSelection() {
        const bgSelect = document.getElementById('liveBackground');
        const customBgUpload = document.getElementById('customBgUpload');
        const customBgUploadArea = document.getElementById('customBgUploadArea');
        const customBgFile = document.getElementById('customBgFile');
        const platformSelect = document.getElementById('livePlatform');
        
        if (!bgSelect) return;
        
        // Xử lý thay đổi chọn background
        bgSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                if (customBgUpload) customBgUpload.style.display = 'block';
            } else {
                if (customBgUpload) customBgUpload.style.display = 'none';
            }
        });
        
        // Xử lý upload custom background
        if (customBgUploadArea && customBgFile) {
            customBgUploadArea.addEventListener('click', () => customBgFile.click());
            customBgFile.addEventListener('change', function(e) {
                if (e.target.files[0]) {
                    // Preview custom background
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const previewContainer = document.getElementById('customBgPreview');
                        if (previewContainer) {
                            previewContainer.innerHTML = `
                                <div style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 8px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="${event.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                                        <div>
                                            <div style="font-weight: 500;">${e.target.files[0].name}</div>
                                            <div style="font-size: 12px; color: #6b7280;">
                                                ${(e.target.files[0].size / 1024 / 1024).toFixed(2)} MB
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
        
        // Xử lý thay đổi platform để cập nhật background options
        if (platformSelect && bgSelect) {
            platformSelect.addEventListener('change', function() {
                const platform = this.value;
                
                // Lấy backgrounds từ localStorage hoặc API
                const backgrounds = this.getPlatformBackgrounds(platform);
                
                // Cập nhật options
                this.updateBackgroundOptions(bgSelect, platform, backgrounds);
            });
        }
    }
    
    getPlatformBackgrounds(platform) {
        // Lấy từ localStorage (trong thực tế sẽ là API call)
        const stored = localStorage.getItem('platformBackgrounds');
        if (stored) {
            const allBackgrounds = JSON.parse(stored);
            return allBackgrounds.filter(bg => bg.platform === platform);
        }
        return [];
    }
    
    updateBackgroundOptions(selectElement, platform, backgrounds) {
        // Giữ options đầu tiên (placeholder) và custom
        const placeholderOption = selectElement.options[0];
        const customOption = Array.from(selectElement.options).find(opt => opt.value === 'custom');
        
        // Xóa các options cũ (trừ placeholder và custom)
        while (selectElement.options.length > 2) {
            selectElement.remove(1); // Giữ index 0 và cuối cùng
        }
        
        // Thêm backgrounds mới
        backgrounds.forEach(bg => {
            const option = document.createElement('option');
            option.value = bg.id || bg.url;
            option.textContent = `${bg.name} (${bg.isDefault ? 'Mặc định' : 'Tùy chọn'})`;
            option.dataset.bgUrl = bg.url;
            
            // Insert before custom option
            selectElement.insertBefore(option, customOption);
        });
    }
    
    updatePreview() {
        // Lấy giá trị từ form
        const title = document.getElementById('liveTitle')?.value || 'Tiêu đề phiên live';
        const date = document.getElementById('liveDate')?.value;
        const startTime = document.getElementById('startTime')?.value;
        const endTime = document.getElementById('endTime')?.value;
        const platform = document.getElementById('livePlatform')?.value;
        const bgSelect = document.getElementById('liveBackground');
        const selectedBgOption = bgSelect?.options[bgSelect?.selectedIndex];
        
        // Cập nhật preview
        const previewTitle = document.getElementById('previewTitle');
        const previewDate = document.getElementById('previewDate');
        const previewTime = document.getElementById('previewTime');
        const previewPlatform = document.getElementById('previewPlatform');
        const previewDescription = document.getElementById('previewDescription');
        const bgPreviewImage = document.getElementById('bgPreviewImage');
        
        if (previewTitle) previewTitle.textContent = title;
        
        if (date) {
            const [year, month, day] = date.split('-');
            if (previewDate) previewDate.textContent = `${day}/${month}`;
        }
        
        if (startTime && endTime) {
            if (previewTime) previewTime.textContent = `${startTime} - ${endTime}`;
        }
        
        if (platform) {
            if (previewPlatform) {
                previewPlatform.textContent = this.getPlatformName(platform);
                previewPlatform.className = `preview-platform tag tag-${platform}`;
            }
        }
        
        // Cập nhật background preview
        if (bgPreviewImage) {
            if (selectedBgOption?.dataset?.bgUrl) {
                // Background từ thư viện
                bgPreviewImage.style.backgroundImage = `url('${selectedBgOption.dataset.bgUrl}')`;
                bgPreviewImage.textContent = '';
            } else if (bgSelect?.value === 'custom') {
                // Custom background preview
                const customPreview = document.querySelector('#customBgPreview img');
                if (customPreview) {
                    bgPreviewImage.style.backgroundImage = `url('${customPreview.src}')`;
                    bgPreviewImage.textContent = '';
                } else {
                    bgPreviewImage.style.backgroundImage = '';
                    bgPreviewImage.textContent = 'Custom Background';
                }
            } else {
                // No background
                bgPreviewImage.style.backgroundImage = '';
                bgPreviewImage.textContent = 'Chưa chọn background';
            }
        }
    }
    
    saveLiveSession(formData) {
        // Lưu vào localStorage (trong thực tế sẽ là API call)
        const liveSessions = JSON.parse(localStorage.getItem('liveSessions') || '[]');
        const newSession = {
            id: Date.now(),
            ...formData,
            date: this.formatDateForDisplay(formData.date),
            status: 'upcoming',
            createdAt: new Date().toISOString()
        };
        
        liveSessions.push(newSession);
        localStorage.setItem('liveSessions', JSON.stringify(liveSessions));
        
        alert('Phiên live đã được tạo thành công!');
        this.navigateTo('live-list');
    }
    
    formatDateForDisplay(dateString) {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;
    }
    
    // ========== KHỞI TẠO TRANG QUẢN LÝ BACKGROUND ==========
    initPlatformBackgroundsPage() {
        // Kiểm tra đăng nhập
        if (localStorage.getItem('isLoggedIn') !== 'true') {
            this.navigateTo('login');
            return;
        }
        
        // Load dữ liệu background
        this.loadBackgrounds();
        
        // Xử lý nút quay lại
        const backBtn = document.getElementById('backToDashboard');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.navigateTo('dashboard');
            });
        }
        
        // Xử lý nút thêm background
        const addBtn = document.getElementById('addBgBtn');
        const addFirstBtn = document.getElementById('addFirstBg');
        
        if (addBtn) addBtn.addEventListener('click', () => this.openUploadModal());
        if (addFirstBtn) addFirstBtn.addEventListener('click', () => this.openUploadModal());
        
        // Xử lý modal
        this.initUploadModal();
        
        // Xử lý tabs
        this.initBackgroundTabs();
    }
    
    loadBackgrounds() {
        // Lấy từ localStorage (trong thực tế sẽ là API call)
        const backgrounds = JSON.parse(localStorage.getItem('platformBackgrounds') || '[]');
        this.renderBackgrounds(backgrounds);
    }
    
    renderBackgrounds(backgrounds) {
        const grid = document.getElementById('backgroundsGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (!grid) return;
        
        if (backgrounds.length === 0) {
            if (emptyState) emptyState.style.display = 'block';
            grid.innerHTML = '';
            return;
        }
        
        if (emptyState) emptyState.style.display = 'none';
        
        grid.innerHTML = backgrounds.map(bg => `
            <div class="bg-item">
                <div class="bg-thumbnail" style="background-image: url('${bg.url || 'https://via.placeholder.com/300x180'}')">
                    <div class="bg-overlay">
                        <div class="bg-actions">
                            <button class="bg-action-btn" onclick="app.setDefaultBackground('${bg.id}')" title="Đặt làm mặc định">
                                <i class="fas fa-star${bg.isDefault ? '' : ''}"></i>
                            </button>
                            <button class="bg-action-btn" onclick="app.editBackground('${bg.id}')" title="Chỉnh sửa">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="bg-action-btn" onclick="app.deleteBackground('${bg.id}')" title="Xóa">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="bg-content">
                    <div class="bg-header">
                        <h4 class="bg-name">${bg.name}</h4>
                        <span class="bg-platform platform-${bg.platform}">
                            ${this.getPlatformName(bg.platform)}
                        </span>
                    </div>
                    <div class="bg-meta">
                        <div>
                            <div>${this.formatDate(bg.uploadedAt)}</div>
                            <div>${bg.size || 'N/A'}</div>
                        </div>
                        ${bg.isDefault ? '<span class="bg-default">Mặc định</span>' : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }
    
    initUploadModal() {
        const modal = document.getElementById('uploadModal');
        const closeBtns = document.querySelectorAll('.modal-close');
        const uploadForm = document.getElementById('uploadForm');
        const bgUploadArea = document.getElementById('bgUploadArea');
        const bgFileInput = document.getElementById('bgFile');
        
        if (!modal) return;
        
        // Open modal
        window.openUploadModal = () => {
            modal.classList.add('active');
        };
        
        // Close modal
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                modal.classList.remove('active');
                if (uploadForm) uploadForm.reset();
            });
        });
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                if (uploadForm) uploadForm.reset();
            }
        });
        
        // File upload
        if (bgUploadArea && bgFileInput) {
            bgUploadArea.addEventListener('click', () => bgFileInput.click());
            bgFileInput.addEventListener('change', function(e) {
                if (e.target.files[0]) {
                    // Preview image
                    const reader = new FileReader();
                    reader.onload = function(event) {
                        const previewContainer = document.getElementById('previewContainer');
                        const previewImg = document.getElementById('previewImg');
                        if (previewContainer && previewImg) {
                            previewImg.src = event.target.result;
                            previewContainer.style.display = 'block';
                        }
                    };
                    reader.readAsDataURL(e.target.files[0]);
                }
            });
        }
        
        // Form submission
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const platform = document.getElementById('bgPlatform').value;
                const name = document.getElementById('bgName').value;
                const file = bgFileInput.files[0];
                const isDefault = document.getElementById('setAsDefault').checked;
                
                if (!platform || !file) {
                    alert('Vui lòng chọn sàn và file ảnh');
                    return;
                }
                
                // Upload background (trong thực tế sẽ là API call)
                this.uploadBackground({
                    platform,
                    name: name || `${this.getPlatformName(platform)} Background`,
                    file,
                    isDefault
                });
                
                // Close modal and reset
                modal.classList.remove('active');
                uploadForm.reset();
            });
        }
    }
    
    initBackgroundTabs() {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // Filter backgrounds
                const platform = tab.dataset.platform;
                this.filterBackgrounds(platform);
            });
        });
    }
    
    filterBackgrounds(platform) {
        const allBackgrounds = JSON.parse(localStorage.getItem('platformBackgrounds') || '[]');
        let filteredBackgrounds = allBackgrounds;
        
        if (platform !== 'all') {
            filteredBackgrounds = allBackgrounds.filter(bg => bg.platform === platform);
        }
        
        this.renderBackgrounds(filteredBackgrounds);
    }
    
    uploadBackground(data) {
        const reader = new FileReader();
        reader.onload = (event) => {
            const newBackground = {
                id: `bg_${Date.now()}`,
                platform: data.platform,
                name: data.name,
                url: event.target.result,
                isDefault: data.isDefault,
                uploadedAt: new Date().toISOString(),
                size: this.formatFileSize(data.file.size)
            };
            
            // Lấy backgrounds hiện tại
            const backgrounds = JSON.parse(localStorage.getItem('platformBackgrounds') || '[]');
            
            // Nếu đặt làm mặc định, bỏ mặc định của backgrounds cùng platform khác
            if (data.isDefault) {
                backgrounds.forEach(bg => {
                    if (bg.platform === data.platform) {
                        bg.isDefault = false;
                    }
                });
            }
            
            // Thêm background mới
            backgrounds.push(newBackground);
            
            // Lưu vào localStorage
            localStorage.setItem('platformBackgrounds', JSON.stringify(backgrounds));
            
            // Re-render
            const activeTab = document.querySelector('.tab-btn.active')?.dataset.platform || 'all';
            this.filterBackgrounds(activeTab);
            
            alert('Background đã được upload thành công!');
        };
        
        reader.readAsDataURL(data.file);
    }
    
    // ========== HÀM HỖ TRỢ BACKGROUND ==========
    setDefaultBackground(bgId) {
        const backgrounds = JSON.parse(localStorage.getItem('platformBackgrounds') || '[]');
        const bg = backgrounds.find(b => b.id === bgId);
        
        if (!bg) return;
        
        // Bỏ mặc định của backgrounds cùng platform
        backgrounds.forEach(b => {
            if (b.platform === bg.platform) {
                b.isDefault = false;
            }
        });
        
        // Đặt background này làm mặc định
        bg.isDefault = true;
        
        // Lưu lại
        localStorage.setItem('platformBackgrounds', JSON.stringify(backgrounds));
        
        // Re-render
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.platform || 'all';
        this.filterBackgrounds(activeTab);
        
        alert(`Đã đặt "${bg.name}" làm background mặc định cho ${this.getPlatformName(bg.platform)}`);
    }
    
    editBackground(bgId) {
        alert(`Chỉnh sửa background #${bgId}\nChức năng này sẽ được phát triển sau.`);
    }
    
    deleteBackground(bgId) {
        if (!confirm('Bạn có chắc chắn muốn xóa background này?')) return;
        
        const backgrounds = JSON.parse(localStorage.getItem('platformBackgrounds') || '[]');
        const bgToDelete = backgrounds.find(b => b.id === bgId);
        
        if (bgToDelete?.isDefault) {
            if (!confirm('Đây là background mặc định. Xóa sẽ bỏ mặc định. Tiếp tục?')) return;
        }
        
        // Xóa background
        const updatedBackgrounds = backgrounds.filter(b => b.id !== bgId);
        localStorage.setItem('platformBackgrounds', JSON.stringify(updatedBackgrounds));
        
        // Re-render
        const activeTab = document.querySelector('.tab-btn.active')?.dataset.platform || 'all';
        this.filterBackgrounds(activeTab);
        
        alert('Đã xóa background thành công');
    }
    
    formatDate(dateString) {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // ========== HÀM HỖ TRỢ CHUNG ==========
    getPlatformName(platform) {
        const platforms = {
            'gar': 'Gar',
            'mny': 'Mny',
            'oap': 'Oap',
            '3ce': '3CE',
            'other': 'Khác'
        };
        return platforms[platform] || platform;
    }
    
    getStatusText(status) {
        const statuses = {
            'upcoming': 'Sắp diễn ra',
            'live': 'Đang live',
            'ended': 'Đã kết thúc'
        };
        return statuses[status] || status;
    }
    
    loadRecentLiveSessions() {
        const container = document.getElementById('recentLiveSessions');
        if (!container) return;
        
        const sampleData = [
            { date: 'Hôm nay', time: '14:30 - 16:00', title: 'Hướng dẫn sử dụng ứng dụng mới', platform: 'mny' },
            { date: 'Hôm qua', time: '19:00 - 20:30', title: 'Khuyến mãi cuối tuần đặc biệt', platform: 'oap' },
            { date: '22/08', time: '10:00 - 12:00', title: 'Q&A với chuyên gia công nghệ', platform: '3ce' }
        ];
        
        container.innerHTML = sampleData.map(item => `
            <div class="recent-item">
                <div class="recent-header">
                    <span class="recent-date">${item.date}</span>
                    <span class="tag tag-${item.platform}">${this.getPlatformName(item.platform)}</span>
                </div>
                <h4 class="recent-title">${item.title}</h4>
                <div class="recent-details">
                    <span><i class="fas fa-clock"></i> ${item.time}</span>
                    <span><i class="fas fa-eye"></i> 1.2K lượt xem</span>
                </div>
            </div>
        `).join('');
    }
    
    // ========== CÁC HÀM XỬ LÝ LIVE ==========
    viewLive(id) {
        alert(`Xem chi tiết phiên live #${id}`);
        // Trong thực tế, sẽ chuyển đến trang chi tiết
    }
    
    editLive(id) {
        alert(`Chỉnh sửa phiên live #${id}`);
        // Trong thực tế, sẽ chuyển đến trang chỉnh sửa
        this.navigateTo('create-live');
    }
    
    deleteLive(id) {
        if (confirm('Bạn có chắc chắn muốn xóa phiên live này?')) {
            alert(`Đã xóa phiên live #${id}`);
            // Trong thực tế, sẽ gọi API xóa
        }
    }
}

// ========== KHỞI TẠO ỨNG DỤNG ==========
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AppRouter();
    
    // Lưu instance app để truy cập từ console
    window.app = app;
    
    // Khởi tạo dữ liệu mẫu nếu chưa có
    if (!localStorage.getItem('platformBackgrounds')) {
        const sampleBackgrounds = [
            {
                id: 'bg_1',
                platform: 'gar',
                name: 'Gaming Background',
                url: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=800',
                isDefault: true,
                uploadedAt: '2024-08-15',
                size: '2.4 MB'
            },
            {
                id: 'bg_2',
                platform: 'mny',
                name: 'Elegant Purple',
                url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800',
                isDefault: true,
                uploadedAt: '2024-08-10',
                size: '1.8 MB'
            },
            {
                id: 'bg_3',
                platform: 'oap',
                name: 'Summer Vibes',
                url: 'https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&w=800',
                isDefault: true,
                uploadedAt: '2024-08-01',
                size: '2.7 MB'
            },
            {
                id: 'bg_4',
                platform: '3ce',
                name: 'Tech Blue',
                url: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=800',
                isDefault: true,
                uploadedAt: '2024-08-05',
                size: '3.1 MB'
            }
        ];
        localStorage.setItem('platformBackgrounds', JSON.stringify(sampleBackgrounds));
    }
});

// Xử lý khi người dùng đóng tab/trình duyệt
window.addEventListener('beforeunload', () => {
    // Có thể lưu trạng thái hiện tại nếu cần
});