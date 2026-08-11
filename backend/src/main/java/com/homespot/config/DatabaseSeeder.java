package com.homespot.config;

import com.homespot.model.Property;
import com.homespot.model.User;
import com.homespot.repository.PropertyRepository;
import com.homespot.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PropertyRepository propertyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            // Ensure PostgreSQL columns are TEXT to prevent "value too long for type character varying(255)"
            jdbcTemplate.execute("ALTER TABLE properties ALTER COLUMN image TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE properties ALTER COLUMN title TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE properties ALTER COLUMN address TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE properties ALTER COLUMN price TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE properties ALTER COLUMN phone TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE properties ALTER COLUMN sqft TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE bookings ALTER COLUMN message TYPE TEXT;");
            jdbcTemplate.execute("ALTER TABLE messages ALTER COLUMN text TYPE TEXT;");
        } catch (Exception e) {
            System.out.println("PostgreSQL schema column adjustment note: " + e.getMessage());
        }

        try {
            if (propertyRepository.count() == 0) {
                System.out.println("Seeding initial properties into PostgreSQL database (rental_hub)...");

                Optional<User> adminOpt = userRepository.findByUsername("admin");
                User landlord;
                if (adminOpt.isEmpty()) {
                    landlord = new User(
                            "admin",
                            "admin@gmail.com",
                            passwordEncoder.encode("Password123!"),
                            "landlord"
                    );
                    landlord = userRepository.save(landlord);
                    System.out.println("Created admin landlord user: admin / admin@gmail.com");
                } else {
                    landlord = adminOpt.get();
                }

                List<Property> seedProperties = createSeedProperties(landlord);
                propertyRepository.saveAll(seedProperties);
                System.out.println("Seeding properties complete. Inserted " + seedProperties.size() + " properties into PostgreSQL.");
            }
        } catch (Exception e) {
            System.err.println("Database seeding failed: " + e.getMessage());
        }
    }

    private List<Property> createSeedProperties(User landlord) {
        List<Property> list = new ArrayList<>();

        list.add(createProp("Modern Punjabi Villa", "ludhiana", 4, 4, 3.0, "2,200", "₹45,000/month",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop",
                "125 Model Town, Ludhiana, Punjab", "+91 98765-43210", landlord));

        list.add(createProp("Amritsar City Apartment", "amritsar", 2, 2, 2.0, "1,100", "₹35,000/month",
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
                "18 Mall Road, Amritsar, Punjab", "+91 98765-43211", landlord));

        list.add(createProp("Jalandhar Family Home", "jalandhar", 3, 3, 2.0, "1,800", "₹28,000/month",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
                "42 Civil Lines, Jalandhar, Punjab", "+91 98765-43212", landlord));

        list.add(createProp("Mohali Luxury Villa", "mohali", 5, 5, 5.0, "4,500", "₹85,000/month",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
                "9 Green Avenue, Mohali, Punjab", "+91 98765-43213", landlord));

        list.add(createProp("Mohali Studio Apartment", "mohali", 1, 1, 1.0, "750", "₹18,000/month",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
                "55 Sector 70, Mohali, Punjab", "+91 98765-43214", landlord));

        list.add(createProp("Mohali Townhouse", "mohali", 3, 3, 2.5, "1,950", "₹42,000/month",
                "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop",
                "210 Phase 8, Mohali, Punjab", "+91 98765-43215", landlord));

        list.add(createProp("Ludhiana Modern Flat", "ludhiana", 2, 2, 2.0, "1,200", "₹25,000/month",
                "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=2070&auto=format&fit=crop",
                "78 Model Town Extension, Ludhiana, Punjab", "+91 98765-43216", landlord));

        list.add(createProp("Amritsar Heritage House", "amritsar", 4, 4, 3.0, "2,500", "₹55,000/month",
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop",
                "12 Heritage Street, Amritsar, Punjab", "+91 98765-43217", landlord));

        list.add(createProp("Jalandhar Executive Suite", "jalandhar", 1, 1, 1.0, "800", "₹20,000/month",
                "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=1980&auto=format&fit=crop",
                "45 Executive Plaza, Jalandhar, Punjab", "+91 98765-43218", landlord));

        list.add(createProp("Mohali Garden Villa", "mohali", 4, 4, 3.0, "2,800", "₹65,000/month",
                "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop",
                "33 Garden Estate, Mohali, Punjab", "+91 98765-43219", landlord));

        return list;
    }

    private Property createProp(String title, String city, int rooms, int beds, double baths,
                                String sqft, String price, String image, String address, String phone, User landlord) {
        Property p = new Property();
        p.setTitle(title);
        p.setCity(city);
        p.setRooms(rooms);
        p.setBeds(beds);
        p.setBaths(baths);
        p.setSqft(sqft);
        p.setPrice(price);
        p.setImage(image);
        p.setAddress(address);
        p.setPhone(phone);
        p.setLandlord(landlord);
        p.setStatus("available");
        return p;
    }
}
