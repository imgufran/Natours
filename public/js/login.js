const login = async (email, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/login",
      data: {
        email: email,
        password: password,
      },
    });
    console.log(res);

    if (res.data.status === "success") {
      alert("Logged in successfully!")
      window.setTimeout(() => {
        location.assign("/");
      });
    }

  } catch (err) {
    alert(err.response.data.message);
  }
};

document.querySelector(".form").addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  login(email, password);
});
