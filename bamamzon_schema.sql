create database if not exists bamazonDB;

use bamazonDB;

create table if not exists products(
    item_id integer (10) auto_increment not null,
    product_name varchar(70) not null,
    department varchar(70),
    price decimal(8,2) not null,
    stock_available integer(10) not null,
    primary key(item_id)
);


SELECT * FROM products;