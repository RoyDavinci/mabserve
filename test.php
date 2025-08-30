<?php

function newCon()
{
    $log_file   = 'insert_results.log';

    $log_handle = fopen($log_file, 'w');
    if ($log_handle === false) {
        die("Error: Could not open the log file for writing.");
    }
    fwrite($log_handle, "Attempting connection to main DB...");
    $con = mysqli_connect("localhost", "uba", "dq[g2*!0.K", "uba");  //livedb
    if (!$con) {
        fwrite($log_handle, "Main DB connection failed: " . mysqli_connect_error());
    } else {
        fwrite($log_handle, "Main DB connection successful.");
    }
    return $con;
}

function newCon2()
{
    $log_file   = 'insert_results.log';

    $log_handle = fopen($log_file, 'w');
    if ($log_handle === false) {
        die("Error: Could not open the log file for writing.");
    }
    fwrite($log_handle, "Attempting connection to secondary SMS DB...");
    $con = mysqli_connect("10.186.0.7", "uba", "RingoVas1@#$", "sms");  //livedb
    if (!$con) {
        fwrite($log_handle, "SMS DB connection failed: " . mysqli_connect_error());
    } else {
        fwrite($log_handle, "SMS DB connection successful.");
    }
    return $con;
}
$input_file = 'cleaned_output.csv';
$log_file   = 'insert_results.log';

// Check if the file exists
if (!file_exists($input_file)) {
    die("Error: The cleaned CSV file '{$input_file}' was not found.");
}

// Open the file for reading
$input_handle = fopen($input_file, 'r');
if ($input_handle === false) {
    die("Error: Could not open the file for reading.");
}

// Open the log file for writing (overwrite each run)
$log_handle = fopen($log_file, 'w');
if ($log_handle === false) {
    die("Error: Could not open the log file for writing.");
}

// Read the header row (ignore it)
$header = fgetcsv($input_handle, 0, ",");

$inserted = 0;
$failed   = 0;
$nochange = 0;
$check  = 0;


while (($row = fgetcsv($input_handle, 0, ",")) !== false) {
    // Map CSV columns to DB fields
    if ($check === 1) {

        break;
    } else {

        $msisdn = trim($row[0], "'"); // remove apostrophes
        $text   = $row[1];
        $id     = $row[2];

        $conn1 = newCon();
        // Escape values to prevent breaking query
        $id_esc     = $conn1->real_escape_string($id);
        $msisdn = $conn1->real_escape_string($msisdn);
        $text1   = $conn1->real_escape_string($text);
        $pages = msgCount($text1);
        $datetime = date('Y-m-d H:i:s');
        $id_symbol = 'UBA' . $id;
        $nmt = substr($msisdn, -10);
        $msisdn1 = $msisdn;

        $conn2 = newCon2();

        $al = "INSERT INTO sp_sms_push (src_id, number, content, pages, status, submit_date, report_date, fail_reason, rpt_msg_id, create_date, update_date, network,   ref_id, account, app_id) VALUES ('UBA', '$nmt', '$text1', '$pages', '0', NULL, NULL, NULL, NULL, '$datetime', '$datetime', NULL, '$id_symbol', 'ubasms', '1')";


        $recharge = "INSERT INTO messages(id,msisdn,pages,text,created_at) VALUES ('$id','$msisdn1','$pages','$text1',NOW())";

        $log_message = "SMS PUSH query: $al\n";

        fwrite($log_handle, $log_message);

        $log_message = "messages query: $recharge\n";


        fwrite($log_handle, $log_message);

        if ($conn1->query($recharge) && $conn2->query($al)) {
            if ($conn1->affected_rows > 0 && $conn2->affected_rows > 0) {
                $inserted++;
                $log_message = "SUCCESS: $sql\n";
            } else {
                $nochange++;
                $log_message = "NO CHANGE (0 rows affected): $sql\n";
            }
            fwrite($log_handle, $log_message);
        } else {
            $failed++;
            $error_message = "FAILED: $al => " . $conn1->error . "\n";
            fwrite($log_handle, $error_message);
            $error_message = "FAILED: $recharge => " . $conn2->error . "\n";
            fwrite($log_handle, $error_message);
        }
        $check++;
    }
}

fclose($input_handle);
fclose($log_handle);


function msgCount($msg)
{
    $log_file   = 'insert_results.log';

    $log_handle = fopen($log_file, 'w');
    if ($log_handle === false) {
        die("Error: Could not open the log file for writing.");
    }
    fwrite($log_handle, "Calculating SMS page count...");
    $msg = trim($msg);
    $strLn = mb_strlen($msg, 'utf-8') + preg_match_all('/[\\^{}\\\~€|\\[\\]]/mu', $msg, $m);
    $len = 0;
    if ($strLn <= 160) $len = 1;
    elseif ($strLn <= 306) $len = 2;
    elseif ($strLn <= 459) $len = 3;
    elseif ($strLn <= 612) $len = 4;
    elseif ($strLn <= 765) $len = 5;
    elseif ($strLn <= 918) $len = 6;
    elseif ($strLn <= 1071) $len = 7;
    elseif ($strLn <= 1224) $len = 8;
    fwrite($log_handle, "Message length: $strLn chars, Pages: $len");
    return $len;
}