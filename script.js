// Fungsi untuk Menampilkan Peringatan CSS
function showNotification(message) {
    let notification = document.getElementById("notification");
    notification.innerText = message;
    notification.classList.add("show");

    // Hilang otomatis setelah 3 detik
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
}

// Fungsi Generate API Key
document.getElementById("generateKey").addEventListener("click", function() {
    let apiKey = "EGPT-APIKEY-" + generateRandomString(5) + "-" + generateRandomString(5);
    document.getElementById("outputText").innerText = "API Key: " + apiKey;
    showNotification("API Key berhasil dibuat!");
});

// Fungsi untuk Salin API Key
document.getElementById("copyText").addEventListener("click", function() {
    let keyText = document.getElementById("outputText").innerText;
    if (keyText.includes("API Key: ")) {
        let key = keyText.replace("API Key: ", "");
        navigator.clipboard.writeText(key).then(() => {
            showNotification("API Key disalin!");
        });
    } else {
        showNotification("Tidak ada API Key untuk disalin!");
    }
});

// Fungsi untuk Pergi ke Website API
document.getElementById("goToWebsite").addEventListener("click", function() {
    let btn = this;
    btn.innerText = "Loading...";
    btn.disabled = true;

    showNotification("Membuka website API...");

    setTimeout(() => {
        window.location.href = "/chat?text=halo&apikey=";
    }, 2000);
});

// Fungsi untuk Membuat String Acak
function generateRandomString(length) {
    return Math.random().toString(36).substr(2, length).toUpperCase();
}