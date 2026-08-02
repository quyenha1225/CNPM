import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  apiFetch,
  buildQuery,
} from "../config/api";

import "./AdminUsersPage.css";

const PAGE_SIZE = 10;


function normalizeUser(user = {}) {
  const roleValue =
    typeof user.role === "string"
      ? user.role
      : user.role?.roleCode ||
        user.role?.role_code ||
        user.role?.code ||
        "";

  return {
    id: Number(
      user.userId ??
        user.user_id ??
        user.id ??
        0,
    ),

    fullName:
      user.userFullName ??
      user.user_full_name ??
      user.fullName ??
      user.name ??
      "Chưa cập nhật",

    email:
      user.userEmail ??
      user.user_email ??
      user.email ??
      "",

    phone:
      user.userPhone ??
      user.user_phone ??
      user.phone ??
      "",

    role: String(
      user.roleCode ??
        user.role_code ??
        roleValue ??
        "CUSTOMER",
    ).toUpperCase(),

    status: String(
      user.accountStatus ??
        user.account_status ??
        user.status ??
        "ACTIVE",
    ).toUpperCase(),

    createdAt:
      user.createdAt ??
      user.created_at ??
      user.user_created_at ??
      null,
  };
}

function normalizeResponse(response) {
  const source =
    response?.data ?? response ?? {};

  const rawUsers = Array.isArray(source)
    ? source
    : source.items ??
      source.users ??
      source.results ??
      [];

  const users = Array.isArray(rawUsers)
    ? rawUsers.map(normalizeUser)
    : [];

  const pagination =
    source.pagination ??
    response?.pagination ??
    {};

  return {
    users,

    total: Number(
      source.total ??
        source.totalItems ??
        source.total_items ??
        pagination.total ??
        pagination.totalItems ??
        users.length,
    ),

    totalPages: Number(
      source.totalPages ??
        source.total_pages ??
        pagination.totalPages ??
        pagination.total_pages ??
        0,
    ),
  };
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "vi-VN",
    {
      dateStyle: "short",
      timeStyle: "short",
    },
  ).format(date);
}

function roleLabel(role) {
  const labels = {
    ADMIN: "Quản trị viên",
    STAFF: "Nhân viên",
    CUSTOMER: "Khách hàng",
  };

  return labels[role] || role;
}

function statusLabel(status) {
  const labels = {
    ACTIVE: "Đang hoạt động",
    INACTIVE: "Ngừng hoạt động",
    LOCKED: "Đã khóa",
    BLOCKED: "Đã khóa",
  };

  return labels[status] || status;
}

function AdminUsersPage() {
  const [users, setUsers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [role, setRole] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [reportedTotalPages, setReportedTotalPages] =
    useState(0);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [
    updatingUserId,
    setUpdatingUserId,
  ] = useState(null);

  const [confirmState, setConfirmState] =
    useState({
      open: false,
      user: null,
      nextStatus: "",
    });

  const totalPages = useMemo(() => {
    if (reportedTotalPages > 0) {
      return reportedTotalPages;
    }

    return Math.max(
      Math.ceil(total / PAGE_SIZE),
      1,
    );
  }, [
    reportedTotalPages,
    total,
  ]);

  const loadUsers = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params =
          new URLSearchParams();

        params.set(
          "page",
          String(page),
        );

        params.set(
          "limit",
          String(PAGE_SIZE),
        );

        if (search) {
          params.set("search", search);
        }

        if (role) {
          params.set("role", role);
        }

        if (status) {
          params.set(
            "status",
            status,
          );
        }

        const data = await apiFetch(
          `/admin/users${buildQuery(Object.fromEntries(params.entries()))}`,
          {
            method: "GET",
            signal,
          },
        );

        const normalized =
          normalizeResponse(data);

        setUsers(normalized.users);
        setTotal(normalized.total);
        setReportedTotalPages(
          normalized.totalPages,
        );
      } catch (requestError) {
        if (
          requestError?.name ===
          "AbortError"
        ) {
          return;
        }

        setUsers([]);

        setError(
          requestError instanceof Error
            ? requestError.message
            : "Không thể kết nối tới backend.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      refreshKey,
      role,
      search,
      status,
    ],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadUsers(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadUsers]);

  function handleSearch(event) {
    event.preventDefault();

    setPage(1);
    setSearch(
      searchInput.trim(),
    );
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  }

  function requestStatusChange(
    user,
  ) {
    const isActive =
      user.status === "ACTIVE";

    setConfirmState({
      open: true,
      user,
      nextStatus: isActive
        ? "LOCKED"
        : "ACTIVE",
    });
  }

  function closeConfirm() {
    if (updatingUserId) {
      return;
    }

    setConfirmState({
      open: false,
      user: null,
      nextStatus: "",
    });
  }

  async function confirmStatusChange() {
    const selectedUser =
      confirmState.user;

    if (!selectedUser?.id) {
      return;
    }

    setUpdatingUserId(
      selectedUser.id,
    );

    setError("");

    try {
      await apiFetch(
        `/admin/users/${selectedUser.id}`,
        {
          method: "PATCH",
          body: JSON.stringify({
            status: confirmState.nextStatus,
          }),
        },
      );

      closeConfirm();

      setConfirmState({
        open: false,
        user: null,
        nextStatus: "",
      });

      setRefreshKey(
        (value) => value + 1,
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Cập nhật tài khoản thất bại.",
      );
    } finally {
      setUpdatingUserId(null);
    }
  }

  return (
    <section className="gx-admin-users">
      <header className="gx-admin-users__heading">
        <div>
          <span>
            USER MANAGEMENT
          </span>

          <h2>
            Người dùng và phân quyền
          </h2>

          <p>
            Theo dõi tài khoản khách hàng,
            nhân viên, quản trị viên và trạng
            thái truy cập hệ thống.
          </p>
        </div>

        <Link
          to="/admin/staff"
          className="gx-admin-users__staff-link"
        >
          Quản lý nhân viên
        </Link>
      </header>

      <section className="gx-admin-users__statistics">
        <article>
          <span>Tổng tài khoản</span>
          <strong>{total}</strong>
        </article>

        <article>
          <span>Đang hiển thị</span>
          <strong>{users.length}</strong>
        </article>

        <article>
          <span>Trang hiện tại</span>
          <strong>
            {page}/{totalPages}
          </strong>
        </article>
      </section>

      <form
        className="gx-admin-users__filters"
        onSubmit={handleSearch}
      >
        <label className="gx-admin-users__search">
          <span>Tìm kiếm</span>

          <input
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value,
              )
            }
            placeholder="Tên, email hoặc số điện thoại..."
          />
        </label>

        <label>
          <span>Vai trò</span>

          <select
            value={role}
            onChange={(event) => {
              setRole(
                event.target.value,
              );

              setPage(1);
            }}
          >
            <option value="">
              Tất cả vai trò
            </option>

            <option value="CUSTOMER">
              Khách hàng
            </option>

            <option value="STAFF">
              Nhân viên
            </option>

            <option value="ADMIN">
              Quản trị viên
            </option>
          </select>
        </label>

        <label>
          <span>Trạng thái</span>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value,
              );

              setPage(1);
            }}
          >
            <option value="">
              Tất cả trạng thái
            </option>

            <option value="ACTIVE">
              Đang hoạt động
            </option>

            <option value="LOCKED">
              Đã khóa
            </option>

            <option value="INACTIVE">
              Ngừng hoạt động
            </option>
          </select>
        </label>

        <div className="gx-admin-users__filter-actions">
          <button type="submit">
            Tìm kiếm
          </button>

          <button
            type="button"
            onClick={clearFilters}
          >
            Xóa bộ lọc
          </button>

          <button
            type="button"
            onClick={() =>
              setRefreshKey(
                (value) => value + 1,
              )
            }
          >
            Tải lại
          </button>
        </div>
      </form>

      {error && (
        <div
          className="gx-admin-users__error"
          role="alert"
        >
          <strong>
            Không thể xử lý yêu cầu
          </strong>

          <span>{error}</span>
        </div>
      )}

      <section className="gx-admin-users__table-card">
        <div className="gx-admin-users__table-header">
          <div>
            <strong>
              Danh sách người dùng
            </strong>

            <span>
              {total} tài khoản trong hệ thống
            </span>
          </div>
        </div>

        <div className="gx-admin-users__table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Ngày tạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="gx-admin-users__message"
                  >
                    Đang tải dữ liệu người dùng...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="gx-admin-users__message"
                  >
                    Không tìm thấy tài khoản phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="gx-admin-users__identity">
                        <span>
                          {user.fullName
                            .charAt(0)
                            .toUpperCase()}
                        </span>

                        <div>
                          <strong>
                            {user.fullName}
                          </strong>

                          <small>
                            ID #{user.id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="gx-admin-users__contact">
                        <strong>
                          {user.email || "—"}
                        </strong>

                        <small>
                          {user.phone || "Chưa có số điện thoại"}
                        </small>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`gx-admin-users__role is-${user.role.toLowerCase()}`}
                      >
                        {roleLabel(user.role)}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`gx-admin-users__status is-${user.status.toLowerCase()}`}
                      >
                        {statusLabel(
                          user.status,
                        )}
                      </span>
                    </td>

                    <td>
                      {formatDate(
                        user.createdAt,
                      )}
                    </td>

                    <td>
                      <button
                        type="button"
                        className={`gx-admin-users__status-button ${
                          user.status ===
                          "ACTIVE"
                            ? "is-lock"
                            : "is-unlock"
                        }`}
                        disabled={
                          updatingUserId ===
                          user.id
                        }
                        onClick={() =>
                          requestStatusChange(
                            user,
                          )
                        }
                      >
                        {updatingUserId ===
                        user.id
                          ? "Đang xử lý..."
                          : user.status ===
                              "ACTIVE"
                            ? "Khóa"
                            : "Mở khóa"}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="gx-admin-users__pagination">
          <span>
            Trang {page} trên {totalPages}
          </span>

          <div>
            <button
              type="button"
              disabled={
                loading || page <= 1
              }
              onClick={() =>
                setPage(
                  (value) =>
                    Math.max(
                      value - 1,
                      1,
                    ),
                )
              }
            >
              Trang trước
            </button>

            <button
              type="button"
              disabled={
                loading ||
                page >= totalPages
              }
              onClick={() =>
                setPage(
                  (value) =>
                    Math.min(
                      value + 1,
                      totalPages,
                    ),
                )
              }
            >
              Trang sau
            </button>
          </div>
        </footer>
      </section>

      {confirmState.open && (
        <div
          className="gx-admin-users__modal"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeConfirm();
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="gx-admin-users__dialog"
          >
            <span>
              XÁC NHẬN THAY ĐỔI
            </span>

            <h3>
              {confirmState.nextStatus ===
              "ACTIVE"
                ? "Mở khóa tài khoản?"
                : "Khóa tài khoản?"}
            </h3>

            <p>
              Tài khoản{" "}
              <strong>
                {confirmState.user?.fullName}
              </strong>{" "}
              sẽ được chuyển sang trạng thái{" "}
              <strong>
                {statusLabel(
                  confirmState.nextStatus,
                )}
              </strong>
              .
            </p>

            <div>
              <button
                type="button"
                onClick={closeConfirm}
                disabled={Boolean(
                  updatingUserId,
                )}
              >
                Hủy
              </button>

              <button
                type="button"
                onClick={
                  confirmStatusChange
                }
                disabled={Boolean(
                  updatingUserId,
                )}
              >
                {updatingUserId
                  ? "Đang cập nhật..."
                  : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminUsersPage;