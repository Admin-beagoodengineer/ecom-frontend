export type User = {
    name: string;
    email: string;
    photo: string;
    phone: string;
    gender: string;
    role: string;
    dob: string;
    _id: string;
}

export type Product = {
    name: string;
    price: number;
    stock: number;
    category: string;
    ratings: number;
    numberOfReviews: number;
    description: string;
    photos: {
        url: string;
        public_id: string;
    }[];
    _id: string;
}

export type ShippingInfo = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone:string;
}

export type CartItem = {
    productId: string;
    photo: string;
    name: string;
    price: number;
    quantity: number;
    stock: number;
}

export type OrderItem = Omit<CartItem, "stock"> & {_id: string};

export type Order = {
    orderItems: OrderItem[];
    shippingInfo: ShippingInfo;
    subTotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    status: string;
    user: {
        name: string;
        _id: string;
    };
    _id: string;
};

type CountAndChange = {
    revenue: number;
    product: number;
    user: number;
    order: number;
}

type LatestTransaction = {
    _id: string;
    amount: number;
    discount: number;
    quantity: number;
    status: string;
};

export type Stats = {
    categoryCount: Record<string, number>[];
    changePercent: CountAndChange;
    count: CountAndChange;
    chart: {
        order: number[],
        revenue: number[]
    },
    userRatio: {
        male: number;
        female: number;
    },
    latestTransactions: LatestTransaction[]
};

type OrderFullFillment = {
    processing: number;
    shipped: number;
    delivered: number;
};

type StockAvailability = {
    inStock: number;
    outOfStock: number;
};

type UsersAgeGroup = {
    teen: number;
    adult: number;
    old: number;
};

type RevenueDistribution = {
    netMargin: number;
    discount: number;
    productionCost: number;
    burnt: number;
    marketingCost: number;
};

type AdminCustomer = {
    admin: number;
    customer: number;
};

export type Pie = {
    orderFullFillment: OrderFullFillment,
    productCategories: Record<string, number>[],
    stockAvailability: StockAvailability,
    revenueDistribution: RevenueDistribution,
    usersAgeGroup: UsersAgeGroup,
    adminCustomer: AdminCustomer
};

export type Bar = {
    users: number[],
    products: number[],
    orders: number[]
};

export type Line = {
    users: number[],
    products: number[],
    discount: number[],
    revenue: number[]
};

export type CouponType = {
    code: string;
    amount: number;
    _id: string;
};

export type Review = {
    rating: number;
    comment: string;
    productId: string;
    user: {
        photo: string;
        name: string;
        _id: string;
    };
    _id: string;
}