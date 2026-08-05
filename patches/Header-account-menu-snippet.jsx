{/* Đặt ba Link này sau gx-header__account-summary
    và trước nút Đăng xuất trong Header.js. */}

<Link
  to="/account"
  onClick={closeMenus}
>
  <FontAwesomeIcon
    icon={["fas", "user-circle"]}
  />
  Tổng quan tài khoản
</Link>

<Link
  to="/account/orders"
  onClick={closeMenus}
>
  <FontAwesomeIcon
    icon={["fas", "receipt"]}
  />
  Đơn hàng của tôi
</Link>

<Link
  to="/account/change-password"
  onClick={closeMenus}
>
  <FontAwesomeIcon
    icon={["fas", "key"]}
  />
  Đổi mật khẩu
</Link>
