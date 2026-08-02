import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  apiFetch,
  buildQuery,
  formatCurrency,
  normalizePagination,
  resolveImageUrl,
} from "../config/api";

import "./AdminResource.css";
import "./AdminProductsPage.css";

const PAGE_SIZE = 10;
const FALLBACK_IMAGE =
  "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23f1f5f9'/%3E%3Ctext x='50%25' y='52%25' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='13' fill='%2394a3b8'%3ENo image%3C/text%3E%3C/svg%3E";

const emptyProductForm = {
  categoryId: "",
  brandId: "",
  name: "",
  slug: "",
  sku: "",
  barcode: "",
  manufacturerPartNumber: "",
  releaseYear: "",
  originCountry: "",
  description: "",
  price: "",
  warrantyMonths: "12",
  status: "ACTIVE",
  thumbnailUrl: "",
};

const emptyVariantForm = {
  name: "",
  sku: "",
  color: "",
  ramSize: "",
  storageSize: "",
  gpuOption: "",
  cpuOption: "",
  additionalPrice: "0",
  status: "ACTIVE",
  isDefault: false,
  initialStock: "0",
};

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function mapProductDetail(product = {}) {
  return {
    categoryId: String(product.category_id ?? product.categoryId ?? ""),
    brandId: String(product.brand_id ?? product.brandId ?? ""),
    name: product.product_name ?? product.name ?? "",
    slug: product.product_slug ?? product.slug ?? "",
    sku: product.sku ?? "",
    barcode: product.barcode ?? "",
    manufacturerPartNumber:
      product.manufacturer_part_number ??
      product.manufacturerPartNumber ??
      "",
    releaseYear: String(product.release_year ?? product.releaseYear ?? ""),
    originCountry: product.origin_country ?? product.originCountry ?? "",
    description: product.product_description ?? product.description ?? "",
    price: String(product.base_price ?? product.price ?? ""),
    warrantyMonths: String(
      product.warranty_months ?? product.warrantyMonths ?? 0,
    ),
    status: product.product_status ?? product.status ?? "ACTIVE",
    thumbnailUrl:
      product.images?.find((image) => Boolean(image.isThumbnail))?.imageUrl ||
      product.images?.[0]?.imageUrl ||
      "",
  };
}

function normalizeDetail(response = {}) {
  return {
    ...response,
    images: Array.isArray(response.images) ? response.images : [],
    variants: Array.isArray(response.variants) ? response.variants : [],
    specifications: Array.isArray(response.specifications)
      ? response.specifications
      : [],
  };
}

function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [lookups, setLookups] = useState({
    categories: [],
    brands: [],
    attributes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
    limit: PAGE_SIZE,
  });
  const [refreshKey, setRefreshKey] = useState(0);
  const [modal, setModal] = useState({
    open: false,
    mode: "create",
    productId: null,
    tab: "basic",
  });
  const [form, setForm] = useState(emptyProductForm);
  const [detail, setDetail] = useState(null);
  const [saving, setSaving] = useState(false);
  const [imageForm, setImageForm] = useState({
    imageUrl: "",
    isThumbnail: false,
    sortOrder: "0",
  });
  const [variantForm, setVariantForm] = useState(emptyVariantForm);
  const [specValues, setSpecValues] = useState({});

  const loadLookups = useCallback(async () => {
    try {
      const response = await apiFetch("/admin/lookups");
      setLookups({
        categories: Array.isArray(response?.categories)
          ? response.categories
          : [],
        brands: Array.isArray(response?.brands) ? response.brands : [],
        attributes: Array.isArray(response?.attributes)
          ? response.attributes
          : [],
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải danh mục và thương hiệu.",
      );
    }
  }, []);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/admin/products${buildQuery({
          page,
          limit: PAGE_SIZE,
          search,
          status,
          categoryId,
        })}`,
      );

      const rows = Array.isArray(response?.items) ? response.items : [];
      setProducts(rows);
      setPagination(normalizePagination(response, rows.length));
    } catch (requestError) {
      setProducts([]);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải danh sách sản phẩm.",
      );
    } finally {
      setLoading(false);
    }
  }, [categoryId, page, refreshKey, search, status]);

  useEffect(() => {
    loadLookups();
  }, [loadLookups]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const statistics = useMemo(() => {
    const active = products.filter((item) => item.status === "ACTIVE").length;
    const lowStock = products.filter(
      (item) => Number(item.stockQuantity || 0) <= 5,
    ).length;
    const sold = products.reduce(
      (sum, item) => sum + Number(item.totalSold || 0),
      0,
    );

    return [
      {
        label: "Tổng sản phẩm",
        value: pagination.total,
        icon: "box-open",
      },
      {
        label: "Đang hiển thị",
        value: products.length,
        icon: "list",
      },
      {
        label: "Đang bán trên trang",
        value: active,
        icon: "check-circle",
      },
      {
        label: "Lượt bán trong trang",
        value: sold,
        icon: "shopping-bag",
        warning: lowStock,
      },
    ];
  }, [pagination.total, products]);

  function showNotice(message) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2500);
  }

  function updateForm(name, value) {
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  function openCreate() {
    setForm(emptyProductForm);
    setDetail(null);
    setSpecValues({});
    setModal({
      open: true,
      mode: "create",
      productId: null,
      tab: "basic",
    });
  }

  async function loadProductDetail(productId) {
    const response = await apiFetch(`/admin/products/${productId}`);
    const normalized = normalizeDetail(response);
    setDetail(normalized);
    setForm(mapProductDetail(normalized));

    const nextSpecs = {};
    normalized.specifications.forEach((item) => {
      nextSpecs[String(item.attributeId)] = item.value ?? "";
    });
    setSpecValues(nextSpecs);

    return normalized;
  }

  async function openEdit(productId, tab = "basic") {
    setSaving(true);
    setError("");

    try {
      await loadProductDetail(productId);
      setModal({
        open: true,
        mode: "edit",
        productId,
        tab,
      });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể tải chi tiết sản phẩm.",
      );
    } finally {
      setSaving(false);
    }
  }

  function closeModal() {
    if (saving) {
      return;
    }

    setModal({
      open: false,
      mode: "create",
      productId: null,
      tab: "basic",
    });
    setDetail(null);
    setImageForm({ imageUrl: "", isThumbnail: false, sortOrder: "0" });
    setVariantForm(emptyVariantForm);
  }

  function validateProduct() {
    if (!form.name.trim()) return "Tên sản phẩm không được để trống.";
    if (!form.slug.trim()) return "Slug không được để trống.";
    if (!form.categoryId) return "Bạn phải chọn danh mục.";
    if (!form.price || Number(form.price) < 0) return "Giá sản phẩm không hợp lệ.";
    return "";
  }

  async function submitProduct(event) {
    event.preventDefault();
    const validationError = validateProduct();

    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      categoryId: Number(form.categoryId),
      brandId: form.brandId ? Number(form.brandId) : undefined,
      name: form.name.trim(),
      slug: form.slug.trim(),
      sku: form.sku.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      manufacturerPartNumber:
        form.manufacturerPartNumber.trim() || undefined,
      releaseYear: form.releaseYear ? Number(form.releaseYear) : undefined,
      originCountry: form.originCountry.trim() || undefined,
      description: form.description.trim() || undefined,
      price: Number(form.price),
      warrantyMonths: Number(form.warrantyMonths || 0),
      status: form.status,
      thumbnailUrl: form.thumbnailUrl.trim() || undefined,
    };

    try {
      if (modal.mode === "create") {
        const response = await apiFetch("/admin/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        const createdId = Number(response?.id || 0);
        showNotice(response?.message || "Đã thêm sản phẩm.");
        setRefreshKey((value) => value + 1);

        if (createdId) {
          await loadProductDetail(createdId);
          setModal({
            open: true,
            mode: "edit",
            productId: createdId,
            tab: "images",
          });
        } else {
          closeModal();
        }
      } else {
        const response = await apiFetch(
          `/admin/products/${modal.productId}`,
          {
            method: "PATCH",
            body: JSON.stringify(payload),
          },
        );
        showNotice(response?.message || "Đã cập nhật sản phẩm.");
        await loadProductDetail(modal.productId);
        setRefreshKey((value) => value + 1);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể lưu sản phẩm.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function updateProductStatus(product, nextStatus) {
    setError("");

    try {
      const response = await apiFetch(
        `/admin/products/${product.id}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      showNotice(response?.message || "Đã cập nhật trạng thái sản phẩm.");
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Không thể cập nhật trạng thái.",
      );
    }
  }

  async function addImage(event) {
    event.preventDefault();
    if (!imageForm.imageUrl.trim()) {
      setError("Vui lòng nhập đường dẫn ảnh.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `/admin/products/${modal.productId}/images`,
        {
          method: "POST",
          body: JSON.stringify({
            imageUrl: imageForm.imageUrl.trim(),
            isThumbnail: Boolean(imageForm.isThumbnail),
            sortOrder: Number(imageForm.sortOrder || 0),
          }),
        },
      );
      showNotice(response?.message || "Đã thêm ảnh.");
      setImageForm({ imageUrl: "", isThumbnail: false, sortOrder: "0" });
      await loadProductDetail(modal.productId);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể thêm ảnh.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteImage(imageId) {
    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(`/admin/product-images/${imageId}`, {
        method: "DELETE",
      });
      showNotice(response?.message || "Đã xóa ảnh.");
      await loadProductDetail(modal.productId);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể xóa ảnh.");
    } finally {
      setSaving(false);
    }
  }

  async function addVariant(event) {
    event.preventDefault();
    if (!variantForm.sku.trim()) {
      setError("SKU biến thể không được để trống.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `/admin/products/${modal.productId}/variants`,
        {
          method: "POST",
          body: JSON.stringify({
            name: variantForm.name.trim() || undefined,
            sku: variantForm.sku.trim(),
            color: variantForm.color.trim() || undefined,
            ramSize: variantForm.ramSize.trim() || undefined,
            storageSize: variantForm.storageSize.trim() || undefined,
            gpuOption: variantForm.gpuOption.trim() || undefined,
            cpuOption: variantForm.cpuOption.trim() || undefined,
            additionalPrice: Number(variantForm.additionalPrice || 0),
            status: variantForm.status,
            isDefault: Boolean(variantForm.isDefault),
            initialStock: Number(variantForm.initialStock || 0),
          }),
        },
      );
      showNotice(response?.message || "Đã thêm biến thể.");
      setVariantForm(emptyVariantForm);
      await loadProductDetail(modal.productId);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể thêm biến thể.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteVariant(variantId) {
    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(`/admin/variants/${variantId}`, {
        method: "DELETE",
      });
      showNotice(response?.message || "Đã ngừng biến thể.");
      await loadProductDetail(modal.productId);
      setRefreshKey((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message || "Không thể cập nhật biến thể.");
    } finally {
      setSaving(false);
    }
  }

  async function saveSpecifications(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const specifications = lookups.attributes
      .map((attribute) => ({
        attributeId: Number(attribute.id),
        value: String(specValues[String(attribute.id)] || "").trim(),
      }))
      .filter((item) => item.value);

    try {
      const response = await apiFetch(
        `/admin/products/${modal.productId}/specifications`,
        {
          method: "PUT",
          body: JSON.stringify({ specifications }),
        },
      );
      showNotice(response?.message || "Đã lưu thông số kỹ thuật.");
      await loadProductDetail(modal.productId);
    } catch (requestError) {
      setError(requestError.message || "Không thể lưu thông số.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="gx-admin-resource gx-admin-products">
      <header className="gx-admin-resource__hero">
        <div className="gx-admin-resource__hero-copy">
          <span>PRODUCT MANAGEMENT</span>
          <h2>Quản lý sản phẩm</h2>
          <p>
            Danh sách được đồng bộ từ API Admin. Bạn có thể thêm, sửa, khóa sản
            phẩm, quản lý ảnh, biến thể và thông số kỹ thuật.
          </p>
        </div>

        <div className="gx-admin-resource__actions">
          <button
            type="button"
            className="gx-admin-resource__button"
            onClick={() => setRefreshKey((value) => value + 1)}
          >
            <FontAwesomeIcon icon={["fas", "sync-alt"]} />
            Tải lại
          </button>
          <button
            type="button"
            className="gx-admin-resource__button is-primary"
            onClick={openCreate}
          >
            <FontAwesomeIcon icon={["fas", "plus"]} />
            Thêm sản phẩm
          </button>
        </div>
      </header>

      <section className="gx-admin-resource__stats">
        {statistics.map((item) => (
          <article key={item.label} className="gx-admin-resource__stat">
            <div className="gx-admin-resource__stat-icon">
              <FontAwesomeIcon icon={["fas", item.icon]} />
            </div>
            <div>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              {item.warning > 0 && (
                <small className="gx-admin-products__warning">
                  {item.warning} sản phẩm sắp hết trong trang
                </small>
              )}
            </div>
          </article>
        ))}
      </section>

      <form
        className="gx-admin-resource__filters"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
          setSearch(searchInput.trim());
        }}
      >
        <label>
          <span>Tìm kiếm</span>
          <input
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Tên, slug hoặc SKU..."
          />
        </label>

        <label>
          <span>Danh mục</span>
          <select
            value={categoryId}
            onChange={(event) => {
              setCategoryId(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {lookups.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Trạng thái</span>
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Đang bán</option>
            <option value="INACTIVE">Tạm ẩn</option>
            <option value="DRAFT">Bản nháp</option>
            <option value="DELETED">Đã xóa</option>
          </select>
        </label>

        <div className="gx-admin-resource__filter-actions">
          <button type="submit" className="gx-admin-resource__button is-primary">
            Tìm kiếm
          </button>
          <button
            type="button"
            className="gx-admin-resource__button"
            onClick={() => {
              setSearchInput("");
              setSearch("");
              setStatus("");
              setCategoryId("");
              setPage(1);
            }}
          >
            Xóa lọc
          </button>
        </div>
      </form>

      {notice && (
        <div className="gx-admin-resource__notice">
          <FontAwesomeIcon icon={["fas", "check-circle"]} />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="gx-admin-resource__notice is-error" role="alert">
          <FontAwesomeIcon icon={["fas", "exclamation-triangle"]} />
          <span>{error}</span>
        </div>
      )}

      <section className="gx-admin-resource__card">
        <div className="gx-admin-resource__card-header">
          <div>
            <strong>Danh sách sản phẩm</strong>
            <span>{pagination.total} sản phẩm trong hệ thống</span>
          </div>
          <span>
            Trang {page}/{pagination.totalPages}
          </span>
        </div>

        <div className="gx-admin-resource__table-wrap">
          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="gx-admin-resource__empty">
                    Đang tải sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" className="gx-admin-resource__empty">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="gx-admin-resource__product">
                        <img
                          src={resolveImageUrl(product.imageUrl) || FALLBACK_IMAGE}
                          alt={product.name}
                          onError={(event) => {
                            event.currentTarget.src = FALLBACK_IMAGE;
                          }}
                        />
                        <div>
                          <strong>{product.name}</strong>
                          <small>
                            #{product.id} · {product.brandName || "Chưa có hãng"}
                          </small>
                        </div>
                      </div>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>
                      <strong>{formatCurrency(product.price)}</strong>
                    </td>
                    <td>
                      <span
                        className={`gx-admin-resource__badge ${
                          Number(product.stockQuantity || 0) <= 5
                            ? "is-inactive"
                            : "is-active"
                        }`}
                      >
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td>{product.totalSold}</td>
                    <td>
                      <span
                        className={`gx-admin-resource__badge is-${String(
                          product.status,
                        ).toLowerCase()}`}
                      >
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <div className="gx-admin-resource__row-actions">
                        <button
                          type="button"
                          className="gx-admin-resource__button"
                          onClick={() => openEdit(product.id)}
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          className="gx-admin-resource__button"
                          onClick={() => openEdit(product.id, "images")}
                        >
                          Cấu hình
                        </button>
                        <button
                          type="button"
                          className={`gx-admin-resource__button ${
                            product.status === "ACTIVE"
                              ? "is-danger"
                              : "is-success"
                          }`}
                          onClick={() =>
                            updateProductStatus(
                              product,
                              product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
                            )
                          }
                        >
                          {product.status === "ACTIVE" ? "Ẩn" : "Mở bán"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="gx-admin-resource__pagination">
          <span>
            Hiển thị {products.length} / {pagination.total} sản phẩm
          </span>
          <div>
            <button
              type="button"
              className="gx-admin-resource__button"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => Math.max(value - 1, 1))}
            >
              Trang trước
            </button>
            <button
              type="button"
              className="gx-admin-resource__button"
              disabled={loading || page >= pagination.totalPages}
              onClick={() =>
                setPage((value) => Math.min(value + 1, pagination.totalPages))
              }
            >
              Trang sau
            </button>
          </div>
        </footer>
      </section>

      {modal.open && (
        <div
          className="gx-admin-resource__modal"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div className="gx-admin-resource__dialog is-wide" role="dialog" aria-modal="true">
            <header className="gx-admin-resource__dialog-header">
              <div>
                <span className="gx-admin-resource__eyebrow">
                  {modal.mode === "create" ? "CREATE PRODUCT" : "PRODUCT DETAIL"}
                </span>
                <h3>
                  {modal.mode === "create"
                    ? "Thêm sản phẩm mới"
                    : detail?.product_name || detail?.name || "Cập nhật sản phẩm"}
                </h3>
              </div>
              <button type="button" onClick={closeModal} aria-label="Đóng">
                <FontAwesomeIcon icon={["fas", "times"]} />
              </button>
            </header>

            <div className="gx-admin-resource__dialog-body">
              {modal.mode === "edit" && (
                <div className="gx-admin-resource__tabs">
                  {[
                    ["basic", "Thông tin chung"],
                    ["images", `Hình ảnh (${detail?.images?.length || 0})`],
                    ["variants", `Biến thể (${detail?.variants?.length || 0})`],
                    ["specs", "Thông số kỹ thuật"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      className={modal.tab === key ? "is-active" : ""}
                      onClick={() =>
                        setModal((previous) => ({ ...previous, tab: key }))
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}

              {modal.tab === "basic" && (
                <form id="gx-product-form" onSubmit={submitProduct}>
                  <div className="gx-admin-resource__form-grid">
                    <label className="gx-admin-resource__field is-full">
                      <span>Tên sản phẩm *</span>
                      <input
                        value={form.name}
                        onChange={(event) => {
                          const value = event.target.value;
                          updateForm("name", value);
                          if (modal.mode === "create") updateForm("slug", slugify(value));
                        }}
                        maxLength="200"
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Slug *</span>
                      <input
                        value={form.slug}
                        onChange={(event) => updateForm("slug", slugify(event.target.value))}
                        maxLength="220"
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>SKU</span>
                      <input
                        value={form.sku}
                        onChange={(event) => updateForm("sku", event.target.value)}
                        maxLength="100"
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Danh mục *</span>
                      <select
                        value={form.categoryId}
                        onChange={(event) => updateForm("categoryId", event.target.value)}
                      >
                        <option value="">Chọn danh mục</option>
                        {lookups.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Thương hiệu</span>
                      <select
                        value={form.brandId}
                        onChange={(event) => updateForm("brandId", event.target.value)}
                      >
                        <option value="">Chưa chọn</option>
                        {lookups.brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Giá bán *</span>
                      <input
                        type="number"
                        min="0"
                        value={form.price}
                        onChange={(event) => updateForm("price", event.target.value)}
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Trạng thái</span>
                      <select
                        value={form.status}
                        onChange={(event) => updateForm("status", event.target.value)}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="INACTIVE">INACTIVE</option>
                        <option value="DRAFT">DRAFT</option>
                      </select>
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Bảo hành (tháng)</span>
                      <input
                        type="number"
                        min="0"
                        value={form.warrantyMonths}
                        onChange={(event) => updateForm("warrantyMonths", event.target.value)}
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Năm ra mắt</span>
                      <input
                        type="number"
                        min="1900"
                        max="2200"
                        value={form.releaseYear}
                        onChange={(event) => updateForm("releaseYear", event.target.value)}
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Xuất xứ</span>
                      <input
                        value={form.originCountry}
                        onChange={(event) => updateForm("originCountry", event.target.value)}
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Barcode</span>
                      <input
                        value={form.barcode}
                        onChange={(event) => updateForm("barcode", event.target.value)}
                      />
                    </label>

                    <label className="gx-admin-resource__field">
                      <span>Mã nhà sản xuất</span>
                      <input
                        value={form.manufacturerPartNumber}
                        onChange={(event) =>
                          updateForm("manufacturerPartNumber", event.target.value)
                        }
                      />
                    </label>

                    <label className="gx-admin-resource__field is-full">
                      <span>Ảnh đại diện URL</span>
                      <input
                        value={form.thumbnailUrl}
                        onChange={(event) => updateForm("thumbnailUrl", event.target.value)}
                        placeholder="https://..."
                      />
                    </label>

                    <label className="gx-admin-resource__field is-full">
                      <span>Mô tả</span>
                      <textarea
                        value={form.description}
                        onChange={(event) => updateForm("description", event.target.value)}
                      />
                    </label>
                  </div>
                </form>
              )}

              {modal.mode === "edit" && modal.tab === "images" && (
                <div className="gx-admin-resource__split">
                  <section className="gx-admin-resource__mini-card">
                    <h4>Ảnh hiện có</h4>
                    <div className="gx-admin-products__image-grid">
                      {detail?.images?.length ? (
                        detail.images.map((image) => (
                          <article key={image.id}>
                            <img
                              src={resolveImageUrl(image.imageUrl) || FALLBACK_IMAGE}
                              alt="Sản phẩm"
                              onError={(event) => {
                                event.currentTarget.src = FALLBACK_IMAGE;
                              }}
                            />
                            <div>
                              <span>
                                {image.isThumbnail ? "Ảnh đại diện" : `Thứ tự ${image.sortOrder}`}
                              </span>
                              <button
                                type="button"
                                className="gx-admin-resource__button is-danger"
                                onClick={() => deleteImage(image.id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </article>
                        ))
                      ) : (
                        <p className="gx-admin-resource__muted">Chưa có ảnh.</p>
                      )}
                    </div>
                  </section>

                  <form className="gx-admin-resource__mini-card" onSubmit={addImage}>
                    <h4>Thêm ảnh bằng URL</h4>
                    <div className="gx-admin-resource__form-grid">
                      <label className="gx-admin-resource__field is-full">
                        <span>Đường dẫn ảnh *</span>
                        <input
                          value={imageForm.imageUrl}
                          onChange={(event) =>
                            setImageForm((previous) => ({
                              ...previous,
                              imageUrl: event.target.value,
                            }))
                          }
                          placeholder="https://..."
                        />
                      </label>
                      <label className="gx-admin-resource__field">
                        <span>Thứ tự</span>
                        <input
                          type="number"
                          min="0"
                          value={imageForm.sortOrder}
                          onChange={(event) =>
                            setImageForm((previous) => ({
                              ...previous,
                              sortOrder: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="gx-admin-products__checkbox">
                        <input
                          type="checkbox"
                          checked={imageForm.isThumbnail}
                          onChange={(event) =>
                            setImageForm((previous) => ({
                              ...previous,
                              isThumbnail: event.target.checked,
                            }))
                          }
                        />
                        <span>Đặt làm ảnh đại diện</span>
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="gx-admin-resource__button is-primary"
                      disabled={saving}
                    >
                      Thêm ảnh
                    </button>
                  </form>
                </div>
              )}

              {modal.mode === "edit" && modal.tab === "variants" && (
                <div className="gx-admin-resource__split">
                  <section className="gx-admin-resource__mini-card">
                    <h4>Danh sách biến thể</h4>
                    <ul className="gx-admin-resource__list">
                      {detail?.variants?.length ? (
                        detail.variants.map((variant) => (
                          <li key={variant.variant_id}>
                            <div>
                              <strong>{variant.variant_name || "Mặc định"}</strong>
                              <small>
                                {variant.sku} · Kho {variant.stock_quantity || 0} · Có thể bán {variant.available_quantity || 0}
                              </small>
                            </div>
                            <button
                              type="button"
                              className="gx-admin-resource__button is-danger"
                              onClick={() => deleteVariant(variant.variant_id)}
                            >
                              Ngừng
                            </button>
                          </li>
                        ))
                      ) : (
                        <li>Chưa có biến thể.</li>
                      )}
                    </ul>
                  </section>

                  <form className="gx-admin-resource__mini-card" onSubmit={addVariant}>
                    <h4>Thêm biến thể</h4>
                    <div className="gx-admin-resource__form-grid">
                      <label className="gx-admin-resource__field is-full">
                        <span>Tên biến thể</span>
                        <input
                          value={variantForm.name}
                          onChange={(event) =>
                            setVariantForm((previous) => ({ ...previous, name: event.target.value }))
                          }
                        />
                      </label>
                      <label className="gx-admin-resource__field">
                        <span>SKU *</span>
                        <input
                          value={variantForm.sku}
                          onChange={(event) =>
                            setVariantForm((previous) => ({ ...previous, sku: event.target.value }))
                          }
                        />
                      </label>
                      <label className="gx-admin-resource__field">
                        <span>Tồn kho ban đầu</span>
                        <input
                          type="number"
                          min="0"
                          value={variantForm.initialStock}
                          onChange={(event) =>
                            setVariantForm((previous) => ({ ...previous, initialStock: event.target.value }))
                          }
                        />
                      </label>
                      {[
                        ["color", "Màu"],
                        ["ramSize", "RAM"],
                        ["storageSize", "Ổ cứng"],
                        ["cpuOption", "CPU"],
                        ["gpuOption", "GPU"],
                      ].map(([key, label]) => (
                        <label key={key} className="gx-admin-resource__field">
                          <span>{label}</span>
                          <input
                            value={variantForm[key]}
                            onChange={(event) =>
                              setVariantForm((previous) => ({
                                ...previous,
                                [key]: event.target.value,
                              }))
                            }
                          />
                        </label>
                      ))}
                      <label className="gx-admin-resource__field">
                        <span>Giá cộng thêm</span>
                        <input
                          type="number"
                          value={variantForm.additionalPrice}
                          onChange={(event) =>
                            setVariantForm((previous) => ({
                              ...previous,
                              additionalPrice: event.target.value,
                            }))
                          }
                        />
                      </label>
                    </div>
                    <button
                      type="submit"
                      className="gx-admin-resource__button is-primary"
                      disabled={saving}
                    >
                      Thêm biến thể
                    </button>
                  </form>
                </div>
              )}

              {modal.mode === "edit" && modal.tab === "specs" && (
                <form onSubmit={saveSpecifications}>
                  <div className="gx-admin-products__spec-grid">
                    {lookups.attributes.map((attribute) => (
                      <label key={attribute.id} className="gx-admin-resource__field">
                        <span>
                          {attribute.name}
                          {attribute.unit ? ` (${attribute.unit})` : ""}
                        </span>
                        <input
                          value={specValues[String(attribute.id)] || ""}
                          onChange={(event) =>
                            setSpecValues((previous) => ({
                              ...previous,
                              [String(attribute.id)]: event.target.value,
                            }))
                          }
                          placeholder={attribute.specGroup || "Thông số"}
                        />
                      </label>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="gx-admin-resource__button is-primary"
                    disabled={saving}
                  >
                    Lưu toàn bộ thông số
                  </button>
                </form>
              )}
            </div>

            <footer className="gx-admin-resource__dialog-footer">
              <button
                type="button"
                className="gx-admin-resource__button"
                onClick={closeModal}
                disabled={saving}
              >
                Đóng
              </button>
              {modal.tab === "basic" && (
                <button
                  type="submit"
                  form="gx-product-form"
                  className="gx-admin-resource__button is-primary"
                  disabled={saving}
                >
                  {saving ? "Đang lưu..." : modal.mode === "create" ? "Tạo sản phẩm" : "Lưu thay đổi"}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </section>
  );
}

export default AdminProductsPage;
