package com.stepstyle.config;

import com.stepstyle.entity.Category;
import com.stepstyle.entity.Product;
import com.stepstyle.entity.Shop;
import com.stepstyle.repository.CategoryRepository;
import com.stepstyle.repository.ProductRepository;
import com.stepstyle.repository.ShopRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Automatically seeds initial categories, shop location, and sample products
 * into the local database on startup if the tables are empty.
 * Zero dependency on Supabase or external networks.
 */
@Component
@Order(2)
public class DatabaseSeederRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeederRunner.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final ShopRepository shopRepository;

    @Value("${app.seed.products.enabled:false}")
    private boolean seedProductsEnabled;

    public DatabaseSeederRunner(
            CategoryRepository categoryRepository,
            ProductRepository productRepository,
            ShopRepository shopRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.shopRepository = shopRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCategories();
        seedShop();
        seedProducts();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            log.info("Categories already exist in database ({} total). Skipping category seed.", categoryRepository.count());
            return;
        }

        log.info("Seeding initial footwear categories into local database...");

        List<Category> categories = List.of(
                new Category("Slippers", "chappals", "Authentic South Indian leather sandals, orthopaedic slippers, and daily slide comforts.", "https://images.unsplash.com/photo-1603487742131-4160ec999306?auto=format&fit=crop&w=600&q=80", 1),
                new Category("Men's Footwear", "men", "Elevate your stride with athletic runners, formal oxfords, and versatile loafers.", "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", 2),
                new Category("Women's Footwear", "women", "Graceful heels, cushioned flats, running trainers, and everyday comfort.", "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", 3),
                new Category("Sports & Athletics", "sports", "High-performance marathons, gym trainers, cricket spikes, and court shoes.", "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80", 4),
                new Category("Formal Elegance", "formal", "Handcrafted genuine leather oxfords, derbies, and executive slip-ons.", "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80", 5),
                new Category("Casual & Lifestyle", "casual", "Trendsetting street sneakers, boat shoes, canvas, and relaxed loafers.", "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80", 6),
                new Category("Kids' Collection", "kids", "Playproof sneakers, school shoes, and soft flexible sandals for little explorers.", "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80", 7)
        );

        categoryRepository.saveAll(categories);
        log.info("Successfully seeded {} footwear categories.", categories.size());
    }

    private void seedShop() {
        if (shopRepository.count() > 0) {
            return;
        }

        Shop shop = new Shop(
                "Palani Footwear Shop",
                "Main Bazaar Road, Near Bus Stand, Musiri",
                "Musiri",
                "Tamil Nadu",
                "621211",
                "+91 96261 57188",
                "Mon - Sun: 07:00 AM - 10:00 PM",
                10.9416,
                78.4552
        );
        shopRepository.save(shop);
        log.info("Successfully seeded Palani Footwear Shop location.");
    }

    private void seedProducts() {
        if (!seedProductsEnabled) {
            log.info("Sample product seeding is disabled; using existing Supabase products table only.");
            return;
        }
        if (productRepository.count() > 0) {
            log.info("Products already exist in database ({} total). Skipping product seed.", productRepository.count());
            return;
        }

        log.info("Seeding initial 14 footwear products into local database...");

        createProduct("Traditional Handcrafted Kolhapuri Chappals", "SS-CHAP-001", "StepStyle Heritage",
                "Premium genuine leather handcrafted ethnic Kolhapuri chappals featuring braided straps, cushioned footbed, and durable leather sole.",
                1299, 1899, "chappals", "6,7,8,9,10", "Tan,Dark Brown,Natural Gold", 45,
                "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?auto=format&fit=crop&w=600&q=80", 31, 4.7);

        createProduct("Daily Comfort Casual Chappals", "SS-CHAP-002", "SoleComfort",
                "Ergonomically contoured rubberized EVA daily wear chappals with anti-skid bottom tread and waterproof strap.",
                499, 799, "chappals", "7,8,9,10,11", "Black,Navy Blue,Olive Green", 100,
                "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80", 37, 4.4);

        createProduct("Orthopedic Memory Foam House Slippers", "SS-SLIP-001", "OrthoStride",
                "Plush, ultra-soft indoor slippers with high-density memory foam padding, arch support, and anti-slip rubberized traction outsole.",
                799, 1199, "chappals", "6,7,8,9,10", "Grey,Navy Blue,Black", 60,
                "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=600&q=80", 33, 4.8);

        createProduct("Quick-Dry Anti-Slip Bathroom Slippers", "SS-SLIP-002", "AquaStep",
                "High-resilience EVA waterproof bathroom slippers featuring drain holes, non-slip textured sole, and lightweight ergonomic arch design.",
                349, 499, "chappals", "5,6,7,8,9", "Sky Blue,Grey,Teal", 120,
                "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=600&q=80", 30, 4.3);

        createProduct("Classic Oxford Leather Brogues", "SS-FORM-001", "RoyalStep",
                "Hand-burnished Italian calfskin formal Oxford shoes with intricate brogue perforations and breathable leather lining.",
                3499, 4999, "formal", "7,8,9,10,11", "Dark Brown,Black", 30,
                "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80", 30, 4.9);

        createProduct("Executive Slip-On Leather Loafers", "SS-FORM-002", "Avenue Classic",
                "Sleek, polished full-grain leather dress loafers with penny strap detail, flexible padded insole, and durable rubber heel.",
                2799, 3999, "formal", "6,7,8,9,10", "Black,Dark Brown", 40,
                "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80", 30, 4.6);

        createProduct("AeroGlide Pro Marathon Running Shoes", "SS-SPRT-001", "Velocity Sport",
                "High-performance lightweight mesh running shoes engineered with responsive nitrogen-infused foam midsole and carbon-fiber plate.",
                3999, 5999, "sports", "7,8,9,10,11", "Neon Lime,Navy Blue,Black", 50,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80", 33, 4.9);

        createProduct("CrossFit Flex Training Sneakers", "SS-SPRT-002", "Apex Athletics",
                "Durable, breathable knit athletic trainers with lateral stability cage and flat stable lifting base.",
                2499, 3499, "sports", "7,8,9,10", "Black,White,Red", 45,
                "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80", 28, 4.7);

        createProduct("Urban Street Low-Top Canvas Sneakers", "SS-CAS-001", "StreetVibe",
                "Timeless vulcanized canvas lace-up sneakers featuring reinforced eyelets and durable waffle-grip rubber sole.",
                1599, 2299, "casual", "6,7,8,9,10", "White,Black,Olive Green", 80,
                "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=600&q=80", 30, 4.5);

        createProduct("Suede Desert Chukka Boots", "SS-CAS-002", "TimberTrail",
                "Soft premium suede leather mid-top chukka boots with minimalist two-eyelet lacing and crepe rubber outsole.",
                2899, 4199, "casual", "7,8,9,10,11", "Tan,Dark Brown,Grey", 35,
                "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80", 31, 4.6);

        createProduct("Rugged Outdoor Hiking Trail Boots", "SS-MEN-001", "PeakMaster",
                "Waterproof leather and ripstop nylon trail boots with gusseted tongue and deep lug Vibram traction outsoles.",
                4299, 5999, "men", "8,9,10,11", "Dark Brown,Olive Green", 25,
                "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80", 28, 4.8);

        createProduct("Elegance Block Heel Pointed Pumps", "SS-WOM-001", "BellaModa",
                "Chic pointed-toe formal pumps with a comfortable 2.5-inch sturdy block heel and cushioned footbed.",
                2199, 3199, "women", "4,5,6,7,8", "Nude Blush,Black,Burgundy", 40,
                "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", 31, 4.7);

        createProduct("Casual Platform Knit Slip-On Flats", "SS-WOM-002", "AuraWalk",
                "Ultra-breathable engineered knit platform walking shoes with stretchy collar and memory foam insole.",
                1499, 2099, "women", "4,5,6,7,8", "Pink,White,Black", 65,
                "https://images.unsplash.com/photo-1562183241-b937e95585b6?auto=format&fit=crop&w=600&q=80", 28, 4.6);

        createProduct("Kids Active Bounce Velcro Sneakers", "SS-KID-001", "TinyTreads",
                "Fun, vibrant kids trainers with dual velcro strap closure, reinforced protective toe cap, and non-marking sole.",
                1199, 1699, "kids", "4,5,6,7", "Royal Blue Red,Pink,Black", 70,
                "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=600&q=80", 29, 4.8);

        log.info("Successfully seeded 14 initial footwear products.");
    }

    private void createProduct(String name, String sku, String brand, String desc, double price, double origPrice,
                              String category, String sizes, String colors, int stock, String imageUrl, int discount, double rating) {
        Product p = new Product(
                name,
                brand,
                desc,
                BigDecimal.valueOf(price),
                BigDecimal.valueOf(origPrice),
                category,
                sizes,
                colors,
                stock,
                imageUrl,
                discount,
                rating,
                true
        );
        p.setSku(sku);
        productRepository.save(p);
    }
}
