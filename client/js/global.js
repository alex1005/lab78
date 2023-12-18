function toggleMenu() {
    const x = document.getElementById("topmenu");
    if(x.className === "") {
        x.className = "responsive"
    } else {
        x.className = "";
    }
}