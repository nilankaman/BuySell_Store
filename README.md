<<<<<<< HEAD
# BuySell Store

Two separate folders — backend and frontend. Start backend first, then open frontend.

--- 

## Folder Structure 

```
BuySell Store/
├── backend/          ← Spring Boot API (Java 17 + MySQL)
└── frontend/         ← Single HTML file (no build tools needed)
```

---

## How to Run

### 1. Database setup
```sql
mysql -u root -p
CREATE DATABASE buysell_db;
```

### 2. Set your DB password
Edit `backend/src/main/resources/application.properties`:
```
spring.datasource.password=YOUR_ACTUAL_PASSWORD
```

### 3. Start  backend
```bash
cd backend
mvn spring-boot:run
```
Wait for: `BuySell API running at :8080`

### 4. Open frontend
Just open `frontend/index.html` in your browser. No server needed.

---

## Test accounts (auto-created on first run)
- Admin: `admin@buysell.com` / `admin123`
- Register a normal account at `/auth/register`

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/auth/register | No | Create account |
| POST | /api/auth/login | No | Login |
| GET | /api/auth/me | Yes | Get profile |
| PUT | /api/auth/me | Yes | Update profile |
| POST | /api/auth/change-password | Yes | Change password |
| GET | /api/products | No | List products |
| GET | /api/products/top-rated | No | Top 8 by rating |
| GET | /api/products/{id} | No | Single product |
| POST | /api/products | Admin | Create product |
| PUT | /api/products/{id} | Admin | Update product |
| DELETE | /api/products/{id} | Admin | Delete product |
| GET | /api/cart | Yes | Get cart |
| POST | /api/cart/add | Yes | Add to cart |
| PUT | /api/cart/item/{id} | Yes | Update quantity |
| DELETE | /api/cart/item/{id} | Yes | Remove item |
| DELETE | /api/cart/clear | Yes | Clear cart |
| GET | /api/wishlist | Yes | Get wishlist |
| POST | /api/wishlist/{productId} | Yes | Add to wishlist |
| DELETE | /api/wishlist/{productId} | Yes | Remove from wishlist |
| POST | /api/orders | Yes | Place order |
| GET | /api/orders | Yes | My orders |
| GET | /api/orders/{orderNumber} | Yes | Single order |
| POST | /api/orders/{orderNumber}/cancel | Yes | Cancel order |
| PUT | /api/orders/{id}/status | Admin | Update order status |
=======
# BuySell_Store
>>>>>>> fb87b8877dd38e68322571e0b9fa97b208b23959
