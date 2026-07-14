import React from 'react';

function About() {
    // Dữ liệu thành viên trong nhóm (Có thể sửa lại tên/vai trò tùy ý)
    const teamMembers = [
        { name: "Thành Viên A", role: "Frontend Developer", desc: "Chịu trách nhiệm thiết kế giao diện & trải nghiệm người dùng." },
        { name: "Thành Viên B", role: "Backend Developer", desc: "Xây dựng hệ thống API và quản lý cơ sở dữ liệu MySQL." },
        { name: "Thành Viên C", role: "Fullstack / Leader", desc: "Điều phối dự án, tối ưu hóa hiệu năng và bảo mật hệ thống." }
    ];

    return (
        <div className="container my-5 py-3">
            {/* 1. Hero Section: Giới thiệu chung */}
            <div className="row align-items-center mb-5 py-4">
                <div className="col-lg-6 text-start pe-lg-5">
                    <span className="text-uppercase text-primary fw-bold tracking-wider small">Về Chúng Tôi</span>
                    <h1 className="display-4 fw-bold text-dark mt-2 mb-4">Chào mừng bạn đến với <span className="text-primary">ElectroShop</span></h1>
                    <p className="lead text-muted mb-4">
                        Được thành lập vào năm 2026, ElectroShop tự hào là một trong những hệ thống cung cấp thiết bị công nghệ, Laptop chính hãng và linh kiện phần cứng hàng đầu.
                    </p>
                    <p className="text-secondary">
                        Chúng tôi không chỉ bán sản phẩm, chúng tôi mang lại giải pháp công nghệ toàn diện tối ưu nhất cho không gian làm việc và trải nghiệm giải trí của bạn. 
                        ElectroShop cam kết 100% sản phẩm phân phối là hàng chính hãng từ Apple, Asus, Intel... kèm chính sách hậu mãi vàng.
                    </p>
                </div>
                <div className="col-lg-6 mt-4 mt-lg-0">
                    <div className="position-relative p-3 bg-light rounded-4 shadow-sm border">
                        <div className="p-5 text-center bg-white rounded-3">
                            <i className="fa-solid fa-laptop-code text-primary display-1 mb-3"></i>
                            <h3 className="h4 text-dark fw-bold">Hệ Sinh Thái Công Nghệ</h3>
                            <p className="text-muted small">Khám phá các dòng Laptop Gaming, Văn phòng & Linh kiện cao cấp.</p>
                        </div>
                    </div>
                </div>
            </div>

            <hr className="my-5 opacity-25" />

            {/* 2. Core Values: Giá trị cốt lõi */}
            <div className="text-center mb-5">
                <h2 className="fw-bold text-dark mb-3">Giá Trị Cốt Lõi</h2>
                <p className="text-muted max-w-2xl mx-auto">Sự hài lòng và tin tưởng của khách hàng là kim chỉ nam cho mọi hoạt động tại ElectroShop.</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-md-4">
                    <div className="card h-100 p-4 border-0 shadow-sm bg-light text-center">
                        <div className="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-circle mb-3 mx-auto" style={{width: "60px", height: "60px"}}>
                            <i className="fa-solid fa-shield-halved fs-4"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-2">Chất Lượng Tối Thượng</h4>
                        <p className="text-muted small mb-0">Cam kết bảo hành chính hãng lâu dài. Nói không với hàng giả, hàng nhái, hàng kém chất lượng trên thị trường.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 p-4 border-0 shadow-sm bg-light text-center">
                        <div className="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle mb-3 mx-auto" style={{width: "60px", height: "60px"}}>
                            <i className="fa-solid fa-truck-fast fs-4"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-2">Dịch Vụ Tốc Độ</h4>
                        <p className="text-muted small mb-0">Xử lý đơn hàng siêu tốc, hỗ trợ giao hàng nhanh chóng nội thành và tư vấn kỹ thuật trực tuyến liên tục 24/7.</p>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card h-100 p-4 border-0 shadow-sm bg-light text-center">
                        <div className="d-inline-flex align-items-center justify-content-center bg-warning text-white rounded-circle mb-3 mx-auto" style={{width: "60px", height: "60px"}}>
                            <i className="fa-solid fa-handshake-angle fs-4"></i>
                        </div>
                        <h4 className="fw-bold text-dark mb-2">Đồng Hành Trọn Đời</h4>
                        <p className="text-muted small mb-0">Chính sách hậu mãi ưu việt, hỗ trợ nâng cấp phần cứng, vệ sinh máy và cài đặt phần mềm trọn đời sản phẩm.</p>
                    </div>
                </div>
            </div>

            <hr className="my-5 opacity-25" />

            {/* 3. Team Section: Đội ngũ phát triển (Rất ăn điểm bài tập nhóm) */}
            <div className="text-center mb-5">
                <h2 className="fw-bold text-dark mb-3">Đội Ngũ Phát Triển</h2>
                <p className="text-muted">Gặp gỡ các kỹ sư đứng sau dự án ElectroShop</p>
            </div>

            <div className="row g-4">
                {teamMembers.map((member, index) => (
                    <div className="col-md-4" key={index}>
                        <div className="card h-100 border shadow-sm text-center p-3">
                            <div className="my-3 mx-auto bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center" style={{width: "80px", height: "80px"}}>
                                <i className="fa-solid fa-user fs-2"></i>
                            </div>
                            <div className="card-body p-2">
                                <h5 className="card-title fw-bold text-dark mb-1">{member.name}</h5>
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-1 small mb-3 d-inline-block">{member.role}</span>
                                <p className="card-text text-muted small">{member.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default About;