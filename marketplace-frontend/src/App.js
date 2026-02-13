import React, { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:5000";

export default function App() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    seller_id: ""
  });

  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const [buyerData, setBuyerData] = useState({
    buyer_name: "",
    buyer_phone: "",
    buyer_address: ""
  });

  const [message, setMessage] = useState("");

  // ---------------- FETCH PRODUCTS ----------------
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_URL}/products`);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.log(err);
    }
  };

  // ---------------- FETCH ORDERS ----------------
  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // ---------------- ADD PRODUCT ----------------
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch(`${API_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          price: Number(formData.price),
          category: formData.category,
          seller_id: Number(formData.seller_id)
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Server error while adding product");
        return;
      }

      setMessage("✅ Product Added Successfully!");
      setFormData({
        title: "",
        description: "",
        price: "",
        category: "",
        seller_id: ""
      });

      fetchProducts();
    } catch (err) {
      setMessage("❌ Failed to add product.");
    }
  };

  // ---------------- PLACE ORDER ----------------
  const handlePlaceOrder = async () => {
    setMessage("");

    if (!checkoutProduct) return;

    if (
      buyerData.buyer_name.trim() === "" ||
      buyerData.buyer_phone.trim() === "" ||
      buyerData.buyer_address.trim() === ""
    ) {
      setMessage("❌ Please fill buyer name, phone and address.");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: checkoutProduct.id,
          buyer_name: buyerData.buyer_name,
          buyer_phone: buyerData.buyer_phone,
          buyer_address: buyerData.buyer_address
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "❌ Failed to place order");
        return;
      }

      setMessage(`✅ Order Placed Successfully! Order ID: ${data.order_id}`);

      setBuyerData({
        buyer_name: "",
        buyer_phone: "",
        buyer_address: ""
      });

      setCheckoutProduct(null);

      fetchOrders();
    } catch (err) {
      setMessage("❌ Failed to place order.");
    }
  };

  // ---------------- UI ----------------
  return (
    <div style={styles.page}>
      <h1 style={styles.heading}>🛒 Mini Marketplace</h1>
      <p style={styles.subheading}>
        A simple marketplace app built using React + Flask + SQLite
      </p>

      {message && <div style={styles.messageBox}>{message}</div>}

      {/* ADD PRODUCT */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>➕ Add Product</h2>

        <form onSubmit={handleAddProduct} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Product Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="text"
            placeholder="Category (Mobiles, Laptop, etc.)"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Price"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
          />

          <input
            style={styles.input}
            type="number"
            placeholder="Seller ID"
            value={formData.seller_id}
            onChange={(e) =>
              setFormData({ ...formData, seller_id: e.target.value })
            }
          />

          <textarea
            style={styles.textarea}
            placeholder="Description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <button style={styles.button} type="submit">
            Add Product
          </button>
        </form>
      </div>

      {/* PRODUCTS LIST */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>📦 Available Products</h2>

        <div style={styles.grid}>
          {products.map((p) => (
            <div key={p.id} style={styles.productCard}>
              <h3 style={styles.productTitle}>{p.title}</h3>
              <p style={styles.smallText}>Category: {p.category}</p>
              <p style={styles.smallText}>Seller ID: {p.seller_id}</p>
              <p style={styles.price}>₹ {p.price}</p>
              <p style={styles.desc}>{p.description}</p>

              <button
                style={styles.buyButton}
                onClick={() => setCheckoutProduct(p)}
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CHECKOUT MODAL */}
      {checkoutProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h2 style={styles.sectionTitle}>🧾 Checkout</h2>
            <p>
              Ordering Product ID <b>{checkoutProduct.id}</b> (
              {checkoutProduct.title})
            </p>

            <input
              style={styles.input}
              type="text"
              placeholder="Buyer Name"
              value={buyerData.buyer_name}
              onChange={(e) =>
                setBuyerData({ ...buyerData, buyer_name: e.target.value })
              }
            />

            <input
              style={styles.input}
              type="text"
              placeholder="Phone Number"
              value={buyerData.buyer_phone}
              onChange={(e) =>
                setBuyerData({ ...buyerData, buyer_phone: e.target.value })
              }
            />

            <textarea
              style={styles.textarea}
              placeholder="Address"
              value={buyerData.buyer_address}
              onChange={(e) =>
                setBuyerData({ ...buyerData, buyer_address: e.target.value })
              }
            />

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={styles.button} onClick={handlePlaceOrder}>
                Confirm Order
              </button>

              <button
                style={styles.cancelButton}
                onClick={() => setCheckoutProduct(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDERS LIST */}
      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>📜 Orders</h2>

        {orders.length === 0 ? (
          <p style={styles.smallText}>No orders yet.</p>
        ) : (
          <div style={styles.orderList}>
            {orders.map((o) => (
              <div key={o.id} style={styles.orderCard}>
                <p>
                  <b>Order ID:</b> {o.id}
                </p>
                <p>
                  <b>Product:</b> {o.product?.title}
                </p>
                <p>
                  <b>Status:</b> {o.status}
                </p>
                <p>
                  <b>Buyer:</b> {o.buyer_name} ({o.buyer_phone})
                </p>
                <p>
                  <b>Address:</b> {o.buyer_address}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ------------------- STYLES -------------------
const styles = {
  page: {
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    backgroundColor: "#f4f6f9",
    minHeight: "100vh"
  },
  heading: {
    textAlign: "center",
    fontSize: "36px",
    marginBottom: "5px"
  },
  subheading: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#444"
  },
  messageBox: {
    backgroundColor: "#fff3cd",
    padding: "12px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #ffeeba",
    fontWeight: "bold"
  },
  card: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0px 2px 8px rgba(0,0,0,0.1)"
  },
  sectionTitle: {
    marginBottom: "15px"
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    fontSize: "14px"
  },
  textarea: {
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    minHeight: "70px",
    fontSize: "14px"
  },
  button: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    backgroundColor: "#007bff",
    color: "white"
  },
  cancelButton: {
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    backgroundColor: "#dc3545",
    color: "white"
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "15px"
  },
  productCard: {
    padding: "15px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    backgroundColor: "#ffffff"
  },
  productTitle: {
    margin: "0px",
    fontSize: "18px"
  },
  price: {
    fontWeight: "bold",
    fontSize: "16px"
  },
  desc: {
    fontSize: "13px",
    color: "#444"
  },
  smallText: {
    fontSize: "13px",
    color: "#666"
  },
  buyButton: {
    padding: "10px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    cursor: "pointer",
    fontWeight: "bold",
    backgroundColor: "#28a745",
    color: "white",
    marginTop: "10px"
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    width: "400px",
    boxShadow: "0px 2px 10px rgba(0,0,0,0.3)"
  },
  orderList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  orderCard: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    backgroundColor: "#fafafa"
  }
};