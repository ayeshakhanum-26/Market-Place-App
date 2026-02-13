from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
DB_PATH = os.path.join(BASE_DIR, "marketplace.db")

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + DB_PATH
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)


# ------------------- MODELS -------------------

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.String(500), nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(100), nullable=False)
    seller_id = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "price": self.price,
            "category": self.category,
            "seller_id": self.seller_id
        }


class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("product.id"), nullable=False)

    buyer_name = db.Column(db.String(200), nullable=False)
    buyer_phone = db.Column(db.String(20), nullable=False)
    buyer_address = db.Column(db.String(500), nullable=False)

    status = db.Column(db.String(50), default="Pending")

    product = db.relationship("Product", backref="orders")

    def to_dict(self):
        return {
            "id": self.id,
            "product_id": self.product_id,
            "buyer_name": self.buyer_name,
            "buyer_phone": self.buyer_phone,
            "buyer_address": self.buyer_address,
            "status": self.status,
            "product": self.product.to_dict() if self.product else None
        }


# ------------------- ROUTES -------------------

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Marketplace Backend is Running!"})


@app.route("/create-db", methods=["GET"])
def create_db():
    with app.app_context():
        db.create_all()
    return jsonify({"message": "Database created successfully!"})


# ------------------- PRODUCTS API -------------------

@app.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([p.to_dict() for p in products])


@app.route("/products", methods=["POST"])
def add_product():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    required_fields = ["title", "description", "price", "category", "seller_id"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    new_product = Product(
        title=data["title"],
        description=data["description"],
        price=float(data["price"]),
        category=data["category"],
        seller_id=int(data["seller_id"])
    )

    db.session.add(new_product)
    db.session.commit()

    return jsonify({"message": "Product added successfully!", "product_id": new_product.id})


@app.route("/products/<int:product_id>", methods=["PUT"])
def update_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    data = request.get_json()

    product.title = data.get("title", product.title)
    product.description = data.get("description", product.description)
    product.price = float(data.get("price", product.price))
    product.category = data.get("category", product.category)
    product.seller_id = int(data.get("seller_id", product.seller_id))

    db.session.commit()

    return jsonify({"message": "Product updated successfully!", "product": product.to_dict()})


@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id):
    product = Product.query.get(product_id)

    if not product:
        return jsonify({"error": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({"message": "Product deleted successfully!"})


# ------------------- ORDERS API -------------------

@app.route("/orders", methods=["GET"])
def get_orders():
    orders = Order.query.all()
    return jsonify([o.to_dict() for o in orders])


@app.route("/orders", methods=["POST"])
def create_order():
    data = request.get_json()

    if not data:
        return jsonify({"error": "No JSON data received"}), 400

    required_fields = ["product_id", "buyer_name", "buyer_phone", "buyer_address"]
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    product = Product.query.get(int(data["product_id"]))
    if not product:
        return jsonify({"error": "Product not found"}), 404

    new_order = Order(
        product_id=int(data["product_id"]),
        buyer_name=data["buyer_name"],
        buyer_phone=data["buyer_phone"],
        buyer_address=data["buyer_address"],
        status="Pending"
    )

    db.session.add(new_order)
    db.session.commit()

    return jsonify({
        "message": "Order placed successfully!",
        "order_id": new_order.id,
        "order": new_order.to_dict()
    })


@app.route("/orders/<int:order_id>", methods=["PUT"])
def update_order_status(order_id):
    order = Order.query.get(order_id)

    if not order:
        return jsonify({"error": "Order not found"}), 404

    data = request.get_json()

    if "status" not in data:
        return jsonify({"error": "Missing field: status"}), 400

    order.status = data["status"]
    db.session.commit()

    return jsonify({"message": "Order updated successfully!", "order": order.to_dict()})


@app.route("/orders/<int:order_id>", methods=["DELETE"])
def delete_order(order_id):
    order = Order.query.get(order_id)

    if not order:
        return jsonify({"error": "Order not found"}), 404

    db.session.delete(order)
    db.session.commit()

    return jsonify({"message": "Order deleted successfully!"})


# ------------------- RUN SERVER -------------------

if __name__ == "__main__":
    app.run(debug=True)