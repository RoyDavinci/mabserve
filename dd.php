<?php
// Define the array
$data = [
    ["network" => "9MOBILE", "category" => "Daily", "price" => "50.00", "allowance" => "50MB", "product_id" => "ET1", "validity" => "1 Day"],
    ["network" => "9MOBILE", "category" => "Daily", "price" => "100.00", "allowance" => "100MB+100m social", "product_id" => "ET2", "validity" => "1 Day"],
    ["network" => "9MOBILE", "category" => "Daily", "price" => "200.00", "allowance" => "650MB", "product_id" => "ET5", "validity" => "1 Day"],
    ["network" => "9MOBILE", "category" => "Weekly", "price" => "1500.00", "allowance" => "7GB", "product_id" => "ET9", "validity" => "7 Days"],
    ["network" => "9MOBILE", "category" => "Daily", "price" => "500.00", "allowance" => "2GB+100MB social", "product_id" => "ES4", "validity" => "3 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "1000.00", "allowance" => "2GB (2GB Night)", "product_id" => "ES5", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "1200.00", "allowance" => "6.2GB(2.2GB + 4GB Night)", "product_id" => "ES6", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "3000.00", "allowance" => "15Gb(10Gb + 5GB Night)", "product_id" => "ES8", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "4000.00", "allowance" => "18.5GB(15GB+3.5GB Night)", "product_id" => "ES9", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "5000.00", "allowance" => "22GB", "product_id" => "EL1", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "10000.00", "allowance" => "50GB", "product_id" => "EL2", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "15000.00", "allowance" => "80GB", "product_id" => "EL3", "validity" => "30 Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "25000.00", "allowance" => "75GB", "product_id" => "EL5", "validity" => "90Days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "50000.00", "allowance" => "165GB", "product_id" => "EL6", "validity" => "180days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "20000.00", "allowance" => "125GB", "product_id" => "EL7", "validity" => "30DAYS"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "100000.00", "allowance" => "365GB", "product_id" => "EL8", "validity" => "365DAYS(1Yr)"],
    ["network" => "9MOBILE", "category" => "Daily", "price" => "300.00", "allowance" => "1GB", "product_id" => "EQ1", "validity" => "1 day"],
    ["network" => "9MOBILE", "category" => "Daily", "price" => "150.00", "allowance" => "200MB", "product_id" => "EL310", "validity" => "3 days"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "2500.00", "allowance" => "Data 11GB (7GB+ 4GB Night) Data", "product_id" => "EQ2", "validity" => "1 Month"],
    ["network" => "9MOBILE", "category" => "Monthly", "price" => "7000.00", "allowance" => "35 GB Data", "product_id" => "EQ3", "validity" => "1 Month"]
];

// Create a CSV file
$filename = "data_plans.csv";
$file = fopen($filename, "w");

// Write the headers
fputcsv($file, ["Network", "Category", "Price", "Allowance", "Product ID", "Validity"]);

// Write each row to the CSV
foreach ($data as $row) {
    fputcsv($file, $row);
}

// Close the file
fclose($file);

echo "CSV file '$filename' has been created successfully.";