import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Link,
  useNavigate,
} from "react-router-dom";

import ScrollToTopOnMount from "../template/ScrollToTopOnMount";
import { useCart } from "../context/CartContext";
import { toast } from "../utils/Toast";
import fallbackImage from "../nillkin-case-1.jpg";

import "./cart.css";

const currencyFormatter =
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });

function formatCurrency(value) {
  const amount = Number(value ?? 0);

  return currencyFormatter.format(
    Number.isFinite(amount) ? amount : 0,
  );
}

function formatSelectedOptions(
  options = {},
) {
  const labels = {
    cpu_option: "CPU",
    cpu: "CPU",

    ram_size: "RAM",
    ram: "RAM",

    storage_size: "Ổ cứng",
    storage: "Ổ cứng",

    gpu_option: "GPU",
    gpu: "GPU",

    color: "Màu sắc",
  };

  return Object.entries(options)
    .filter(([, value]) => {
      return (
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
      );
    })
    .map(([key, value]) => ({
      key,
      label: labels[key] || key,
      value: String(value),
    }));
}

function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) {
      return undefined;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onCancel();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="gx-cart-v3-modal"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onCancel();
        }
      }}
    >
      <section
        className="gx-cart-v3-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-dialog-title"
        aria-describedby="cart-dialog-description"
      >
        <button
          type="button"
          className="gx-cart-v3-modal__close"
          aria-label="Đóng"
          onClick={onCancel}
        >
          ×
        </button>

        <div className="gx-cart-v3-modal__icon">
          <FontAwesomeIcon
            icon={[
              "fas",
              "exclamation-triangle",
            ]}
          />
        </div>

        <span className="gx-cart-v3-modal__eyebrow">
          XÁC NHẬN THAO TÁC
        </span>

        <h2 id="cart-dialog-title">
          {title}
        </h2>

        <p id="cart-dialog-description">
          {description}
        </p>

        <div className="gx-cart-v3-modal__actions">
          <button
            type="button"
            className="gx-cart-v3-modal__cancel"
            onClick={onCancel}
          >
            Giữ lại
          </button>

          <button
            type="button"
            className="gx-cart-v3-modal__confirm"
            onClick={onConfirm}
          >
            <FontAwesomeIcon
              icon={["fas", "trash-alt"]}
            />

            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body,
  );
}

function Cart() {
  const navigate = useNavigate();

  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCart();

  const [
    confirmState,
    setConfirmState,
  ] = useState({
    open: false,
    type: null,
    item: null,
  });

  const rows = useMemo(() => {
    return cartItems.map((item) => {
      const price = Number(
        item.price ?? 0,
      );

      const quantity = Math.max(
        Number(item.quantity ?? 1),
        1,
      );

      const stock = Math.max(
        Number(
          item.stock ??
            item.stock_quantity ??
            item.available_quantity ??
            0,
        ),
        0,
      );

      return {
        ...item,

        id: Number(
          item.id ??
            item.productId ??
            item.product_id ??
            0,
        ),

        image:
          item.image ||
          item.image_url ||
          fallbackImage,

        price,
        quantity,
        stock,

        lineTotal: price * quantity,

        optionLabels:
          formatSelectedOptions(
            item.selectedOptions,
          ),
      };
    });
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return rows.reduce(
      (total, item) =>
        total + item.lineTotal,
      0,
    );
  }, [rows]);

  const totalItems = useMemo(() => {
    return rows.reduce(
      (total, item) =>
        total + item.quantity,
      0,
    );
  }, [rows]);

  function closeConfirmDialog() {
    setConfirmState({
      open: false,
      type: null,
      item: null,
    });
  }

  function requestRemoveItem(item) {
    setConfirmState({
      open: true,
      type: "item",
      item,
    });
  }

  function requestRemoveAll() {
    setConfirmState({
      open: true,
      type: "all",
      item: null,
    });
  }

  function confirmDelete() {
    if (
      confirmState.type === "item" &&
      confirmState.item
    ) {
      removeFromCart(
        confirmState.item.lineKey,
      );

      toast.success(
        "Đã xóa sản phẩm khỏi giỏ hàng",
        1800,
      );
    }

    if (confirmState.type === "all") {
      clearCart();

      toast.success(
        "Đã làm trống giỏ hàng",
        1800,
      );
    }

    closeConfirmDialog();
  }

  function changeQuantity(
    item,
    nextValue,
  ) {
    const parsedValue = Number(
      nextValue,
    );

    if (!Number.isFinite(parsedValue)) {
      return;
    }

    let quantity = Math.max(
      Math.floor(parsedValue),
      1,
    );

    if (item.stock > 0) {
      quantity = Math.min(
        quantity,
        item.stock,
      );
    }

    updateQuantity(
      item.lineKey,
      quantity,
    );
  }

  function goToPayment() {
    if (!rows.length) {
      toast.warning(
        "Giỏ hàng hiện đang trống",
        2000,
      );

      return;
    }

    navigate("/payment");
  }

  const deletingAll =
    confirmState.type === "all";

  const deletingItem =
    confirmState.item;

  return (
    <>
      <main className="gx-cart-v3-page">
        <ScrollToTopOnMount />

        <section className="gx-cart-v3-hero">
          <div className="gx-cart-v3-container">
            <div className="gx-cart-v3-hero__content">
              <span>
                GIỎ HÀNG GEARXIN
              </span>

              <h1>
                Kiểm tra sản phẩm
                <br />
                trước khi thanh toán
              </h1>

              <p>
                Điều chỉnh số lượng, kiểm
                tra cấu hình và loại bỏ
                những sản phẩm không còn
                cần thiết.
              </p>
            </div>

            <div className="gx-cart-v3-hero__stats">
              <div>
                <strong>
                  {rows.length}
                </strong>

                <span>
                  Cấu hình đã chọn
                </span>
              </div>

              <div>
                <strong>
                  {totalItems}
                </strong>

                <span>
                  Tổng sản phẩm
                </span>
              </div>

              <div>
                <strong>
                  {formatCurrency(
                    subtotal,
                  )}
                </strong>

                <span>
                  Giá trị giỏ hàng
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="gx-cart-v3-content">
          <div className="gx-cart-v3-container">
            <div className="gx-cart-v3-toolbar">
              <div>
                <span>
                  SẢN PHẨM ĐÃ CHỌN
                </span>

                <h2>
                  Giỏ hàng của bạn
                </h2>
              </div>

              <Link
                to="/products"
                className="gx-cart-v3-continue"
              >
                <FontAwesomeIcon
                  icon={[
                    "fas",
                    "arrow-left",
                  ]}
                />

                Tiếp tục mua sắm
              </Link>
            </div>

            {!rows.length ? (
              <section className="gx-cart-v3-empty">
                <div className="gx-cart-v3-empty__icon">
                  <FontAwesomeIcon
                    icon={[
                      "fas",
                      "shopping-cart",
                    ]}
                  />
                </div>

                <h2>
                  Giỏ hàng đang trống
                </h2>

                <p>
                  Hãy chọn sản phẩm phù hợp
                  để bắt đầu đơn hàng của
                  bạn.
                </p>

                <Link to="/products">
                  Khám phá sản phẩm
                </Link>
              </section>
            ) : (
              <div className="gx-cart-v3-layout">
                <section
                  className="gx-cart-v3-list"
                  aria-label="Sản phẩm trong giỏ hàng"
                >
                  <header className="gx-cart-v3-list__header">
                    <div>
                      <strong>
                        {totalItems} sản phẩm
                      </strong>

                      <span>
                        {rows.length} cấu hình
                        trong giỏ
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={
                        requestRemoveAll
                      }
                    >
                      <FontAwesomeIcon
                        icon={[
                          "fas",
                          "trash-alt",
                        ]}
                      />

                      Xóa toàn bộ
                    </button>
                  </header>

                  <div className="gx-cart-v3-list__body">
                    {rows.map((item) => (
                      <article
                        className="gx-cart-v3-item"
                        key={item.lineKey}
                      >
                        <Link
                          to={`/products/${item.id}`}
                          className="gx-cart-v3-item__media"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(
                              event,
                            ) => {
                              event.currentTarget.src =
                                fallbackImage;
                            }}
                          />
                        </Link>

                        <div className="gx-cart-v3-item__information">
                          <div className="gx-cart-v3-item__meta">
                            <span>
                              {item.brand ||
                                "Gearxin"}
                            </span>

                            <small
                              className={
                                item.stock >
                                0
                                  ? "is-available"
                                  : "is-empty"
                              }
                            >
                              {item.stock > 0
                                ? `Còn ${item.stock} sản phẩm`
                                : "Hết hàng"}
                            </small>
                          </div>

                          <h3>
                            <Link
                              to={`/products/${item.id}`}
                            >
                              {item.name}
                            </Link>
                          </h3>

                          {item.variantName &&
                            item.variantName !==
                              "Mặc định" && (
                              <p className="gx-cart-v3-item__variant">
                                {
                                  item.variantName
                                }
                              </p>
                            )}

                          {item.optionLabels
                            .length > 0 && (
                            <div className="gx-cart-v3-item__options">
                              {item.optionLabels.map(
                                (
                                  option,
                                ) => (
                                  <span
                                    key={`${option.key}-${option.value}`}
                                  >
                                    <small>
                                      {
                                        option.label
                                      }
                                    </small>

                                    <strong>
                                      {
                                        option.value
                                      }
                                    </strong>
                                  </span>
                                ),
                              )}
                            </div>
                          )}

                          <strong className="gx-cart-v3-item__unit-price">
                            {formatCurrency(
                              item.price,
                            )}
                          </strong>
                        </div>

                        <div className="gx-cart-v3-item__controls">
                          <div className="gx-cart-v3-quantity">
                            <button
                              type="button"
                              aria-label={`Giảm số lượng ${item.name}`}
                              disabled={
                                item.quantity <= 1
                              }
                              onClick={() =>
                                changeQuantity(
                                  item,
                                  item.quantity -
                                    1,
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={[
                                  "fas",
                                  "minus",
                                ]}
                              />
                            </button>

                            <input
                              type="number"
                              min="1"
                              max={
                                item.stock >
                                0
                                  ? item.stock
                                  : undefined
                              }
                              value={
                                item.quantity
                              }
                              aria-label={`Số lượng ${item.name}`}
                              onChange={(
                                event,
                              ) =>
                                changeQuantity(
                                  item,
                                  event.target
                                    .value,
                                )
                              }
                            />

                            <button
                              type="button"
                              aria-label={`Tăng số lượng ${item.name}`}
                              disabled={
                                item.stock >
                                  0 &&
                                item.quantity >=
                                  item.stock
                              }
                              onClick={() =>
                                changeQuantity(
                                  item,
                                  item.quantity +
                                    1,
                                )
                              }
                            >
                              <FontAwesomeIcon
                                icon={[
                                  "fas",
                                  "plus",
                                ]}
                              />
                            </button>
                          </div>

                          <div className="gx-cart-v3-item__total">
                            <small>
                              Thành tiền
                            </small>

                            <strong>
                              {formatCurrency(
                                item.lineTotal,
                              )}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="gx-cart-v3-item__remove"
                            onClick={() =>
                              requestRemoveItem(
                                item,
                              )
                            }
                          >
                            <FontAwesomeIcon
                              icon={[
                                "fas",
                                "trash-alt",
                              ]}
                            />

                            Xóa sản phẩm
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>

                <aside className="gx-cart-v3-summary">
                  <span className="gx-cart-v3-summary__eyebrow">
                    TÓM TẮT ĐƠN HÀNG
                  </span>

                  <h2>
                    Thanh toán an toàn
                  </h2>

                  <p className="gx-cart-v3-summary__description">
                    Kiểm tra số lượng và tổng
                    tiền trước khi tiếp tục.
                  </p>

                  <div className="gx-cart-v3-summary__rows">
                    <div>
                      <span>
                        Số cấu hình
                      </span>

                      <strong>
                        {rows.length}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Tổng sản phẩm
                      </span>

                      <strong>
                        {totalItems}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Tạm tính
                      </span>

                      <strong>
                        {formatCurrency(
                          subtotal,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        Phí vận chuyển
                      </span>

                      <strong className="is-free">
                        Miễn phí
                      </strong>
                    </div>
                  </div>

                  <div className="gx-cart-v3-summary__total">
                    <span>
                      Tổng thanh toán
                    </span>

                    <strong>
                      {formatCurrency(
                        subtotal,
                      )}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="gx-cart-v3-summary__checkout"
                    onClick={goToPayment}
                  >
                    Tiến hành thanh toán

                    <FontAwesomeIcon
                      icon={[
                        "fas",
                        "arrow-right",
                      ]}
                    />
                  </button>

                  <div className="gx-cart-v3-summary__security">
                    <FontAwesomeIcon
                      icon={[
                        "fas",
                        "shield-alt",
                      ]}
                    />

                    <p>
                      Thông tin thanh toán
                      được bảo vệ và chỉ sử
                      dụng để xử lý đơn hàng.
                    </p>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </section>
      </main>

      <ConfirmDialog
        open={confirmState.open}
        title={
          deletingAll
            ? "Xóa toàn bộ giỏ hàng?"
            : "Xóa sản phẩm khỏi giỏ?"
        }
        description={
          deletingAll
            ? `Bạn sắp xóa ${totalItems} sản phẩm thuộc ${rows.length} cấu hình. Thao tác này không thể hoàn tác.`
            : deletingItem
              ? `Sản phẩm “${deletingItem.name}” sẽ được loại khỏi giỏ hàng của bạn.`
              : ""
        }
        confirmLabel={
          deletingAll
            ? "Xóa toàn bộ"
            : "Xóa sản phẩm"
        }
        onCancel={closeConfirmDialog}
        onConfirm={confirmDelete}
      />
    </>
  );
}

export default Cart;