// 用户管理模拟数据
export const mockUsers = [
  { id: 1, username: 'zhangsan', name: '张三', phone: '13800138001', email: 'zhangsan@qq.com', status: 1, createTime: '2024-01-15 10:30:00' },
  { id: 2, username: 'lisi', name: '李四', phone: '13800138002', email: 'lisi@qq.com', status: 1, createTime: '2024-01-16 14:20:00' },
  { id: 3, username: 'wangwu', name: '王五', phone: '13800138003', email: 'wangwu@qq.com', status: 0, createTime: '2024-01-17 09:15:00' },
  { id: 4, username: 'zhaoliu', name: '赵六', phone: '13800138004', email: 'zhaoliu@qq.com', status: 1, createTime: '2024-01-18 16:45:00' },
  { id: 5, username: 'sunqi', name: '孙七', phone: '13800138005', email: 'sunqi@qq.com', status: 1, createTime: '2024-01-19 11:00:00' },
  { id: 6, username: 'zhouba', name: '周八', phone: '13800138006', email: 'zhouba@qq.com', status: 0, createTime: '2024-01-20 13:30:00' },
  { id: 7, username: 'wujiu', name: '吴九', phone: '13800138007', email: 'wujiu@qq.com', status: 1, createTime: '2024-01-21 08:45:00' },
  { id: 8, username: 'zhengshi', name: '郑十', phone: '13800138008', email: 'zhengshi@qq.com', status: 1, createTime: '2024-01-22 15:20:00' }
]

// 用户地址管理模拟数据
export const mockUserAddresses = [
  { id: 1, userId: 1, name: '张三', phone: '13800138001', province: '北京市', city: '北京市', district: '朝阳区', address: '建国路88号SOHO现代城A座1501', isDefault: 1, createTime: '2024-01-15 10:30:00' },
  { id: 2, userId: 1, name: '张三', phone: '13800138001', province: '北京市', city: '北京市', district: '海淀区', address: '中关村南大街5号理工大学家属院3号楼2单元101', isDefault: 0, createTime: '2024-01-16 14:20:00' },
  { id: 3, userId: 2, name: '李四', phone: '13800138002', province: '北京市', city: '北京市', district: '朝阳区', address: '东大桥路56号富力广场B座2203', isDefault: 1, createTime: '2024-01-17 09:15:00' },
  { id: 4, userId: 4, name: '赵六', phone: '13800138004', province: '北京市', city: '北京市', district: '朝阳区', address: '工人体育场北路8号三里屯SOHO 11层', isDefault: 1, createTime: '2024-01-18 16:45:00' }
]

// 外卖小哥（骑手）管理模拟数据
export const mockDeliveryMen = [
  { id: 1, name: '王军', username: 'wangjun', phone: '15900159001', idCard: '110101199001011234', status: 1, isOnline: 1, rating: 4.8, orderCount: 1256, income: 8560, latitude: 39.9042, longitude: 116.4074, createTime: '2023-06-10 08:00:00' },
  { id: 2, name: '刘强', username: 'liuqiang', phone: '15900159002', idCard: '110102199102022345', status: 1, isOnline: 0, rating: 4.6, orderCount: 892, income: 6230, latitude: 39.9142, longitude: 116.4174, createTime: '2023-08-15 08:00:00' },
  { id: 3, name: '张伟', username: 'zhangwei', phone: '15900159003', idCard: '110103199203033456', status: 1, isOnline: 1, rating: 4.9, orderCount: 1568, income: 10890, latitude: 39.8942, longitude: 116.3974, createTime: '2023-05-20 08:00:00' },
  { id: 4, name: '陈明', username: 'chenming', phone: '15900159004', idCard: '110104199304044567', status: 0, isOnline: 0, rating: 4.5, orderCount: 567, income: 4120, latitude: 39.9242, longitude: 116.4274, createTime: '2024-01-10 08:00:00' }
]

// 食品分类模拟数据
export const mockCategories = [
  { id: 1, name: '汉堡', icon: '🍔', sort: 1, status: 1, createTime: '2024-01-10 08:00:00' },
  { id: 2, name: '饮品', icon: '🥤', sort: 2, status: 1, createTime: '2024-01-10 08:05:00' },
  { id: 3, name: '小食', icon: '🍟', sort: 3, status: 1, createTime: '2024-01-10 08:10:00' },
  { id: 4, name: '甜点', icon: '🍨', sort: 4, status: 1, createTime: '2024-01-10 08:15:00' },
  { id: 5, name: '套餐', icon: '🍱', sort: 5, status: 1, createTime: '2024-01-10 08:20:00' },
  { id: 6, name: '早餐', icon: '🥪', sort: 6, status: 0, createTime: '2024-01-10 08:25:00' }
]

// 食品管理模拟数据
export const mockFoods = [
  { id: 1, name: '经典牛肉汉堡', categoryId: 1, price: 28, originalPrice: 35, stock: 100, image: 'https://via.placeholder.com/200x150?text=牛肉汉堡', description: '100%纯牛肉饼，新鲜生菜，秘制酱料', status: 1, sales: 520, createTime: '2024-01-12 10:00:00' },
  { id: 2, name: '双层芝士汉堡', categoryId: 1, price: 35, originalPrice: null, stock: 80, image: 'https://via.placeholder.com/200x150?text=芝士汉堡', description: '双层牛肉饼，融化芝士，口感丰富', status: 1, sales: 380, createTime: '2024-01-12 10:05:00' },
  { id: 3, name: '香辣鸡腿堡', categoryId: 1, price: 32, originalPrice: 38, stock: 90, image: 'https://via.placeholder.com/200x150?text=鸡腿堡', description: '酥脆鸡腿肉，香辣酱，爽辣过瘾', status: 1, sales: 420, createTime: '2024-01-12 10:10:00' },
  { id: 4, name: '珍珠奶茶', categoryId: 2, price: 15, originalPrice: null, stock: 200, image: 'https://via.placeholder.com/200x150?text=珍珠奶茶', description: 'Q弹珍珠，香浓奶茶，经典口味', status: 1, sales: 890, createTime: '2024-01-12 10:15:00' },
  { id: 5, name: '芒果冰沙', categoryId: 2, price: 18, originalPrice: 22, stock: 150, image: 'https://via.placeholder.com/200x150?text=芒果冰沙', description: '新鲜芒果，冰爽细腻，夏日首选', status: 1, sales: 650, createTime: '2024-01-12 10:20:00' },
  { id: 6, name: '柠檬气泡水', categoryId: 2, price: 12, originalPrice: null, stock: 180, image: 'https://via.placeholder.com/200x150?text=柠檬气泡水', description: '清新柠檬，清爽气泡，解腻神器', status: 0, sales: 320, createTime: '2024-01-12 10:25:00' },
  { id: 7, name: '薯条', categoryId: 3, price: 10, originalPrice: 12, stock: 300, image: 'https://via.placeholder.com/200x150?text=薯条', description: '金黄酥脆，外酥里嫩，配番茄酱', status: 1, sales: 780, createTime: '2024-01-12 10:30:00' },
  { id: 8, name: '鸡米花', categoryId: 3, price: 16, originalPrice: null, stock: 250, image: 'https://via.placeholder.com/200x150?text=鸡米花', description: '香脆鸡块，外酥里嫩，配蘸酱', status: 1, sales: 560, createTime: '2024-01-12 10:35:00' },
  { id: 9, name: '洋葱圈', categoryId: 3, price: 14, originalPrice: null, stock: 200, image: 'https://via.placeholder.com/200x150?text=洋葱圈', description: '金黄洋葱圈，香脆可口', status: 1, sales: 280, createTime: '2024-01-12 10:40:00' },
  { id: 10, name: '提拉米苏', categoryId: 4, price: 22, originalPrice: 28, stock: 60, image: 'https://via.placeholder.com/200x150?text=提拉米苏', description: '经典意式甜点，浓郁咖啡香', status: 1, sales: 180, createTime: '2024-01-12 10:45:00' },
  { id: 11, name: '巧克力熔岩蛋糕', categoryId: 4, price: 25, originalPrice: null, stock: 50, image: 'https://via.placeholder.com/200x150?text=熔岩蛋糕', description: '外酥内软，巧克力流心', status: 1, sales: 210, createTime: '2024-01-12 10:50:00' },
  { id: 12, name: '经典套餐A', categoryId: 5, price: 45, originalPrice: 53, stock: 40, image: 'https://via.placeholder.com/200x150?text=套餐A', description: '经典汉堡 + 薯条 + 可乐', status: 1, sales: 420, createTime: '2024-01-12 10:55:00' },
  { id: 13, name: '豪华套餐B', categoryId: 5, price: 58, originalPrice: 69, stock: 35, image: 'https://via.placeholder.com/200x150?text=套餐B', description: '双层汉堡 + 鸡米花 + 奶茶', status: 0, sales: 280, createTime: '2024-01-12 11:00:00' }
]

// 员工管理模拟数据
export const mockEmployees = [
  { id: 1, name: '王小明', username: 'wangxm', phone: '13900139001', email: 'wangxm@mixue.com', department: '厨房', position: '厨师长', status: 1, hireDate: '2022-03-15', salary: 8000, createTime: '2022-03-15 08:00:00' },
  { id: 2, name: '李小红', username: 'lixh', phone: '13900139002', email: 'lixh@mixue.com', department: '前厅', position: '收银员', status: 1, hireDate: '2022-05-20', salary: 4500, createTime: '2022-05-20 08:00:00' },
  { id: 3, name: '赵小刚', username: 'zhaoxg', phone: '13900139003', email: 'zhaoxg@mixue.com', department: '配送', position: '配送员', status: 1, hireDate: '2022-06-10', salary: 5000, createTime: '2022-06-10 08:00:00' },
  { id: 4, name: '孙小丽', username: 'sunxl', phone: '13900139004', email: 'sunxl@mixue.com', department: '前厅', position: '服务员', status: 1, hireDate: '2022-08-01', salary: 4000, createTime: '2022-08-01 08:00:00' },
  { id: 5, name: '周小杰', username: 'zhouxj', phone: '13900139005', email: 'zhouxj@mixue.com', department: '厨房', position: '厨师', status: 0, hireDate: '2023-01-15', salary: 5500, createTime: '2023-01-15 08:00:00' },
  { id: 6, name: '吴小燕', username: 'wuxy', phone: '13900139006', email: 'wuxy@mixue.com', department: '管理', position: '店长', status: 1, hireDate: '2021-06-01', salary: 12000, createTime: '2021-06-01 08:00:00' },
  { id: 7, name: '郑小东', username: 'zhengxd', phone: '13900139007', email: 'zhengxd@mixue.com', department: '配送', position: '配送员', status: 1, hireDate: '2023-03-20', salary: 4800, createTime: '2023-03-20 08:00:00' },
  { id: 8, name: '陈小文', username: 'chenxw', phone: '13900139008', email: 'chenxw@mixue.com', department: '厨房', position: '帮厨', status: 1, hireDate: '2023-06-01', salary: 4200, createTime: '2023-06-01 08:00:00' }
]

// 订单管理模拟数据
export const mockOrders = [
  { id: 'ORD20240115001', userId: 1, userName: '张三', phone: '13800138001', totalPrice: 68, actualPrice: 62, status: 1, orderType: 'delivery', orderTime: '2024-01-15 12:30:00', items: [{ name: '经典牛肉汉堡', quantity: 1, price: 28 }, { name: '薯条', quantity: 2, price: 10 }, { name: '珍珠奶茶', quantity: 1, price: 15 }], address: '北京市朝阳区建国路88号', addressId: 1, deliveryManId: null, remark: '汉堡少酱', estimatedDeliveryTime: 30 },
  { id: 'ORD20240115002', userId: 2, userName: '李四', phone: '13800138002', totalPrice: 45, actualPrice: 45, status: 2, orderType: 'delivery', orderTime: '2024-01-15 13:15:00', items: [{ name: '经典套餐A', quantity: 1, price: 45 }], address: '北京市朝阳区东大桥路56号', addressId: 3, deliveryManId: 1, remark: '', estimatedDeliveryTime: 25 },
  { id: 'ORD20240115003', userId: 3, userName: '王五', phone: '13800138003', totalPrice: 92, actualPrice: 85, status: 3, orderType: 'delivery', orderTime: '2024-01-15 18:45:00', items: [{ name: '双层芝士汉堡', quantity: 1, price: 35 }, { name: '香辣鸡腿堡', quantity: 1, price: 32 }, { name: '芒果冰沙', quantity: 1, price: 18 }], address: '北京市朝阳区三里屯北路19号', addressId: null, deliveryManId: 3, remark: '要发票', estimatedDeliveryTime: 35 },
  { id: 'ORD20240116001', userId: 1, userName: '张三', phone: '13800138001', totalPrice: 37, actualPrice: 37, status: 4, orderType: 'delivery', orderTime: '2024-01-16 11:20:00', items: [{ name: '双层芝士汉堡', quantity: 1, price: 35 }, { name: '柠檬气泡水', quantity: 1, price: 12 }], address: '北京市朝阳区建国路88号', addressId: 1, deliveryManId: 1, remark: '', estimatedDeliveryTime: 30 },
  { id: 'ORD20240116002', userId: 4, userName: '赵六', phone: '13800138004', totalPrice: 56, actualPrice: 50, status: 1, orderType: 'delivery', orderTime: '2024-01-16 12:00:00', items: [{ name: '提拉米苏', quantity: 2, price: 22 }, { name: '珍珠奶茶', quantity: 1, price: 15 }], address: '北京市朝阳区工人体育场北路8号', addressId: 4, deliveryManId: null, remark: '蛋糕要保温', estimatedDeliveryTime: 28 },
  { id: 'ORD20240116003', userId: 5, userName: '孙七', phone: '13800138005', totalPrice: 128, actualPrice: 115, status: 2, orderType: 'delivery', orderTime: '2024-01-16 19:30:00', items: [{ name: '豪华套餐B', quantity: 2, price: 58 }, { name: '鸡米花', quantity: 1, price: 16 }], address: '北京市朝阳区朝阳公园路6号', addressId: null, deliveryManId: null, remark: '', estimatedDeliveryTime: 32 },
  { id: 'ORD20240117001', userId: 2, userName: '李四', phone: '13800138002', totalPrice: 22, actualPrice: 22, status: 5, orderType: 'delivery', orderTime: '2024-01-17 09:15:00', items: [{ name: '巧克力熔岩蛋糕', quantity: 1, price: 25 }], address: '北京市朝阳区东大桥路56号', addressId: 3, deliveryManId: null, remark: '取消订单', estimatedDeliveryTime: 0 },
  { id: 'ORD20240117002', userId: 6, userName: '周八', phone: '13800138006', totalPrice: 53, actualPrice: 53, status: 1, orderType: 'delivery', orderTime: '2024-01-17 12:45:00', items: [{ name: '经典套餐A', quantity: 1, price: 45 }, { name: '洋葱圈', quantity: 1, price: 14 }], address: '北京市朝阳区新东路8号', addressId: null, deliveryManId: null, remark: '', estimatedDeliveryTime: 30 }
]

// 订单配送状态映射（外卖专用）
export const deliveryStatusMap = {
  1: { label: '待接单', type: 'warning' },
  2: { label: '已接单', type: 'primary' },
  3: { label: '取餐中', type: 'info' },
  4: { label: '配送中', type: 'warning' },
  5: { label: '已送达', type: 'success' },
  6: { label: '已取消', type: 'danger' }
}

// 订单跟踪记录模拟数据
export const mockOrderTracking = [
  { id: 1, orderId: 'ORD20240115003', status: 1, description: '订单已创建，等待商家确认', time: '2024-01-15 18:45:00' },
  { id: 2, orderId: 'ORD20240115003', status: 2, description: '商家已确认，等待骑手接单', time: '2024-01-15 18:47:00' },
  { id: 3, orderId: 'ORD20240115003', status: 3, description: '骑手张伟已接单，正在前往商家', time: '2024-01-15 18:50:00', deliveryManId: 3 },
  { id: 4, orderId: 'ORD20240115003', status: 4, description: '骑手已取餐，正在配送中', time: '2024-01-15 18:58:00', deliveryManId: 3 },
  { id: 5, orderId: 'ORD20240116001', status: 1, description: '订单已创建，等待商家确认', time: '2024-01-16 11:20:00' },
  { id: 6, orderId: 'ORD20240116001', status: 2, description: '商家已确认，等待骑手接单', time: '2024-01-16 11:22:00' },
  { id: 7, orderId: 'ORD20240116001', status: 3, description: '骑手王军已接单，正在前往商家', time: '2024-01-16 11:25:00', deliveryManId: 1 },
  { id: 8, orderId: 'ORD20240116001', status: 4, description: '骑手已取餐，正在配送中', time: '2024-01-16 11:32:00', deliveryManId: 1 },
  { id: 9, orderId: 'ORD20240116001', status: 5, description: '订单已送达，感谢您的使用', time: '2024-01-16 11:55:00', deliveryManId: 1 }
]

// 消息通知模拟数据
export const mockNotifications = [
  { id: 1, userId: 1, type: 'order', title: '订单已接单', content: '您的订单 ORD20240116001 已被骑手王军接单', isRead: 0, createTime: '2024-01-16 11:25:00' },
  { id: 2, userId: 1, type: 'order', title: '订单已送达', content: '您的订单 ORD20240116001 已送达，请确认收货', isRead: 1, createTime: '2024-01-16 11:55:00' },
  { id: 3, userId: 2, type: 'order', title: '订单已创建', content: '您的订单 ORD20240115002 已创建成功', isRead: 1, createTime: '2024-01-15 13:15:00' },
  { id: 4, userId: 3, type: 'order', title: '订单已接单', content: '您的订单 ORD20240115003 已被骑手张伟接单', isRead: 0, createTime: '2024-01-15 18:50:00' }
]

// 订单状态映射
export const orderStatusMap = {
  1: { label: '待付款', type: 'warning' },
  2: { label: '待发货', type: 'primary' },
  3: { label: '待收货', type: 'info' },
  4: { label: '已完成', type: 'success' },
  5: { label: '已取消', type: 'danger' }
}

// 部门列表
export const departments = ['厨房', '前厅', '配送', '管理']

// 职位列表
export const positions = ['厨师长', '厨师', '帮厨', '收银员', '服务员', '配送员', '店长', '副店长']