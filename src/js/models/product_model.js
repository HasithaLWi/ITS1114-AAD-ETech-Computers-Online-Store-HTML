export class Product {
    id;
    name;
    category;
    price;
    originalPrice;
    rating;
    reviews;
    image;
    description;
    fullDescription;
    inStock;
    badge;
    sku;
    warranty;
    specs;
    features;

    constructor(id, name, category, price, originalPrice, rating, reviews, image, description, fullDescription, inStock, badge, sku, warranty, specs, features) {
        this.id = id;
        this.name = name || '';
        this.category = category;
        this.price = price;
        this.originalPrice = originalPrice;
        this.rating = rating;
        this.reviews = reviews;
        this.image = image;
        this.description = description;
        this.fullDescription = fullDescription;
        this.inStock = inStock|| true;
        this.badge = badge;
        this.sku = sku;
        this.warranty = warranty || 'warranty not specified';
        this.specs = specs || {};
        this.features = features || [];
    }
}