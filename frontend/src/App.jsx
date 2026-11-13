
import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:5000/api";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load products
  const loadProducts = async () => {
    try {
      const response = await fetch(`${API}/products`);
      if (!response.ok) throw new Error("Unable to fetch products");

      setProducts(await response.json());
    } catch (error) {
      setMessage(error.message + ". Please start the backend.");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Add product to cart
  const addToCart = (product) => {
    if (product.stock < 1) return;

    setCart((current) => {
      const existing = current.find(
        (item) => item._id === product._id
      );

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? {
                ...item,
                quantity: Math.min(
                  item.quantity + 1,
                  product.stock
                )
              }
            : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });

    setMessage(`${product.name} added to cart!`);
  };

  // Remove cart item
  const removeFromCart = (id) => {
    setCart((current) =>
      current.filter((item) => item._id !== id)
    );
  };

  // Cart total
  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // Register and login
  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isRegister ? "register" : "login";

      const response = await fetch(`${API}/users/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(
          isRegister
            ? { name, email, password }
            : { email, password }
        )
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      if (isRegister) {
        setMessage("Account created successfully! Please log in.");
        setIsRegister(false);
        setPassword("");
      } else {
        setToken(data.token);
        setUser(data.user);
        setShowLogin(false);
        setPassword("");
        setMessage(`Welcome, ${data.user.name}!`);
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load customer's orders
  const loadOrders = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${API}/orders/my-orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders");
      }

      setOrders(data);
      setShowOrders(true);
    } catch (error) {
      setMessage(error.message);
    }
  };

  // Checkout
  const checkout = async () => {
    if (!token) {
      setShowLogin(true);
      setMessage("Please log in before placing an order.");
      return;
    }

    if (cart.length === 0) {
      setMessage("Your cart is empty.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            product: item._id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Checkout failed");
      }

      setCart([]);
      setMessage(
        `Order placed successfully! Order ID: ${data.order._id}`
      );

      await loadProducts();
      await loadOrders();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken("");
    setOrders([]);
    setShowOrders(false);
    setMessage("You have logged out.");
  };

  return (
    <div className="store">

      {/* Navigation */}
      <nav className="navbar">
        <a href="#" className="brand">
          Shop<span>Ease.</span>
        </a>

        <div className="nav-actions">
          <a href="#products">Products</a>

          <a href="#cart">
            Cart ({cart.reduce((n, item) => n + item.quantity, 0)})
          </a>

          {user ? (
            <>
              <span className="welcome">
                Hi, {user.name}
              </span>

              <button
                className="login-btn"
                onClick={loadOrders}
              >
                My Orders
              </button>

              <button
                className="login-btn"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() => {
                setIsRegister(false);
                setShowLogin(true);
              }}
            >
              Login / Register
            </button>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div>
          <span className="hero-tag">
            YOUR EVERYDAY SHOPPING DESTINATION
          </span>

          <h1>
            Find What You Love.
            <br />
            <span>Shop With Ease.</span>
          </h1>

          <p>
            Discover great products at great prices.
            A simple and enjoyable shopping experience.
          </p>

          <a href="#products" className="shop-btn">
            Explore Products →
          </a>
        </div>

        <div className="hero-art">🛍️</div>
      </section>

      {/* Notifications */}
      {message && (
        <div className="notice">
          {message}

          <button onClick={() => setMessage("")}>
            ×
          </button>
        </div>
      )}

      <main className="content">

        {/* Products */}
        <section id="products" className="products-section">
          <div className="section-heading">
            <div>
              <span className="small-label">
                OUR COLLECTION
              </span>

              <h2>Featured Products</h2>
            </div>

            <span>
              {products.length} products available
            </span>
          </div>

          <div className="product-grid">
            {products.map((product) => (
              <article
                className="product-card"
                key={product._id}
              >
                <div className="product-image">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://placehold.co/400x400?text=Product";
                    }}
                  />
                </div>

                <div className="product-details">
                  <span className="category">
                    {product.category}
                  </span>

                  <h3>{product.name}</h3>

                  <p>{product.description}</p>

                  <div className="product-bottom">
                    <strong>
                      ₹{product.price.toLocaleString("en-IN")}
                    </strong>

                    <button
                      disabled={product.stock < 1}
                      onClick={() => addToCart(product)}
                    >
                      {product.stock < 1
                        ? "Out of Stock"
                        : "Add to Cart +"}
                    </button>
                  </div>

                  <small>
                    {product.stock} in stock
                  </small>
                </div>
              </article>
            ))}
          </div>

          {products.length === 0 && (
            <p className="empty">
              No products available yet.
            </p>
          )}
        </section>

        {/* Shopping Cart */}
        <section id="cart" className="cart-section">
          <div>
            <span className="small-label">
              YOUR SELECTION
            </span>

            <h2>Shopping Cart</h2>
          </div>

          {cart.length === 0 ? (
            <p className="empty">
              Your cart is empty. Start shopping!
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  className="cart-item"
                  key={item._id}
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <strong>
                    ₹{(
                      item.price * item.quantity
                    ).toLocaleString("en-IN")}
                  </strong>

                  <button
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              ))}

              <div className="cart-total">
                <strong>
                  Total: ₹{total.toLocaleString("en-IN")}
                </strong>

                <button
                  onClick={checkout}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Place Order"}
                </button>
              </div>

              <p className="demo-note">
                Demo checkout only. No real payment is collected.
              </p>
            </>
          )}
        </section>

        {/* Order History */}
        {showOrders && (
          <section className="cart-section">
            <h2>My Orders</h2>

            {orders.length === 0 ? (
              <p className="empty">
                You haven't placed any orders yet.
              </p>
            ) : (
              orders.map((order) => (
                <article
                  className="cart-item"
                  key={order._id}
                >
                  <div>
                    <strong>
                      Order #{order._id.slice(-8)}
                    </strong>

                    <p>
                      {order.items.map((item) =>
                        item.product
                          ? `${item.product.name} × ${item.quantity}`
                          : "Product unavailable"
                      ).join(", ")}
                    </p>
                  </div>

                  <strong>
                    ₹{order.totalAmount.toLocaleString("en-IN")}
                  </strong>

                  <span>{order.status}</span>
                </article>
              ))
            )}
          </section>
        )}
      </main>

      {/* Login and Registration Modal */}
      {showLogin && (
        <div className="modal-overlay">
          <form
            className="auth-modal"
            onSubmit={handleAuth}
          >
            <button
              type="button"
              className="close-btn"
              onClick={() => setShowLogin(false)}
            >
              ×
            </button>

            <h2>
              {isRegister
                ? "Create Account"
                : "Welcome Back"}
            </h2>

            <p>
              {isRegister
                ? "Join ShopEase today."
                : "Log in to continue shopping."}
            </p>

            {isRegister && (
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            )}

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="password"
              placeholder="Password (at least 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isRegister
                  ? "Register"
                  : "Login"}
            </button>

            <p className="switch-auth">
              {isRegister
                ? "Already registered?"
                : "New customer?"}

              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setMessage("");
                }}
              >
                {isRegister ? "Login" : "Create an account"}
              </button>
            </p>
          </form>
        </div>
      )}

      {/* Footer */}
      <footer>
        <a href="#" className="brand">
          Shop<span>Ease.</span>
        </a>

        <p>Simple shopping. Better experiences.</p>

        <small>
          © 2026 ShopEase. Demo E-Commerce Project.
        </small>
      </footer>
    </div>
  );
}

export default App;
