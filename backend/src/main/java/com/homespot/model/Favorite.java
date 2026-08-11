package com.homespot.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Document(collection = "favorites")
public class Favorite {

    @Id
    private String id;

    private Object user;
    private Object property;

    @CreatedDate
    private Date createdAt;

    @LastModifiedDate
    private Date updatedAt;

    public Favorite() {
    }

    public Favorite(Object user, Object property) {
        this.user = user;
        this.property = property;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Object getUser() {
        return user;
    }

    public void setUser(Object user) {
        this.user = user;
    }

    public Object getProperty() {
        return property;
    }

    public void setProperty(Object property) {
        this.property = property;
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

    public String getUserId() {
        if (user == null) return null;
        if (user instanceof User) return ((User) user).getId();
        if (user instanceof Map) {
            Object idObj = ((Map<?, ?>) user).get("id");
            if (idObj == null) idObj = ((Map<?, ?>) user).get("_id");
            return idObj != null ? idObj.toString() : null;
        }
        return user.toString();
    }

    public String getPropertyId() {
        if (property == null) return null;
        if (property instanceof Property) return ((Property) property).getId();
        if (property instanceof Map) {
            Object idObj = ((Map<?, ?>) property).get("id");
            if (idObj == null) idObj = ((Map<?, ?>) property).get("_id");
            return idObj != null ? idObj.toString() : null;
        }
        return property.toString();
    }
}
