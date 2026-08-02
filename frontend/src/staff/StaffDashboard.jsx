import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { toast } from "../utils/Toast";
import "./StaffDashboard.css";

const API_BASE = (
  process.env.REACT_APP_API_URL ||
  "http://localhost:3001/api"
).replace(/\/$/, "");

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES = [
  "UNPAID",
  "PAID",
  "FAILED",
  "REFUNDED",
];

const NAV_ITEMS = [
  {
    id: "overview",
    label: "Tổng quan",
    icon: "chart-pie",
  },
  {
    id: "orders",
    label: "Đơn hàng",
    icon: "receipt",
  },
  {
    id: "products",
    label: "Sản phẩm",
    icon: "box-open",
  },
  {
    id: "inventory",
    label: "Kho hàng",
    icon: "warehouse",
  },
  {
    id: "payments",
    label: "Thanh toán",
    icon: "credit-card",
  },
  {
    id: "reviews",
    label: "Đánh giá",
    icon: "star",
  },
  {
    id: "reports",
    label: "Báo cáo",
    icon: "chart-line",
  },
];

function formatCurrency(value) {
  return new Intl.NumberFormat(
    "vi-VN",
    {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    },
  ).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

async function apiRequest(
  path,
  options = {},
) {
  const response = await fetch(
    `${API_BASE}${path}`,
    {
      credentials: "include",
      ...options,
      headers: {
        "Content-Type":
          "application/json",
        ...(options.headers || {}),
      },
    },
  );

  const data = await response
    .json()
    .catch(() => ({}));

  if (!response.ok) {
    const message = Array.isArray(
      data.message,
    )
      ? data.message.join(", ")
      : data.message ||
        "Yêu cầu không thành công";

    throw new Error(message);
  }

  return data;
}

function StatusBadge({
  value,
}) {
  const normalized = String(
    value || "UNKNOWN",
  ).toUpperCase();

  return (
    <span
      className={`staff-status staff-status--${normalized.toLowerCase()}`}
    >
      {normalized}
    </span>
  );
}

function EmptyState({
  title,
  description,
}) {
  return (
    <div className="staff-empty">
      <FontAwesomeIcon
        icon={[
          "fas",
          "inbox",
        ]}
      />

      <h3>{title}</h3>

      <p>{description}</p>
    </div>
  );
}

function StaffDashboard() {
  const navigate = useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const role = String(
    user?.role || "",
  ).toUpperCase();

  const isAdmin =
    role === "ADMIN";

  const [activeTab, setActiveTab] =
    useState("overview");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [dashboard, setDashboard] =
    useState(null);

  const [orders, setOrders] =
    useState([]);

  const [products, setProducts] =
    useState([]);

  const [inventory, setInventory] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [reviews, setReviews] =
    useState([]);

  const [report, setReport] =
    useState(null);

  const [accounts, setAccounts] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    lowStockOnly,
    setLowStockOnly,
  ] = useState(false);

  const [
    editingProduct,
    setEditingProduct,
  ] = useState(null);

  const [
    inventoryForm,
    setInventoryForm,
  ] = useState({
    productId: "",
    variantId: "",
    type: "IN",
    quantity: "",
    unitCost: "",
    note: "",
  });

  const [
    accountForm,
    setAccountForm,
  ] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    status: "ACTIVE",
  });


  const [productAssets, setProductAssets] = useState({
    images: [],
    variants: [],
  });

  const [assetLoading, setAssetLoading] = useState(false);

  const [imageForm, setImageForm] = useState({
    imageUrl: "",
    isThumbnail: false,
    sortOrder: 0,
  });

  const [variantForm, setVariantForm] = useState({
    name: "",
    sku: "",
    color: "",
    ram: "",
    storage: "",
    cpu: "",
    gpu: "",
    additionalPrice: 0,
    isDefault: false,
  });

  const availableNavItems =
    useMemo(
      () =>
        isAdmin
          ? [
              ...NAV_ITEMS,
              {
                id: "accounts",
                label:
                  "Tài khoản nhân viên",
                icon: "users-cog",
              },
            ]
          : NAV_ITEMS,
      [isAdmin],
    );

  const loadDashboard =
    useCallback(async () => {
      const data =
        await apiRequest(
          "/staff/dashboard",
        );

      setDashboard(data);
    }, []);

  const loadActiveTab =
    useCallback(async () => {
      setLoading(true);

      try {
        if (
          activeTab === "overview"
        ) {
          await loadDashboard();
        }

        if (activeTab === "orders") {
          const params =
            new URLSearchParams();

          if (search.trim()) {
            params.set(
              "search",
              search.trim(),
            );
          }

          if (statusFilter) {
            params.set(
              "status",
              statusFilter,
            );
          }

          setOrders(
            await apiRequest(
              `/staff/orders?${params.toString()}`,
            ),
          );
        }

        if (
          activeTab === "products"
        ) {
          const params =
            new URLSearchParams();

          if (search.trim()) {
            params.set(
              "search",
              search.trim(),
            );
          }

          setProducts(
            await apiRequest(
              `/staff/products?${params.toString()}`,
            ),
          );
        }

        if (
          activeTab === "inventory"
        ) {
          const params =
            new URLSearchParams();

          if (search.trim()) {
            params.set(
              "search",
              search.trim(),
            );
          }

          params.set(
            "lowStockOnly",
            String(lowStockOnly),
          );

          setInventory(
            await apiRequest(
              `/staff/inventory?${params.toString()}`,
            ),
          );
        }

        if (
          activeTab === "payments"
        ) {
          const params =
            new URLSearchParams();

          if (search.trim()) {
            params.set(
              "search",
              search.trim(),
            );
          }

          if (statusFilter) {
            params.set(
              "status",
              statusFilter,
            );
          }

          setPayments(
            await apiRequest(
              `/staff/payments?${params.toString()}`,
            ),
          );
        }

        if (activeTab === "reviews") {
          const params =
            new URLSearchParams();

          if (statusFilter) {
            params.set(
              "status",
              statusFilter,
            );
          }

          setReviews(
            await apiRequest(
              `/staff/reviews?${params.toString()}`,
            ),
          );
        }

        if (activeTab === "reports") {
          setReport(
            await apiRequest(
              "/staff/reports/revenue",
            ),
          );
        }

        if (
          activeTab === "accounts" &&
          isAdmin
        ) {
          setAccounts(
            await apiRequest(
              "/staff/accounts",
            ),
          );
        }
      } catch (error) {
        toast.error(
          error.message,
          3200,
        );
      } finally {
        setLoading(false);
      }
    }, [
      activeTab,
      isAdmin,
      loadDashboard,
      lowStockOnly,
      search,
      statusFilter,
    ]);

  useEffect(() => {
    loadActiveTab();
  }, [loadActiveTab]);

  useEffect(() => {
    if (
      activeTab !== "overview"
    ) {
      loadDashboard().catch(
        () => {},
      );
    }
  }, [
    activeTab,
    loadDashboard,
  ]);

  function changeTab(tab) {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("");
    setEditingProduct(null);
    setProductAssets({ images: [], variants: [] });
    setSidebarOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate("/login", {
      replace: true,
    });
  }

  async function updateOrderStatus(
    order,
    status,
  ) {
    if (
      status === order.status
    ) {
      return;
    }

    const note =
      window.prompt(
        "Ghi chú cập nhật trạng thái (có thể để trống):",
        "",
      ) || "";

    try {
      await apiRequest(
        `/staff/orders/${order.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
            note,
          }),
        },
      );

      toast.success(
        "Đã cập nhật đơn hàng",
      );

      await loadActiveTab();
      await loadDashboard();
    } catch (error) {
      toast.error(error.message);
    }
  }


  async function selectProduct(product) {
    setEditingProduct({ ...product });
    setAssetLoading(true);

    try {
      const data = await apiRequest(
        `/staff/products/${product.id}/assets`,
      );

      setProductAssets({
        images: Array.isArray(data.images) ? data.images : [],
        variants: Array.isArray(data.variants) ? data.variants : [],
      });
    } catch (error) {
      toast.error(error.message);
      setProductAssets({ images: [], variants: [] });
    } finally {
      setAssetLoading(false);
    }
  }

  async function addProductImage(event) {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    try {
      new URL(imageForm.imageUrl);
    } catch {
      toast.warning('Đường dẫn hình ảnh không hợp lệ');
      return;
    }

    try {
      await apiRequest(
        `/staff/products/${editingProduct.id}/images`,
        {
          method: 'POST',
          body: JSON.stringify({
            imageUrl: imageForm.imageUrl.trim(),
            isThumbnail: Boolean(imageForm.isThumbnail),
            sortOrder: Number(imageForm.sortOrder || 0),
          }),
        },
      );

      toast.success('Đã thêm hình ảnh sản phẩm');
      setImageForm({ imageUrl: '', isThumbnail: false, sortOrder: 0 });
      await selectProduct(editingProduct);
      await loadActiveTab();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function deleteProductImage(imageId) {
    if (!editingProduct) {
      return;
    }

    if (!window.confirm('Xóa hình ảnh này?')) {
      return;
    }

    try {
      await apiRequest(
        `/staff/products/${editingProduct.id}/images/${imageId}`,
        { method: 'DELETE' },
      );

      toast.success('Đã xóa hình ảnh');
      await selectProduct(editingProduct);
      await loadActiveTab();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function createProductVariant(event) {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    if (variantForm.name.trim().length < 2 || variantForm.sku.trim().length < 2) {
      toast.warning('Tên phiên bản và SKU phải có ít nhất 2 ký tự');
      return;
    }

    const additionalPrice = Number(variantForm.additionalPrice || 0);

    if (!Number.isFinite(additionalPrice) || additionalPrice < 0) {
      toast.warning('Giá cộng thêm không hợp lệ');
      return;
    }

    try {
      await apiRequest(
        `/staff/products/${editingProduct.id}/variants`,
        {
          method: 'POST',
          body: JSON.stringify({
            ...variantForm,
            name: variantForm.name.trim(),
            sku: variantForm.sku.trim(),
            additionalPrice,
          }),
        },
      );

      toast.success('Đã tạo phiên bản sản phẩm');
      setVariantForm({
        name: '',
        sku: '',
        color: '',
        ram: '',
        storage: '',
        cpu: '',
        gpu: '',
        additionalPrice: 0,
        isDefault: false,
      });
      await selectProduct(editingProduct);
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function saveProduct(
    event,
  ) {
    event.preventDefault();

    if (!editingProduct) {
      return;
    }

    const price = Number(
      editingProduct.price,
    );

    if (
      !editingProduct.name
        .trim() ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      toast.warning(
        "Tên và giá sản phẩm không hợp lệ",
      );

      return;
    }

    try {
      await apiRequest(
        `/staff/products/${editingProduct.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            name:
              editingProduct.name.trim(),
            price,
            description:
              editingProduct.description ||
              "",
            status:
              editingProduct.status,
          }),
        },
      );

      toast.success(
        "Đã cập nhật sản phẩm",
      );

      await loadActiveTab();
      await selectProduct({
        ...editingProduct,
        price,
      });
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function createInventoryTransaction(
    event,
  ) {
    event.preventDefault();

    const productId = Number(
      inventoryForm.productId,
    );

    const quantity = Number(
      inventoryForm.quantity,
    );

    if (
      !Number.isInteger(
        productId,
      ) ||
      productId <= 0
    ) {
      toast.warning(
        "Vui lòng chọn sản phẩm",
      );

      return;
    }

    if (
      !Number.isInteger(quantity) ||
      quantity === 0
    ) {
      toast.warning(
        "Số lượng phải là số nguyên khác 0",
      );

      return;
    }

    if (
      inventoryForm.type !==
        "ADJUST" &&
      quantity < 0
    ) {
      toast.warning(
        "Nhập hoặc xuất kho phải dùng số lượng dương",
      );

      return;
    }

    try {
      await apiRequest(
        "/staff/inventory/transactions",
        {
          method: "POST",
          body: JSON.stringify({
            productId,
            variantId:
              inventoryForm.variantId
                ? Number(
                    inventoryForm.variantId,
                  )
                : undefined,
            type:
              inventoryForm.type,
            quantity,
            unitCost:
              inventoryForm.unitCost
                ? Number(
                    inventoryForm.unitCost,
                  )
                : undefined,
            note:
              inventoryForm.note,
          }),
        },
      );

      toast.success(
        "Đã ghi nhận giao dịch kho",
      );

      setInventoryForm({
        productId: "",
        variantId: "",
        type: "IN",
        quantity: "",
        unitCost: "",
        note: "",
      });

      await loadActiveTab();
      await loadDashboard();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function updatePaymentStatus(
    payment,
    status,
  ) {
    if (
      status === payment.status
    ) {
      return;
    }

    try {
      await apiRequest(
        `/staff/payments/${payment.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        },
      );

      toast.success(
        "Đã cập nhật thanh toán",
      );

      await loadActiveTab();
      await loadDashboard();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function updateReviewStatus(
    review,
    status,
  ) {
    try {
      await apiRequest(
        `/staff/reviews/${review.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status,
          }),
        },
      );

      toast.success(
        "Đã cập nhật đánh giá",
      );

      await loadActiveTab();
      await loadDashboard();
    } catch (error) {
      toast.error(error.message);
    }
  }

  async function replyReview(
    review,
  ) {
    const content =
      window.prompt(
        `Phản hồi đánh giá của ${review.customerName}:`,
        "",
      );

    if (
      !content ||
      content.trim().length < 2
    ) {
      return;
    }

    try {
      await apiRequest(
        `/staff/reviews/${review.id}/replies`,
        {
          method: "POST",
          body: JSON.stringify({
            content:
              content.trim(),
          }),
        },
      );

      toast.success(
        "Đã phản hồi đánh giá",
      );

      await loadActiveTab();
    } catch (error) {
      toast.error(error.message);
    }
  }

  function validateAccountForm() {
    const errors = [];

    if (
      accountForm.name
        .trim().length < 2
    ) {
      errors.push(
        "Họ tên tối thiểu 2 ký tự",
      );
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        accountForm.email.trim(),
      )
    ) {
      errors.push(
        "Email không hợp lệ",
      );
    }

    if (
      !/^(0|\+84)[0-9]{9}$/.test(
        accountForm.phone
          .replace(/[\s.-]/g, ""),
      )
    ) {
      errors.push(
        "Số điện thoại không hợp lệ",
      );
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,72}$/.test(
        accountForm.password,
      )
    ) {
      errors.push(
        "Mật khẩu từ 8 ký tự, có chữ hoa, chữ thường và số",
      );
    }

    return errors;
  }

  async function createStaffAccount(
    event,
  ) {
    event.preventDefault();

    const errors =
      validateAccountForm();

    if (errors.length) {
      toast.warning(
        errors[0],
        3200,
      );

      return;
    }

    try {
      await apiRequest(
        "/staff/accounts",
        {
          method: "POST",
          body: JSON.stringify({
            ...accountForm,
            name:
              accountForm.name.trim(),
            email:
              accountForm.email
                .trim()
                .toLowerCase(),
            phone:
              accountForm.phone
                .replace(
                  /[\s.-]/g,
                  "",
                ),
          }),
        },
      );

      toast.success(
        "Tạo tài khoản nhân viên thành công",
      );

      setAccountForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "ACTIVE",
      });

      await loadActiveTab();
    } catch (error) {
      toast.error(error.message);
    }
  }

  const summary =
    dashboard?.summary || {};

  const maxRevenue = Math.max(
    1,
    ...(report?.monthly || []).map(
      (item) =>
        Number(item.revenue || 0),
    ),
  );

  return (
    <main className="staff-app">
      <aside
        className={`staff-sidebar ${
          sidebarOpen
            ? "is-open"
            : ""
        }`}
      >
        <div className="staff-brand">
          <span>
            <FontAwesomeIcon
              icon={[
                "fas",
                "microchip",
              ]}
            />
          </span>

          <div>
            <strong>GEARXIN</strong>
            <small>
              Staff Operations
            </small>
          </div>
        </div>

        <nav>
          {availableNavItems.map(
            (item) => (
              <button
                key={item.id}
                type="button"
                className={
                  activeTab === item.id
                    ? "is-active"
                    : ""
                }
                onClick={() =>
                  changeTab(item.id)
                }
              >
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    item.icon,
                  ]}
                />

                <span>
                  {item.label}
                </span>
              </button>
            ),
          )}
        </nav>

        <div className="staff-sidebar__bottom">
          <Link to="/ai-search">
            <FontAwesomeIcon
              icon={[
                "fas",
                "robot",
              ]}
            />

            Sử dụng AI Search
          </Link>

          <Link to="/">
            <FontAwesomeIcon
              icon={[
                "fas",
                "store",
              ]}
            />

            Xem cửa hàng
          </Link>

          <button
            type="button"
            onClick={handleLogout}
          >
            <FontAwesomeIcon
              icon={[
                "fas",
                "sign-out-alt",
              ]}
            />

            Đăng xuất
          </button>
        </div>
      </aside>

      <section className="staff-main">
        <header className="staff-topbar">
          <button
            type="button"
            className="staff-menu-toggle"
            onClick={() =>
              setSidebarOpen(
                (value) => !value,
              )
            }
          >
            <FontAwesomeIcon
              icon={[
                "fas",
                "bars",
              ]}
            />
          </button>

          <div>
            <span>
              Khu vực nghiệp vụ
            </span>

            <h1>
              {
                availableNavItems.find(
                  (item) =>
                    item.id ===
                    activeTab,
                )?.label
              }
            </h1>
          </div>

          <div className="staff-user">
            <span>
              <FontAwesomeIcon
                icon={[
                  "fas",
                  "user-shield",
                ]}
              />
            </span>

            <div>
              <strong>
                {user?.name ||
                  user?.email}
              </strong>

              <small>{role}</small>
            </div>
          </div>
        </header>

        <div className="staff-content">
          {loading && (
            <div className="staff-loading">
              <span className="spinner-border" />
              Đang tải dữ liệu...
            </div>
          )}

          {activeTab ===
            "overview" &&
            dashboard && (
              <>
                <section className="staff-summary-grid">
                  <SummaryCard
                    icon="calendar-day"
                    label="Đơn hôm nay"
                    value={
                      summary.ordersToday
                    }
                  />

                  <SummaryCard
                    icon="hourglass-half"
                    label="Chờ xử lý"
                    value={
                      summary.ordersWaiting
                    }
                    tone="warning"
                  />

                  <SummaryCard
                    icon="triangle-exclamation"
                    label="Sắp hết hàng"
                    value={
                      summary.lowStockProducts
                    }
                    tone="danger"
                  />

                  <SummaryCard
                    icon="comments"
                    label="Đánh giá chờ duyệt"
                    value={
                      summary.pendingReviews
                    }
                    tone="info"
                  />

                  <SummaryCard
                    icon="coins"
                    label="Doanh thu tháng"
                    value={formatCurrency(
                      summary.revenueThisMonth,
                    )}
                    tone="success"
                    wide
                  />
                </section>

                <section className="staff-two-columns">
                  <Panel
                    title="Đơn hàng gần đây"
                    action={() =>
                      changeTab("orders")
                    }
                    actionLabel="Xem tất cả"
                  >
                    <CompactOrderTable
                      rows={
                        dashboard.recentOrders ||
                        []
                      }
                    />
                  </Panel>

                  <Panel
                    title="Cảnh báo tồn kho"
                    action={() =>
                      changeTab(
                        "inventory",
                      )
                    }
                    actionLabel="Mở kho hàng"
                  >
                    {(dashboard.lowStock ||
                      []).length ? (
                      <div className="staff-alert-list">
                        {dashboard.lowStock.map(
                          (item) => (
                            <div
                              key={
                                item.id
                              }
                            >
                              <span>
                                {
                                  item.name
                                }
                              </span>

                              <b>
                                {
                                  item.stock
                                }
                              </b>
                            </div>
                          ),
                        )}
                      </div>
                    ) : (
                      <EmptyState
                        title="Kho đang ổn định"
                        description="Không có sản phẩm dưới ngưỡng cảnh báo."
                      />
                    )}
                  </Panel>
                </section>
              </>
            )}

          {activeTab ===
            "orders" && (
            <Panel title="Quản lý và xử lý đơn hàng">
              <Toolbar
                search={search}
                setSearch={setSearch}
                placeholder="Mã đơn, khách hàng, email..."
                onSearch={
                  loadActiveTab
                }
              >
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value,
                    )
                  }
                >
                  <option value="">
                    Tất cả trạng thái
                  </option>

                  {ORDER_STATUSES.map(
                    (status) => (
                      <option
                        key={status}
                        value={status}
                      >
                        {status}
                      </option>
                    ),
                  )}
                </select>
              </Toolbar>

              {orders.length ? (
                <div className="staff-table-wrap">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Đơn</th>
                        <th>Khách hàng</th>
                        <th>Thanh toán</th>
                        <th>Tổng tiền</th>
                        <th>Ngày tạo</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map(
                        (order) => (
                          <tr
                            key={
                              order.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  order.code
                                }
                              </strong>

                              <small>
                                {
                                  order.shippingAddress ||
                                  "Chưa có địa chỉ"
                                }
                              </small>
                            </td>

                            <td>
                              <strong>
                                {
                                  order.customerName
                                }
                              </strong>

                              <small>
                                {
                                  order.customerPhone
                                }
                              </small>
                            </td>

                            <td>
                              <StatusBadge
                                value={
                                  order.paymentStatus ||
                                  "UNPAID"
                                }
                              />

                              <small>
                                {
                                  order.paymentMethod ||
                                  "—"
                                }
                              </small>
                            </td>

                            <td>
                              <strong>
                                {formatCurrency(
                                  order.totalAmount,
                                )}
                              </strong>
                            </td>

                            <td>
                              {formatDate(
                                order.createdAt,
                              )}
                            </td>

                            <td>
                              <select
                                className="staff-status-select"
                                value={
                                  order.status
                                }
                                onChange={(
                                  event,
                                ) =>
                                  updateOrderStatus(
                                    order,
                                    event
                                      .target
                                      .value,
                                  )
                                }
                              >
                                {ORDER_STATUSES.map(
                                  (
                                    status,
                                  ) => (
                                    <option
                                      key={
                                        status
                                      }
                                      value={
                                        status
                                      }
                                    >
                                      {
                                        status
                                      }
                                    </option>
                                  ),
                                )}
                              </select>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  title="Không có đơn hàng"
                  description="Không tìm thấy đơn hàng phù hợp với bộ lọc."
                />
              )}
            </Panel>
          )}

          {activeTab ===
            "products" && (
            <div className="staff-split-layout">
              <Panel title="Danh sách sản phẩm">
                <Toolbar
                  search={search}
                  setSearch={
                    setSearch
                  }
                  placeholder="Tên sản phẩm, danh mục, thương hiệu..."
                  onSearch={
                    loadActiveTab
                  }
                />

                <div className="staff-product-list">
                  {products.map(
                    (product) => (
                      <button
                        type="button"
                        key={
                          product.id
                        }
                        className={
                          editingProduct
                            ?.id ===
                          product.id
                            ? "is-selected"
                            : ""
                        }
                        onClick={() =>
                          selectProduct(product)
                        }
                      >
                        <img
                          src={
                            product.image ||
                            "https://via.placeholder.com/120?text=Gearxin"
                          }
                          alt={
                            product.name
                          }
                        />

                        <span>
                          <strong>
                            {
                              product.name
                            }
                          </strong>

                          <small>
                            {
                              product.categoryName
                            }{" "}
                            ·{" "}
                            {
                              product.brandName
                            }
                          </small>
                        </span>

                        <b>
                          {formatCurrency(
                            product.price,
                          )}
                        </b>
                      </button>
                    ),
                  )}
                </div>
              </Panel>

              <Panel title="Chỉnh sửa sản phẩm">
                {editingProduct ? (
                  <>
                  <form
                    className="staff-form"
                    onSubmit={
                      saveProduct
                    }
                  >
                    <label>
                      <span>
                        Tên sản phẩm
                      </span>

                      <input
                        value={
                          editingProduct.name
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditingProduct(
                            (
                              current,
                            ) => ({
                              ...current,
                              name:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Giá bán</span>

                      <input
                        type="number"
                        min="0"
                        value={
                          editingProduct.price
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditingProduct(
                            (
                              current,
                            ) => ({
                              ...current,
                              price:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Trạng thái
                      </span>

                      <select
                        value={
                          editingProduct.status
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditingProduct(
                            (
                              current,
                            ) => ({
                              ...current,
                              status:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      >
                        <option value="ACTIVE">
                          ACTIVE
                        </option>

                        <option value="INACTIVE">
                          INACTIVE
                        </option>
                      </select>
                    </label>

                    <label>
                      <span>Mô tả</span>

                      <textarea
                        rows="7"
                        value={
                          editingProduct.description ||
                          ""
                        }
                        onChange={(
                          event,
                        ) =>
                          setEditingProduct(
                            (
                              current,
                            ) => ({
                              ...current,
                              description:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <button type="submit">
                      Lưu thay đổi
                    </button>
                  </form>

                  <section className="staff-asset-section">
                    <header>
                      <div>
                        <span>Hình ảnh</span>
                        <h3>Ảnh sản phẩm</h3>
                      </div>
                      <b>{productAssets.images.length}</b>
                    </header>

                    {assetLoading ? (
                      <p>Đang tải hình ảnh và phiên bản...</p>
                    ) : (
                      <div className="staff-image-grid">
                        {productAssets.images.map((image) => (
                          <article key={image.id}>
                            <img src={image.imageUrl} alt="Ảnh sản phẩm" />
                            <span>{image.isThumbnail ? 'Ảnh đại diện' : `Thứ tự ${image.sortOrder}`}</span>
                            <button type="button" onClick={() => deleteProductImage(image.id)}>
                              Xóa
                            </button>
                          </article>
                        ))}
                      </div>
                    )}

                    <form className="staff-inline-form" onSubmit={addProductImage}>
                      <input
                        type="url"
                        placeholder="https://.../image.jpg"
                        value={imageForm.imageUrl}
                        onChange={(event) => setImageForm((current) => ({
                          ...current,
                          imageUrl: event.target.value,
                        }))}
                        required
                      />
                      <input
                        type="number"
                        min="0"
                        aria-label="Thứ tự ảnh"
                        value={imageForm.sortOrder}
                        onChange={(event) => setImageForm((current) => ({
                          ...current,
                          sortOrder: event.target.value,
                        }))}
                      />
                      <label className="staff-check-row">
                        <input
                          type="checkbox"
                          checked={imageForm.isThumbnail}
                          onChange={(event) => setImageForm((current) => ({
                            ...current,
                            isThumbnail: event.target.checked,
                          }))}
                        />
                        Ảnh đại diện
                      </label>
                      <button type="submit">Thêm ảnh</button>
                    </form>
                  </section>

                  <section className="staff-asset-section">
                    <header>
                      <div>
                        <span>Phiên bản</span>
                        <h3>Biến thể sản phẩm</h3>
                      </div>
                      <b>{productAssets.variants.length}</b>
                    </header>

                    <div className="staff-variant-assets">
                      {productAssets.variants.map((variant) => (
                        <article key={variant.id}>
                          <div>
                            <strong>{variant.name}</strong>
                            <small>{variant.sku || 'Chưa có SKU'}</small>
                          </div>
                          <span>{[variant.cpu, variant.ram, variant.storage, variant.color].filter(Boolean).join(' · ') || 'Cấu hình mặc định'}</span>
                          <b>Còn {variant.available}</b>
                        </article>
                      ))}
                    </div>

                    <form className="staff-form staff-variant-create" onSubmit={createProductVariant}>
                      <div className="staff-form-grid">
                        <label><span>Tên phiên bản *</span><input value={variantForm.name} onChange={(event) => setVariantForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                        <label><span>SKU *</span><input value={variantForm.sku} onChange={(event) => setVariantForm((current) => ({ ...current, sku: event.target.value }))} required /></label>
                        <label><span>CPU</span><input value={variantForm.cpu} onChange={(event) => setVariantForm((current) => ({ ...current, cpu: event.target.value }))} /></label>
                        <label><span>RAM</span><input value={variantForm.ram} onChange={(event) => setVariantForm((current) => ({ ...current, ram: event.target.value }))} /></label>
                        <label><span>Ổ cứng</span><input value={variantForm.storage} onChange={(event) => setVariantForm((current) => ({ ...current, storage: event.target.value }))} /></label>
                        <label><span>GPU</span><input value={variantForm.gpu} onChange={(event) => setVariantForm((current) => ({ ...current, gpu: event.target.value }))} /></label>
                        <label><span>Màu sắc</span><input value={variantForm.color} onChange={(event) => setVariantForm((current) => ({ ...current, color: event.target.value }))} /></label>
                        <label><span>Giá cộng thêm</span><input type="number" min="0" value={variantForm.additionalPrice} onChange={(event) => setVariantForm((current) => ({ ...current, additionalPrice: event.target.value }))} /></label>
                      </div>
                      <label className="staff-check-row">
                        <input type="checkbox" checked={variantForm.isDefault} onChange={(event) => setVariantForm((current) => ({ ...current, isDefault: event.target.checked }))} />
                        Đặt làm phiên bản mặc định
                      </label>
                      <button type="submit">Tạo phiên bản</button>
                    </form>
                  </section>
                  </>
                ) : (
                  <EmptyState
                    title="Chọn một sản phẩm"
                    description="Chọn sản phẩm bên trái để chỉnh sửa tên, giá, mô tả và trạng thái."
                  />
                )}
              </Panel>
            </div>
          )}

          {activeTab ===
            "inventory" && (
            <div className="staff-split-layout staff-split-layout--inventory">
              <Panel title="Tồn kho sản phẩm">
                <Toolbar
                  search={search}
                  setSearch={
                    setSearch
                  }
                  placeholder="Tìm sản phẩm trong kho..."
                  onSearch={
                    loadActiveTab
                  }
                >
                  <label className="staff-check">
                    <input
                      type="checkbox"
                      checked={
                        lowStockOnly
                      }
                      onChange={(
                        event,
                      ) =>
                        setLowStockOnly(
                          event.target
                            .checked,
                        )
                      }
                    />

                    Chỉ hiện sắp hết
                  </label>
                </Toolbar>

                <div className="staff-table-wrap">
                  <table className="staff-table">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Danh mục</th>
                        <th>Biến thể</th>
                        <th>Tồn kho</th>
                      </tr>
                    </thead>

                    <tbody>
                      {inventory.map(
                        (item) => (
                          <tr
                            key={
                              item.id
                            }
                          >
                            <td>
                              <strong>
                                {
                                  item.name
                                }
                              </strong>

                              <small>
                                ID #
                                {
                                  item.id
                                }
                              </small>
                            </td>

                            <td>
                              {
                                item.categoryName
                              }
                            </td>

                            <td>
                              {
                                item.variantCount
                              }
                            </td>

                            <td>
                              <span
                                className={`staff-stock ${
                                  item.stock <=
                                  10
                                    ? "is-low"
                                    : ""
                                }`}
                              >
                                {
                                  item.stock
                                }
                              </span>
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </Panel>

              <Panel title="Nhập, xuất hoặc điều chỉnh kho">
                <form
                  className="staff-form"
                  onSubmit={
                    createInventoryTransaction
                  }
                >
                  <label>
                    <span>
                      Sản phẩm
                    </span>

                    <select
                      required
                      value={
                        inventoryForm.productId
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            productId:
                              event
                                .target
                                .value,
                            variantId:
                              "",
                          }),
                        )
                      }
                    >
                      <option value="">
                        Chọn sản phẩm
                      </option>

                      {inventory.map(
                        (item) => (
                          <option
                            value={
                              item.id
                            }
                            key={
                              item.id
                            }
                          >
                            {
                              item.name
                            }{" "}
                            (còn{" "}
                            {
                              item.stock
                            }
                            )
                          </option>
                        ),
                      )}
                    </select>
                  </label>

                  <label>
                    <span>
                      Variant ID
                      (nếu có)
                    </span>

                    <input
                      type="number"
                      min="1"
                      value={
                        inventoryForm.variantId
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            variantId:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                      placeholder="Để trống nếu sản phẩm không có biến thể"
                    />
                  </label>

                  <label>
                    <span>
                      Loại giao dịch
                    </span>

                    <select
                      value={
                        inventoryForm.type
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            type:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    >
                      <option value="IN">
                        Nhập kho
                      </option>

                      <option value="OUT">
                        Xuất kho
                      </option>

                      <option value="ADJUST">
                        Điều chỉnh
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Số lượng</span>

                    <input
                      type="number"
                      required
                      value={
                        inventoryForm.quantity
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            quantity:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>
                      Giá nhập
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={
                        inventoryForm.unitCost
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            unitCost:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </label>

                  <label>
                    <span>Ghi chú</span>

                    <textarea
                      rows="3"
                      value={
                        inventoryForm.note
                      }
                      onChange={(
                        event,
                      ) =>
                        setInventoryForm(
                          (
                            current,
                          ) => ({
                            ...current,
                            note:
                              event
                                .target
                                .value,
                          }),
                        )
                      }
                    />
                  </label>

                  <button type="submit">
                    Ghi nhận giao dịch
                  </button>
                </form>
              </Panel>
            </div>
          )}

          {activeTab ===
            "payments" && (
            <Panel title="Xử lý thanh toán và hoàn tiền">
              <Toolbar
                search={search}
                setSearch={setSearch}
                placeholder="Mã thanh toán, mã đơn, khách hàng..."
                onSearch={
                  loadActiveTab
                }
              >
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value,
                    )
                  }
                >
                  <option value="">
                    Tất cả trạng thái
                  </option>

                  {PAYMENT_STATUSES.map(
                    (status) => (
                      <option
                        value={status}
                        key={status}
                      >
                        {status}
                      </option>
                    ),
                  )}
                </select>
              </Toolbar>

              <div className="staff-table-wrap">
                <table className="staff-table">
                  <thead>
                    <tr>
                      <th>Thanh toán</th>
                      <th>Đơn hàng</th>
                      <th>Khách hàng</th>
                      <th>Phương thức</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map(
                      (payment) => (
                        <tr
                          key={
                            payment.id
                          }
                        >
                          <td>
                            <strong>
                              {
                                payment.code
                              }
                            </strong>

                            <small>
                              {formatDate(
                                payment.createdAt,
                              )}
                            </small>
                          </td>

                          <td>
                            {
                              payment.orderCode
                            }
                          </td>

                          <td>
                            {
                              payment.customerName
                            }
                          </td>

                          <td>
                            {
                              payment.methodName
                            }
                          </td>

                          <td>
                            <strong>
                              {formatCurrency(
                                payment.amount,
                              )}
                            </strong>
                          </td>

                          <td>
                            <select
                              className="staff-status-select"
                              value={
                                payment.status
                              }
                              onChange={(
                                event,
                              ) =>
                                updatePaymentStatus(
                                  payment,
                                  event
                                    .target
                                    .value,
                                )
                              }
                            >
                              {PAYMENT_STATUSES.map(
                                (
                                  status,
                                ) => (
                                  <option
                                    key={
                                      status
                                    }
                                    value={
                                      status
                                    }
                                  >
                                    {
                                      status
                                    }
                                  </option>
                                ),
                              )}
                            </select>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {activeTab ===
            "reviews" && (
            <Panel title="Kiểm duyệt và phản hồi đánh giá">
              <Toolbar
                search=""
                setSearch={() => {}}
                hideSearch
                onSearch={
                  loadActiveTab
                }
              >
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target
                        .value,
                    )
                  }
                >
                  <option value="">
                    Tất cả trạng thái
                  </option>

                  <option value="PENDING">
                    PENDING
                  </option>

                  <option value="APPROVED">
                    APPROVED
                  </option>

                  <option value="REJECTED">
                    REJECTED
                  </option>
                </select>
              </Toolbar>

              <div className="staff-review-grid">
                {reviews.map(
                  (review) => (
                    <article
                      className="staff-review-card"
                      key={review.id}
                    >
                      <header>
                        <div>
                          <strong>
                            {
                              review.customerName
                            }
                          </strong>

                          <small>
                            {
                              review.productName
                            }
                          </small>
                        </div>

                        <StatusBadge
                          value={
                            review.status
                          }
                        />
                      </header>

                      <div className="staff-review-stars">
                        {"★".repeat(
                          review.rating,
                        )}
                        {"☆".repeat(
                          Math.max(
                            0,
                            5 -
                              review.rating,
                          ),
                        )}
                      </div>

                      <h3>
                        {review.title ||
                          "Đánh giá sản phẩm"}
                      </h3>

                      <p>
                        {review.content ||
                          "Không có nội dung."}
                      </p>

                      <footer>
                        <button
                          type="button"
                          onClick={() =>
                            updateReviewStatus(
                              review,
                              "APPROVED",
                            )
                          }
                        >
                          Duyệt
                        </button>

                        <button
                          type="button"
                          className="is-danger"
                          onClick={() =>
                            updateReviewStatus(
                              review,
                              "REJECTED",
                            )
                          }
                        >
                          Từ chối
                        </button>

                        <button
                          type="button"
                          className="is-secondary"
                          onClick={() =>
                            replyReview(
                              review,
                            )
                          }
                        >
                          Phản hồi
                        </button>
                      </footer>
                    </article>
                  ),
                )}
              </div>
            </Panel>
          )}

          {activeTab ===
            "reports" &&
            report && (
              <div className="staff-report-grid">
                <Panel title="Doanh thu 12 tháng">
                  <div className="staff-chart">
                    {(report.monthly ||
                      []).map(
                      (item) => (
                        <div
                          className="staff-chart__item"
                          key={
                            item.month
                          }
                        >
                          <span>
                            {formatCurrency(
                              item.revenue,
                            )}
                          </span>

                          <div>
                            <i
                              style={{
                                height: `${Math.max(
                                  6,
                                  (item.revenue /
                                    maxRevenue) *
                                    100,
                                )}%`,
                              }}
                            />
                          </div>

                          <small>
                            {
                              item.month
                            }
                          </small>
                        </div>
                      ),
                    )}
                  </div>
                </Panel>

                <Panel title="Trạng thái đơn hàng">
                  <div className="staff-stat-list">
                    {(
                      report.statusSummary ||
                      []
                    ).map(
                      (item) => (
                        <div
                          key={
                            item.status
                          }
                        >
                          <StatusBadge
                            value={
                              item.status
                            }
                          />

                          <strong>
                            {
                              item.orderCount
                            }
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                </Panel>

                <Panel title="Sản phẩm bán chạy">
                  <div className="staff-ranking">
                    {(
                      report.topProducts ||
                      []
                    ).map(
                      (
                        item,
                        index,
                      ) => (
                        <div
                          key={
                            item.id
                          }
                        >
                          <b>
                            #
                            {index +
                              1}
                          </b>

                          <span>
                            {
                              item.name
                            }
                          </span>

                          <strong>
                            {
                              item.totalSold
                            }
                          </strong>
                        </div>
                      ),
                    )}
                  </div>
                </Panel>
              </div>
            )}

          {activeTab ===
            "accounts" &&
            isAdmin && (
              <div className="staff-split-layout">
                <Panel title="Tài khoản nhân viên">
                  <div className="staff-table-wrap">
                    <table className="staff-table">
                      <thead>
                        <tr>
                          <th>Nhân viên</th>
                          <th>Liên hệ</th>
                          <th>Trạng thái</th>
                          <th>Ngày tạo</th>
                        </tr>
                      </thead>

                      <tbody>
                        {accounts.map(
                          (account) => (
                            <tr
                              key={
                                account.id
                              }
                            >
                              <td>
                                <strong>
                                  {
                                    account.name
                                  }
                                </strong>

                                <small>
                                  ID #
                                  {
                                    account.id
                                  }
                                </small>
                              </td>

                              <td>
                                <strong>
                                  {
                                    account.email
                                  }
                                </strong>

                                <small>
                                  {
                                    account.phone
                                  }
                                </small>
                              </td>

                              <td>
                                <StatusBadge
                                  value={
                                    account.status
                                  }
                                />
                              </td>

                              <td>
                                {formatDate(
                                  account.createdAt,
                                )}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <Panel title="Tạo tài khoản nhân viên">
                  <div className="staff-admin-note">
                    <FontAwesomeIcon
                      icon={[
                        "fas",
                        "shield-alt",
                      ]}
                    />

                    Chỉ tài khoản
                    ADMIN được phép
                    tạo nhân viên.
                  </div>

                  <form
                    className="staff-form"
                    onSubmit={
                      createStaffAccount
                    }
                  >
                    <label>
                      <span>
                        Họ và tên
                      </span>

                      <input
                        value={
                          accountForm.name
                        }
                        onChange={(
                          event,
                        ) =>
                          setAccountForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              name:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>Email</span>

                      <input
                        type="email"
                        value={
                          accountForm.email
                        }
                        onChange={(
                          event,
                        ) =>
                          setAccountForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              email:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      />
                    </label>

                    <label>
                      <span>
                        Số điện thoại
                      </span>

                      <input
                        value={
                          accountForm.phone
                        }
                        onChange={(
                          event,
                        ) =>
                          setAccountForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              phone:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        placeholder="0901234567"
                      />
                    </label>

                    <label>
                      <span>
                        Mật khẩu ban
                        đầu
                      </span>

                      <input
                        type="password"
                        value={
                          accountForm.password
                        }
                        onChange={(
                          event,
                        ) =>
                          setAccountForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              password:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                        placeholder="Tối thiểu 8 ký tự, có A-z và số"
                      />
                    </label>

                    <label>
                      <span>
                        Trạng thái
                      </span>

                      <select
                        value={
                          accountForm.status
                        }
                        onChange={(
                          event,
                        ) =>
                          setAccountForm(
                            (
                              current,
                            ) => ({
                              ...current,
                              status:
                                event
                                  .target
                                  .value,
                            }),
                          )
                        }
                      >
                        <option value="ACTIVE">
                          ACTIVE
                        </option>

                        <option value="INACTIVE">
                          INACTIVE
                        </option>
                      </select>
                    </label>

                    <button type="submit">
                      Tạo tài khoản
                    </button>
                  </form>
                </Panel>
              </div>
            )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  tone = "primary",
  wide = false,
}) {
  return (
    <article
      className={`staff-summary-card staff-summary-card--${tone} ${
        wide ? "is-wide" : ""
      }`}
    >
      <span>
        <FontAwesomeIcon
          icon={["fas", icon]}
        />
      </span>

      <div>
        <small>{label}</small>
        <strong>{value ?? 0}</strong>
      </div>
    </article>
  );
}

function Panel({
  title,
  action,
  actionLabel,
  children,
}) {
  return (
    <section className="staff-panel">
      <header className="staff-panel__head">
        <h2>{title}</h2>

        {action && (
          <button
            type="button"
            onClick={action}
          >
            {actionLabel}
          </button>
        )}
      </header>

      <div className="staff-panel__body">
        {children}
      </div>
    </section>
  );
}

function Toolbar({
  search,
  setSearch,
  placeholder,
  onSearch,
  children,
  hideSearch = false,
}) {
  return (
    <div className="staff-toolbar">
      {!hideSearch && (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            onSearch();
          }}
        >
          <FontAwesomeIcon
            icon={[
              "fas",
              "search",
            ]}
          />

          <input
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value,
              )
            }
            placeholder={placeholder}
          />

          <button type="submit">
            Tìm
          </button>
        </form>
      )}

      <div className="staff-toolbar__filters">
        {children}

        <button
          type="button"
          onClick={onSearch}
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}

function CompactOrderTable({
  rows,
}) {
  if (!rows.length) {
    return (
      <EmptyState
        title="Chưa có đơn hàng"
        description="Đơn hàng mới sẽ xuất hiện tại đây."
      />
    );
  }

  return (
    <div className="staff-compact-list">
      {rows.map((order) => (
        <div key={order.id}>
          <span>
            <strong>
              {order.code}
            </strong>

            <small>
              {order.customerName}
            </small>
          </span>

          <b>
            {formatCurrency(
              order.totalAmount,
            )}
          </b>

          <StatusBadge
            value={order.status}
          />
        </div>
      ))}
    </div>
  );
}

export default StaffDashboard;
