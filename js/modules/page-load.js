async function validateUser() {
    let response = await fetch("/php/page-load.php");
    response = await response.json();
    if (!response.Success) { return window.location.href = "/index.html"; }
}

validateUser();