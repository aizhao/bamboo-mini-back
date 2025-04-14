# Bamboo Mini API Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication

所有需要认证的接口都需要在请求头中添加：

```
Authorization: Bearer <token>
```

## API Endpoints

### 用户相关

#### 获取用户信息

```
GET /users/profile
```

Response:

```json
{
  "id": 1,
  "openid": "wx123456789",
  "nickname": "张三",
  "avatar": "https://example.com/avatars/user1.jpg",
  "phone": "13800138000",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### 更新用户信息

```
PUT /users/profile
```

Request Body:

```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg",
  "phone": "13800138001"
}
```

Response:

```json
{
  "id": 1,
  "openid": "wx123456789",
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg",
  "phone": "13800138001",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

### 商品相关

#### 获取所有商品

```
GET /products
```

Response:

```json
[
  {
    "id": 1,
    "name": "竹制餐桌",
    "description": "天然竹材制作，环保耐用",
    "price": 899.0,
    "stock": 50,
    "image": "https://example.com/images/table.jpg",
    "category_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

#### 获取商品详情

```
GET /products/:id
```

Response:

```json
{
  "id": 1,
  "name": "竹制餐桌",
  "description": "天然竹材制作，环保耐用",
  "price": 899.0,
  "stock": 50,
  "image": "https://example.com/images/table.jpg",
  "category_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### 获取分类商品

```
GET /products/category/:categoryId
```

Response:

```json
[
  {
    "id": 1,
    "name": "竹制餐桌",
    "description": "天然竹材制作，环保耐用",
    "price": 899.0,
    "stock": 50,
    "image": "https://example.com/images/table.jpg",
    "category_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
]
```

### 订单相关

#### 创建订单

```
POST /orders
```

Request Body:

```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 1
    }
  ],
  "address": "北京市朝阳区xxx街道",
  "contact": "张三",
  "phone": "13800138000"
}
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "total_amount": 899.0,
  "status": "pending",
  "address": "北京市朝阳区xxx街道",
  "contact": "张三",
  "phone": "13800138000",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z"
}
```

#### 获取用户订单列表

```
GET /orders/my-orders
```

Response:

```json
[
  {
    "id": 1,
    "user_id": 1,
    "total_amount": 1197.0,
    "status": "completed",
    "address": "北京市朝阳区xxx街道",
    "contact": "张三",
    "phone": "13800138000",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "order_items": [
      {
        "id": 1,
        "order_id": 1,
        "product_id": 1,
        "quantity": 1,
        "price": 899.0,
        "product": {
          "id": 1,
          "name": "竹制餐桌",
          "description": "天然竹材制作，环保耐用",
          "price": 899.0,
          "image": "https://example.com/images/table.jpg"
        }
      }
    ]
  }
]
```

#### 获取订单详情

```
GET /orders/:id
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "total_amount": 1197.0,
  "status": "completed",
  "address": "北京市朝阳区xxx街道",
  "contact": "张三",
  "phone": "13800138000",
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "order_items": [
    {
      "id": 1,
      "order_id": 1,
      "product_id": 1,
      "quantity": 1,
      "price": 899.0,
      "product": {
        "id": 1,
        "name": "竹制餐桌",
        "description": "天然竹材制作，环保耐用",
        "price": 899.0,
        "image": "https://example.com/images/table.jpg"
      }
    }
  ]
}
```

### 足迹相关

#### 添加足迹

```
POST /footprints
```

Request Body:

```json
{
  "product_id": 1
}
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### 获取用户足迹列表

```
GET /footprints/my-footprints
```

Response:

```json
[
  {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": 1,
      "name": "竹制餐桌",
      "description": "天然竹材制作，环保耐用",
      "price": 899.0,
      "image": "https://example.com/images/table.jpg"
    }
  }
]
```

### 收藏相关

#### 添加收藏

```
POST /favorites
```

Request Body:

```json
{
  "product_id": 1
}
```

Response:

```json
{
  "id": 1,
  "user_id": 1,
  "product_id": 1,
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

#### 取消收藏

```
DELETE /favorites/:productId
```

Response:

```json
{
  "message": "Favorite removed successfully"
}
```

#### 获取用户收藏列表

```
GET /favorites/my-favorites
```

Response:

```json
[
  {
    "id": 1,
    "user_id": 1,
    "product_id": 1,
    "created_at": "2024-01-01T00:00:00.000Z",
    "product": {
      "id": 1,
      "name": "竹制餐桌",
      "description": "天然竹材制作，环保耐用",
      "price": 899.0,
      "image": "https://example.com/images/table.jpg"
    }
  }
]
```

## 错误响应

所有接口在发生错误时都会返回以下格式的响应：

```json
{
  "success": false,
  "error": {
    "message": "错误信息"
  }
}
```

常见错误状态码：

- 400: 请求参数错误
- 401: 未授权
- 404: 资源不存在
- 500: 服务器内部错误
