package com.stepstyle.dto;

public class DashboardStatsDto {
    private long totalProducts;
    private long totalShoes;
    private long totalChappals;
    private long totalSlippers;
    private long totalChappalsAndSlippers;
    private long totalCategories;
    private long lowStockCount;
    private long chappalsInStock;
    private long overallTotalStock;
    private double totalStockValue;

    public DashboardStatsDto() {
    }

    public DashboardStatsDto(long totalProducts, long totalShoes, long totalChappals, long totalSlippers,
                             long totalCategories, long lowStockCount, long chappalsInStock) {
        this(totalProducts, totalShoes, totalChappals, totalSlippers, totalCategories, lowStockCount, chappalsInStock, 0L, 0.0);
    }

    public DashboardStatsDto(long totalProducts, long totalShoes, long totalChappals, long totalSlippers,
                             long totalCategories, long lowStockCount, long chappalsInStock,
                             long overallTotalStock, double totalStockValue) {
        this.totalProducts = totalProducts;
        this.totalShoes = totalShoes;
        this.totalChappals = totalChappals;
        this.totalSlippers = totalSlippers;
        this.totalChappalsAndSlippers = totalChappals + totalSlippers;
        this.totalCategories = totalCategories;
        this.lowStockCount = lowStockCount;
        this.chappalsInStock = chappalsInStock;
        this.overallTotalStock = overallTotalStock;
        this.totalStockValue = totalStockValue;
    }

    public DashboardStatsDto(long totalProducts, long totalShoes, long totalChappalsAndSlippers,
                             long totalCategories, long lowStockCount, long chappalsInStock) {
        this(totalProducts, totalShoes, totalChappalsAndSlippers, 0, totalCategories, lowStockCount, chappalsInStock, 0L, 0.0);
    }

    public long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public long getTotalShoes() {
        return totalShoes;
    }

    public void setTotalShoes(long totalShoes) {
        this.totalShoes = totalShoes;
    }

    public long getTotalChappals() {
        return totalChappals;
    }

    public void setTotalChappals(long totalChappals) {
        this.totalChappals = totalChappals;
    }

    public long getTotalSlippers() {
        return totalSlippers;
    }

    public void setTotalSlippers(long totalSlippers) {
        this.totalSlippers = totalSlippers;
    }

    public long getTotalChappalsAndSlippers() {
        return totalChappalsAndSlippers;
    }

    public void setTotalChappalsAndSlippers(long totalChappalsAndSlippers) {
        this.totalChappalsAndSlippers = totalChappalsAndSlippers;
    }

    public long getTotalCategories() {
        return totalCategories;
    }

    public void setTotalCategories(long totalCategories) {
        this.totalCategories = totalCategories;
    }

    public long getLowStockCount() {
        return lowStockCount;
    }

    public void setLowStockCount(long lowStockCount) {
        this.lowStockCount = lowStockCount;
    }

    public long getChappalsInStock() {
        return chappalsInStock;
    }

    public void setChappalsInStock(long chappalsInStock) {
        this.chappalsInStock = chappalsInStock;
    }

    public long getOverallTotalStock() {
        return overallTotalStock;
    }

    public void setOverallTotalStock(long overallTotalStock) {
        this.overallTotalStock = overallTotalStock;
    }

    public double getTotalStockValue() {
        return totalStockValue;
    }

    public void setTotalStockValue(double totalStockValue) {
        this.totalStockValue = totalStockValue;
    }
}
