package com.homespot.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Document(collection = "properties")
public class Property {

    @Id
    private String id;

    private String title;
    private String city;
    private Integer rooms;
    private Integer beds;
    private Double baths;
    private String sqft;
    private String price;
    private String image = "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2070&auto=format&fit=crop";
    private String address;
    private String phone;

    private Object landlord;

    private String status = "available"; // 'available' or 'rented'

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Property() {
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCity() {
        return city != null ? city.toLowerCase().trim() : null;
    }

    public void setCity(String city) {
        this.city = city != null ? city.toLowerCase().trim() : null;
    }

    public Integer getRooms() {
        return rooms;
    }

    public void setRooms(Integer rooms) {
        this.rooms = rooms;
    }

    public Integer getBeds() {
        return beds;
    }

    public void setBeds(Integer beds) {
        this.beds = beds;
    }

    public Double getBaths() {
        return baths;
    }

    public void setBaths(Double baths) {
        this.baths = baths;
    }

    public String getSqft() {
        return sqft;
    }

    public void setSqft(String sqft) {
        this.sqft = sqft;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Object getLandlord() {
        return landlord;
    }

    public void setLandlord(Object landlord) {
        this.landlord = landlord;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Date getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getLandlordId() {
        if (landlord == null) return null;
        if (landlord instanceof User) {
            return ((User) landlord).getId();
        }
        if (landlord instanceof Map) {
            Object idObj = ((Map<?, ?>) landlord).get("id");
            if (idObj == null) idObj = ((Map<?, ?>) landlord).get("_id");
            return idObj != null ? idObj.toString() : null;
        }
        return landlord.toString();
    }
}
