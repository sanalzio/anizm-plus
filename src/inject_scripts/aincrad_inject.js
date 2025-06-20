document.addEventListener("click", (e) => {
    if (e.target.id == "skip-outro" || e.target.id == "skip-intro")
        document.getElementsByTagName("video")[0].focus();
});
