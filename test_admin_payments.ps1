# Test: Admin history should be filtered by selectedStudentId
$ErrorActionPreference = "Stop"

Write-Host "=================================================" -ForegroundColor Cyan
Write-Host " ADMIN PAYMENT HISTORY FILTER VERIFICATION       " -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Login as admin
Write-Host "`n[TEST 1] Admin login (ADM001)..." -ForegroundColor Yellow
$adminLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"ADM001","password":"admin123"}'
$adminToken = $adminLogin.token
if (-not $adminToken) { throw "Admin login FAILED!" }
$adminHeaders = @{ Authorization = "Bearer $adminToken" }
Write-Host " -> OK (Role: $($adminLogin.role))" -ForegroundColor Green

# Student login
Write-Host "`n[TEST 2] Student login (STU001)..." -ForegroundColor Yellow
$stuLogin = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method Post -ContentType "application/json" -Body '{"identifier":"STU001","password":"student123"}'
$stuToken = $stuLogin.token
if (-not $stuToken) { throw "Student login FAILED!" }
$stuHeaders = @{ Authorization = "Bearer $stuToken" }
Write-Host " -> OK (ID: $($stuLogin.userId))" -ForegroundColor Green

# GET /api/payments/students list
Write-Host "`n[TEST 3] GET /api/payments/students..." -ForegroundColor Yellow
$studentIds = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/students" -Method Get -Headers $adminHeaders
Write-Host " -> Retrieved: $($studentIds -join ', ')" -ForegroundColor Green
if ($studentIds.Count -lt 1) { throw "No student IDs returned!" }

# History filtered by STU001
Write-Host "`n[TEST 4] Admin GET history for STU001 specifically..." -ForegroundColor Yellow
$stu001History = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/history?studentId=STU001&role=admin" -Method Get -Headers $adminHeaders
Write-Host " -> Returned $($stu001History.Count) records." -ForegroundColor Green
$wrongRecord = $stu001History | Where-Object { $_.studentId -ne "STU001" }
if ($wrongRecord) { throw "ISOLATION BROKEN! Got records for other students: $($wrongRecord.studentId)" }
Write-Host " -> All records belong to STU001. OK." -ForegroundColor Green

# History filtered by STU002 (if exists)
if ($studentIds -contains "STU002") {
    Write-Host "`n[TEST 5] Admin GET history for STU002 specifically..." -ForegroundColor Yellow
    $stu002History = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/history?studentId=STU002&role=admin" -Method Get -Headers $adminHeaders
    Write-Host " -> Returned $($stu002History.Count) records." -ForegroundColor Green
    $wrongRecord2 = $stu002History | Where-Object { $_.studentId -ne "STU002" }
    if ($wrongRecord2) { throw "ISOLATION BROKEN! Got records for other student: $($wrongRecord2.studentId)" }
    Write-Host " -> All records belong to STU002. OK." -ForegroundColor Green
}

# Admin bypass payment
Write-Host "`n[TEST 6] POST /api/payments/bypass for STU002..." -ForegroundColor Yellow
$bypassBody = @{ studentId = "STU002"; term = "Fall2026"; reason = "Test Auto Bypass"; bypassedBy = "ADM001" } | ConvertTo-Json
$bypassRecord = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/bypass" -Method Post -ContentType "application/json" -Headers $adminHeaders -Body $bypassBody
$recordId = $bypassRecord.id
if (-not $recordId) { throw "Bypass did not return record ID!" }
if ($bypassRecord.paymentMethod -ne "ADMIN_BYPASS") { throw "Expected ADMIN_BYPASS method, got $($bypassRecord.paymentMethod)" }
Write-Host " -> Bypass OK! Receipt: $($bypassRecord.receiptNumber), ID: $recordId" -ForegroundColor Green

# Edit payment record
Write-Host "`n[TEST 7] PUT /api/payments/$recordId (edit)..." -ForegroundColor Yellow
$updateBody = @{ term = "Fall2026"; netPayable = 40000.0; paymentStatus = "CONFIRMED"; paymentMethod = "ADMIN_BYPASS"; bankName = "Test Fund"; transactionId = "TST-999"; amountInWords = "Forty Thousand" } | ConvertTo-Json
$updated = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/$recordId" -Method Put -ContentType "application/json" -Headers $adminHeaders -Body $updateBody
if ($updated.netPayable -ne 40000.0) { throw "Amount not updated correctly. Got: $($updated.netPayable)" }
Write-Host " -> Edit OK! Amount: $($updated.netPayable), Bank: $($updated.bankName)" -ForegroundColor Green

# Delete payment record
Write-Host "`n[TEST 8] DELETE /api/payments/$recordId..." -ForegroundColor Yellow
$del = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/$recordId" -Method Delete -Headers $adminHeaders
if (-not $del.success) { throw "Delete was not successful!" }
Write-Host " -> Delete OK!" -ForegroundColor Green

# Student isolation: student can only see own records
Write-Host "`n[TEST 9] Student history isolation..." -ForegroundColor Yellow
$stuHistory = Invoke-RestMethod -Uri "http://localhost:8080/api/payments/history?studentId=STU001&role=student" -Method Get -Headers $stuHeaders
$leak = $stuHistory | Where-Object { $_.studentId -ne "STU001" }
if ($leak) { throw "Data leak! Student sees records for $($leak.studentId)" }
Write-Host " -> Isolation OK! $($stuHistory.Count) records, all for STU001." -ForegroundColor Green

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host " ALL TESTS PASSED SUCCESSFULLY!                  " -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan
