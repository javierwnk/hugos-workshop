// LogIn

document.getElementById("loginBtn").addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();

    auth
        .signInWithEmailAndPassword(document.getElementById("email").value, document.getElementById("password").value)
        .then(userCredential => {
            localStorage.setItem("usr", userCredential.user.uid)
            window.location.href = "index.html"
        })
        .catch( err => {
            document.getElementById("errorMsg").innerHTML = `<p style="color: red;">Check user or passwork.</p>`
        }
        )
})